const {resolve, join} = require('path');
const fs = require("fs");
const {Buffer} = require('buffer');
const uid = require("uuid");
const logModel = require("../db/control/logger");
const {logSystem} = require("./logTolls");
const tools = require("./tools");
/**
 * 思路：
 * 日志切割粒度 按分钟切割
 * 文件格式布局 日志改成自定义布局 使用json形式
 * 同步策略：
 * 每隔【自定义分钟】自动同步之前的日志，同步完之后直接删除本地文件 --- 后续可以在子进程处理此过程
 *
 *
 *
 * 自动同步文件到数据库
 * @param opt
 */
const logAutoSync = function (opt) {
    opt = opt || {
        prefixDir: resolve(__dirname, '../logs'),// 目录前缀
        timeThreshold: 1000 * 60 * 3,// 时间阈值 取前3分钟到前6分钟之内的日志文件
        syncFileLogList: ['api', 'system'], // 需要同步的本地日志二级目录
    }

    const run = async function () {
        let needSyncLogFilePath = []; // 需要同步的日志文件列表
        // 先遍历指定目录下的日志文件
        for (let i = 0; i < opt.syncFileLogList.length; i++) {
            let dirName = opt.syncFileLogList[i];
            let list = await fs.readdirSync(opt.prefixDir + '/' + dirName);
            list = list.map(v => {
                let timeOfFileName = v.split('.')[1].replace("~", " ").split(" ");   // [ '2022-06-16', '23-54' ]
                let YYMMDD = timeOfFileName[0];                                                             // 2022-06-16
                let hhmmss = timeOfFileName[1].replace("-", ":") + ":00";             // 23:57:00
                let YYMMDDhhmmss = YYMMDD + " " + hhmmss;                                                   // 2022-06-17 00:31:00
                let timeGap = Date.now() - new Date(YYMMDDhhmmss).getTime()                                 // 时间差
                // console.log(666, timeOfFileName, YYMMDDhhmmss, timeGap, opt.timeThreshold)
                // if (timeGap >= opt.timeThreshold && timeGap <= opt.timeThreshold * 2) {                     // 只取范围内的时间(日志)文件
                if (timeGap >= opt.timeThreshold) {                         // 只取范围内的时间(日志)文件
                    return join(opt.prefixDir, join(`/${dirName}`, `/${v}`))
                }
                return null
            }).filter(v => v)
            needSyncLogFilePath = needSyncLogFilePath.concat(list)
        }
        // console.log('需要同步的文件', needSyncLogFilePath)

        let targetData = [];  // api接口请求日志
        for (let index = 0; index < needSyncLogFilePath.length; index++) {
            let fileName = needSyncLogFilePath[index];
            const file = await fs.readFileSync(fileName);
            let fileContent = Buffer.from(file).toString('utf8');
            fileContent = "[" + fileContent.slice(0, -3) + "]"
            fileContent = JSON.parse(fileContent)
            if (fileContent.length > 0) {
                fileContent.forEach(item => {
                    let arr = tools.dataProcessForLogCategory(item)
                    if (arr) {
                        targetData.push(arr);
                    }
                })
            }
        }

        // 将指定数据存到数据库中
        let res = saveLogToDataBase(targetData);
        if (!res) {
            return logSystem(`数据同步到库失败` + res, 'error');
        }
        // 清除掉已经同步完成的文件
        needSyncLogFilePath.forEach(item => {
            fs.unlinkSync(item);
            // logSystem(`${item}日志文件删除成功`)
        })

    }
    run().then(r => {

    })

    //TODO 要上个锁，在前置操作没执行完之前不允许下一次同步
    setInterval(run, opt.timeThreshold);
}


/**
 * 将数据存入到数据库的logs文档中
 * @param $document   文档(表)
 * @param $data       数据集合
 */
const saveLogToDataBase = async function ($data) {
    try {
        let res = null
        if (!$data) return // console.error("$data不能为空");
        if (Array.isArray($data)) {
            if ($data.length == 0) return // console.error("$data不能为空")
            res = await logModel.addMany($data);
        } else {
            res = await logModel.add($data);
        }
        return res
    } catch (e) {
        logSystem(`saveLogToDataBase错误` + e, 'error');
        return null
    }
}


module.exports = logAutoSync