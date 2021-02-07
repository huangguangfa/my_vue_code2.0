import { parseHtmlToAst } from './astParser.js'
import { generate } from './generate.js'

function compileToRenderFunction(html){
    const ast = parseHtmlToAst(html),
          code = generate(ast),
          render = new Function(`
            with(this) { return ${code} }
          `);
    console.log(render)
}

export {
    compileToRenderFunction
}