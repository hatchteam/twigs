var
  gulp = require('gulp'),
  karma = require('karma').server,
  eslint = require('gulp-eslint');


var paths = {
  prodFiles: './src/**/*.js'
};

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

gulp.task('default', ['lint', 'test']);
