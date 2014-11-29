'use strict';
var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var path = require('path');
var mountFolder = function (connect, dir) {
  var resolved = path.resolve(dir);
  console.log('mounting folder ', resolved);
  return connect.directory(resolved);
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'src',
    dist: 'dist',
    demo: 'demo'
  };

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {
  }

  /*
   * for automatic docu generation
   */
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-connect-rewrite');

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      livereload: {
        files: [
          'components/{,*/}*.js',
          'dist/{,*/}*.js',
          '<%= yeoman.demo %>/{,*/}*.html',
          '{.tmp,<%= yeoman.demo %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.demo %>}/{,*/}*.js',
          '<%= yeoman.demo %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        tasks: ['livereload']
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      rules: [
        // Internal rewrite for templates, since our directives use a correct relative path to the templates
        {from: '^/demo/templates/(.*)$', to: '/templates/$1'}
      ],
      livereload: {
        options: {
          middleware: function (connect, options) {
            /**
             *  We want to serve our whole directory. We need twigs source-files, and also demo files.
             */
            var middlewares = [];
            middlewares.push(rewriteRulesSnippet);
            middlewares.push(lrSnippet);
            middlewares.push(connect.static(options.base));
            middlewares.push(connect.directory(options.base));
            return middlewares;
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
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>/demo'
      }
    },
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp'
    },
    eslint: {
      target: ['<%= yeoman.app %>/{,*/}*.js']
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
      unitwatch: {
        configFile: 'karma.conf.js',
        singleRun: false,
        autoWatch: true
      }
    },
    protractor: {
      options: {
        configFile: "node_modules/protractor/referenceConf.js", // Default config file
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      e2e: {
        configFile: "protractor-e2e.conf.js",
        options: {
          args: {} // Target-specific arguments
        }
      }
    },
    concat: {
      dist: {
        files: {
          '<%= yeoman.dist %>/twigs.js': [
            '<%= yeoman.app %>/{,*/}*.js',
            '.tmp/{,*/}*.js'
          ]
        }
      }
    },
    ngmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>',
            src: '*.js',
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,txt}',
              '.htaccess',
              'images/{,*/}*.{gif,webp}',
              'styles/fonts/*'
            ]
          }
        ]
      }
    },

    uglify: {
      options: {
        beautify: false,
        mangle: true
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>',
            src: '*.js',
            dest: '<%= yeoman.dist %>',
            ext: '.min.js'
          }
        ]
      }
    },

    ngdocs: {
      options: {
        dest: 'docs',
        html5Mode: false,
        startPage: '/api',
        title: 'Twigs Documentation',
        animation: true
      },
      api: {
        src: [
          'src/**/*.js',
          'src/*.js'
        ],
        title: 'API Reference'
      }

    },
    less: {
      dist: {
        files: [
          {
            expand: true,
            dest: 'dist/',
            src: 'styles/*.less',
            ext: '.css'
          }
        ]
      }
    },
    ngtemplates: {
      'twigs.templates': {
        src: 'templates/*.html',
        dest: '.tmp/templates.js'
      }
    }
  });

  grunt.renameTask('regarde', 'watch');


  grunt.registerTask('server', [
    'clean:server',
    'livereload-start',
    'configureRewriteRules',  // this is to enable grunt-connect-rewrite
    'connect:livereload',
    'open',
    'watch'
  ]);

  grunt.registerTask('docu', [
    'ngdocs'
  ]);

  grunt.registerTask('test:unit', [
    'clean:server',
    'ngtemplates',
    'connect:test',
    'karma:unit'
  ]);
  grunt.registerTask('test', ['test:unit']);

  grunt.registerTask('test:unitwatch', [
    'clean:server',
    'ngtemplates',
    'connect:test',
    'karma:unitwatch'
  ]);


  grunt.registerTask('test:e2e', [
    'protractor:e2e'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'eslint',
    'test:unit',
    'docu',
    'ngtemplates',
    'concat',
    'less:dist',
    'copy',
    'ngmin',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);
};
