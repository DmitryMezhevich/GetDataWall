const axios = require('axios');

const sqlRequest = require('../db/requestSQL-helper');
const ItemPostModule = require('../models/itemPostModel');

const TOKEN =
    'vk1.a.KFKmxEKIi-kJiFKL4vbjsc5m2FIGRGEWKXFNvZzAIIKMbohUPGcOUBv812djGZy9H4vIJhVHsBm96QaC4R71fs0cw9FdJxi84v2PjZ0gZ-Vbaa8Debn9wKuJKBads66lO6TnB0FvZxGDXk10ql5JbAYDUozXDS4oLJSohLIjxoUx06n5Hmq0HPYDaVKHoh2KMrJK2Y02BPnVy8f4t49w6g';

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
            const date = item.date;
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
        const urlGoogleSheets =
            'https://script.google.com/macros/s/AKfycbxEffBnaCWp4Izit7vhGmIvZprScT4ZsWVhsTdj3NvVF_kItVJvdp2I5kqyL6SVPZQGjQ/exec';
        axios.post(urlGoogleSheets, urlList, {
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
