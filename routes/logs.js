const router = require('koa-router')();
const logger = require("../control/logger");
router.prefix('/logs')
/**
 * 对路由表进行crud操作
 */

// 获取全部日志列表
router.post('/logList', async function (ctx, next) {
    /**
     * 可查询的条件       日期、方法、url、大屏使用方、ip、日志类型（系统、api、数据库操作）、日志等级、响应状态、响应速度
     */
    let {pageNum = 0, pageSize = 10, startTime, endTime} = ctx.request.body;
    let selJson = {}
    let reqBodyArgList = ['logType', 'logLevel', 'method', 'status']; // 多条件查询入参【可选】
    for (let i in reqBodyArgList) {
        ctx.request.body[reqBodyArgList[i]] ? selJson[reqBodyArgList[i]] = ctx.request.body[reqBodyArgList[i]] : ""
    }

    let like_Json = {}
    let like_reqBodyArgList = ['url', 'requestHref'] // 需要进行模糊查询的入参【可选】
    for (let i in like_reqBodyArgList) {
        ctx.request.body[like_reqBodyArgList[i]] ? like_Json[like_reqBodyArgList[i]] = new RegExp(`${ctx.request.body[like_reqBodyArgList[i]]}`) : ""
    }
    if (startTime && endTime) { // 处理日期范围查询【可选】
        selJson['startTime'] = {$gte: startTime, $lte: endTime}
    }
    // if (startTime && endTime) { // 处理响应速度范围查询【可选】
    //     selJson['responseSpeed'] = {$gte: startTime, $lte: endTime}
    // }


    const _filter = Object.assign(selJson, like_Json)
    let dataList = await logger.selectByQuoteType(pageNum, pageSize, _filter);
    let count = await logger.selectCount(_filter);
    return ctx.body = {code: 200, msg: "查询成功！", data: dataList.data, total: count.data, pageNum, pageSize}
})

// 删除指定日志
router.delete('/log', async function (ctx, next) {
    let {uuid} = ctx.request.body;
    if (!uuid) return ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"};
    const _filter = {
        uuid
    }
    let dataList = await logger.deleteByQuoteType(_filter);
    if (dataList.data.deletedCount > 0) {
        return ctx.body = {code: 200, msg: "数据删除查询成功！", count: dataList.data.deletedCount}
    } else {
        return ctx.body = {code: 200, msg: "数据已被删除或者不存在！",}
    }
})
// 删除多条日志
router.delete('/logList', async function (ctx, next) {
    let {uuids} = ctx.request.body;
    if (!uuids) return ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"};
    if (!Array.isArray(uuids)) return ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"};

    let dataList = await logger.deleteManyByUuid(uuids);
    if (dataList.data.deletedCount > 0) {
        return ctx.body = {code: 200, msg: "数据删除查询成功！", count: dataList.data.deletedCount}
    } else {
        return ctx.body = {code: 200, msg: "数据已被删除或者不存在！",}
    }
})
module.exports = router