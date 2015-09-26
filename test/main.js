'use strict';

require('chai').should();

var Mutex = require('../');

describe('Mutex', function () {
    var mutex = new Mutex();

    describe('#lock()', function () {
        it('returns a fulfilled promise if the given function succeeds', function (done) {
            var s = 'abc';
            mutex.lock(function () {
                return s;
            }).then(function (res) {
                res.should.equal(s);
                done();
            });
        });

        it('returns a rejected promise if the given function fails', function (done) {
            var e = new Error();
            mutex.lock(function () {
                throw e;
            }).catch(function (err) {
                err.should.equal(e);
                done();
            });
        });

        it('returns a rejected promise if the given argument is not a function', function (done) {
            mutex.lock(3).catch(function (err) {
                err.message.should.equal('argument not function');
                done();
            });
        });

        it('allows only one promise chain to run at a time', function (done) {
            var xs = [];

            var task = function (x) {
                xs.push(x);
                return Promise.resolve(x);
            };

            var chain = function (x) {
                return task(x).then(function (x) {
                    return task(x);
                }).then(function (x) {
                    return task(x);
                });
            };

            var run = function (x) {
                return mutex.lock(function () {
                    return chain(x);
                });
            };

            Promise.all([
                run(5),
                run(8),
                run(11)
            ]).then(function (rs) {
                rs.should.deep.equal([5, 8, 11]);
                xs.should.deep.equal([5, 5, 5, 8, 8, 8, 11, 11, 11]);
                done();
            });
        });
    });

    describe('#isLocked()', function () {
        it('returns false while being not locked', function () {
            mutex.isLocked().should.equal(false);
        });

        it('returns true while being locked', function (done) {
            var task = function () {
                mutex.isLocked().should.equal(true);
                return Promise.resolve(null);
            };

            var chain = function () {
                return task().then(function () {
                    return task();
                });
            };

            mutex.lock(chain).then(function () {
                mutex.isLocked().should.equal(false);
                done();
            });

            mutex.isLocked().should.equal(true);
        });
    });
});
