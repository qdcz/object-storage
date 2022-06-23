const uid = require("uuid");
module.exports = {
    // 对日志文件中的数据 按类别处理并归类
    dataProcessForLogCategory: function (data) {
        const fieldMapPolicy = {
            'systemLogger': function (item) {
                return {
                    startTime: item.startTime,
                    uuid: uid.v4(),
                    logType: item.categoryName,  // 日志类型
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
                    requestHref: da.requestHref,
                    requestQuery: da.requestQuery ? JSON.stringify(da.requestQuery) : "{}",
                    requestBody: da.requestBody ? JSON.stringify(da.requestBody) : "{}",
                    status: da.responseStatus,
                    responseData: da.responseBody ? JSON.stringify(da.responseBody) : "{}",
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
}
