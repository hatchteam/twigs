// Karma configuration
// Generated on Wed Mar 05 2014 09:38:26 GMT+0100 (W. Europe Standard Time)

module.exports = function (config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-bootstrap/ui-bootstrap.min.js',
      'bower_components/angular-route/angular-route.js',
      'src/**/module.js',
      'src/**/*.js',
      'test/unit/**/*.js'
    ],

    // list of files to exclude
    exclude: [],

    preprocessors: {
      'src/*.js': 'coverage'
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['PhantomJS'],

    captureTimeout: 60000,

    singleRun: false
  });
};
