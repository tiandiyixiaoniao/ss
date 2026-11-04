// 路由定义与装配（backend.md §后端设计）。
// 装配方式：遍历指定目录下的路由文件，读取其导出的 RouteDefs，
// 按 `${前缀}/${文件名}/${uri}` 组装；新增路由文件即生效，无需登记。
const fs = require('node:fs');
const path = require('node:path');
const Router = require('@koa/router');
const logger = require('@/utils/logger');

function createApiRouter({ dir, prefix }) {
    const router = new Router();
    const routesDir = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);

    for (const file of listRouteFiles(routesDir)) {
        const base = path.basename(file, path.extname(file));
        const defs = require(file).RouteDefs;
        for (const def of defs) {
            let url = joinPath(prefix, base, def.uri);
            router.register(url, [def.method.toUpperCase()], doHandler(def));
            logger.info(`route: ${def.method.toUpperCase()} ${url}`);
        }

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
/**
* 路由定义接口。
* @typedef {Object} RouteDef
    interface def {
        method: 'get' | 'post' 
        uri: string;
        handler: (ctx: any) => any;
        params?: (data: any) => void;
    }
    */
function doHandler(def) {
    return async (ctx) => {
        try {
            ctx.body = await def.handler(ctx);
        } catch (err) {
            console.log(err)
            ctx.status = 500;
            ctx.body = { code: err.code || 1, message: err.message || 'Internal Server Error' };``
        }
    };
}

module.exports = { createApiRouter };
