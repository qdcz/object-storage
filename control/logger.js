const {logModel} = require("../db/model");
const {logSystem} = require('../utils/logTolls');

// class logger {
//     constructor() {
//
//     }
//
// }

// logModel = new proxy(logModel)

/**
 * 添加一条数据
 * @param data
 * @returns {Promise<unknown>}
 */
const add = function (data) {
    return new Promise((res, rej) => {
        let _logger = new logModel(data)
        _logger.save((err, data) => {
            if (err) {
                logSystem(err, 'error');
                rej(err)
                return
            }
            const resData = {dbCode: 200, msg: "数据插入成功!", data};
            res(resData);
            // logSystem(JSON.stringify(resData));
        })
    })
}

/**
 * 通过id查询数据
 * @param id
 * @returns {Promise<unknown>}
 */
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
            // logSystem(JSON.stringify(resData));
        });
    })
}

/**
 * 通过指定属性查询删除数据
 * @param arg    过滤器对象
 * @returns {Promise<unknown>}
 */
const deleteByQuoteType = async function (arg) {
    return new Promise((res, rej) => {
        logModel.deleteOne({...arg}, (err, data) => {
            if (err) {
                logSystem(err, 'error');
                rej(err)
                return
            }
            const resData = {dbCode: 200, msg: "数据删除成功!", data};
            res(resData);
            // logSystem(JSON.stringify(resData));
        });
    })
}

/**
 * 通过uuid属性查询多条删除数据
 * @param uuidList
 * @returns {Promise<unknown>}
 */
const deleteManyByUuid = async function (uuidList) {
    return new Promise((res, rej) => {
        logModel.deleteMany({'uuid': {$in: uuidList}}, (err, data) => {
            if (err) {
                logSystem(err, 'error');
                rej(err)
                return
            }
            const resData = {dbCode: 200, msg: "数据删除成功!", data};
            res(resData);
            // logSystem(JSON.stringify(resData));
        });
    })
}

/**
 * 通过对象属性查询数据(分页、多字段条件查询)
 * @param pageNum
 * @param pageSize
 * @param arg           过滤器
 * @returns {Promise<unknown>}
 */
const selectByQuoteType = async function (pageNum, pageSize, arg) {
    return new Promise((resolve, reject) => {
        logModel.find({...arg}).skip(pageNum * pageSize).limit(pageSize).exec((error, result) => {
            if (error) {
                logSystem(error, 'error');
                reject(error)
                return
            }
            const resData = {dbCode: 200, msg: "数据查询成功!", data: result};
            resolve(resData);
            // logSystem(JSON.stringify(resData));
        })
    })
}

/**
 * 查询count
 * @param arg
 * @returns {Promise<unknown>}
 */
const selectCount = function (arg) {
    return new Promise((resolve, reject) => {
        logModel.count({...arg}, (error, result) => {
            if (error) {
                logSystem(error, 'error');
                reject(error)
                return
            }
            const resData = {dbCode: 200, msg: "数据查询成功!", data: result};
            resolve(resData);
            // logSystem(JSON.stringify(resData));
        })
    })
}

/**
 * 添加多条数据
 * @param list
 * @returns {Promise<unknown>}
 */
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
            // logSystem(JSON.stringify(resData));
        });
    })
}

/**
 * 删除当前文档的所有数据
 * @returns {Promise<unknown>}
 */
const deleteCurrentDoc = function () {
    return new Promise((res, rej) => {
        logModel.deleteMany({uuid: {$ne: "test"}}, function (err, docs) {
            if (err) {
                logSystem(err, 'error');
                rej(err)
                return
            }
            const resData = {dbCode: 200, msg: "清除文档成功!", docs};
            res(resData);
            // logSystem(JSON.stringify(resData));
        })
    })

}

module.exports = {
    add,
    addMany,
    deleteCurrentDoc,
    deleteByQuoteType,
    deleteManyByUuid,
    selectById,
    selectByQuoteType,
    selectCount
}