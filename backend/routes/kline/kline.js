const KlineService = require('@/services/kline');

exports.RouteDefs = [
    {
        uri: '/listBycode',
        method: 'get',
        handler: listBycode
    },
    {
        uri: '/addKlines',
        method: 'post',
        handler: addKlines
    }
];

async function listBycode(ctx) {
    const { code, start, end } = ctx.query;
    const klineService = new KlineService();
    return await klineService.listBycode(code, start, end);
}

async function addKlines(ctx) {
    const { klines } = ctx.request.body;
    const klineService = new KlineService();
    return await klineService.addMany(klines); 
}
