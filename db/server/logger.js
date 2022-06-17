const loggerSchema = require("../schema/logger");
const mongoose = require('mongoose');
const loggerModel = mongoose.model('logger', loggerSchema);  // 建立一个日志文档

const {logSystem} = require('../../utils/logTolls')
const {json} = require("formidable/src/plugins");


// 添加一条数据
const add = function (arg) {
    return new Promise((res, rej) => {
        let _logger = new loggerModel({
            uuid: 'String',
            // url: 'String',
            // method: 'String',
            // remoteAddress: 'String',
            // query: 'String',
            // status: 'String',
            // responeData: 'String',
            // responseSpeed: 2, // (单位s)
            // logType: 'String',  // 日志类型
            // logLevel: 2 // 日志等级
        })
        _logger.save((err, data) => {
            if (err) {
                logSystem(err, 'error');
                rej(err)
                return
            }
            const resData = {dbCode: 200, msg: "数据插入成功!", data};
            res(resData);
            logSystem(JSON.stringify(resData));
        })
    })
}

// 查询数据
const selectById = async function (id) {
    return new Promise((res, rej) => {
        loggerModel.findById(id, (err, data) => {
            if (err) {
                logSystem(err, 'error');
                rej(err)
                return
            }
            const resData = {dbCode: 200, msg: "数据查询成功!", data};
            res(resData);
            logSystem(JSON.stringify(resData));
        });
    })
}
module.exports = {
    add,
    selectById,
}