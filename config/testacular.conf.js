basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'app/vendor/js/angular.js',
  'app/vendor/js/angular-*.js',
  'test/lib/angular/angular-mocks.js',
  'app/common/*.js',
  'app/percent/*.js',
  'test/unit/percent/*.js'
];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
