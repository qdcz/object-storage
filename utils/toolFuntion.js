const {resolve, basename, join} = require('path')
const fs = require("fs");
const {path} = require('../config/cookie');
const {Buffer} = require('buffer');
const uid = require("uuid")
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
 *
 * @param prefixDir 目前前缀
 * @param time      设置自动同步日志的时间频率 单位s
 */
const getFileData = function (prefixDir, time) {
    let jsonData = [];


    let timeThreshold = 1000 * 60 * 200;  // 时间阈值 取前两分钟的所有日志文件
    const run = async function () {
        prefixDir = prefixDir || resolve(__dirname, '../logs');
        const syncFileLogList = ['api', 'system']; // 需要同步的本地日志二级目录
        let needSyncLogFilePath = []; // 需要同步的日志文件
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
                if (timeGap < timeThreshold) { // 只取范围内的时间文件
                    return join(prefixDir, join(`/${dirName}`, `/${v}`))
                }
                return null
            }).filter(v => v)
            needSyncLogFilePath = needSyncLogFilePath.concat(list)
        }
        console.log('needSyncLogFilePath', needSyncLogFilePath)

        // fs.readFile(resolve(__dirname),(err,file)=>{
        //     console.log(file,resolve(__dirname),prefixDir)
        // })

        // 遍历数组 顺序入库：
        // needSyncLogFilePath
        for (let index = 0; index < needSyncLogFilePath.length; index++) {
            let fileName = needSyncLogFilePath[index];
            const file = await fs.readFileSync(fileName);
            let fileContent = Buffer.from(file).toString('utf8');
            fileContent = "[" + fileContent.slice(0, -3) + "]"
            fileContent = JSON.parse(fileContent)
            if (fileContent.length > 0) {
                // console.log('日志文件下的数据列表', fileContent)

                // 对数据进行处理成想要的数据格式
                let targetData_restfulApi = [];
                let targetData_system = [];
                fileContent.forEach(item => {

                    // 对data数据进行处理
                    if (item.categoryName === 'systemLogger') { // 系统运行级别的日志打印文本处理
                        targetData_system.push({
                            startTime: item.startTime,
                            uuid: uid.v4(),
                            logLevel: item.levelStr, // 日志等级
                            data: item.data[0]
                        })
                    } else if (item.categoryName === 'apiLogger') { // restfulApi 日志文本处理
                        let da = JSON.parse(item.data[0])
                        console.log(666,da)
                        let infoObj = {
                            startTime: item.startTime,
                            uuid: uid.v4(),
                            url: da.requestUrl,
                            method: da.requestMethod,
                            remoteAddress: da.requestClientRemoteAddress,
                            query: da.requestQuery,
                            body:da.requestBody,
                            status: da.responseStatus,
                            responseData: da.requestMethod,
                            responseSpeed: da.requestTime, // (单位s)
                            logType: item.categoryName,  // 日志类型
                            // responseBody:
                            logLevel: undefined // 日志等级
                        };
                    }
                    // item.data[0]


                })


            }
        }
    }
    run().then(r => {
    })

    // 要上个锁 不能这么玩，在前置操作没执行完之前不允许下一次同步
    setInterval(run, time)
}

module.exports = {
    getFileData
}