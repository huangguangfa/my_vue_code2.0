
/* 
<div id="app" style="color: red;">
    {{ age }}
    <span>{{ name }}</span>
</div> 
*/

//匹配属性 --> id="app" || id='app' || id=app
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
//标签名 <my-header></my-header>
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
//标签名 <my:header></my:header>
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// <div
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// > || />
const startTagClose = /^\s*(\/?)>/;
// </div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

//去做标签处理判断循环html、根据开始标签 结束标签 文本标签等进行相对应的查找匹配、然后转为层级清晰的AST语法树

function parseHtmlToAst(html){
    let text,
        root,
        currentParent,
        stack = [];
    while(html){
        let textEnd = html.indexOf('<');
        if(textEnd === 0){
            const startTagMatch = parseStartTage();
            if(startTagMatch){
                start( startTagMatch.tagName, startTagMatch.attrs );
                continue;
            }

            const endTagMatch = html.match(endTag);
            if(endTagMatch){
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue;
            }
        }

        if(textEnd > 0){
            text = html.substring(0,textEnd);
        }

        if(text){
            advance(text.length);
            chars(text)
        }

    }

    function parseStartTage(){
        const start = html.match(startTagOpen);
        let end,
            attr;
        if(start){
            const match = {
                tagName:start[1],
                attrs:[]
            }
            advance(start[0].length)
            //不是结束标签、并且匹配是否是属性
            while( !(end = html.match(startTagClose)) &&  (attr = html.match(attribute))){
                match.attrs.push({
                    name:attr[1],
                    value:attr[3] || attr[4] || attr[5]
                });
                advance(attr[0].length);
            }
            if(end){
                advance(end[0].length)
                return match;
            }
        }
    }

    function advance(n){
        html = html.substring(n);
    }

    function start(tagName,attrs){
        const elemet = createASTElement(tagName,attrs);
        if(!root){
            root = elemet;
        }
        currentParent = elemet;
        stack.push(elemet)
    }
    
    function end(tagName){
        //span
        const element = stack.pop();
        //div
        currentParent = stack[stack.length -1];
        if(currentParent){
            // span => parent => div
            element.parent = currentParent;
            //div => children => push => span
            currentParent.children.push(element)
        }

    }
    
    function chars(text){
        text = text.trim();
        if(text.length > 0){
            currentParent.children.push({
                type:3,
                text
            })
        }
    }

    function createASTElement(tagName,attrs){
        return {
            tag:tagName,
            type:1,
            children:[],
            attrs,
            parent
        }
    }
    return root;
}




export{
    parseHtmlToAst
}