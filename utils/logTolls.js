const log4js = require('log4js');
const logsConfig = require('../config/log4js');
const uuid = require("uuid");
const {log} = require("debug");
// 设置日志自定义布局为json格式
log4js.addLayout('json', function (config) {
    return function (logEvent) {
        return JSON.stringify(logEvent) + config.separator;
    }
})
//加载配置文件
log4js.configure(logsConfig);
//调用预先定义的日志名称
var apiLogger = log4js.getLogger("apiLogger");
var errorLogger = log4js.getLogger("errorLogger");
var handleLogger = log4js.getLogger("handleLogger");
var systemLogger = log4js.getLogger("systemLogger");
var consoleLogger = log4js.getLogger();


// 格式化日志文本 加上日志头尾和换行方便查看 ==>  普通日志、请求日志、响应日志、操作日志、错误日志
const formatText = {
    info: function (info) {
        let logText = new String();
        //响应日志头信息
        logText += "\n" + "***************info log start ***************" + "\n";
        //响应内容
        logText += "info detail: " + "\n" + JSON.stringify(info) + "\n";
        //响应日志结束信息
        logText += "*************** info log end ***************" + "\n";
        return logText;
    },

    handle: function (info) {
        let logText = new String();
        //响应日志开始
        logText += "\n" + "***************info log start ***************" + "\n";
        //响应内容
        logText += "handle info detail: " + "\n" + JSON.stringify(info).replace(/\\n/g, "\n") + "\n";
        //响应日志结束
        logText += "*************** info log end ***************" + "\n";
        return logText;
    },
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
     * 请求日志打印
     * @param ctx
     * @param uuid
     * @returns {String}
     */
    request: function (ctx, uuid, intervals) {
        let logText = new String();
        let method = ctx.req.method,
            url = ctx.url,
            remoteAddress = (ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips),
            ip = ctx.req.ip,
            query = ctx.req.query,
            body = ctx.req.body;
        // logText += "requestUrl:" + `"${url}",`;
        // logText += "requestUuid:" + `"${uuid}",`;
        // logText += "requestMethod:" + `"${method}",`;
        // logText += "requestClientRemoteAddress:" + `"${remoteAddress}",`;
        // logText += "requestQuery:" + JSON.stringify(query) + ",";
        // logText += "requestBody:" + JSON.stringify(body) + ",";
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
    /**
     * 响应日志打印
     * @param ctx
     * @param intervals
     * @param uuid
     * @returns {String}
     */
    response: function (ctx, intervals) {
        // let logText = new String();
        // logText += "responseStatus:" + `"${ctx.status}",`; //响应状态码
        // logText += "requestTime:" + `"${intervals}",`; //服务器响应时间
        // logText += "responseBody:" + JSON.stringify(ctx.body) + ","; //响应内容
        // return logText;
        return {
            responseStatus: ctx.status,
            requestTime: intervals,
            responseBody: ctx.body,
        }
    },
}

module.exports = {
    // //封装普通日志
    // logInfo: function (info) {
    //     if (info) {
    //         consoleLogger.info(formatText.info(info));
    //     }
    // },
    // //封装请求日志
    // logRequest: function (ctx, resTime) {
    //     if (ctx) {
    //         reqLogger.info(formatText.request(ctx, resTime));
    //     }
    // },
    // //封装响应日志
    // logResponse: function (ctx, resTime) {
    //     if (ctx) {
    //         resLogger.info(formatText.response(ctx, resTime));
    //     }
    // },
    // //封装操作日志
    // logHandle: function (res) {
    //     if (res) {
    //         handleLogger.info(formatText.handle(res));
    //     }
    // },
    // //封装错误日志
    // logError: function (ctx, error, resTime) {
    //     if (ctx && error) {
    //         errorLogger.error(formatText.error(ctx, error, resTime));
    //     }
    // },


    //系统程序运行打印
    logSystem: function (info, type = 'info') {
        if (info) {
            systemLogger[type](formatText.system(info));
        }
    },
    // 本地请求接口日志打印
    apiLog: async function (ctx, next) {
        let uid = await uuid.v4();
        const start = new Date();					                // 开始时间
        let intervals;								                // 间隔时间
        try {
            await next();
            intervals = new Date() - start;
            // reqLogger.info(formatText.request(ctx, uid));
            // resLogger.info(formatText.response(ctx, intervals, uid));
            let logInfo = formatText.request(ctx, uid, intervals)
            // logInfo = logInfo.slice(0, -1)
            apiLogger.info(JSON.stringify(logInfo))
        } catch (error) {
            intervals = new Date() - start;
            errorLogger.error(formatText.error(ctx, error, intervals));
        }
    }
};
