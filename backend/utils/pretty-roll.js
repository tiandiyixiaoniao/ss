'use strict'
const { pipeline, Transform } = require('stream')
const split2 = require('split2')
const prettyFactory = require('pino-pretty').prettyFactory
const roll = require('pino-roll')

// ponytail: pino-pretty 无法直接接入 pipeline（会内部 pump 到 stdout），故自写 transport：格式化 + 滚动写文件
module.exports = async function (opts) {
  const dest = await roll(opts)
  const pretty = prettyFactory({
    colorize: false,
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    ignore: 'pid,hostname'
  })
  const fmt = new Transform({
    transform (chunk, enc, cb) {
      let line
      try {
        line = pretty(chunk.toString())
      } catch {
        line = chunk.toString() + '\n'
      }
      if (!line.endsWith('\n')) line += '\n'
      cb(null, line)
    }
  })
  const src = split2()
  pipeline(src, fmt, dest, () => {})
  return src
}
