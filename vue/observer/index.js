import defineReactiveData from '../reactive';
import { arrMethods } from './array';
import observeArr from './observeArr';
//数据劫持
function observe(data){
    if(typeof data !== 'object' || data === null) return ;
    return new Observer(data)
}

function Observer(data){
    if(Array.isArray(data)){
        //把重写数组方法给到数据的__proto__，目的用于拦截数组
        data.__proto__ = arrMethods;
        //监听数组里面的每一项---递归操作
        observeArr(data);
    }else{
        //对象的拦截
        this.walk(data)
    }
}

Observer.prototype.walk = function(data){
    let keys = Object.keys(data);
    for(let i=0; i<keys.length;i++){
        let key = keys[i],
        value = data[key];
        defineReactiveData(data,key,value);
    }
}

export default observe;