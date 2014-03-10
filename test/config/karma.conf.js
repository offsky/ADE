// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '../../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine', 'ng-scenario'],

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',

      'app/common/*.js',

      'app/date/*.js',
      'test/unit/date/*.js',

      'app/decimal/*.js',
      'test/unit/decimal/*.js',

      'app/email/*.js',
      'test/unit/email/*.js',

      'app/icon/*.js',
      'test/unit/icon/*.js',

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

      'app/rich/*.js',
      'test/unit/rich/*.js',

      'app/text/*.js',
      'test/unit/text/*.js',

      'app/time/*.js',
      'test/unit/time/*.js',

      'app/toggle/*.js',
      'test/unit/toggle/*.js',

      'app/url/*.js',
      'test/unit/url/*.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'coverage'],

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
    browsers: ['PhantomJS'], //'Firefox', 'Safari', 'Chrome'

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    // Code coverage
    preprocessors: {
      'app/*/*_filters.js': 'coverage',
      // 'app/common/*.js': 'coverage',
      // 'app/date/*.js': 'coverage',
      // 'app/decimal/*.js': 'coverage',
      // 'app/email/*.js': 'coverage',
      // 'app/icon/*.js': 'coverage',
      // 'app/integer/*.js': 'coverage',
      // 'app/length/*.js': 'coverage',
      // 'app/list/*.js': 'coverage',
      // 'app/money/*.js': 'coverage',
      // 'app/percent/*.js': 'coverage',
      // 'app/phone/*.js': 'coverage',
      // 'app/rating/*.js': 'coverage',
      // 'app/rich/*.js': 'coverage',
      // 'app/text/*.js': 'coverage',
      // 'app/time/*.js': 'coverage',
      // 'app/toggle/*.js': 'coverage',
      // 'app/url/*.js': 'coverage',
    }

  });
};
