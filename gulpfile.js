var gulp        = require('gulp');
var browserify  = require('browserify');
var sourcemaps  = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');
var source      = require('vinyl-source-stream');
var streamify   = require('gulp-streamify');


// gulp.task('compile', function() {
//   return browserify('./src/js/app/app.js', { debug: true, paths: ['./src/js']})
//     .bundle()
//     .pipe(sourcemaps.init({loadMaps: true}))
//     //.pipe(uglify())
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest('./dist/js/'))
//   ;
// });

gulp.task('browserify', function() {
  var bundleStream = browserify('./src/js/index.js', 
    { debug: true, paths:['./src/js'] }
  ).bundle();

  bundleStream
    .pipe(source('app.js'))
    .pipe(streamify(sourcemaps.init( {loadMaps: true} )))
    .pipe(streamify(uglify()))
    .pipe(streamify(sourcemaps.write()))
    .pipe(gulp.dest('./dist/js/'))
  ;
});