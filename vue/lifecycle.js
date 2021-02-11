import { patch } from './vdom/patch';
function mountComponent (vm){
    vm._updata(vm._render());
}

function lifecycleMixin(Vue){
    Vue.prototype._updata = function (vnode){
        const vm = this;
        patch(vm.$el,vnode)
        callHook(vm,'mounted');
    }
}

function callHook (vm, hook) {
    const handlers = vm.$options[hook]
    handlers && handlers.call(vm)
}

export {
    mountComponent,
    lifecycleMixin,
    callHook
}