const knex = require('knex');

// knex 实例：pg 连接池由 knex 内部管理，兼容原 PG* 环境变量
const db = knex({
    client: 'pg',
    connection: {
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        database: process.env.PGDATABASE || 'postgres',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
    },
});

module.exports = db;
