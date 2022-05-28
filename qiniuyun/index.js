const config = require("./config");
const qiniu = require("qiniu");
qiniu.conf.ACCESS_KEY = config.options.accessKey;
qiniu.conf.SECRET_KEY = config.options.secretKey;

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

// 查询文件信息
const selFileInfo = function (fileName, bucket = config.options.bucket) {
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
 * @param options
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
 * @param fileName
 * @param bucket
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


module.exports = {
    qiniu,
    uoloadToken,
    uploadFile,
    selFileInfo,
    selFileList,
    delFile
}