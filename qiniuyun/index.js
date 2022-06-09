const config = require("./config");
const qiniu = require("qiniu");
qiniu.conf.ACCESS_KEY = config.options.accessKey;
qiniu.conf.SECRET_KEY = config.options.secretKey;

const PUBLICDOMAIN = 'www.qddscxy.cn'; // 公开空间前缀域名
const PRIVATEDOMAIN = 'rd7t1thzx.hn-bkt.clouddn.com'; // 私有空间前缀域名


const qiniuConfig = new qiniu.conf.Config();
/**
 * 华东    qiniu.zone.Zone_z0
 * 华北    qiniu.zone.Zone_z1
 * 华南    qiniu.zone.Zone_z2
 * 北美    qiniu.zone.Zone_na0
 */
qiniuConfig.zone = qiniu.zone.Zone_z0;

// Mac是钥匙，拿到“钥匙”的人才有这个权限，用到了准备工作中的公私钥对
const mac = new qiniu.auth.digest.Mac(config.options.accessKey, config.options.secretKey);

// 资源管理相关的操作首先要构建BucketManager对象：
const bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig);


/**
 * 存储支持空间创建在不同的机房，在使用 Node.js SDK 中的FormUploader和ResumeUploader上传文件之前，必须要构建一个上传用的config对象，在该对象中，可以指定空间对应的zone以及其他的一些影响上传的参数。
 */
let putExtra = new qiniu.form_up.PutExtra();
let formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
// 生成一个token凭证
// 查询文件信息
const uoloadToken = function (fileName, bucket, opt, overUpload) {
    bucket = bucket || config.options.bucket;
    opt = opt || {};
    var putPolicy = new qiniu.rs.PutPolicy({
        scope: overUpload ? `${bucket}:${fileName}` : bucket,
        expires: 3600,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket  )","name":"$(x:name)"}'
    });
    putPolicy = Object.assign(putPolicy, opt);
    // console.log(overUpload ? `${bucket}:${fileName}` : bucket)
    return putPolicy.uploadToken(mac);
}
/**
 * 上传文件
 * @param fileName
 * @returns {Promise<unknown>}
 */
const uploadFile = function (uploadToken, localFile, saveName, bucket = config.options.bucket) {
    return new Promise((resolve, reject) => {
        formUploader.putFile(uploadToken, saveName, localFile, putExtra, function (respErr, respBody, respInfo) {
            if (!respErr) {
                if (respInfo.statusCode == 200) {
                    resolve({
                        state: "ok",
                        data: respBody
                    })
                } else {
                    resolve({
                        state: "ok & !=200",
                        respInfo: respInfo,
                        respBody: respBody
                    })
                }
            } else {
                resolve({
                    state: "fail",
                    data: respErr
                })
            }
        });
    })
}
/**
 * 上传文件（流式上传）
 * @param uploadToken
 * @param localFile
 * @param saveName
 * @param bucket
 */
const uploadFileForStream = function (uploadToken, fileStream, saveName, bucket = config.options.bucket) {
    return new Promise((resolve, reject) => {
        formUploader.putStream(uploadToken, saveName, fileStream, putExtra, function (respErr, respBody, respInfo) {
            if (respErr) {
                resolve({
                    state: "fail",
                    data: respErr
                })
            } else {
                if (respInfo.statusCode == 200) {
                    resolve({
                        state: "ok",
                        data: respBody
                    })
                } else {
                    resolve({
                        state: "ok & !=200",
                        respInfo: respInfo,
                        respBody: respBody
                    })
                }
            }
        })
    })
}, selFileInfo = function (fileName, bucket = config.options.bucket) {
    return new Promise((resolve, reject) => {
        bucketManager.stat(bucket, fileName, function (err, respBody, respInfo) {
            if (err) {
                resolve({
                    state: "fail",
                    data: err
                })
            } else {
                if (respInfo.statusCode == 200) {
                    resolve({
                        state: "ok",
                        data: respBody
                    })
                } else {
                    resolve({
                        state: "ok & !=200",
                        respInfo: respInfo,
                        respBody: respBody
                    })
                }
            }
        })
    })
}
/**
 * 查询文件/文件列表
 * @param options  对象
 * {
 *   prefix: prefixFilePath || "",      前缀
 *   limit: limit || 20                 条数
 *  }
 * @param bucket
 * @returns {Promise<unknown>}
 */
const selFileList = function (options, bucket = config.options.bucket) {
    return new Promise((resolve, reject) => {
        bucketManager.listPrefix(bucket, options, function (err, respBody, respInfo) {
            if (err) {
                resolve({
                    state: "fail",
                    data: err
                })
            } else {
                if (respInfo.statusCode == 200) {
                    resolve({
                        state: "ok",
                        data: respBody
                    })
                } else {
                    resolve({
                        state: "ok & !=200",
                        respInfo: respInfo,
                        respBody: respBody
                    })
                }
            }
        })
    })
}
/**
 * 删除文件
 * @param fileName  文件名字
 * @param bucket    桶名字
 * @returns {Promise<unknown>}
 */
const delFile = function (fileName, bucket = config.options.bucket) {
    return new Promise((resolve, reject) => {
        bucketManager.delete(bucket, fileName, function (err, respBody, respInfo) {
            if (err) {
                resolve({
                    state: "fail",
                    data: err
                })
            } else {
                if (respInfo.statusCode == 200) {
                    resolve({
                        state: "ok",
                        data: respBody
                    })
                } else {
                    resolve({
                        state: "ok & !=200",
                        respInfo: respInfo,
                        respBody: respBody
                    })
                }
            }
        })
    })
}
/**
 * 删除文件夹目录及其文件   查询目录后面必须加上/
 * @param folderName    文件夹名字    eg:test/ad/
 * @param bucket        桶名字
 */
const delFolder = function (folderName, bucket = config.options.bucket) {
    return new Promise(async (resolve, reject) => {
        if (folderName.slice(-1) != "/") {
            resolve({
                state: "fail",
                data: "后缀必须带有/符号"
            })
            return
        }

        /**
         * 先需查询出该文件夹下的所有目录 按层级划分
         * 然后逐一删除文件夹内的文件 从最内层级开始删
         */
        const dirFloder = []; // 给文件夹做等级编号
        let delQueue = []; // 需要删除的文件路径队列(先进先删)

        let list = await selFileList({
            prefix: folderName || "",
            limit: 100
        })
        list.data.items.forEach(i => {
            if (i.key.slice(-1) == '/') { // 判定为是目录
                let count = i.key.match(/\//igm).length;
                dirFloder.push({
                    key: i.key,
                    level: count
                })
            } else { // 不是目录是文件可以直接删除
                delQueue.push(i.key)
            }
        })
        dirFloder.sort((a, b) => b.level - a.level).forEach(i => {
            delQueue.push(i.key)
        })


        // 整理成七牛云需要删除的格式数组
        delQueue = delQueue.map(i => qiniu.rs.deleteOp(bucket, i));
        let excuteIndex = 0; // 批次删除执行 当前所属下标
        let excuteResult = undefined; // 批次删除执行 删除成功数据缓存
        // 每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送（批次删除）
        for (let i = 1; i <= Math.ceil(delQueue.length / 2000); i++) {
            bucketManager.batch(delQueue, function (err, respBody, respInfo) {
                if (err) {
                    resolve({
                        state: "fail",
                        data: err
                    })
                } else {
                    // 200 is success, 298 is part success
                    if (parseInt(respInfo.statusCode / 100) == 2) {
                        respBody.forEach(function (item) {
                            if (item.code == 200) {
                                if (i == Math.ceil(delQueue.length / 2000)) {
                                    resolve({
                                        state: "ok",
                                        data: excuteResult
                                    })
                                } else {
                                    excuteResult.push(respBody)
                                }
                                // resolve({
                                //     state: "ok",
                                //     data: respBody
                                // })
                            } else {
                                resolve({
                                    state: "ok & !=200",
                                    respInfo: respInfo,
                                    respBody: respBody
                                })
                            }
                        });
                    } else {
                        resolve({
                            state: "ok & !=200",
                            respInfo: respInfo,
                            respBody: respBody
                        })
                    }
                }
                excuteIndex++
            });
        }
    })
}
/**
 * 获取文件下载链接（公开空间）
 * @param filePath  文件路径
 */
const publicFileDownloadLink = function (filePath) {
    let publicDownloadUrl = bucketManager.publicDownloadUrl(PUBLICDOMAIN, filePath);
    return publicDownloadUrl
}
/**
 * 获取文件下载链接（私有空间）
 * @param filePath  文件路径
 * @param deadline  有效时间
 */
const privateFileDownloadLink = function (filePath, deadline) {
    deadline = deadline || parseInt(Date.now() / 1000) + 3600; // 1小时过期
    let publicDownloadUrl = bucketManager.privateDownloadUrl(PRIVATEDOMAIN, filePath, deadline);
    return publicDownloadUrl
};


module.exports = {
    qiniu,
    uoloadToken,
    uploadFile,
    publicFileDownloadLink,
    privateFileDownloadLink,
    uploadFileForStream,
    selFileInfo,
    selFileList,
    delFile,
    delFolder
}


/**
 * TODO
 * 上传:  文件上传、单文件上传、分段上传、批量上传
 * 下载： 公开空间下载链接【ok】 、私有空间下载链接【OK】
 * 删除【ok】:  单个删除、删除目录（深度删除）   多个删除文件、目录（并发调用接口即可）
 * 修改：
 * 查询【ok】：  查询所有文件、查询指定目录、查询指定文件
 * 移动：
 * 复制：
 * 重命名：
 *
 */