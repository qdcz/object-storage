const Koa = require('koa');
const app = new Koa();
/**
 * 外部包
 */
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const cors = require('koa-cors');
// const session = require('koa-generic-session');
/**
 * 内置模块
 */
const {resolve} = require('path');
/**
 * 配置文件
 */
const redisConfig = require("./config/redis");
const apiLog = require("./utils/apiLog");
/**
 * 路由
 */
const index = require('./routes/index');
const users = require('./routes/users');
const qiniu = require('./routes/qiniu');
const logs = require('./routes/logs');
/**
 * 附加处理
 */
const logAutoSync = require("./utils/autoSyncLocalLogFile");
/**
 * 全局事件监听执行
 */
const EventStack = require("./utils/events");  // 引入即可
/**
 * 数据库
 */
// const wyh_redis = require("./utils/redis");
const mongodb = require("./utils/mongodb");

// error handler
onerror(app)
// 跨域
app.use(cors({credentails: true,}));
// 静态文件解析
app.use(require('koa-static')(__dirname + '/public'))
// 页面模板引擎
app.use(views(__dirname + '/views', {
    extension: 'pug'
}))
// middlewares
// app.use(bodyparser({
//     enableTypes:['json', 'form', 'text']
// }))
// post方法入参处理    直能解析put和post
app.use(koaBody({
    multipart: true,
    json: true,
    strict: false, //如果启用，则不解析GET，HEAD，DELETE请求，默认为true
}));
// 对cookie中sessionid进行加密的秘钥
// app.keys = ['wyh666.!@#$%^&*']
// 使用koa-generic-session则不用手动发送cookie，其自动配置了cookie和session的对应关系
// app.use(session({
//     cookie: { // 配置cookie
//         path: '/', // cookie在根路径下的所有路径都有效
//         maxAge: 1000 * 60 * 60 * 24, // cookie过期时间，单位毫秒
//         httpOnly: true, // cookie只允许服务端操作
//     }
// }))
// redis实例
// app.use(wyh_redis(redisConfig))
// 建立mongodb连接
app.use(mongodb())
app.use(json())
app.use(logger())
// 接口日志收集
app.use(apiLog());
// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(qiniu.routes(), qiniu.allowedMethods())
app.use(logs.routes(), logs.allowedMethods())
// 自动同步【自定义分钟】前的日志入库
logAutoSync({
    prefixDir: resolve(__dirname, './logs'), // 路径前缀
    timeThreshold: 1000 * 60 * 3, // 同步频率和同步时间范围  当前时间往前推自定义分钟数的所有文件
    syncFileLogList: ['api', 'system'], // 需要同步的本地日志二级目录
});

app.on('error', (err, ctx) => {
    console.error('control error', err, ctx)
});
module.exports = app
