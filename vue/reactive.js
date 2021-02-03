import observe from './observe'
function defineReactiveData(data,key,value){
    observe(value);
    Object.defineProperty(data,key,{
        get(){
            console.log('响应式获取',value)
            return value
        },
        set(newVal){
            console.log('响应式设置',newVal);
            if(newVal === value) return;
            observe(newVal); //怕设置的值是一个对象或者数组
            value = newVal;
        }
    })
}

export default defineReactiveData;