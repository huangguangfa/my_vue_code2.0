import { parseHtmlToAst } from './astParser.js'
import { generate } from './generate.js'

function compileToRenderFunction(html){
    const ast = parseHtmlToAst(html);
    const code = generate(ast);
    // console.log(code)
}

export {
    compileToRenderFunction
}