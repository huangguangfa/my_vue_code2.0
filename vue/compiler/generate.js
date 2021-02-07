const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function formatProps(attrs){
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
        attrStr += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${attrStr.slice(0, -1)}}`
}

function generateChildren(node){
    if(node.type === 1){
        return generate(node)
    }else if( node.type === 3){
        let text = node.text;
        //纯文本
        if(!defaultTagRE.test(text)){
            return `_v(${JSON.stringify(text)})`
        }
        let match,
            index,
            lastIndex = defaultTagRE.lastIndex = 0,
            textArr = [];
        while( match = defaultTagRE.exec(text) ){
            index = match.index;
            if(index > lastIndex){
                textArr.push(JSON.stringify(text.slice(lastIndex,index)));
            }
            textArr.push(`_s(${match[1].trim()})`);
            lastIndex = index + match[0].length
        }
        //匹配完{{}}长度还小于text证明后面还有纯文字文本
        if(lastIndex < text.length){
            textArr.push(JSON.stringify(text.slice(lastIndex)))
        }

        return  `_v(${textArr.join('+')})`
    }
}

function getChildren(el){
    const children = el.children;
    if(children){
        return children.map( c => generateChildren(c)).join(',');
    }
}

function generate(el){
    let children = getChildren(el);
    let code = `
        _c('${el.tag}', ${
            el.attrs.length > 0 ?  formatProps(el.attrs) : 'undefind'
        }
        ,${
            children
        })
    `  
    return code;
}

export {
    generate
}

