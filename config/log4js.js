const path = require('path');

//日志保存的根目录
const baseLogPath = path.resolve(__dirname, '../logs');

/*报错输出日志*/

// 请求日志目录
let reqPath = '/request';
// 请求日志文件名
let reqFileName = 'request';
// 请求日志输出完整路径
let reqLogPath = baseLogPath + reqPath + '/' + reqFileName;

//错误日志目录、文件名、输出完整路径
const errorPath = "/error";
const errorFileName = "error";
const errorLogPath = baseLogPath + errorPath + "/" + errorFileName;

//响应日志目录、文件名、输出完整路径
const responsePath = "/response";
const responseFileName = "response";
const responseLogPath = baseLogPath + responsePath + "/" + responseFileName;

/*操作数据库进行增删改等敏感操作记录日志*/
//操作日志目录、文件名、输出完整路径
const handlePath = "/handle";
const handleFileName = "handle";
const handleLogPath = baseLogPath + handlePath + "/" + handleFileName;


module.exports = {
    //日志格式等设置
    appenders: {
        "rule-console": {"type": "console"},
        "errorLogger": {
            "type": "dateFile", // 日志类型
            "filename": errorLogPath, // 输出文件名
            "pattern": "-yyyy-MM-dd-hh.log", // 后缀
            "alwaysIncludePattern": true, // 上面两个参数是否合并
            "encoding": "utf-8", // 编码格式

            "maxLogSize": 1000, // 最大存储内容
            "numBackups": 3, // 当文件内容超过文件存储空间时，备份文件的数量
            "path": errorPath
        },
        "resLogger": {
            "type": "dateFile",
            "filename": responseLogPath,
            "pattern": "-yyyy-MM-dd-hh.log",
            "alwaysIncludePattern": true,
            "encoding": "utf-8",
            "maxLogSize": 1000,
            "numBackups": 3,
            "path": responsePath
        },
        "handleLogger": {
            "type": "dateFile",
            "filename": handleLogPath,
            "pattern": "-yyyy-MM-dd-hh.log",
            "alwaysIncludePattern": true,
            "encoding": "utf-8",
            "maxLogSize": 1000,
            "numBackups": 3,
            "path": responsePath
        },
        // 请求日志
        'reqLogger': {
            "type": 'dateFile', // 日志类型
            "filename": reqLogPath, // 输出文件名
            "pattern": '-yyyy-MM-dd-hh.log', // 后缀
            "alwaysIncludePattern": true, // 上面两个参数是否合并
            "encoding": 'utf-8', // 编码格式
            "maxLogSize": 1000, // 最大存储内容
        },
    },
    // 分类以及日志等级
    categories: {
        "reqLogger": {"appenders": ['reqLogger'], "level": 'info'},
        "default": {"appenders": ["rule-console"], "level": "all"},
        "resLogger": {"appenders": ["resLogger"], "level": "info"},
        "errorLogger": {"appenders": ["errorLogger"], "level": "error"},
        "handleLogger": {"appenders": ["handleLogger"], "level": "all"},
        "http": {"appenders": ["resLogger"], "level": "info"}
    },
    "baseLogPath": baseLogPath
}
