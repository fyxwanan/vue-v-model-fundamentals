/*
 * @Date: 2023-06-05 02:46:00
 * @LastEditors: xiaoreya@163.com
 * @LastEditTime: 2023-06-05 03:04:22
 * @Description: 搜集依赖的类, 内面全是 Watcher 实例
 */

class Dep {

  constructor() {
    this.subs = [];
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach((watcher) => {
      watcher.update();
    })
  }

}

export default Dep;