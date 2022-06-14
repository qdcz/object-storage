const router = require('koa-router')();
const uuid = require('uuid');
const {getCookie, setCookie} = require("../utils/cookieTools");
const {sign, unsign} = require("../utils/signature");
const sessionConfig = require("../config/session")
router.prefix('/users')

router.get('/login', async function (ctx, next) {
    try {
        const uid = uuid.v4()
        const objInfo = {
            uid,
            time: Date.now(),
            msg: "后续存入用户信息"
        }
        let sessionId = sign(uid, sessionConfig.secret); // 对uuid和其他数据进行签名
        await ctx.redis.set(sessionId, JSON.stringify(objInfo)); // redis存储
        await ctx.redis.expire(sessionId, 1000 * 60 * 30); // 设置30分钟过后过期
        setCookie(ctx, "sid", sessionId)
        ctx.body = '登陆成功啊！'
    } catch (e) {
        console.log('login接口错误', e)
    }
})
router.get('/userInfo', async function (ctx, next) {
    try {
        // const {cookie} = ctx.headers;
        // if (!cookie) {
        //     return ctx.body = {code: 204, msg: "cookie已经过期或不存在，请重新登陆！"}
        // }
        // let cookies = cookie.split(";");
        // cookies = cookies.reduce((tot, cur, ind) => {
        //     tot[cur.split("=")[0]] = cur.split("=")[1]
        //     return tot
        // }, {})
        const sid = getCookie(ctx, 'sid');
        if (!sid) return ctx.body = {code: 204, msg: "cookie已经过期或不存在，请重新登陆！"}
        // let sessionId = unsign(sid, sessionConfig.secret); // 解密sessionId
        let objInfo = await ctx.redis.get(sid);
        if (!objInfo) return ctx.body = {code: 204, msg: "cookie已经过期或不存在，请重新登陆！"}
        ctx.body = '获取信息成功！' + objInfo
    } catch (e) {
        console.log('userInfo接口错误', e)
    }
})

module.exports = router
