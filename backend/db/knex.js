module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: '127.0.0.1',      // 数据库地址
            port: 5432,             // 端口
            user: 'your_database_user',
            password: 'your_database_password',
            database: 'your_database_name'
        },
        pool: { min: 2, max: 10 }, // 连接池配置
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations' // 迁移文件存放目录   
        }
    }
};