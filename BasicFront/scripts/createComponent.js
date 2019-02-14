
const chalk = require('chalk');
const argv = require('minimist')(process.argv.slice(2));
const mkdirp = require('mkdirp');
const fs = require('fs');
class createComponent {
  constructor() {
    if(argv.name){
      let paths = argv.name.split('/');
      let name = argv.name;
      let dir='';
      if(paths.length > 1){
        name = paths[paths.length - 1];
        dir = `/${paths[0]}`;
      }
      console.log(chalk.green(`we are going to build component ${name}`));
      this._buildDir(name,dir);
      this._buildJS(name,dir);
      this._buildHTML(name,dir);
      this._buildSASS(name,dir);
      this._buildTest(name,dir);
    } else {
      console.log(chalk.red('Please add the argument --name=<<name>>'));
    }
  }
  _slug(name){
    return name.toLowerCase().split('-').map((item) => {
      return item.replace(/^\w/, c => c.toUpperCase())
    }).join('');

  }
  _buildDir(name,dir){
    mkdirp.sync(`src${dir}/flask-demo-${name}`);
    mkdirp.sync(`spec${dir}/flask-demo-${name}`);
    console.log(chalk.green(`we have created a file at src/flask-demo-${name}`));
  }
  _buildJS(name,dir){
    const file = `src${dir}/flask-demo-${name}/flask-demo-${name}.js`;
    const writeStream = fs.createWriteStream(file);
    writeStream.write(`
import {Flask-demoBase} from '../../utils/flask-demo-base.js';
export class Flask-demo${this._slug(name)} extends Flask-demoBase {
  constructor(){
    super();
  }
  render(){
    this.html(tempHtml);
  }
}
if(!customElements.get('flask-demo-${name}')){
  customElements.define('flask-demo-${name}', Flask-demo${this._slug(name)});
}
`);
    writeStream.end();
    fs.createReadStream(file)
      .pipe(writeStream);
    console.log(chalk.green(`we have created javascript file flask-demo-${name}.js`));
  }
  _buildHTML(name,dir){
    const file = `src${dir}/flask-demo-${name}/flask-demo-${name}.html`;
    const writeStream = fs.createWriteStream(file);
    writeStream.write(`<div>${name}</div>`);
    writeStream.end();
    fs.createReadStream(file)
      .pipe(writeStream);
    console.log(chalk.green(`we have created html file flask-demo-${name}.html`));
  }
  _buildTest(name,dir){
    const file = `spec${dir}/flask-demo-${name}/flask-demo-${name}-spec.js`;
    const writeStream = fs.createWriteStream(file);
    writeStream.write(`
import '../../../dist${dir}/flask-demo-${name}';
describe('Test of ${this._slug(name)}', ()=>{
  let elem;
  afterEach(()=>{
    document.innerHTML = '';
  });
  beforeEach(()=>{
    elem = document.createElement('flask-demo-${name}');
  });
  it('Test we can spec', ()=>{
    document.body.appendChild(elem);
    expect(!elem).toBeFalsy();
  });
});
`);
    writeStream.end();
    fs.createReadStream(file)
      .pipe(writeStream);
    console.log(chalk.green(`we have created spec file flask-demo-${name}.js`));
  }
  _buildSASS(name,dir){
    const file = `src${dir}/flask-demo-${name}/flask-demo-${name}.scss`;
    const writeStream = fs.createWriteStream(file);
    fs.createReadStream(file)
      .pipe(writeStream);
    console.log(chalk.green(`we have created sass file flask-demo-${name}.scss`));
  }
}
new createComponent();
    