/*
 * @Date: 2023-06-05 02:45:44
 * @LastEditors: xiaoreya@163.com
 * @LastEditTime: 2023-06-05 05:18:21
 * @Description: 我自己的Vue组件
 */

import Dep from "./Dep.js";
import Watcher from "./Watcher.js";

class MyVue {
  constructor(props) {
    this.$data = props?.data;
    this.childNode = '';

    this.Observer(this.$data);

    this.DataProxy(this.$data);

    this.Compile(props?.el);
  }


/** 
 * Description: 进行数据劫持, 样例数据如下
   data: {
      name: 'xiaoreya',
      age: 18,
      info: {
        React: 'I am React!',
        Vue: 'I am Vue!'
      }
    }
 */
  Observer(obj) {
    if (!obj || typeof obj !== 'object') return;

    // 初始化监听装置
    const dep = new Dep();

    // 对象中所有的 key 
    const keys = Object.keys(obj);

    keys.forEach((key) => {
      let value = obj[key];
      // 如果子集是对象，继续递归，在方法第一行有判断
      this.Observer(value);
      const that = this;
      Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        get() {
          console.log('调用了Observer方法进行了数据劫持！')
          Dep.target && dep.addSub(Dep.target);
          return value;
        },
        set(newVal) {
          console.log(`字段${key}的数据发生了变化，原始值为：${obj[key]}, 新的值为：${newVal}`);
          value = newVal;
          // 新赋予的值也要进行数据劫持， 新赋予的可能是Object对象
          that.Observer(value);

          // 修改了值之后就通知订阅者
          dep.notify();

        }
      })
      
    })

  }

  // 属性代理，把data挂在vm上面
  DataProxy(data) {
    console.log('DataProxy data: ', data, this);
    if (!data || typeof data !== 'object') return;

    const keys = Object.keys(data);
    keys.forEach((key) => {
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get() {
          return this.$data[key];
        },
        set(newVal) {
          this.$data[key] = newVal;
        }
      })
    });
  }

  // 解析html模板，解析 {{ name }}
  Compile(el) {
    // const reg = / \{\{\s*(\S+)\s*\}\}/;
    // console.log('Compile: ', this)

    // 获取渲染的根节点
    this.$el = document.querySelector(el);

    // 创建文档碎片, 提高dom操作的性能
    const fragment = document.createDocumentFragment();

    // 把文档碎片添加到文档流中, 把this.$el.firstChild 赋值给 childNode，然后添加到 fragment 中
    // 循环遍历，this.$el 中的元素一个一个减少，都被添加到 fragment 中去了
    while(this.childNode  = this.$el.firstChild) {
      fragment.append(this.childNode);
    }

    // 解析html模板
    parseHtml(fragment, this);

    // 将解析过后的html添加到dom树中
    this.$el.appendChild(fragment)
  }

}

// 解析html的方法
function parseHtml(node, vm) {
  const reg = / \{\{\s*(\S+)\s*\}\}/;
  console.log('parseHtml node', node)
  const text = node.textContent;

  // 如果是文本节点
  if (node.nodeType === 3) {
    /**
     * @description: matchText 实例返回值
     * @return {*}  [' {{ name }}', 'name', index: 4, input: '名字是: {{ name }}', groups: undefined]
     */    
    const matchText = reg.exec(text);
    if (matchText) {
      const value = matchText[1].split('.').reduce((newObj, i) => newObj[i], vm);
      node.textContent = text.replace(reg, value)

      // 这个时候创建一个订阅者
      new Watcher(vm, matchText[1], (newVal) => {
        node.textContent = text.replace(reg, newVal);
      })
    }

    // 终止递归条件
    return;
  }

  // 如果是 Input 框
  if (node.nodeType === 1 && node.tagName.toUpperCase() === 'INPUT') {
    const attrs = Array.from(node.attributes);
    // 找到 v-model 为双向绑定
    const vModelEle = attrs.find(x => x.name === 'v-model');
    if (vModelEle) {
      // 绑定的属性 key
      const expStr = vModelEle.value;
      const value = expStr.split('.').reduce((newObj, i) => newObj[i], vm);
      // 赋值操作，给input框赋值
      node.value = value;

      // 开始订阅字段
      new Watcher(vm, expStr, (newVal) => {
        node.value = newVal;
      })

      // 绑定监听事件，监听Input输入值的时候，回写到字段上
      node.addEventListener('input', (e) => {
        const keyArr = expStr.split('.');
        const obj = keyArr.slice(0, keyArr.length - 1).reduce((newObj, i) => newObj[i], vm);
        obj[keyArr.slice(-1)] = e.target.value;
      });
    }
  }

  node?.childNodes?.forEach((child) => {
    parseHtml(child, vm);
  })

}

export default MyVue;