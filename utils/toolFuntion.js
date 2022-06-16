const {resolve, basename} = require('path')
const fs = require("fs");
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
    prefixDir = prefixDir || resolve(__dirname, '../logs');
    const syncFileLogList = ['request','response']; // 需要同步的本地日志文件

    let needSyncLogFilePath = []; // 需要同步的日志文件
    // 先遍历指定目录下的日志文件
    for(let i=0;i<syncFileLogList.length;i++){
        let dirName = syncFileLogList[i];
        let list = fs.readdirSync(prefixDir + '/' + dirName);
        list.map(v=>{
            let a = v.split('.')[1].replace("~"," ");
            console.log(a)
            return v
        })
        needSyncLogFilePath = needSyncLogFilePath.concat(list)
    }
    console.log(needSyncLogFilePath)
}

module.exports = {
    getFileData
}