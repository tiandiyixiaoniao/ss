exports.errorHandle = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: ctx.status === 500 ? 'Internal Server Error' : err.message };
    if (ctx.status === 500) console.error(err);
  }
}