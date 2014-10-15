/*
  Protractor

  https://github.com/angular/protractor
  https://github.com/angular/protractor/blob/master/docs/getting-started.md
  http://ramonvictor.github.io/protractor/slides/#/
  https://github.com/angular/protractor/tree/master/docs

  API

  https://github.com/angular/protractor/blob/master/docs/api.md
  https://code.google.com/p/selenium/wiki/WebDriverJs

  Supported Browsers: Chrome, Safari, Firefox, IE8, IE9, IE10, PhantomJS.

  Opera is supported through its operadriver. This driver only works up to version 12.16. It does not support higher blink-based versions.
  However, Opera is not supported since operadriver does not support executing asynchronous javascript in the browser. The following
  follows this issue:

    https://github.com/angular/protractor/issues/226

  IE11 is not supported in Selenium yet.

    https://code.google.com/p/selenium/issues/detail?id=6511


  Use:

    1) Start selenium server

    webdriver-manager start

    2) Run tests

    protractor test/config/protractor_conf.js 

  Element Explorer:

    /usr/local/lib/node_modules/protractor/bin/elementexplorer.js http://localoutline.toodledo.com/~aartola/outline/app/index.iphone.html#/

    Press tab

*/


// An example configuration file.
// https://github.com/angular/protractor/blob/master/referenceConf.js

exports.config = {
  // Override the timeout for webdriver to 20 seconds.
  // allScriptsTimeout: 20000,

  // The address of a running selenium server.
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  // multiCapabilities: [{
  //   'browserName': 'chrome'
  // }, {
  //   'browserName': 'safari'
  // }, {
  //   'browserName': 'firefox'
  // }, {
  //   'browserName': 'phantomjs'
  // }, {
  //   'browserName': 'ie'
  // }],

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: [    
    '../exampleSpec.js'
  ],

  onPrepare: function() {
    global.isAngularSite = function(flag) {
      browser.ignoreSynchronization = !flag;
    };

    // set window size
    // browser.driver.manage().window().setSize(1600, 800);

    global.getHomepage = function() {
      browser.get('http://local.toodledo.com/ADE/app/');
    };
  },

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    isVerbose: true,
    includeStackTrace: true
  }
};