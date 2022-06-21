const {EventEmitter} = require('events');
const logModel = require("../control/logger");
const {logSystem} = require("./logTolls");
const myEmitter = new EventEmitter();

myEmitter.on('dataInStorage', async function ($data) {
    try {
        await logModel.add($data);
    } catch (e) {
        logSystem(`dataInStorage错误` + e, 'error');
        return null
    }
});
module.exports = myEmitter


