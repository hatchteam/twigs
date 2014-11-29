var
  gulp = require('gulp'),
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

gulp.task('default', ['lint']);
