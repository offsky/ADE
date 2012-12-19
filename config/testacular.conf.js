basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'app/vendor/js/jquery-1.8.2.min.js',
  'app/vendor/js/angular.js',
  'app/vendor/js/angular-*.js',
  'test/lib/angular/angular-mocks.js',
  'app/common/*.js',

  'app/percent/*.js',
  'test/unit/percent/*.js',

  'app/date/*.js',
  'test/unit/date/*.js',

  'app/text/*.js',
  'test/unit/text/*.js',

  'app/currency/*.js',
  'test/unit/currency/*.js',

  'app/url/*.js',
  'test/unit/url/*.js',

  'app/email/*.js',
  'test/unit/email/*.js',

  'app/phone/*.js',
  'test/unit/phone/*.js',

  'app/integer/*.js',
  'test/unit/integer/*.js'

];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
