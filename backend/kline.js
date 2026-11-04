require('module-alias/register');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { errorHandle } = require('@/middleware/error');
const { createApiRouter } = require('@/utils/route');
const config = require('@/config');
const logger = require('@/utils/logger');

const app = new Koa();
app.use(errorHandle);
app.use(bodyParser());

const router = createApiRouter({ dir: 'routes/kline', prefix: '/dataApi' });
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.port, () => {
  logger.info('kline api started on port: %d ', config.port);
});
