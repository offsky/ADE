// Generated on 2013-08-28 using generator-angular 0.4.0
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    watch: {
      // not used
      // coffee: {
      // },
      // coffeeTest: {
      // },
      styles: {
        files: ['app/styles/{,*/}*.css'],
        tasks: ['copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          'app/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '{.tmp,app}/js/{,*/}*.js',
          'app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      },
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/*',
            '!dist/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'app/js/{,*/}*.js'
      ]
    },
    // not used
    /*coffee: {
      dist: {}
    },*/
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
      dist: {}
    },*/
    rev: {
      dist: {
        files: {
          src: [
            'dist/js/{,*/}*.js',
            'dist/styles/{,*/}*.css',
            'dist/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            'dist/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'dist'
      }
    },
    usemin: {
      html: ['dist/{,*/}*.html'],
      css: ['dist/styles/{,*/}*.css'],
      options: {
        dirs: ['dist']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: 'dist/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '{,*/}*.svg',
          dest: 'dist/images'
        }]
      }
    },
    // By default, your `index.html` <!-- Usemin Block --> will take care of minification.
    // cssmin: {
    //   
    // },
    htmlmin: {
      dist: {
        options: {
        },
        files: [{
          expand: true,
          cwd: 'app',
          src: ['views/*.html'],
          dest: 'dist'
        }]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            '**/*',
            'index.html'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: 'dist/images',
          src: [
            'generated/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: 'app/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },
    concurrent: {
      server: [
        // 'coffee:dist',
        'copy:styles'
      ],
      test: [
        // 'coffee',
        'copy:styles'
      ],
      dist: [
        // 'coffee',
        'copy:styles',
        // 'imagemin',
        'svgmin',
        'htmlmin'
      ]
    },
    karma: {
      unit: {
        configFile: 'test/config/karma.conf.js',
        singleRun: true,
        reporters: ['progress'],
        browsers: ['PhantomJS']
      },
      dist: {
        configFile: 'test/config/karma-build-dist.conf.js',
        singleRun: true
      },
      e2e: {
        configFile: 'test/config/karma-e2e.conf.js',
        singleRun: true
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/js',
          src: '*.js',
          dest: 'dist/js'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/js/scripts.js': [
            'dist/js/scripts.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  //what gets executed when you run "grunt test"
  grunt.registerTask('test', [
    'clean:server',     //
    'copy:styles',      //
    'autoprefixer',     //
    'connect:test',     //
    'karma:unit'        //
  ]);

  //what gets executed when you run "grunt build"
  grunt.registerTask('build', [
    'clean:dist',       //cleans out the dist folder
    'test',             //runs unit tests on app folder
    'useminPrepare',    //looks at index file to find css/js blocks for minification
    'concurrent:dist',  //
    'autoprefixer',     //
    'concat',           //concatenates js/css files into one. Where is this defined?
    'copy:dist',        //
    // 'ngmin',         //Prepares angular app for minification by injecting providers
    'cssmin',           //
    'uglify',           //obfuscates and shirinks the js file
    'rev',              //adds unique has to scripts.js and styles.css to avoid browser caching
    'usemin',           //updates index with minified files and css with revisioned images
    'clean:server'      //cleans .tmp
  ]);

  grunt.registerTask('default', ['build']);
};
