const pino = require('pino');
const { join } = require('path');

const isProduction = process.env.NODE_ENV === 'production';

// 统一格式：[2026-11-03 11:03:10] INFO: message
const prettyOpts = {
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    ignore: 'pid,hostname'
};

let transport;

if (isProduction) {
    // 生产环境：写文件，error / info 分离，按日滚动，保留 14 天
    transport = pino.transport({
        targets: [
            {
                level: 'error', // 仅收集 error 及以上级别的日志
                target: join(__dirname, 'pretty-roll.js'),
                options: {
                    file: './logs/error',
                    frequency: 'daily',
                    dateFormat: 'yyyy-MM-dd',
                    extension: '.log',
                    limit: { count: 14 },
                    mkdir: true
                }
            },
            {
                level: 'info',  // 收集 info 及以上级别的所有日志 (包含 error)
                target: join(__dirname, 'pretty-roll.js'),
                options: {
                    file: './logs/info',
                    frequency: 'daily',
                    dateFormat: 'yyyy-MM-dd',
                    extension: '.log',
                    limit: { count: 14 },
                    mkdir: true
                }
            }
        ]
    });
} else {
    // 开发环境：输出到控制台
    transport = pino.transport({
        target: 'pino-pretty',
        options: { ...prettyOpts, colorize: true }
    });
}

const logger = pino({
    level: isProduction ? 'info' : 'debug',
}, transport);

module.exports = logger;
