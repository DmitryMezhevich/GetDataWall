const dbRequest = require('./index');

class RequestSQLHelper {
    async getListGoods() {
        try {
            const { rows } = await dbRequest(`SELECT * FROM list_goods;`);

            return rows;
        } catch {
            return null;
        }
    }

    async getGroupByDomain(domain) {
        try {
            const { rows } = await dbRequest(
                `SELECT * FROM list_goods WHERE domain = $1`,
                [domain]
            );

            return rows.length !== 0 ? rows : null;
        } catch {
            return null;
        }
    }

    async getGroupByID(id) {
        try {
            const { rows } = await dbRequest(
                `SELECT * FROM list_goods WHERE from_id = $1`,
                [id]
            );

            return rows.length !== 0 ? rows : null;
        } catch {
            return null;
        }
    }

    async addNewGroup(id, domain, url, name) {
        try {
            const { rows } = await dbRequest(
                `INSERT INTO list_goods (from_id, domain, url, name) VALUES ($1, $2, $3, $4)`,
                [id, domain, url, name]
            );

            return rows.length !== 0 ? rows : null;
        } catch {
            return null;
        }
    }

    async removeGroupByURL(url) {
        try {
            const { rows } = await dbRequest(
                `DELETE FROM list_goods WHERE url = $1`,
                [url]
            );

            return rows.length !== 0 ? rows : null;
        } catch {
            return null;
        }
    }

    async changeErrorRequest(domain) {
        try {
            const { rows } = await dbRequest(
                `UPDATE list_goods SET error_req = TRUE WHERE domain = $1;`,
                [domain]
            );

            return rows.length !== 0 ? rows : null;
        } catch {
            return null;
        }
    }
}

module.exports = new RequestSQLHelper();
