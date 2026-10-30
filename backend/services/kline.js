
const dayjs = require('dayjs');


/**
 * 数据表字段定义 - kline
 * {
 * time: 时间戳,
 * open: 开盘价,
 * high: 最高价,
 * low: 最低价,
 * close: 收盘价,
 * volume: 成交量,
 * amount: 成交额,
 * }
*/


module.exports = class KlineService {
    async create(code, time, open, high, low, close, volume, amount) {
        // 创建kline数据
        return await db.kline.create({
            code,
            time,
            open,
            high,
            low,
            close,
            volume,
            amount,
        });
    }

    async addMany(klines) {
        return await db.kline.bulkCreate(klines);
    }

    async listBycode(code, codes, startTS, endTS) {
        endTS = endTS ? endTS : dayjs().value();
        startTS = startTS ? startTS : dayjs().subtract(1, 'day').value();
        return await db.kline.findAll({
            where: {
                code,
                time: {
                    [db.Op.between]: [startTS, endTS],
                },
            },
            order: [['time', 'DESC']],
        });
    }

}