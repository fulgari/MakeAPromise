// 链式调用
function Promise(fn) {
  var promise = this, value = null;
  
  // 相当于把Promise1.js中的callback拓展为一个数组，存储一组一部操作
  promise._resolves = [];

  this.then = function(onFulfuilled) {
    promise._resolves.push(onFulfuilled);
    return this; // 返回当前的Promise类
  }

  function resolve(value) {
    setTimeout(function() {
      promise._resolves.forEach(function (callback){
        callback(value);
      })
    }, 0);
  }

  fn(resolve);
}