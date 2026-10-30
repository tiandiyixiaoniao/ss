const KlineService = require('@/services/kline');

export const RouteDefs = [
    {
        uri: '/listBycode',
        method: 'get',
        params: null,
        handler: listBycode
    }
];



async function listBycode(ctx) {
    const { code, start, end } = ctx.query;
    const klineService = new KlineService();
    const klines = await klineService.listBycode(code, start, end);
    ctx.body = klines;
}