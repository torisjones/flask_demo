
var proxy = require('proxy-middleware');
var url = require('url');
var proxyListing = url.parse('http://localhost:5000/');
// var proxyListing = url.parse('http://api.reimaginebanking.com/');
proxyListing.route = '/';

module.exports = {
  ui: {
    port: 8050,
    weinre: {
      port: 8079
    }
  },
  files: 'dist/flask-demo-ui.js,web/*.html',
  watchOptions: {},
  server: true,
  proxy: false,
  port: 8050,
  middleware: [
    proxy(proxyListing)
  ],
  single:true,
  serveStatic: ['web','dist','node_modules/@c1/dist'],
  ghostMode: {
    clicks: true,
    scroll: true,
    forms: {
      submit: true,
      inputs: true,
      toggles: true
    }
  },
  logLevel: 'info',
  logPrefix: 'flask-demo-WC',
  logConnections: false,
  logFileChanges: true,
  logSnippet: true,
  rewriteRules: false,
  open: 'local',
  browser: 'default',
  cors: false,
  xip: false,
  hostnameSuffix: false,
  reloadOnRestart: false,
  notify: true,
  scrollProportionally: true,
  scrollThrottle: 0,
  scrollRestoreTechnique: 'window.name',
  scrollElements: [],
  scrollElementMapping: [],
  reloadDelay: 0,
  reloadDebounce: 0,
  reloadThrottle: 0,
  plugins: [],
  injectChanges: true,
  startPath: null,
  minify: true,
  host: null,
  localOnly: false,
  codeSync: true,
  timestamps: true,
  clientEvents: [
    'scroll',
    'scroll:element',
    'input:text',
    'input:toggles',
    'form:submit',
    'form:reset',
    'click'
  ],
  socket: {
    socketIoOptions: {
      log: false
    },
    socketIoClientConfig: {
      reconnectionAttempts: 50
    },
    path: '/browser-sync/socket.io',
    clientPath: '/browser-sync',
    namespace: '/browser-sync',
    clients: {
      heartbeatTimeout: 5000
    }
  },
  tagNames: {
    less: 'link',
    scss: 'link',
    css: 'link',
    jpg: 'img',
    jpeg: 'img',
    png: 'img',
    svg: 'img',
    gif: 'img',
    js: 'script'
  }
};
