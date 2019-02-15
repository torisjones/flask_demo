
import templateRollupPlugin from './scripts/templateRollupPlugin.js';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify-es';
const isProduction = process.env.BUILD === 'production';
console.log(process.env.BUILD);
export default [{
    input: 'src/build.js',
    output: [
    {
        file: 'dist/flask-demo-ui.js',
        format: 'es'
    }
    ],
    plugins: [
    templateRollupPlugin(),
    resolve(),
    commonjs({
        include: 'node_modules/**'
    }),
    isProduction && uglify()]
}];  