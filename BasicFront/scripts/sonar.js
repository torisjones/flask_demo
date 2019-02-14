
const sonarqubeScanner = require('sonarqube-scanner');
sonarqubeScanner({
    serverUrl : process.env.SONAR_URL||'https://sonar-community.cloud.capitalone.com/',
    options : {
    'sonar.sources': 'dist/',
    'sonar.tests': 'test/',
    'sonar.inclusions': 'dist/pages/*.js,dist/widgets/*.js',
    'sonar.javascript.lcov.itReportPath': 'coverage/lcov.info',
    'sonar.javascript.lcov.reportPath': 'coverage/lcov-report'
    }
}, ()=>{
    console.log('DONE?');
});
    