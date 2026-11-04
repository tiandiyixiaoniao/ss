const db = require('@/db/db');

/**
 * 数据表字段 - kline
 * { code, time, open, high, low, close, volume, amount }
 */
module.exports = class KlineService {
    async create(code, time, open, high, low, close, volume, amount) {
        const [row] = await db('kline')
            .insert({ code, time, open, high, low, close, volume, amount })
            .returning('*');
        return row;
    }

    async addMany(klines) {
        if (!klines || klines.length === 0) return [];
        return db('kline').insert(klines).returning('*');
    }

    async listBycode(code, startTS, endTS) {
        const q = db('kline').where('code', code);
        if (startTS) q.andWhere('time', '>=', startTS);
        if (endTS) q.andWhere('time', '<=', endTS);
        return q.orderBy('time', 'desc');
    }
}
