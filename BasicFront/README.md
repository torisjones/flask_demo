
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
    
    `curl -sSu $USER https://artifactory.cloud.capitalone.com/artifactory/api/npm/npm-internalfacing/auth/c1 >> ~/.npmrc`
    
    `npm install`
    
    ### <a name="commands"></a>Commands
    
    
    To start the a web server and test your code run the command
    
    `npm run start`
    
    run these commands to start the mock server for back services.
    
    ```
    cd mock-webservice
    node server.js
    ```
    
    To run unit test, type the command.
    
    `npm run test`
    
    To run a build, this will build files into dist.
    
    `npm run build`
    
    To run a sonar
    
    `npm run sonar`
    
    `npm run release`
    
    This command will run the sonar task. After sonar is finished it will check the git [Commands](#commands) and decide on how to bump the semverion.
    As long as your git commit messages are conventional and accurate, you no longer need to specify the semver type - and you get CHANGELOG generation for free! o/
    
    Use the flag --prerelease to generate pre-releases:
    ```
    # npm run script
    npm run release -- --prerelease alpha
    ```
    this will tag the version 1.0.1-alpha.0
    To forgo the automated version bump use --release-as with the argument major, minor or patch
    ## <a name='deploy'></a> Deploy
    To update the version of the Web components run the Jeninks build from this URL
    [Jenkins](https://coafjenkins.kdc.capitalone.com/coafjenkins/view/FsPlatform/job/FS-Non-prod/job/FS-Promote/job/Application_LibraryBuild_Node/)
    
    use the build with parameters
    the branch should be master
    organization is fs-garage-data
    repository is flask-demo-offers-ui
    
    ## <a name='polyfill'></a> Polyfill
    The widget is using the latest web technology. the widget will work native in Chrome, Opera, and Safari.
    For Edge and firefox these are available behind a flag. Both of these browsers need to have a polyfill to work correctly. We are using the polyfill from [Polymer](https://github.com/webcomponents/webcomponentsjs). You will need to get webcomponents-lite.js from this site and place into your web repo. You should now progressive add this polyfill to your page. we have an example of how testing tool handles this [example](POLYFILL.MD). In this example, we are checking what version of IE you are using and blocking any version of IE other than Edge. We are also adding a fetch API polyfill for browsers that don't have this. This code needs to be at the top of the index.html of your app.
    
    
    
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
    ## <a name="commit"></a> Git Commit Guidelines
    
    We have very precise rules over how our git commit messages can be formatted.  This leads to **more
    readable messages** that are easy to follow when looking through the **project history**.  But also,
    we use the git commit messages to **generate the Flask-demo App change log**.
    The commit message formatting can be added using a typical git workflow or through the use of a CLI
    wizard ([Commitizen](https://github.com/commitizen/cz-cli)).
    
    ### Commit Message Format
    Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
    format that includes a **type**, a **scope** and a **subject**:
    
    ```
    <type>(<scope>): <subject>
    <BLANK LINE>
    <body>
    <BLANK LINE>
    <footer>
    ```
    
    The **header** is mandatory and the **scope** of the header is optional.
    
    *patches:*
    ```
    git commit -a -m "fix(parsing): fixed a bug in our parser"
    ```
    *features:*
    ```
    git commit -a -m "feat(parser): we now have a parser o/"
    ```
    *breaking changes:*
    ```
    git commit -a -m "feat(new-parser): introduces a new parsing library
    BREAKING CHANGE: new library does not support foo-construct"
    ```
    
    Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
    to read on GitHub as well as in various git tools.
    
    ### Revert
    If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit.
    In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.
    
    ### Type
    Must be one of the following:
    
    * **feat**: A new feature
    * **fix**: A bug fix
    * **docs**: Documentation only changes
    * **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
      semi-colons, etc)
    * **refactor**: A code change that neither fixes a bug nor adds a feature
    * **perf**: A code change that improves performance
    * **test**: Adding missing or correcting existing tests
    * **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
      generation
    
    ### Scope
    The scope could be anything specifying a place of the commit change. For example `routes`,
    `mock`, `helpers`, etc...
    
    You can use `*` when the change affects more than a single scope.
    
    ### Subject
    The subject contains a succinct description of the change:
    
    * use the imperative, present tense: "change" not "changed" nor "changes"
    * don't capitalize the first letter
    * no dot (.) at the end
    
    ### Body
    Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes."
    The body should include the motivation for the change and contrast this with previous behavior.
    
    ### Footer
    The footer should contain any information about **Breaking Changes** and is also the place to
    [reference GitHub issues that this commit closes][closing-issues].
    
    **Breaking Changes** should start with the word `BREAKING CHANGE:` with space or two newlines.
    The rest of the commit message is then used for this.
    
    A detailed explanation can be found in this [document][commit-message-format].
    
    Adding routing in the next version.
    version 3.0.1
    