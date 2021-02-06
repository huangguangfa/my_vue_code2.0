
function formatProps(attrs){
    console.log(attrs)
    let attrStr = '';
    for(let i=0; i<attrs.length; i++){
        let attr = attrs[i];
        if(attr.name === 'style'){
            let styleAttrs = {};
            attr.value.split(';').forEach( (styleAttrsItem) =>{
                let [key ,value] = styleAttrsItem.split(':');
                styleAttrs[key] = value
            })
            attr.value = styleAttrs;
        }
        attrStr += `${attr.name}:${JSON.stringify(attr.value)}`
    }
    console.log(`{${attrStr.slice(0, -1)}}`)
    return `{${attrStr.slice(0, -1)}}`
}


function generate(el){
    let code = `
        _c('${el.tag}',{
            ${el.attrs.length > 0 ?  formatProps(el.attrs) : 'undefind'}
        })
    `
}

export {
    generate
}

