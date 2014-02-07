// Karma configuration for running unit tests on dist folder
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '../../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
          'app/bower_components/jquery/jquery.js',
          'app/bower_components/angular/angular.js',
          'app/bower_components/angular-mocks/angular-mocks.js',
          'app/bower_components/angular-sanitize/angular-sanitize.js',
      
          'dist/build/*.js',

          'test/unit/date/*.js',
          'test/unit/decimal/*.js',
          'test/unit/duration/*.js',
          'test/unit/email/*.js',
          'test/unit/icon/*.js',
          'test/unit/integer/*.js',
          'test/unit/money/*.js',
          'test/unit/percent/*.js',
          'test/unit/phone/*.js',
          'test/unit/rating/*.js',
          'test/unit/rich/*.js',
          'test/unit/text/*.js',
          'test/unit/time/*.js',
          'test/unit/toggle/*.js',
          'test/unit/url/*.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],

    // web server port
    port: 9876,

    // cli runner port
    runnerPort: 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
   browsers: ['Chrome', 'Safari', 'Firefox', 'Opera'],
   // browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
