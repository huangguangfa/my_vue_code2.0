import proxyData from './proxy';
import observe from './observer';

function initState(vm){
    let options = vm.$options;
    if(options.data){
        initData(vm)
    }
}

function initData(vm){
    let data = vm.$options.data;
    vm._data = data = typeof data === 'function' ? data.call(vm): data || {};
    //数据代理 this._data.xxx => this.xxx
    for( let key in data ){
        proxyData(vm,'_data',key);
    }
    observe(vm._data)
}


export {
    initState
}