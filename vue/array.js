import observeArr from './observeArr';
import { ARR_METHODS } from './config';

let originArrMethods = Array.prototype,
    arrMethods = Object.create(originArrMethods);

ARR_METHODS.map(function(m){
    arrMethods[m] = function(){
        let agrs = Array.prototype.slice.call(arguments),
        rt = originArrMethods[m].apply(this,agrs);
        console.log('数组方法劫持',rt);
        let newArr;
        switch(m){
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

        newArr && observeArr( newArr );
        return rt;
    }
})

export {
    arrMethods
}