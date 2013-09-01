basePath = '../../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'dist/vendor/js/jquery-1.10.2.min.js',
  'dist/vendor/js/angular.js',
  'dist/vendor/js/angular-*.js',
  'test/lib/angular/angular-mocks.js',
  'dist/build/*.js',

  'test/unit/date/*.js',
  'test/unit/decimal/*.js',
  'test/unit/email/*.js',
  'test/unit/integer/*.js',
  'test/unit/duration/*.js',
  'test/unit/money/*.js',
  'test/unit/percent/*.js',
  'test/unit/phone/*.js',
  'test/unit/rating/*.js',
  'test/unit/text/*.js',
  'test/unit/toggle/*.js',
  'test/unit/url/*.js',
  'test/unit/icon/*.js',
  'test/unit/time/*.js',
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

autoWatch = true;

browsers = ['Chrome','Safari','Firefox']; // 'PhantomJS'

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
