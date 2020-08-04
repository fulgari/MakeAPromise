// 完整版Promise！

(function(global, undefined) {
  
  // resolve和reject最后都会调用这个函数
  var final = function(status, value) {
    var promise = this, 
        fn, 
        st;
    if(promise._status !== 'PENDING') return;

    // setTimeout能让所有的执行都是异步调用，保证then是先执行的！
    setTimeout(function() {
      promise._status = status;
      st = promise._status === 'FULFILLED';
      queue= promise[st ? '_resolves' : '_rejects']; // 将队列generalize了一下

      while(fn = queue.shift()){
        value = fn.call(promise, value) || value;
      }

      promise[st ? '_value' : '_reason'] = value;

      promise['_resolves'] = promise['_rejects'] = undefined;
    });
  }

  //参数是一个函数，内部提供两个函数没分别是resolve和reject
  var Promise = function(resolver) {
    if(!(typeof resovler === 'function'))
      throw new TypeError('You must pass a resolver fucntion as the argument');
    // 如果当前对象不是promise就new一个
    if(!(this instanceof Promise)) {
      return new Promise(resolver);
    }

    var promise = this;
    promise._value;
    promise._reason;
    promise._status = 'PENDING';
    // 存储状态
    promise._resolves = [];
    promise._rejects = [];

    //
    var resolve = function(value) {
      // apply - arr
      final.apply(promise, ['FULFILLED'].concat([value]));
    }

    var reject = function(reason) {
      final.apply(promise, ['REJECTED'].concat([reason]));
    }

    resolver(resolve, reject);
  }

  Promise.prototype.then = function(onFulfilled, onRejected) {
    var promise = this;
    // 每次返回一个promise，保证是thenable的
    return new Promise(function(resolve, reject) {
      function handle(value) {
        // 很关键，决定传给下一个resolve的值
        // 如果传一个function那就将value赋给那个function并将执行结果赋给ret，否则就直接赋value值
        var ret = typeof onFulfilled === 'function' && onFulfilled(value) || value;

        //判断是不是promise对象
        // ret 不为null并且ret有一个值为'then'的对应结果
        // 为什么onFulFilled执行完会返回一个有key为'then‘的东西??
        if(ret && typeof ret ['then'] === 'funtion') {
          ret.then(function(value) {
            resolve(value);
          }, function(reason){
            reject(reason)
          });
        } else {
          resolve(ret);
        }
      }

      function errback(reason) {
        reason = typeof onRejected === 'function' && onRejected(reason) || value;
        reject(reason);
      }

      if(promise._status === 'PENDING'){
        promise._resolves.push(handle);
        promise._rejects.push(errback);
      } else if (promise._status === 'FULFILLED') {
        callback(promise._value);
      } else if (promise._status === 'REJECTED') {
        errback(promise._reason);
      }
    });
  }

  Promise.prototype.catch = function(onRejected) {
    return this.then(undefined, onRejected);
  }

  Promise.prototype.delay = function(ms, value) {
    return this.then(function(ori) { //ori = origin
      return Promise.delay(ms, value || ori);
    });
  }

  // Promise.delay is static while Promise.prototype.delay is not 
  Promise.delay = function(ms, value) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(value);
        console.log('1');
      }, ms);
    });
  }

  Promise.resolve = function(value) {
    return new Promise(function(resolve, reject){
      resolve(value);
    })
  }

  Promise.reject = function(reason) {
    return new Promise(function(resolve, reject) {
      reject(reason);
    })
  }
  
  Promise.all = function(promises) {
    if(!Array.isArray(promises)) {
      throw new TypeError('You must pass an array to all.');
    }

    // 全用一个大promise包起来
    return Promise(function(resolve, reject) {
      var i=0, result=[], len=promises.length, count=len;

      // 这里和race中的函数相比，多了一层嵌套，要传入index
      function resolver(index) {
        return function(value) {
          resolveAll(index, value);
        }
      }

      function rejecter(reason) {
        reject(reason);
      }

      // 为什么叫resolveAll -- 其实就是已经`resolve`了promises中所有的promise了
      function resolveAll(index,value) {
        promises[index] = value;
        //每有一个promise完成，就会count--，直到promises中的最后一个完成，就能够返回它的值了
        if(--count == 0) {
          resolve(value);
        }
      }

      for(;i<len;i++){
        promises[i].then(resolver(i), rejecter);
      }
    });
  }

  Promise.race = function(promises) {
    if(!Array.isArray(promises)) {
      throw new TypeError('You must pass an array to race.');
    };
    return Promise(function(resolve, reject) {
      var i=0, len=promises.length;

      function resolver(value) {
        resolve(value);
      }
      function rejecter(reason) {
        reject(reason);
      }
      for(;i<len;i++){
        //promises里面谁先调用resolver或者rejecter当前race就直接返回
        promises[i].then(resolver, rejecter);
      }
    })
  }

  // global.Promise = Promise;

})();

let timeout = (msg, dur) => {
  setTimeout(()=>console.log(msg), dur);
  return msg;
}

// let f1 = new Promise((resolve, reject) => resolve(timeout("1", 200)));

// let f2 = new Promise((resolve, reject) => resolve(timeout("3",3000)));

// Promise.all([f1, f2]).then(()=>console.log('finish'));
var get100 = function(){
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve('100ms');
    }, 1000);
  })
}
var get200 = function(){
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve('200ms');
    }, 2000);
  })
}
var get300 = function(){
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve('300ms');
    }, 3000);
  })
}

// get100().then(function(data) {
//   console.log(data);
//   return get200();
// }).then(function(data){
//   console.log(data);
//   return get300();
// }).then(function(data) {
//   console.log(data);
// })

Promise.all([get200(), get300()]).then(function(data){
  console.log(data);
})

Promise.race([get300(), get100()]).then(function(data) {
  console.log(data);
})
