const mongoose = require('mongoose');
const loggerSchema = new mongoose.Schema({
    startTime: Date, // 开始时间
    uuid: String,
    logType: String,  // 日志类型
    logLevel: Number, // 日志等级

    /**
     * 以下是针对restfulApi格式的的数据建模
     */
    url: String,
    method: String,
    remoteAddress: String,
    query: String,
    status: String,
    responseData: String,
    responseSpeed: Number // (单位s)
});

module.exports = loggerSchema