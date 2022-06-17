const path = require('path');

//日志保存的根目录
const baseLogPath = path.resolve(__dirname, '../logs');

module.exports = {
    //日志格式等设置
    appenders: {
        "rule-console": {"type": "console"},
        // 系统程序运行时日志
        "system": {
            "type": "file",
            "filename": baseLogPath + '/system/out',
            "pattern": "yyyy-MM-dd~hh-mm.log",
            "alwaysIncludePattern": true,
            "encoding": "utf-8",
            "numBackups": 3,
            "path": '/system',
            "layout": {
                "type": "json",
                "separator": ",",
            }
        },
        "errorLogger": {
            "type": "file", // 日志类型
            "filename": baseLogPath + '/error/error', // 输出文件名
            "pattern": "yyyy-MM-dd~hh-mm.log", // 后缀
            "alwaysIncludePattern": true, // 上面两个参数是否合并
            "encoding": "utf-8", // 编码格式
            "numBackups": 3, // 当文件内容超过文件存储空间时，备份文件的数量
            "path": '/error',
            "layout": {
                "type": "json",
                "separator": ",",
            }
        },
        // 接口请求日志
        "api": {
            "type": "file",
            "filename": baseLogPath + '/api/api',
            "pattern": "yyyy-MM-dd~hh-mm.log",
            "alwaysIncludePattern": true,
            "encoding": "utf-8",
            // "numBackups": 3,
            "path": '/api',
            "layout": {
                "type": "json",
                "separator": ",",
            }
        },
        "handleLogger": {
            "type": "file",
            "filename": baseLogPath + '/handle/handle',
            "pattern": "yyyy-MM-dd~hh-mm.log",
            "alwaysIncludePattern": true,
            "encoding": "utf-8",
            // "numBackups": 3,
            "path": '/handle',
            "layout": {
                "type": "json",
                "separator": ",",
            }
        }
    },
    // 分类以及日志等级
    categories: {
        "default": {"appenders": ["rule-console"], "level": "all"},
        "apiLogger": {"appenders": ["api"], "level": "info"},
        "errorLogger": {"appenders": ["errorLogger"], "level": "error"},
        "handleLogger": {"appenders": ["handleLogger"], "level": "all"},
        "systemLogger": {"appenders": ['rule-console', "system"], "level": "all"}
    },
    "baseLogPath": baseLogPath
}
