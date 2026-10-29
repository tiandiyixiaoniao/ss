// 路由定义与装配（backend.md §后端设计）。
// 装配方式：遍历指定目录下的路由文件，读取其导出的 RouteDefs，
// 按 `${前缀}/${文件名}/${uri}` 组装；新增路由文件即生效，无需登记。
const fs = require('node:fs');
const path = require('node:path');
const Router = require('@koa/router');
const { runValidator } = require('@/utils/validate');
const logger = require('@/utils/logger');

function createApiRouter({ dir, prefix }) {
    const router = new Router();
    const routesDir = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);

    for (const file of listRouteFiles(routesDir)) {
        const base = path.basename(file, path.extname(file));
        const defs = require(file).RouteDefs;
        for (const def of defs) {
            router.register(joinPath(prefix, base, def.uri), [def.method.toUpperCase()], doHandler(def));
        }
        logger.debug({ file, count: defs.length }, 'routes loaded');
    }

    return router;
}

function listRouteFiles(dir) {
    return fs
        .readdirSync(dir)
        .filter((name) => /\.js$/.test(name) && !name.endsWith('.d.js'))
        .sort()
        .map((name) => path.join(dir, name));
}

function joinPath(prefix, base, uri) {
    const basePath = `${prefix}/${base}`;
    if (!uri || uri === '/') return basePath;
    return basePath + (uri.startsWith('/') ? uri : `/${uri}`);
}

function doHandler(def) {
    return async (ctx) => {
        try {
            if (def.validator) {
                const data = def.method === 'get' ? ctx.request.query : ctx.request.body;
                runValidator(def.validator, data);
            }
            ctx.body = await def.handler(ctx);
        } catch (err) {
            ctx.status = 500;
            ctx.body = { message: err.message };
        }
    };
}

module.exports = { createApiRouter };
