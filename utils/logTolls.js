const log4js = require('log4js');
const logsConfig = require('../config/log4js');
const uuid = require("uuid");
const globalConfig = require('../config/index');
// 设置日志自定义布局为json格式
log4js.addLayout('json', function (config) {
    return function (logEvent) {
        return JSON.stringify(logEvent) + config.separator;
    }
})
//加载配置文件
log4js.configure(logsConfig);
//调用预先定义的日志名称
const apiLogger = log4js.getLogger("apiLogger");
const errorLogger = log4js.getLogger("errorLogger");
const dbHandleLogger = log4js.getLogger("dbHandleLogger");
const systemLogger = log4js.getLogger("systemLogger");
const consoleLogger = log4js.getLogger();


// 格式化日志文本 加上日志头尾和换行方便查看 ==>  普通日志、请求日志、响应日志、操作日志、错误日志
const formatText = {
    /**
     * 系统日志打印
     * @param info
     * @returns {String}
     */
    system: function (info) {
        return info;
    },
    /**
     * 数据库操作日志
     * @param info
     * @returns {String}
     */
    dbHandle: function (info) {
        return info
    },
    /**
     * 请求日志打印
     * @param ctx
     * @param uuid
     * @returns {String}
     */
    request: function (ctx, uuid, intervals) {
        let method = ctx.req.method,
            url = ctx.url,
            remoteAddress = (ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips),
            ip = ctx.req.ip,
            query = ctx.req.query,
            body = ctx.req.body;

        return {
            requestUrl: url,
            requestUuid: uuid,
            requestMethod: method,
            requestClientRemoteAddress: remoteAddress,
            requestQuery: query,
            requestBody: body,

            responseStatus: ctx.status,
            requestTime: intervals,
            responseBody: ctx.body,
        }
    },
    // 接口请求错误日志打印
    requestError: function (ctx, uid, err, intervals) {
        let obj = this.request(ctx, uid, intervals);
        return Object.assign(obj, {
            data: {
                // name:err.name,
                // message:err.message,
                stack: err.stack
            }
        })
    }
}

module.exports = {
    formatText,
    //系统程序运行打印
    logSystem: function (info, type = 'info') {
        if (info) {
            systemLogger[type](formatText.system(info));
        }
    },
    // 接口日志请求打印    有多个文件相互调用 给迁移到单个文件去了
    // apiLog: function (ctx, next) {
    //     return async function (ctx, next) {
    //         let uid = await uuid.v4();
    //         const start = new Date();					                // 开始时间
    //         let intervals;
    //         try {
    //             await next();
    //             intervals = new Date() - start;
    //             let logInfo = formatText.request(ctx, uid, intervals)
    //             if (globalConfig.ApiSyncInStorage) { // 直接入库
    //                 // 多个文件互相引用会有问题！！!
    //                 let data = tools.dataProcessForLogCategory({          // 处理格式要跟日志文件内的一样
    //                     categoryName: "apiLogger",
    //                     context: {},
    //                     level: {level: 10000, levelStr: 'INFO', colour: 'green'},
    //                     pid: '00000',
    //                     startTime: "2022-06-20T08:56:12.699Z",
    //                     data: [JSON.stringify(logInfo)]
    //                 })
    //                 _Emitter.emit("dataInStorage",data)
    //             } else { // 日志输入
    //                 apiLogger.info(JSON.stringify(logInfo))
    //             }
    //         } catch (error) {
    //             intervals = new Date() - start;
    //             let logError = formatText.requestError(ctx, uid, error, intervals)
    //             apiLogger.error(JSON.stringify(logError));
    //         }
    //     }
    // },
    // 数据库操作日志
    dbLog: async function (info, type = 'info') {
        if (info) {
            dbHandleLogger[type](formatText.dbHandle(info))
        }
    }
};
