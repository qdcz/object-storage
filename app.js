const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const koaBody = require('koa-body');
const logger = require('koa-logger')
const cors = require('koa-cors');

const path =  require('path')

const index = require('./routes/index')
const users = require('./routes/users')
const qiniu = require('./routes/qiniu')

// error handler
onerror(app)

app.use(cors());
// middlewares
// app.use(bodyparser({
//     enableTypes:['json', 'form', 'text']
// }))
// 直能解析put和post
app.use(koaBody({
    multipart: true,
    json: true,
    strict: false, //如果启用，则不解析GET，HEAD，DELETE请求，默认为true
}));
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
    extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(qiniu.routes(), qiniu.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app
