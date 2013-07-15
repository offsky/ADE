basePath = '../../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'app/vendor/js/jquery-1.9.1.min.js',
  'app/vendor/js/angular.js',
  'app/vendor/js/angular-*.js',
  'test/lib/angular/angular-mocks.js',
  'app/common/*.js',

  'app/date/*.js',
  'test/unit/date/*.js',

  'app/decimal/*.js',
  'test/unit/decimal/*.js',

  'app/email/*.js',
  'test/unit/email/*.js',

  'app/integer/*.js',
  'test/unit/integer/*.js',

  'app/duration/*.js',
  'test/unit/duration/*.js',

  'app/money/*.js',
  'test/unit/money/*.js',

  'app/percent/*.js',
  'test/unit/percent/*.js',

  'app/phone/*.js',
  'test/unit/phone/*.js',

  'app/rating/*.js',
  'test/unit/rating/*.js',

  'app/text/*.js',
  'test/unit/text/*.js',

  'app/toggle/*.js',
  'test/unit/toggle/*.js',

  'app/url/*.js',
  'test/unit/url/*.js',

  'app/icon/*.js',
  'test/unit/icon/*.js',

  'app/time/*.js',
  'test/unit/time/*.js',

  'app/rich/*.js',
  'test/unit/rich/*.js'

];

// list of files to exclude
exclude = [

];


// test results reporter to use
// possible values: dots || progress
reporter = 'progress';


// web server port
port = 8080;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari
// - PhantomJS
browsers = ['PhantomJS'];


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
