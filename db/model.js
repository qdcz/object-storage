const mongoose = require("mongoose");
const loggerSchema = require("./schema/logger");


// 日志文档
exports.loggerModel = mongoose.model('logger', loggerSchema);
// 其他数据库的文档...