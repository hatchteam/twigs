var
  gulp = require('gulp'),
  karma = require('karma').server,
  del = require('del'),
  less = require('gulp-less'),
  concat = require('gulp-concat'),
  ngAnnotate = require('gulp-ng-annotate'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  gulpDocs = require('gulp-ngdocs'),
  webserver = require('gulp-webserver'),
  ngTemplates = require('gulp-ng-templates'),
  eslint = require('gulp-eslint'),
  path = require('path');

var server = {
  host: 'localhost',
  port: '8001',
  root: './'
};

var paths = {
  prodModuleFiles: './src/**/module.js',
  prodFiles: './src/**/*.js',
  testFiles: './test/**/*.js',
  styleFiles: './styles/**/*.less',
  templateFiles: './templates/**/*.html',
  dist: './dist',
  docs: './docs'
};

var fileNames = {
  twigsDist: 'twigs.js',
  twigsDistMin: 'twigs.min.js'
};

gulp.task('serve', function () {
  gulp.src(server.root)
    .pipe(webserver({
      host: server.host,
      port: server.port,
      open: '/demo/index.html',
      livereload: true,
      directoryListing: false
    }));
});

/**
 * generates ngDoc
 */
gulp.task('docu', ['cleandoc'], function () {

  var options = {
    html5Mode: false,
    startPage: '/api',
    title: 'Twigs Documentation',
    animation: true
  };

  return gulp.src(paths.prodFiles)
    .pipe(gulpDocs.process(options))
    .pipe(gulp.dest(paths.docs));
});

gulp.task('cleandist', function (done) {
  del([paths.dist], done);
});

gulp.task('cleandoc', function (done) {
  del([paths.docs], done);
});

gulp.task('clean', ['cleandist', 'cleandoc']);

/**
 * concatenates all our production js files, ngAnnotates them, uglifies and minifies
 */
gulp.task('compress', ['cleandist', 'templates'], function () {
  return gulp.src([paths.prodModuleFiles, paths.prodFiles, './.tmp/templates.js'])
    // concatenates our productionFiles to the dist directory
    .pipe(concat(fileNames.twigsDist))
    // adds injection metadata to our angular components
    .pipe(ngAnnotate())
    .pipe(gulp.dest(paths.dist))
    // obfuscate
    .pipe(uglify())
    .pipe(rename(fileNames.twigsDistMin))
    .pipe(gulp.dest(paths.dist))
});

/**
 * generates a new file with an angular module "twigs.templates",
 * which puts all our html files into the angular template cache
 */
gulp.task('templates', function () {
  return gulp.src(paths.templateFiles)
    .pipe(ngTemplates({
      module: 'twigs.templates',
      filename: 'templates.js',
      path: function (filePath, base) {
        return path.join('templates', filePath.replace(base, ''));
      }
    }))
    .pipe(gulp.dest('./.tmp/'));
});

/**
 * compiles less files to dist directory
 */
gulp.task('less', ['cleandist'], function () {
  gulp.src(paths.styleFiles)
    .pipe(less())
    .pipe(gulp.dest(paths.dist + '/styles'));
});

/**
 * lints our production files with ESLint
 */
gulp.task('lint', function () {
  return gulp.src(paths.prodFiles)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

/**
 * Runs our unit tests with karma
 * */
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    autoWatch: false
  }, done);
});

/**
 * Watch for file changes and re-run tests on each change
 * */
gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    autoWatch: true
  }, done);
});

gulp.task('build', [
  'lint',
  'test',
  'docu',
  'compress',
  'less'
]);

gulp.task('default', ['build']);
