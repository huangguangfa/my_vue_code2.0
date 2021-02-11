import { callHook } from './patch'

function patch(oldNode, vNode){
    let el = createElement(vNode),
        parentElement = oldNode.parentNode;
    //把el插入到oldNode后面然后把前面的旧节点进行删除、这样做的目地是怕后面有script标签啥的
    parentElement.insertBefore(el,oldNode.nextSibling);
    parentElement.removeChild(oldNode);
   
}

function createElement(vnode){
    const { tag,props,children,text } = vnode;
    if(typeof tag ===  'string'){
        vnode.el = document.createElement(tag);
        updateProps(vnode)
        children.map( child => {
            //递归
            vnode.el.appendChild(createElement(child))
        })
    }else{
        vnode.el = document.createTextNode(text)
    }
    return vnode.el;
}

function updateProps(vnode){
    const el = vnode.el,
          newProps = vnode.props || {};
    for(let key in newProps){
        if(key === 'style'){
            for( let sKey in newProps.style){
                el.style[sKey] = newProps.style[sKey];
            }
        }else if( key === 'class'){
            el.className = el.class;
        }else{
            el.setAttribute(key,newProps[key])
        }
    }
}


export {
    patch
}