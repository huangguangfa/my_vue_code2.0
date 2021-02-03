import Vue from 'vue'

const app = new Vue({
    el:'#app',
    data(){
        return{
            name:'黄',
            type_list:['类型1','类型2'],
            list:[
                {
                    name:'张三'
                },
                {
                    name:'李四'
                }
            ],
            user:{
                userInfo:{
                    name:'王五'
                }
            }
        }
    }
})
