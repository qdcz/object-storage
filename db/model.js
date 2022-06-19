const mongoose = require("mongoose");
const logSchema = require("./schema/logger");


// 日志文档
exports.logModel = mongoose.model('log', logSchema);
// 其他数据库的文档...