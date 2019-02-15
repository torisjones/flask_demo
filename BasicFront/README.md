
![](logo.png)
# Flask-demo-ui Web Components
Common Web Components for the FS org.

- [Start Up](#startup)
- [Commands](#commands)
- [Deploy](#deploy)
- [Polyfill](#polyfill)
- [Code Structure](#structure)
- [Angular Usage](#angular)
- [Bower Usage](#bower)
- [Commit Message Guidelines](#commit)

## <a name="startup"></a>StartUp
Clone the code from this repo to your own github repo. After you get the code please run the following code to get the npm dependances.

`npm install`

### <a name="commands"></a>Commands


To start the a web server and test your code run the command

`npm run start`


## <a name='structure'></a> Structure
We are structuring the code to take advantage of writing a micro-frontends.
```
src
| +---pages (This is an all the pages that multiple web components)
| +---routes(micro-frontend starting point. uses fsc-router. rollup will build a js file for exporting.)
| +---widgets(list of web components and are the features)
| +---utils ( common js for all the apps)
```
This is a Web Components using v1 w3c standards.  The source code is in the src. The structure for a web component is:
```
flask-demo-feature
|   +---flask-demo-feature.js (the javascript code for the web components)
|   +---flask-demo-feature.scss (sass files for building css styles)
|   +---flask-demo-feature.html (templates for init view of the style.)
```
When we build the files, we call the file scripts/injectTemplates. This file will compile the sass file into a css text.
This text will be injected into the HTML in memory. The HTML will then be injected into the js at the temp HTML with the back tic javascript template.  This tempHtml var should be the innerHTML for your web component.
example

```javascript
this._shadowRoot.innerHTML = tempHtml;
```
the file will be saved in the dist dir.
At this point, we use rollup to build a flask-demo-ui.js in the dist dir.

We are using the test dir for the unit test files. The coverage reports are stored in the reports dir. We are creating a lcov file so that we can run sonar against are unit test.

### Dev work
The test-web is been we are doing a web page to show our work. We are using Browser-sync as our web server. If you need to change the proxy for browser sync the config file can be found in rollup.config.js.


##Usage
### <a name="es6"></a>ES6 module
You can import individual micor-frontend if your app can take advantage of ES6 modules.
Example, You only need to use the metrics home.
```
<script src="flask-demo-metrics-home.js" charset="utf-8" type="module"></script>
<script src="flask-demo-ui.min.js" charset="utf-8" nomodule></script>
```
The second line is the fallback is the browser does not support modules.

### <a name="angular"></a>Angular 2
#### Way one
In the package.json add to the dependencies add the line.

```
"flask-demo-ui" : "git://github.kdc.capitalone.com/fs-flask-demo-repos/flask-demo-ui.git"
```
In the app.module.[ts,js] add CUSTOM_ELEMENTS_SCHEMA for the import and schema. Here is an example in typescript.

```
import { BrowserModule } from '@angular/platform-browser';
import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
```
To your .angular-cli.json add to the script atttibute.

```
 "scripts": ["../node_modules/flask-demo-ui/dist/flask-demo-ui.js"],
```
Now you can use the componets as you wish.

####Way two
In the package.json add to the dependencies add the line.

```
"flask-demo-ui" : "git://github.kdc.capitalone.com/fs-flask-demo-repos/flask-demo-ui.git"
```
In the app.module.[ts,js] add CUSTOM_ELEMENTS_SCHEMA for the import and schema. Here is an example in typescript.

```
import { BrowserModule } from '@angular/platform-browser';
import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
```
In your main.ts add the import for flask-demo-ui.

```
import 'flask-demo-ui';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
```

