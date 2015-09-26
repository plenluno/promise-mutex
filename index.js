'use strict';

const locked = Symbol('locked');

var _lock = function (mutex) {
    if (mutex[locked]) {
        return false;
    } else {
        mutex[locked] = true;
        return true;
    }
};

var _unlock = function (mutex) {
    if (mutex[locked]) {
        mutex[locked] = false;
        return true;
    } else {
        return false;
    }
};

class Mutex {
    constructor() {
        this[locked] = false;
    }

    lock(f) {
        var self = this;
        return new Promise(function executor(resolve, reject) {
            if (!_lock(self)) {
                setTimeout(function () {
                    executor(resolve, reject);
                }, 0);
                return;
            }

            if (!(f instanceof Function)) {
                reject(new Error('argument not function'));
                _unlock(self);
                return;
            }

            try {
                var r = f();
            } catch (e) {
                reject(e);
                _unlock(self);
                return;
            }

            Promise.resolve(r).then(function (res) {
                resolve(res);
                _unlock(self);
            }).catch(function (err) {
                reject(err);
                _unlock(self);
            });
        });
    }

    isLocked() {
        return this[locked];
    }
}

module.exports = Mutex;
