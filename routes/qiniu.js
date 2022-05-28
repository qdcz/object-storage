const router = require('koa-router')();
const path = require('path');
router.prefix('/qiniu');
const qiniu = require("../qiniuyun/index");


// 单文件上传
router.get('/singleUploadFile', async function (ctx, next) {
    let localFile = path.join(path.resolve(), 'qiniuyun', 'index.js')
    let saveName = 'ad/saveName.js';
    let uploadToken = qiniu.uoloadToken(saveName,undefined,{fileType: 2},false)
    let res = await qiniu.uploadFile(uploadToken, localFile, saveName)
    ctx.body = res
})

router.get('/selFileInfo', async function (ctx, next) {
    let fileName = '';
    let res = await qiniu.selFileInfo(fileName);
    console.log("qiniu", fileName, res)
    ctx.body = 'this is a users/bar response'
})


// 创建一个文件夹
router.post('/mkdir', async function (ctx, next) {
    let {filePath} = ctx.request.body;
    if(!filePath) ctx.body = {code:204,msg:"入参错误，请查看接口文档！"}
    let localFile = path.join(path.resolve(), 'public', 'useForUploadFolder.js')
    let uploadToken = qiniu.uoloadToken(filePath, undefined, {fileType: 1},true)
    let res = await qiniu.uploadFile(uploadToken, localFile, filePath)
    ctx.body = res
})

// 查询所有的文件列表
router.get('/selFileList', async function (ctx, next) {
    let res = await qiniu.selFileList({
        prefix: "", limit: 999
    })
    ctx.body = res
})

// 删除文件
router.delete("/delFile", async function (ctx, next) {
    let {filePath} = ctx.request.body;
    if(!filePath) ctx.body = {code:204,msg:"入参错误，请查看接口文档！"}
    let res = await qiniu.delFile(filePath)
    ctx.body = res
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
