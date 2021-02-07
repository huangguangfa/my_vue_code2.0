import { patch } from './vdom/patch';
function mountComponent (vm){
    vm._updata(vm._render());
}

function lifecycleMixin(Vue){
    Vue.prototype._updata = function (vnode){
        const vm = this;
        patch(vm.$el,vnode)
    }
}

export {
    mountComponent,
    lifecycleMixin
}