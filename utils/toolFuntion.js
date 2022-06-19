const {resolve, join} = require('path')
const fs = require("fs");
const {Buffer} = require('buffer');
const uid = require("uuid");
const logModel = require("../db/control/logger")
/**
 * 思路
 *
 * 切割粒度 按分钟切割
 *
 *
 * 同步策略 启动程序时先同步所有已有的日志
 * 退出程序时，清空所有的日志
 *      在退出回调进行清空操作
 *      可以在子进程中处理日志同步
 *
 *  每隔【自定义分钟】自动同步之前的日志，同步完之后直接删除
 * 读取指定文件的
 */


/**
 *  自动同步文件到数据库
 * @param prefixDir 目录前缀
 * @param time      设置自动同步日志的时间频率 单位s
 */
const logAutoSync = function (prefixDir, time) {
    let timeThreshold = 1000 * 60 * 2;  // 时间阈值 取前两分钟的所有日志文件
    const run = async function () {
        prefixDir = prefixDir || resolve(__dirname, '../logs'); // 目录前缀
        const syncFileLogList = ['api', 'system']; // 需要同步的本地日志二级目录
        let needSyncLogFilePath = []; // 需要同步的日志文件列表

        // 先遍历指定目录下的日志文件
        for (let i = 0; i < syncFileLogList.length; i++) {
            let dirName = syncFileLogList[i];
            let list = await fs.readdirSync(prefixDir + '/' + dirName);
            list = list.map(v => {
                let timeOfFileName = v.split('.')[1].replace("~", " ").split(" ");   // [ '2022-06-16', '23-54' ]
                let YYMMDD = timeOfFileName[0];                                      // 2022-06-16
                let hhmmss = timeOfFileName[1].replace("-", ":") + ":00";             // 23:57:00
                let YYMMDDhhmmss = YYMMDD + " " + hhmmss;                            // 2022-06-17 00:31:00
                let timeGap = Date.now() - new Date(YYMMDDhhmmss).getTime()          // 时间差
                if (timeGap > timeThreshold) { // 只取范围外的时间(日志)文件
                    return join(prefixDir, join(`/${dirName}`, `/${v}`))
                }
                return null
            }).filter(v => v)
            needSyncLogFilePath = needSyncLogFilePath.concat(list)
        }
        console.log('needSyncLogFilePath', needSyncLogFilePath)


        let targetData = [];  // api接口请求日志
        // 遍历数组 顺序入库：
        for (let index = 0; index < needSyncLogFilePath.length; index++) {
            let fileName = needSyncLogFilePath[index];
            const file = await fs.readFileSync(fileName);
            let fileContent = Buffer.from(file).toString('utf8');
            fileContent = "[" + fileContent.slice(0, -3) + "]"
            fileContent = JSON.parse(fileContent)
            if (fileContent.length > 0) {
                // console.log('日志文件下的数据列表', fileContent)



                // 对数据进行处理成想要的数据格式
                fileContent.forEach(item => {
                    let arr = dataProcessForLogCategory(item)
                    if (arr) {
                        targetData.push(arr);
                    }
                })
            }
        }

        // 将指定数据存到数据库中
        let res = saveLogToDataBase(targetData);
        if(!res){
            return console.log("数据同步到库失败！");
        }
        // 清楚掉已经同步完成的文件
        needSyncLogFilePath.forEach(item=>{
            fs.unlink(item,(err)=>{
                if(err){
                    console.log('文件删除失败',err,item)
                }
            })
        })

    }
    run().then(r => {
    })

    // 要上个锁 不能这么玩，在前置操作没执行完之前不允许下一次同步
    setInterval(run, time)
}


// 对日志文件中的数据 按类别处理并归类
const dataProcessForLogCategory = function (data) {
    const fieldMapPolicy = {
        'systemLogger': function (item) {
            return {
                startTime: item.startTime,
                uuid: uid.v4(),
                logLevel: item.level.levelStr, // 日志等级
                data: item.data[0]
            }
        },
        'apiLogger': function (item) {
            let da = JSON.parse(item.data[0])
            return {
                startTime: item.startTime,
                uuid: uid.v4(),
                url: da.requestUrl,
                method: da.requestMethod,
                remoteAddress: da.requestClientRemoteAddress,
                query: da.requestQuery,
                body: da.requestBody,
                status: da.responseStatus,
                responseData: da.responseBody ? JSON.stringify(da.responseBody) : "",
                responseSpeed: Number(da.requestTime), // (单位s)
                logType: item.categoryName,  // 日志类型
                logLevel: item.level.levelStr // 日志等级
            }
        },
    }
    let executeFn = fieldMapPolicy[data.categoryName];
    if (executeFn) {
        return executeFn(data)
    }
    return null
}


/**
 * 将数据存入到数据库中
 * @param $document   文档(表)
 * @param $data       数据集合
 */
const saveLogToDataBase = async function ($data) {
    try{
        let res = null
        if (!$data) return console.error("$data不能为空");
        if (Array.isArray($data)) {
            if ($data.length == 0) return console.error("$data不能为空")
            res = await logModel.addMany($data);
        } else {
            res = await logModel.add($data);
        }
        return res
    }catch(e){
        console.log('saveLogToDataBase错误',e)
        return null
    }
}


module.exports = {
    logAutoSync
}