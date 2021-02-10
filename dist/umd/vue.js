
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

    function proxyData(vm, target, key) {
      Object.defineProperty(vm, key, {
        get() {
          return vm[target][key];
        },

        set(newVal) {
          vm[target][key] = newVal;
        }

      });
    }

    function defineReactiveData(data, key, value) {
      //递归做拦截
      observe(value);
      Object.defineProperty(data, key, {
        get() {
          console.log('响应式获取', value);
          return value;
        },

        set(newVal) {
          console.log('响应式设置', newVal);
          if (newVal === value) return;
          observe(newVal); //怕设置的值是一个对象或者数组

          value = newVal;
        }

      });
    }

    function observeArr(arr) {
      for (let i = 0; i < arr.length; i++) {
        observe(arr[i]);
      }
    }

    const ARR_METHODS = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

    let originArrMethods = Array.prototype,
        //复制一份array原型方法
    arrMethods = Object.create(originArrMethods);
    ARR_METHODS.map(function (method) {
      //重写数组方法
      Object.defineProperty(arrMethods, method, {
        value: function () {
          let agrs = Array.prototype.slice.call(arguments),
              rt = originArrMethods[method].apply(this, agrs);
          console.log('数组方法劫持', rt);
          let newArr;

          switch (method) {
            case 'push':
            case 'unshift':
              newArr = agrs;
              break;

            case 'splice':
              newArr = agrs.slice(2);
              break;
          } //改变数组的数据进行劫持


          newArr && observeArr(newArr);
          return rt;
        },
        enumerable: false,
        writable: true,
        configurable: true
      });
    });

    function observe(data) {
      if (typeof data !== 'object' || data === null) return;
      return new Observer(data);
    }

    function Observer(data) {
      if (Array.isArray(data)) {
        //把重写数组方法给到数据的__proto__，目的用于拦截数组
        data.__proto__ = arrMethods; //监听数组里面的每一项---递归操作

        observeArr(data);
      } else {
        //对象的拦截
        this.walk(data);
      }
    }

    Observer.prototype.walk = function (data) {
      let keys = Object.keys(data);

      for (let i = 0; i < keys.length; i++) {
        let key = keys[i],
            value = data[key];
        defineReactiveData(data, key, value);
      }
    };

    function initState(vm) {
      let options = vm.$options;

      if (options.data) {
        initData(vm);
      }
    }

    function initData(vm) {
      let data = vm.$options.data;
      vm._data = data = typeof data === 'function' ? data.call(vm) : data || {}; //数据代理 this._data.xxx => this.xxx

      for (let key in data) {
        proxyData(vm, '_data', key);
      }

      observe(vm._data);
    }

    /* 
    <div id="app" style="color: red;">
        {{ age }}
        <span>{{ name }}</span>
    </div> 
    */
    //匹配属性 --> id="app" || id='app' || id=app
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //标签名 <my-header></my-header>

    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //标签名 <my:header></my:header>

    const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // <div

    const startTagOpen = new RegExp(`^<${qnameCapture}`); // > || />

    const startTagClose = /^\s*(\/?)>/; // </div>

    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //去做标签处理判断循环html、根据开始标签 结束标签 文本标签等进行相对应的查找匹配、然后转为层级清晰的AST语法树

    function parseHtmlToAst(html) {
      let text,
          root,
          currentParent,
          stack = [];

      while (html) {
        let textEnd = html.indexOf('<');

        if (textEnd === 0) {
          const startTagMatch = parseStartTage();

          if (startTagMatch) {
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }

          const endTagMatch = html.match(endTag);

          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch[1]);
            continue;
          }
        }

        if (textEnd > 0) {
          text = html.substring(0, textEnd);
        }

        if (text) {
          advance(text.length);
          chars(text);
        }
      }

      function parseStartTage() {
        const start = html.match(startTagOpen);
        let end, attr;

        if (start) {
          const match = {
            tagName: start[1],
            attrs: []
          };
          advance(start[0].length); //不是结束标签、并且匹配是否是属性

          while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5]
            });
            advance(attr[0].length);
          }

          if (end) {
            advance(end[0].length);
            return match;
          }
        }
      }

      function advance(n) {
        html = html.substring(n);
      }

      function start(tagName, attrs) {
        const elemet = createASTElement(tagName, attrs);

        if (!root) {
          root = elemet;
        }

        currentParent = elemet;
        stack.push(elemet);
      }

      function end(tagName) {
        //span
        const element = stack.pop(); //div

        currentParent = stack[stack.length - 1];

        if (currentParent) {
          // span => parent => div
          element.parent = currentParent; //div => children => push => span

          currentParent.children.push(element);
        }
      }

      function chars(text) {
        text = text.trim();

        if (text.length > 0) {
          currentParent.children.push({
            type: 3,
            text
          });
        }
      }

      function createASTElement(tagName, attrs) {
        return {
          tag: tagName,
          type: 1,
          children: [],
          attrs,
          parent
        };
      }

      return root;
    }

    const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

    function formatProps(attrs) {
      let attrStr = '';

      for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];

        if (attr.name === 'style') {
          let styleAttrs = {};
          attr.value.split(';').forEach(styleAttrsItem => {
            let [key, value] = styleAttrsItem.split(':');
            styleAttrs[key] = value;
          });
          attr.value = styleAttrs;
        }

        attrStr += `${attr.name}:${JSON.stringify(attr.value)},`;
      }

      return `{${attrStr.slice(0, -1)}}`;
    }

    function generateChildren(node) {
      if (node.type === 1) {
        return generate(node);
      } else if (node.type === 3) {
        let text = node.text; //纯文本

        if (!defaultTagRE.test(text)) {
          return `_v(${JSON.stringify(text)})`;
        }

        let match,
            index,
            lastIndex = defaultTagRE.lastIndex = 0,
            textArr = [];

        while (match = defaultTagRE.exec(text)) {
          index = match.index;

          if (index > lastIndex) {
            textArr.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          textArr.push(`_s(${match[1].trim()})`);
          lastIndex = index + match[0].length;
        } //匹配完{{}}长度还小于text证明后面还有纯文字文本


        if (lastIndex < text.length) {
          textArr.push(JSON.stringify(text.slice(lastIndex)));
        }

        return `_v(${textArr.join('+')})`;
      }
    }

    function getChildren(el) {
      const children = el.children;

      if (children) {
        return children.map(node => generateChildren(node)).join(',');
      }
    }

    function generate(el) {
      let children = getChildren(el);
      let code = `_c('${el.tag}',  
    ${el.attrs.length > 0 ? `${formatProps(el.attrs)}` : 'undefined'}
    ${children ? `,${children}` : ''})`;
      return code;
    }

    function compileToRenderFunction(html) {
      const ast = parseHtmlToAst(html),
            code = generate(ast),
            render = new Function(`
            with(this) { return ${code} }
          `);
      return render;
    }

    function patch(oldNode, vNode) {
      let el = createElement(vNode),
          parentElement = oldNode.parentNode; //把el插入到oldNode后面然后把前面的旧节点进行删除、这样做的目地是怕后面有script标签啥的

      parentElement.insertBefore(el, oldNode.nextSibling);
      parentElement.removeChild(oldNode);
    }

    function createElement(vnode) {
      const {
        tag,
        props,
        children,
        text
      } = vnode;

      if (typeof tag === 'string') {
        vnode.el = document.createElement(tag);
        updateProps(vnode);
        children.map(child => {
          //递归
          vnode.el.appendChild(createElement(child));
        });
      } else {
        vnode.el = document.createTextNode(text);
      }

      return vnode.el;
    }

    function updateProps(vnode) {
      const el = vnode.el,
            newProps = vnode.props || {};

      for (let key in newProps) {
        if (key === 'style') {
          for (let sKey in newProps.style) {
            el.style[sKey] = newProps.style[sKey];
          }
        } else if (key === 'class') {
          el.className = el.class;
        } else {
          el.setAttribute(key, newProps[key]);
        }
      }
    }

    function mountComponent(vm) {
      vm._updata(vm._render());
    }

    function lifecycleMixin(Vue) {
      Vue.prototype._updata = function (vnode) {
        const vm = this;
        patch(vm.$el, vnode);
      };
    }

    function callHook(vm, hook) {
      const handlers = vm.$options[hook];
      handlers && handlers.call(vm);
    }

    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        let vm = this;
        vm.$options = options;
        callHook(vm, 'beforeCreate');
        initState(vm);
        callHook(vm, 'created');

        if (vm.$options.el) {
          //挂载函数
          vm.$mount(vm.$options.el);
        }
      };

      Vue.prototype.$mount = function (el) {
        const vm = this,
              options = vm.$options;
        el = document.querySelector(el);
        vm.$el = el;

        if (!options.render) {
          let template = options.template;

          if (!template && el) {
            template = el.outerHTML;
          }

          const render = compileToRenderFunction(template);
          options.render = render;
        }

        mountComponent(vm);
      };
    }

    function createElement$1(tag, attrs = {}, ...children) {
      return vnode(tag, attrs, children);
    }

    function createTextVnode(text) {
      return vnode(undefined, undefined, undefined, text);
    }

    function vnode(tag, props, children, text) {
      return {
        tag,
        props,
        children,
        text
      };
    }

    function renderMixin(Vue) {
      Vue.prototype._c = function () {
        return createElement$1(...arguments);
      };

      Vue.prototype._s = function (value) {
        if (value === null) return;
        return typeof value === 'object' ? JSON.stringify(value) : value;
      };

      Vue.prototype._v = function (text) {
        return createTextVnode(text);
      };

      Vue.prototype._render = function () {
        const vm = this,
              render = vm.$options.render,
              //虚拟节点
        vnode = render.call(this);
        return vnode;
      };
    }

    function Vue(options) {
      this._init(options);
    }

    initMixin(Vue);
    lifecycleMixin(Vue);
    renderMixin(Vue);

    return Vue;

})));
