const koa = require('koa')
const app = new koa()
const logger = require('koa-logger')

app.use(logger())

const mid1 = async (ctx, next) => {
  ctx.body = 'text start:'
  await next()
  ctx.body = ctx.body + ' where am i'
}

const mid2 = async (ctx, next) => {
  ctx.type = 'text/html; charset=utf-8'
  ctx.body = ctx.body + 'Hi'
  await next()
}

const mid3 = async (ctx, next) => {
  ctx.body = ctx.body + ' Forrest'
  // awit next()
}

app.use(mid1)
app.use(mid2)
app.use(mid3)

app.listen(8080, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('A Server Running at port 8080')
  }
})