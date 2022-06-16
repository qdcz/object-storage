const { resolve, basename,join } = require('path')
const fs = require("fs");
const { path } = require('../config/cookie');
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
    let timeThreshold = 1000 * 60 * 2;  // 时间阈值 取前两分钟的所有日志文件
    const run = async function () {
        prefixDir = prefixDir || resolve(__dirname, '../logs');
        const syncFileLogList = ['request', 'response','system']; // 需要同步的本地日志二级目录
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
                console.log(timeGap < timeThreshold);
                if (timeGap < timeThreshold) { // 只取范围内的时间文件
                    return join(prefixDir,v)
                }
                return null
            }).filter(v => v)
            needSyncLogFilePath = needSyncLogFilePath.concat(list)
        }
        console.log(needSyncLogFilePath)



        // 遍历数组 顺序入库：
        // needSyncLogFilePath

    }
    run()

    // 要上个锁 不能这么玩，在前置操作没执行完之前不允许下一次同步
    setInterval(run, time)
}

module.exports = {
    getFileData
}