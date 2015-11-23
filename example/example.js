const Mutex = require('../');

const print = x => new Promise(resolve => {
  /* eslint-disable no-console */
  console.log(x);
  resolve(x);
});

const doublePrint = x => print(x).then(y => print(y));

const mutex = new Mutex();

Promise.all([
  // 1 2 1 2
  doublePrint(1),
  doublePrint(2),
]).then(() => {
  // 1 1 2 2
  mutex.lock(() => doublePrint(1));
  mutex.lock(() => doublePrint(2));
});
