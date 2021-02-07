import { parseHtmlToAst } from './astParser.js'
import { generate } from './generate.js'

function compileToRenderFunction(html){
    const ast = parseHtmlToAst(html),
          code = generate(ast),
          render = new Function(`
            with(this) { return ${code} }
          `);
    return render;
}

export {
    compileToRenderFunction
}