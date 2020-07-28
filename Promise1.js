// 初步构建
function Promise(fn) {
  var callback; // 一个成功时的callback
  this.then = function(done) { //一个实例的方法，用来注册异步callback function
    callback = done;
  }
  function resolve() {
    callback();
  }
  // fn就是我们作为参数式回调函数传入new Promise((res, rej)=>{})的那个，一开始我还很奇怪resolve和reject是怎么给赋值进去的，直到我看到了这行代码。
  // 可以看出，每个Promise都会最后执行一遍该fn，参数为Promise中定义的resolve()和reject()。因此在Promise后面括号中定义的回调函数是会直接执行的（放到callstack中的哦）
  fn(resolve);  
}