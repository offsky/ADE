'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({
		watch: {
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

		//Allows you to use generic css rules (border-radius) and this will automatically generate the prefixed versions (-webkit-border-radius)
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

		//empties out the folders in preparation for a new build
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

		//
		jshint: {
	      options: {
	        reporter: require('jshint-stylish'),
	        globals: {
	          "jQuery": true,
	          "$": true,
	          "angular": true,
	          "console": true,
	          "window": true,
	        }
	      },
	      all: [
            'app/common/*.js',
            'app/date/*.js',
            'app/decimal/*.js',
            'app/duration/*.js',
            'app/email/*.js',
            'app/icon/*.js',
            'app/integer/*.js',
            'app/list/*.js',
            'app/money/*.js',
            'app/percent/*.js',
            'app/phone/*.js',
            'app/rating/*.js',
            'app/rich/*.js',
            'app/tag/*.js',
            'app/text/*.js',
            'app/time/*.js',
            'app/toggle/*.js',
            'app/url/*.js'

	      ]
	    },
		
		plato: {
        options: {
          jshint: {
            globals: {
             "jQuery": true,
             "$": true,
             "angular": true,
             "console": true,
             "window": true,
            }
          }
        },
        report: {
            files: {
                'reports/': [
                 'app/common/*.js',
		            'app/date/*.js',
		            'app/decimal/*.js',
		            'app/duration/*.js',
		            'app/email/*.js',
		            'app/icon/*.js',
		            'app/integer/*.js',
		            'app/list/*.js',
		            'app/money/*.js',
		            'app/percent/*.js',
		            'app/phone/*.js',
		            'app/rating/*.js',
		            'app/rich/*.js',
		            'app/tag/*.js',
		            'app/text/*.js',
		            'app/time/*.js',
		            'app/toggle/*.js',
		            'app/url/*.js'
                ],
            }
        }
    },

		// not used since Uglify task does concat,
		// but still available if needed
		/*concat: {
			dist: {}
		},*/
		
		//revisions files to avoid browser caching of old resources
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

		//looks at index file to find css/js blocks for minification
		useminPrepare: {
			html: 'app/index.html',
			options: {
				dest: 'dist'
			}
		},
		
		//updates index with minified files and css with revisioned images
		usemin: {
			html: ['dist/*.html'],
			css: ['dist/common/*.css'],
			options: {
				dirs: ['dist']
			}
		},
		
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'app/common/',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: 'dist/common/'
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
					src: ['*.html'],
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
				// }, {
				// 	expand: true,
				// 	cwd: '.tmp/images',
				// 	dest: 'dist/images',
				// 	src: [
				// 		'generated/*'
				// 	]
				}]
			},
			styles: {
				expand: true,
				cwd: 'app/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
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

		//Prepares angular app for minification by injecting providers
		/* We don't need this because we explicitly inject providers in ADE
		ngmin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'dist/js',
					src: '*.js',
					dest: 'dist/js'
				}]
			}
		},*/

		uglify: {
			options: {
       		banner: '/*! Copyright <%= grunt.template.today("yyyy") %> Toodledo. Licensed under the MIT License */\n'
     		},
			dist: {
				files: {
					'dist/build/ade.min.js': [
						'dist/build/ade.min.js'
					]
				}
			}
		},

		protractor_webdriver: {
			app: {
				options: {
					// path: 'node_modules/protractor/bin/',
				command: 'webdriver-manager start'
				}
			}
		},
		protractor: {
			options: {
				configFile: "node_modules/protractor/referenceConf.js", // Default config file
				keepAlive: true, // If false, the grunt process stops when the test fails.
				noColor: false, // If true, protractor will not use colors in its output.
				args: {
				// Arguments passed to the command
			  }
			},
			app: {
			  options: {
			    configFile: "test/config/protractor_conf.js", // Target-specific config file
			    args: {} // Target-specific arguments
			  }
			}
		}
	});

   grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('p:test', [
		'protractor_webdriver',
		'protractor'
	]);

	grunt.registerTask('server', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			'copy:styles',
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
		'karma:unit',       //
		//'jshint',
    	'plato:report'
	]);

	//what gets executed when you run "grunt build"
	grunt.registerTask('build', [
		'clean:dist',       //cleans out the dist folder
		'test',             //runs unit tests on app folder
		'useminPrepare',    //looks at index file to find css/js blocks for minification
		'copy:styles',  	  //
		//'imagemin',  	  //
		'htmlmin',			  //
		'autoprefixer',     //Allows you to use generic css rules (border-radius) and this will automatically generate the prefixed versions (-webkit-border-radius)
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
