//添加对Promise对象的判断

function Promise(fun) {
  var promise = this, value = null; //value默认值为null哦
  promise._resolves = [];
  promise._status = 'PENDING';

  this.then = function(onFulFilled) {
    return new Promise(function(resolve) {
      function handle(value) {
        var ret = typeof onFulFilled === 'function' && onFulFilled || value;
        if(ret && typeof ret ['then'] == 'function') {
          ret.then(function(value){
            resolve(value);
          });
        } else {
          resolve(ret);
        }
      }
      // function errback(reason) {
      //   reason = typeof onRejected === 'function' && onRejected(reaseon) || value;
      //   reject(reason);
      // }

      if(promise._status === 'PENDING') {
        promise._resolves.push(handle);
        promise.rejects
      }
    })
  };

  function resolve(value) {
    setTimeout(function() {
      promise._status = "FULFILLED";
      promise._resolves.forEach(function(callback) {
        value = callback.call(promise, value);
      })
    }, 0);
  }

  fn(resolve);


}