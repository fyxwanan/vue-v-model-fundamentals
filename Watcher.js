/*
 * @Date: 2023-06-05 02:46:07
 * @LastEditors: xiaoreya@163.com
 * @LastEditTime: 2023-06-05 05:13:24
 * @Description: 
 */

import Dep from './Dep.js';

// 观察者类
class Watcher {

  /**
   * @param {*} vm 数据实例
   * @param {*} key 为需要观察的属性值
   * @param {*} cb 回调函数
   */  
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    // new Watcher的时候先把this指向当前的依赖收集器 Dep
    Dep.target = this;
    // 执行赋值操作
    key.split('.').reduce((newObj, k) => newObj[k], vm);
    // 恢复Dep的值
    Dep.target = null;
    
  }

  // 
  update() {
    const value = this.key.split('.').reduce((newObj, k) => newObj[k], this.vm)
    this.cb(value);
  }

}

export default Watcher;