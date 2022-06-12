const path = require('path');
const fs = require('fs');
const stream = require('stream')

const router = require('koa-router')();

router.prefix('/qiniu');
const qiniu = require("../qiniuyun/index");


// 单文件上传(假的-测试用)
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

// 单文件上传-流式(文件传到后端，后端再流式传到七牛云)
router.put('/singleUploadFileStream', async function (ctx, next) {
    let {fileName, fileSize, filePath} = ctx.request.body; // 获取上传文件接口的入参

    // 二进制文件直接写入到本地
    const {files} = ctx.request.files; // 获取form-data上传的接口信息
    const reader = fs.createReadStream(files.filepath); // 创建可读流
    /**
     * 不同时写入到本地可以关掉
     */
    // let saveFilePath = "./public/testFile/" + `/${files.originalFilename}`;  // 设置文件的保存路径
    // const upStream = fs.createWriteStream(saveFilePath); // 创建可写流
    // reader.pipe(upStream); // 将可读流的数据消费到可写流


    filePath = filePath || 'test/' + fileName; // 传到七牛云的路径
    // files = files.replace(/\s/g, "+");
    // files = files.replace(/^\w+:\w+\/\w+;base64,/, "");
    // const fileBuffer = Buffer.from(files, 'base64').toString('binary'); // 将上传的base64转为buffer
    // for (let i = 0; i < fileBuffer.length; ++i) {
    //     if (fileBuffer[i] < 0) {// 调整异常数据
    //         fileBuffer[i] += 256;
    //     }
    // }
    // fs.writeFileSync("./public/" + fileName, fileBuffer);
    // return
    // let readable = new stream.Readable(); // 创建可读流
    // readable.push(fileBuffer); // 往可读流塞数据
    // readable.push(null); // 结束

    // var readStream = fs.createReadStream(); // 创建可读流
    // readStream.push(fileBuffer); // 往可读流塞数据
    // readStream.push(null); // 结束


    // 创建可读流
    // const bufferStream = new stream.PassThrough();
    // const streams = bufferStream.end(fileBuffer);

    // let stream1 = new stream.Duplex();
    // stream1.push(fileBuffer);
    // stream1.push(null);

    // let writeable = fs.createWriteStream("./ttt/" + `/${fileName}`); // 创建可写流
    // bufferStream.pipe(writeable)
    //
    // return


    // 获取上传凭证
    let uploadToken = qiniu.uoloadToken(filePath, undefined, {fileType: 2}, false);
    let res = await qiniu.uploadFileForStream(uploadToken, reader, filePath);
    if (res.state == 'ok') {
        return ctx.body = {code: 200, msg: "上传成功！"}
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
 * 获取文件下载链接(公开空间存储)
 */
router.post('/publicFileDownloadLink', async function (ctx, next) {
    let {filePath} = ctx.request.body;
    if (!filePath) return ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"}
    let localFile = path.join(path.resolve(), 'public', 'useForUploadFolder.js')
    let res = qiniu.publicFileDownloadLink(filePath)
    return ctx.body = {code: 200, msg: "创建链接成功！", url: res}
})

/**
 * 获取文件下载链接(私有空间存储)
 */
router.post('/privateFileDownloadLink', async function (ctx, next) {
    let {filePath} = ctx.request.body;
    if (!filePath) return ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"}
    let localFile = path.join(path.resolve(), 'public', 'useForUploadFolder.js')
    let res = qiniu.privateFileDownloadLink(filePath)
    return ctx.body = {code: 200, msg: "创建链接成功！", url: res}
})


/**
 * 查询所有的文件列表
 */
router.get('/selFileList', async function (ctx, next) {
    let {prefixFilePath, limit, bucket} = ctx.request.query;
    let res = await qiniu.selFileList({
        prefix: prefixFilePath || "", limit: limit || 20
    }, bucket)
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
    if (!filePath) return ctx.body = {code: 204, msg: "入参错误，请查看接口文档！"}
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
        return ctx.body = {code: 200, msg: "删除成功！", data: res.data}
    } else {
        return ctx.body = {code: 204, msg: res.data}
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
