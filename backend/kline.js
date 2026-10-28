const Koa = require('koa');
const Router = require('@koa/router');
const db = require('./db');
const app = new Koa();
const router = new Router();
const { errorHandle } = require('./middleware/error')

app.use(require('koa-bodyparser')());

app.use(errorHandle)

router.post('/kine', async (ctx) => {
  console.log(11, ctx.request.body);
  const { name, email } = ctx.request.body || {};
  if (!name) ctx.throw(400, 'name required');
  const { rows } = await db.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email || null]
  );
  ctx.body = rows[0];
});


app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
