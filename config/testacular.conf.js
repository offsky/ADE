basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'app/vendor/js/jquery-1.8.2.min.js',
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

  'app/length/*.js',
  'test/unit/length/*.js',

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
  'test/unit/url/*.js'

];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
