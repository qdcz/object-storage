const cookieConfig = require("../config/cookie");

/**
 * 设置cookie
 * @param ctx
 * @param key
 * @param value
 */
exports.setCookie = function (ctx, key, value) {
    // 转换成 base64 字符串
    let val = Buffer.from(value).toString('base64')
    ctx.cookies.set(key, val, cookieConfig)
}
/**
 * 获取cookie
 * @param ctx
 * @param key
 * @returns {string}
 */
exports.getCookie = function (ctx, key) {
    let val = ctx.cookies.get(key)
    return Buffer.from(val, 'base64').toString()
}