const log4js = require('log4js');
const logsConfig = require('../config/log4js');
const uuid = require("uuid");
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

    error: function (ctx, err, resTime) {
        let logText = new String();
        //错误信息开始
        logText += "\n" + "*************** error log start ***************" + "\n";
        //添加请求日志
        logText += formatText.request(ctx.request, resTime);
        //错误名称
        logText += "err name: " + err.name + "\n";
        //错误信息
        logText += "err message: " + err.message + "\n";
        //错误详情
        logText += "err stack: " + err.stack + "\n";
        //错误信息结束
        logText += "*************** error log end ***************" + "\n";
        return logText;
    },
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
    }
}

module.exports = {
    //系统程序运行打印
    logSystem: function (info, type = 'info') {
        if (info) {
            systemLogger[type](formatText.system(info));
        }
    },
    // 接口日志请求打印
    apiLog: async function (ctx, next) {
        let uid = await uuid.v4();
        const start = new Date();					                // 开始时间
        let intervals;								                // 间隔时间
        try {
            await next();
            intervals = new Date() - start;
            let logInfo = formatText.request(ctx, uid, intervals)
            apiLogger.info(JSON.stringify(logInfo))
        } catch (error) {
            intervals = new Date() - start;
            errorLogger.error(formatText.error(ctx, error, intervals));
        }
    },
    // 数据库操作日志
    dbLog: async function (info, type = 'info') {
        if (info) {
            dbHandleLogger[type](formatText.dbHandle(info))
        }
    }
};
