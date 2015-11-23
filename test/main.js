require('chai').should();

const Mutex = require('../');

describe('Mutex', () => {
  const mutex = new Mutex();

  describe('#lock()', () => {
    it('returns a fulfilled promise if the given function succeeds', done => {
      const s = 'abc';
      mutex.lock(() => {
        return s;
      }).then(res => {
        res.should.equal(s);
        done();
      });
    });

    it('returns a rejected promise if the given function fails', done => {
      const e = new Error();
      mutex.lock(() => {
        throw e;
      }).catch(err => {
        err.should.equal(e);
        done();
      });
    });

    it('returns a rejected promise if the given argument is not a function', done => {
      mutex.lock(3).catch(err => {
        err.message.should.equal('argument not function');
        done();
      });
    });

    it('allows only one promise chain to run at a time', done => {
      const xs = [];

      function task(x) {
        xs.push(x);
        return Promise.resolve(x);
      }

      function chain(x) {
        return task(x).then(y => {
          return task(y);
        }).then(z => {
          return task(z);
        });
      }

      function run(x) {
        return mutex.lock(() => {
          return chain(x);
        });
      }

      Promise.all([
        run(5),
        run(8),
        run(11),
      ]).then(rs => {
        rs.should.deep.equal([5, 8, 11]);
        xs.should.deep.equal([5, 5, 5, 8, 8, 8, 11, 11, 11]);
        done();
      });
    });
  });

  describe('#isLocked()', () => {
    it('returns false while being not locked', () => {
      mutex.isLocked().should.equal(false);
    });

    it('returns true while being locked', done => {
      function task() {
        mutex.isLocked().should.equal(true);
        return Promise.resolve(null);
      }

      function chain() {
        return task().then(() => {
          return task();
        });
      }

      mutex.lock(chain).then(() => {
        mutex.isLocked().should.equal(false);
        done();
      });

      mutex.isLocked().should.equal(true);
    });
  });
});
