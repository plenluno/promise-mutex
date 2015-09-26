'use strict';

var Mutex = require('../');

var print = x => new Promise(resolve => {
    console.log(x);
    resolve(x);
});

var doublePrint = x => print(x).then(x => print(x));

var mutex = new Mutex();

Promise.all([
    // 1 2 1 2
    doublePrint(1),
    doublePrint(2)
]).then(() => {
    // 1 1 2 2
    mutex.lock(() => doublePrint(1));
    mutex.lock(() => doublePrint(2));
});
