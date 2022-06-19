/**
 * 代理对数据库操作的函数
 *      是否开启对数据库操作日志输入（log4js）
 *
 * 注入携带日志打印
 */

class dbControlProxy {
    constructor(opt) {
        if(!opt) return console.error("初始化错误,缺少必要参数")
        this.isOpenLogRecord = false // 是否开启日志记录

        this.reWriteMethodList = ['save', 'findById', 'insertMany'];



        // 重新方法
        if(opt?.model){
            // opt.model.
        }
    }

    // 对模型操作的方法进行重写 来达到内部记录日志的效果

}

let a = new dbControlProxy({
    isOpenLogRecord:true,
    model:"sss" // 文档模型
})
