const router = require('koa-router')();
const path = require('path');
router.prefix('/qiniu');
const qiniu = require("../qiniuyun/index");


// 单文件上传
router.post('/singleUploadFile', async function (ctx, next) {
    let {filePath} = ctx.request.body;
    if (!filePath) return ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"};
    let localFile = path.join(path.resolve(), 'qiniuyun', 'index.js');
    let uploadToken = qiniu.uoloadToken(filePath, undefined, {fileType: 2}, false);
    let res = await qiniu.uploadFile(uploadToken, localFile, filePath);

    if (res.state == 'ok') {
        return ctx.body = {code: 200, msg: "上传成功！", data: res.data.items}
    } else {
        return ctx.body = {code: 204, msg: res.respBody.error}
    }
})

router.get('/selFileInfo', async function (ctx, next) {
    let fileName = '';
    let res = await qiniu.selFileInfo(fileName);
    console.log("qiniu", fileName, res)
    ctx.body = 'this is a users/bar response'
})


/**
 * 创建一个文件夹
 */
router.post('/mkdir', async function (ctx, next) {
    let {filePath} = ctx.request.body;
    if (!filePath) return ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"}
    let localFile = path.join(path.resolve(), 'public', 'useForUploadFolder.js')
    let uploadToken = qiniu.uoloadToken(filePath, undefined, {fileType: 1}, true)
    let res = await qiniu.uploadFile(uploadToken, localFile, filePath)
    if (res.state == 'ok') {
        return ctx.body = {code: 200, msg: "创建成功！"}
    } else {
        return ctx.body = {code: 204, msg: res.respBody.error}
    }
})

/**
 * 查询所有的文件列表
 */
router.get('/selFileList', async function (ctx, next) {
    let {prefixFilePath, limit} = ctx.request.query;
    let res = await qiniu.selFileList({
        prefix: prefixFilePath || "", limit: limit || 20
    })
    if (res.state == 'ok') {
        return ctx.body = {code: 200, msg: "查询成功！", data: res.data.items}
    } else {
        return ctx.body = {code: 204, msg: res.respBody.error}
    }
})

/**
 * 删除文件
 */
router.delete("/delFile", async function (ctx, next) {
    let {filePath} = ctx.request.body;
    if (!filePath) return  ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"}
    let res = await qiniu.delFile(filePath);
    if (res.state == 'ok') {
        return ctx.body = {code: 200, msg: "删除成功！"}
    } else {
        return ctx.body = {code: 204, msg: res.respBody.error}
    }
})

/**
 * 删除目录（含深度删除）
 */
router.delete("/delFolder", async function (ctx, next) {
    let {folderPath} = ctx.request.body;
    if (!folderPath) return ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"}
    let res = await qiniu.delFolder(folderPath);
    if (res.state == 'ok') {
        return ctx.body = {code: 200, msg: "删除成功！",data:res.data}
    } else {
        return ctx.body = {code: 204, msg: res.data }
    }
})

module.exports = router

/**
 * uoloadToken
 * fileType 1 设置文件夹
 *          2 设置为文件
 * overUpload 只对文件有效，对文件夹无效
 *
 * 删除文件请用递归删除
 */
