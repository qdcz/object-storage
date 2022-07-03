// 线程锁
let isLock = false;
let lockList = [];

async function lock() {
    function unlock() {
        let waitFunc = lockList.shift();
        if (waitFunc) {
            waitFunc.resolve(unlock);
        } else {
            isLock = false;
        }
    }

    if (isLock) {
        return new Promise((resolve, reject) => {
            lockList.push({resolve, reject});
        });
    } else {
        isLock = true;
        return unlock;
    }
}
console.log(111)
let fn = async function (){
    console.log(222)
    let unlock = await lock();
    console.log(333)
    unlock()
    console.log(444)
}
console.log(555)
fn()

// module.exports = lock