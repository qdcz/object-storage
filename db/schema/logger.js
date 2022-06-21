const mongoose = require('mongoose');

// 日志表数据建模
const logSchema = new mongoose.Schema({
    startTime: Date, // 开始时间
    uuid: String, // uuid
    logType: String,  // 日志类型
    logLevel: String, // 日志等级


    /**
     * 以下是针对systemLog格式的数据建模
     */
    data: String,  // 系统日志打印内容

    /**
     * 以下是针对restfulApi格式的数据建模
     */
    url: String,  // 请求路径
    method: String, // 请求方法
    remoteAddress: String, // 请求地址   入参+个接口调用方
    requestHref: String, // 请求路径 www.xxx.com/a/b/c/d.html
    requestQuery: String, // 请求query入参
    requestBody: String,   // 请求body 入参
    status: String, // 响应状态
    responseData: String, // 响应数据
    responseSpeed: Number // 响应时间(单位s)


});

module.exports = logSchema