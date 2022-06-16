const {createClient} = require('redis');
const {logSystem} = require("../utils/logTolls")

module.exports = function (opts) {
    let client = null;
    try {
        opts = opts || {
            username: "default",
            password: "",
            host: 'localhost',
            port: '6379'
        }
        client = createClient({
            url: `redis://${opts.username}:${opts.password}@${opts.host}:${opts.port}`
        });
        client.on('error', (err) => {
            logSystem('Redis 连接失败', 'info')
        });
        client.on('ready', () => {
            logSystem('Redis 连接成功', 'info')
        })
        client.on('reconnecting', (delay, attempt) => {
            logSystem('Redis 断线重连中...', 'info')
        })
        client.on('end', () => {
            logSystem('Redis 连接已被关闭', 'info')
        })
        client.connect();
    } catch (e) {
        logSystem('redis连接失败了' + e, 'error')
        client = null
        return (ctx, next) => next()
    }
    return async function (ctx, next) {
        if (client) {
            ctx.redis = client;
            await next()
        } else {
            ctx.body = {msg: "redis实例初始化异常", code: "500"}
        }
    }
}

