const db = require('./knex');
const logger = require('@/utils/logger');

// 所有链式查询最终都经过 QueryBuilder.then，在原型上统一捕获错误并记录日志后抛出，由上层错误中间件兜底
const QB = db.queryBuilder().constructor;
const origThen = QB.prototype.then;
QB.prototype.then = function (resolve, reject) {
  return origThen.call(this, resolve, (err) => {
    logger.error({ err: err.message }, 'db query failed');
    throw { code: 1, message: err.message };
  }).catch(
    (err) => (reject ? reject(err) : Promise.reject({ code: 1, message: err.message }))
  );
};

module.exports = db;
