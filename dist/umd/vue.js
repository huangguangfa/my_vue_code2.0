
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
        arrMethods = Object.create(originArrMethods);
    ARR_METHODS.map(function (m) {
      arrMethods[m] = function () {
        let agrs = Array.prototype.slice.call(arguments),
            rt = originArrMethods[m].apply(this, agrs);
        console.log('数组方法劫持', rt);
        let newArr;

        switch (m) {
          case 'push':
          case 'unshift':
            newArr = agrs;
            break;

          case 'splice':
            newArr = agrs.slice(2);
            break;
        }

        newArr && observeArr(newArr);
        return rt;
      };
    });

    function observe(data) {
      if (typeof data !== 'object' || data === null) return;
      return new Observer(data);
    }

    function Observer(data) {
      if (Array.isArray(data)) {
        data.__proto__ = arrMethods;
        observeArr(data);
      } else {
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
      vm._data = data = typeof data === 'function' ? data.call(vm) : data || {};

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

    function formatProps(attrs) {
      console.log(attrs);
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

        attrStr += `${attr.name}:${JSON.stringify(attr.value)}`;
      }

      console.log(`{${attrStr.slice(0, -1)}}`);
      return `{${attrStr.slice(0, -1)}}`;
    }

    function generate(el) {
      `
        _c('${el.tag}',{
            ${el.attrs.length > 0 ? formatProps(el.attrs) : 'undefind'}
        })
    `;
    }

    function compileToRenderFunction(html) {
      const ast = parseHtmlToAst(html);
      generate(ast); // console.log(code)
    }

    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        let vm = this;
        vm.$options = options;
        initState(vm);

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
      };
    }

    function Vue(options) {
      this._init(options);
    }

    initMixin(Vue);

    return Vue;

})));
