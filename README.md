# promise-mutex

The promise-mutex package provides a mutual-exclusion lock to allow only one promise chain to run at a time.

## Installation

```
npm install promise-mutex
```

## Usage

```
var Mutex = require('promise-mutex');

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
```

## License

The MIT License (MIT)

See [LICENSE](https://github.com/plenluno/promise-mutex/blob/master/LICENSE) for details.
