'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'src',
        dist: 'dist'
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

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            livereload: {
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
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
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
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
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/{,*/}*.js'
            ]
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
                animation: true,
                styles: ['docs/css/twigsDocuStyles.css']
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
            'twigs.templates':{
               src: 'templates/*.html',
               dest: '.tmp/templates.js'
            }
        }
    });

    grunt.renameTask('regarde', 'watch');


    grunt.registerTask('docu', [
        'ngdocs'
    ]);


    grunt.registerTask('test:unit', [
        'clean:server',
        'ngtemplates',
        'connect:test',
        'karma:unit'
    ]);

    grunt.registerTask('test:unitwatch', [
        'clean:server',
        'ngtemplates',
        'connect:test',
        'karma:unitwatch'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
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
