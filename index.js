'use strict';

const locked = Symbol('locked');

function _lock(mutex) {
  if (mutex[locked]) {
    return false;
  }

  mutex[locked] = true;
  return true;
}

function _unlock(mutex) {
  if (!mutex[locked]) {
    return false;
  }

  mutex[locked] = false;
  return true;
}

class Mutex {
  constructor() {
    this[locked] = false;
  }

  lock(f) {
    const self = this;
    return new Promise(function executor(resolve, reject) {
      if (!_lock(self)) {
        setTimeout(() => {
          executor(resolve, reject);
        }, 0);
        return;
      }

      if (!(f instanceof Function)) {
        reject(new Error('argument not function'));
        _unlock(self);
        return;
      }

      let r;
      try {
        r = f();
      } catch (e) {
        reject(e);
        _unlock(self);
        return;
      }

      Promise.resolve(r).then(res => {
        resolve(res);
        _unlock(self);
      }).catch(err => {
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
