// Add status

function Promise(fn) {
  var promise = this,
      value = null;
  promise._resolves = [];
  promise._status = 'PENDING';

  // 这就是为什么要向then传一个有返回值的函数的原因
  this.then = function(onFullfilled) {
    if(promise._status==='PENDING') {
      promise._resolves.push(onFullfilled);
      return this;
    }
    onFullfilled(value); //这里可以看到，所有then()里面的回调函数也是会直接（放到调用栈callstack里）执行的。因此该回调函数里面的可执行语句可以看作是同步的，直接就push到callsatck执行了。
    return this;
  }

  function resolve(value) {
    setTimeout(function() {
      promise._status = 'FULFILLED';
      promise._resolves.forEach(function (callback) {
        callback(value);
      })
    },0);
  }

  fn(resolve);
} 

// 函数的执行顺序，异步编程

async function async1() {
  console.log('1'); // STEP3: 第二个可执行log语句，在调用async1()的时候被执行到，直接push到callstack中并执行
  await async2();// await会将async2()包装到一个Promise里去，并将await async2()之后的操作包装到一个.then(()=>{})里面去，所以console.log('2')变成了一个异步的请求了！异步请求需要等callstack执行完毕，即callstack为空，这时eventloog将会从Callback/Task Queue中shift队列头的回调函数进行执行。
  console.log('2');  // STEP7 - ASYNC1:主要还是要等上面await的底层Promise成功resolve了才能执行，这个也是作为callback queue的一员大将在等待
}
async function async2() {
  console.log('3'); // STEP4: 第三个可执行log语句，在await async2()执行的时候会将async2()作为一个resolve回调函数包装到一个Promise里面去。因为Promise在定义的时候里面的可执行语句实际上也是相当于
}

console.log('4'); // STEP1：遇到的第一个可执行log语句，直接push到callstack并执行

setTimeout(() => {
  console.log('5'); // STEP9 - ASYNC3：一般来说setTimeout因为要调用网页API可能会慢一些，浏览器里输出在7之后，但是在node.js里面输出是在8之前的的。这里我们以浏览器为准。
}, 0);

async1(); // STEP2：可执行语句，将该函数push到callstack中去execute，执行该函数即对async1()里面所有的可执行语句进行同样的push和execute操作

new Promise(function(resolve) {
  console.log('6'); //STEP5: 第四个可执行log语句，Promise中作为参数的回调函数，该回调函数是会在Promise内部直接被执行的，即Promise中最后一句fn(resolve)。该语句为可执行语句，会被直接push到callstack中去（位置在匿名回调函数之上，因为是该匿名回调函数先执行的），逐个执行
  resolve(); // 这是一个用setTimeout(callback,0)包装起来的异步操作。终结当前Promise的异步状态（完成任务！），把被Promise包装起来的那个值（这里是null）传给所有以当前Promise为需求的then((res)=>{})中间的匿名回调函数作为参数（如果有的话）
}).then(function() {
  console.log('7'); // STEP8 - ASYNC 2：因为需要等上一个Promise的resolve异步操作完了才能执行，因此只能乖乖排在回调队列的最后面等了。
})
console.log('8'); //STEP6：第五个可执行log语句

///////////////////////////////////////////

// 调度器scheduler，练习题
class Scheduler {
  constructor() {
    this.queue = [];
    this.count = 2;
    this.run = [];
  }
  add(task) {
    this.queue.push(task);
    return this.schedule();
  }

  schedule() {
    if(this.run.length<this.count && this.queue.length>0){
      let cur = this.queue.shift();
      let p = cur().then(()=>{
        this.run.splice(this.run.indexOf(p), 1);
      });
      this.run.push(p);
      return p;
    } else {
      return Promise.race(this.run).then(()=>this.schedule());
    }
  }
}

const timeout = function(time) {
  return new Promise((resolve, reject)=>{
    setTimeout(resolve, time);
  });
};

const scheduler = new Scheduler();
const addTask = function(time, order) {
  scheduler.add(()=>timeout(time)).then(()=>console.log(order));
}

addTask(1000, "1");
addTask(200, "2");
addTask(300, "3");
addTask(500, "4");