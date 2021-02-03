import { initState } from './init'

function Vue(option){
    this._init(option)
}

Vue.prototype._init = function(option){
    let vm = this;
    vm.$options = option;

    initState(vm)
}

export default Vue;