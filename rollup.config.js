import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import comminjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';

export default{
    input:'./vue/index.js',
    output:{
        format:'umd',
        name:'Vue',
        file:'dist/umd/vue.js',
        courcemap:true
    },
    plugins:[
        babel({
            exclude:'node_modules/**'
        }),
        livereload(),
        serve({
            open:true,
            port:8000,
            contentBase:'',
            openPage:'./index.html'
        }),
        comminjs()
        
    ]
}