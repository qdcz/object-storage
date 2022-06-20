const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
// 简单crud用 orm 快速操作，对于复杂场景也引入了原厂支持的包，可做处理
const {mongooseConfig} = require("../config/mongodb");
const {logSystem} = require("../utils/logTolls");
const db_logger = require("../db/control/logger")


async function main() {
    let db = await mongoose.connect(mongooseConfig.url + "/" + mongooseConfig.dbName);
    logSystem("mongodb 连接成功！")
    // let addRes = await db_logger.add(); // 增加一条数据
    // if (!addRes.dbCode == 200) {
    //     return logSystem("数据异常" + addRes.msg, 'error')
    // }
    // let selectRes = await db_logger.selectById(addRes.data._id);
    // console.log(selectRes)

    // 批量清除数据库的数据
    // db_logger.deleteCurrentDoc()
}

// main().catch(err => {
//     logSystem("mongodb 连接异常:" + err)
// });

module.exports = function (opts) {
    let db = null; // mongodb数据库实例
    const main = async function () {
        db = await mongoose.connect(mongooseConfig.url + "/" + mongooseConfig.dbName);
        logSystem('mongodb数据库连接成功');
        // 批量清除数据库的数据
        // db_logger.deleteCurrentDoc()
    }
    main().catch(err => {
        logSystem("mongodb 连接异常:" + err)
        db = null
        return (ctx, next) => next()
    })
    return async function (ctx, next) {
        if (db) {
            ctx.db = db;
            await next()
        } else {
            ctx.body = {msg: "mongodb实例初始化异常", code: "500"}
        }
    }
}
