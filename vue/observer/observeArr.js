import observe from './index.js'
function observeArr( arr ){
    for(let i = 0; i<arr.length; i++){
        observe(arr[i])
    }
}

export default observeArr;