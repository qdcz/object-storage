const {createClient} = require('redis');

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
        client.on('error', (err) => console.log('Redis Client Error', err));
        client.on('ready', () => {
            console.log('Redis 连接成功')
        })
        client.on('reconnecting', (delay, attempt) => {
            console.log('Redis 断线重连中...', delay)
        })
        client.on('end', () => {
            console.log('Redis 连接已被关闭')
        })
        client.connect();
        // await client.set('key', '哦豁噢噢噢噢');
        // const value = await client.get('key');
        // console.log(11, value)
    } catch (e) {
        console.log('redis连接失败了', e)
        client = null
        return (ctx, next) => next()
    }
    return async function (ctx, next) {
        if (client) {
            ctx.redis = client;
            await next()
        } else {
            ctx.body = {msg: "redis异常", code: "500"}
        }
    }
}

