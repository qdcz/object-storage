const {logModel} = require("../model");
const {logSystem} = require('../../utils/logTolls')


class logger {
    constructor() {

    }

}
// logModel = new proxy(logModel)

// 添加一条数据
const add = function (arg) {
    return new Promise((res, rej) => {
        let _logger = new logModel({
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
        logModel.findById(id, (err, data) => {
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

// 添加多条数据
const addMany = function (list) {
    return new Promise((res, rej) => {
        logModel.insertMany(list, (err, docs) => {
            if (err) {
                logSystem(err, 'error');
                rej(err)
                return
            }
            const resData = {dbCode: 200, msg: "数据批量插入成功!", docs};
            res(resData);
            logSystem(JSON.stringify(resData));
        });
    })
}

// 删除当前文档的所有数据
const deleteCurrentDoc = function () {
    return new Promise((res, rej) => {
        logModel.remove(function (err, docs) {
            if (err) {
                logSystem(err, 'error');
                rej(err)
                return
            }
            const resData = {dbCode: 200, msg: "清楚文档成功!", docs};
            res(resData);
            logSystem(JSON.stringify(resData));
        })
    })

}

// 删除一条数据
// 修改数据
module.exports = {
    add,
    addMany,
    deleteCurrentDoc,
    selectById,
}