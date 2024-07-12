const axios = require('axios');

const sqlRequest = require('../db/requestSQL-helper');
const ItemPostModule = require('../models/itemPostModel');

const TOKEN =
    'vk1.a.KFKmxEKIi-kJiFKL4vbjsc5m2FIGRGEWKXFNvZzAIIKMbohUPGcOUBv812djGZy9H4vIJhVHsBm96QaC4R71fs0cw9FdJxi84v2PjZ0gZ-Vbaa8Debn9wKuJKBads66lO6TnB0FvZxGDXk10ql5JbAYDUozXDS4oLJSohLIjxoUx06n5Hmq0HPYDaVKHoh2KMrJK2Y02BPnVy8f4t49w6g';
const urlGoogleSheets =
    'https://script.google.com/macros/s/AKfycbxbWnMOsDlyyQcxTgNLLma2AH1TSWlYRWuamt6TsYs3WWkhavOxoG8osXx8DR5Q1_9ejg/exec';

class ControllerHelper {
    async getListWall(filter) {
        let listGroups = await sqlRequest.getListGoods();
        listGroups = listGroups.map((item) => item.domain);

        let listWall = [];
        for (const group of listGroups) {
            let offset = 0;
            while (offset >= 0) {
                const list = await this.#getDataWall(group, offset);

                for (const item of list.items) {
                    if (this.#checkDate(filter, item.date)) {
                        listWall.push(item);
                    }
                    if (item.date < filter.startDate && item.is_pinned !== 1) {
                        offset = -2;
                        break;
                    }
                }

                offset += 1;
            }
        }

        return listWall;
    }

    getUrlList(listWall, filter) {
        let list = listWall.flatMap((item) => {
            if (item.hasOwnProperty('copy_history')) {
                item.attachments = item.copy_history[0].attachments;
                item.date = item.copy_history[0].date;
                item.text = item.copy_history[0].text;
            }
            const reposts = item.reposts.count;
            if (
                reposts >= filter.noLessReposts &&
                reposts <= filter.noMoreReposts
            ) {
                return new ItemPostModule(item);
            }
            return [];
        });

        list = list.sort((a, b) => b.reposts - a.reposts);

        return list;
    }

    async sendToGoogleSheets(urlList) {
        const data = urlList.map((item) => {
            return [
                item.date,
                item.reposts,
                item.likes,
                item.views,
                `=IMAGE("${item.urlImg}")`,
                item.text,
                item.url,
            ];
        });

        axios.post(urlGoogleSheets, data, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async #getDataWall(domain, offset) {
        const res = await axios.post(
            'https://api.vk.com/method/wall.get',
            null,
            {
                headers: { Authorization: `Bearer ${TOKEN}` },
                params: {
                    domain: domain,
                    count: 50,
                    offset: offset * 50,
                    v: '5.236',
                },
            }
        );
        return res.data.response;
    }

    #checkDate(filter, date) {
        return date >= filter.startDate && date <= filter.endDate;
    }
}

module.exports = new ControllerHelper();
