//添加promise.all

function Promise(fn) {
  var promise = this;
  promise._value;
  promise._reason;
  promise._resolves = [];
  promise._rejects = [];
  promise._status = 'PENDING';

  this.then = function (onFulfilled, onRejected) {
    return new Promise(function(resolve, reject) {
      function handle(value) {
        // 判断then的参数是否回调函数
        // ret用闭包把函数存起来了
        var ret = typeof onFulfilled === 'function' && onFulfilled(value) || value;
        if(ret && typeof ret ['then'] === 'function') {
          ret.then(function(value) {
            resolve(value);
          }, function(reason) {
            reject(reason);
          })
        } else {
          // 如果then里面仅是一个value，那么就resolve它
          resolve(ret);
        }
      }
      function errback(reason) {
        reason = typeof onRejected === 'function' && onRejected(reason) || reason;
        reject(reason);
      }
      if(promise._status === 'PENDING') {
        promise._resolves.push(handle);
        promise._rejects.push(errback);
      }
    });
  };

  function resolve(value) {
    setTimeout(function() {
      promise._status = "FULFILLED";
      promise._resolves.forEach(function(callback){
        value = callback(value);
      })
    },0);
  }

  function reject(value) {
    setTimeout(function() {
      promise._status = "REJECTED";
      promise._rejects.forEach(function(callback){
        promise._reason = callback(value);
      })
    },0);
  }

  fn(resolve, reject);
}

Promise.all = function(promises) {
  if(!Array.isArray(promises)){
    throw new TypeError("you must pass an array to all.");
  }

  return new Promise(function(resolve, reject){
    var i = 0,
        result = [],
        len = promises.length,
        count = len;

    function resolver(index) {
      return function(value) {
        resolveAll(index, value);
      }
    }

    function rejecter(reason) {
      reject(reason);
    }

    function resolveAll(index, value) {
      result[index] = value;
      if(--count == 0) {
        resolve(result);
      }
    }

    for(; i<len; i++) {
      promises[i].then(resolver(i), rejecter);
    }
  })
}