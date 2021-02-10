import observeArr from './observeArr';
import { ARR_METHODS } from '../config';

let originArrMethods = Array.prototype,
    //复制一份array原型方法
    arrMethods = Object.create(originArrMethods);

ARR_METHODS.map(function(method){
    //重写数组方法
    Object.defineProperty(arrMethods, method, {
        value: function(){
            let agrs = Array.prototype.slice.call(arguments),
            rt = originArrMethods[method].apply(this,agrs);
            console.log('数组方法劫持',rt);
            let newArr;
            switch(method){
                case 'push':
                case 'unshift':
                    newArr = agrs;
                    break;
                case 'splice':
                    newArr = agrs.slice(2)
                    break
                default:
                    break
            }
            //改变数组的数据进行劫持
            newArr && observeArr( newArr );
            return rt;
        },
        enumerable: false,
        writable: true,
        configurable: true
    })
})

export {
    arrMethods
}