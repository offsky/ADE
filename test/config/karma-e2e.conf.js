// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({

    basePath: '../../',

    frameworks: ['ng-scenario'],

    files: [
      'test/e2e/**/*.js'
    ],

    autoWatch: false,

    // browsers = ['PhantomJS'];
    // browsers = ['Chrome'];
    // browsers = ['Firefox'];
    // browsers = ['Safari'];
    browsers: ['Chrome', 'Safari', 'Firefox'],

    singleRun: true,

    proxies: {
      '/': 'http://localhost/~jake/ADE/'
    },

    urlRoot: '/__e2e/'

  });
};
