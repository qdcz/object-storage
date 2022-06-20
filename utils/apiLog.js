const uuid = require("uuid");
const globalConfig = require("../config");
const tools = require("./tools");
const {formatText, apiLogger} = require("../utils/logTolls");
const _Emitter = require("./events");
module.exports = function () {
    return async function (ctx, next) {
        let uid = await uuid.v4();
        const start = new Date();					                // 开始时间
        let intervals;
        try {
            await next();
            intervals = new Date() - start;
            let logInfo = formatText.request(ctx, uid, intervals)


            if (globalConfig.ApiSyncInStorage) { // 直接入库
                // 多个文件互相引用会有问题！！!
                let data = tools.dataProcessForLogCategory({          // 处理格式要跟日志文件内的一样
                    categoryName: "apiLogger",
                    context: {},
                    level: {level: 10000, levelStr: 'INFO', colour: 'green'},
                    pid: '00000',
                    startTime: "2022-06-20T08:56:12.699Z",
                    data: [JSON.stringify(logInfo)]
                })
                _Emitter.emit("dataInStorage", data)
            } else { // 日志输入
                apiLogger.info(JSON.stringify(logInfo))
            }


        } catch (error) {
            intervals = new Date() - start;
            let logError = formatText.requestError(ctx, uid, error, intervals)
            apiLogger.error(JSON.stringify(logError));
        }
    }
}
