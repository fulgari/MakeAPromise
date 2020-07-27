// 初步构建
function Promise(fn) {
  var callback; // 一个成功时的callback
  this.then = function(done) { //一个实例的方法，用来注册异步callback function
    callback = done;
  }
  function resolve() {
    callback();
  }
  fn(resolve);
}