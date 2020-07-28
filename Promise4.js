//串通Promise和异步结果的传递
function Promise(fn) {
  var promise = this, value = null;
  promise._resolves = []; // 我称为'等我'队列，因为这里面的方法都是在等我当前这个Promise结束才能触发的
  promise._status = 'PENDING'; //Promise状态

  this.then = function(onFulfilled) {
    return new Promise(function(resolve) { //这里的匿名函数好处是能够很好利用了闭包的特性去访问只有他自己能够访问的两个私有变量，当前Promise状态_status和'等我'队列_resolves
      function handle(value) {
        var ret = typeof onFulfilled === 'function' && onFulfilled(value) || value;
        resolve(ret);
      }
      if(promise._status === 'PENDING') {
        promise._resolves.push(handle); //如果当前Promise的状态为Pending的话，放到私有的_resolves队列中
      } else {
        handle(value);
      }
    });
  }

  function resolve(value) {
    setTimeout(function() {
      promise._status = "FULLFILLED";
      promise._resolves.forEach(function (callback) { //这里的callback就是'等我'队列_resolves中每一个等待当前Promise结束的请求
        value = callback(value);
      });
    },0);
  }

  fn(resolve);
}