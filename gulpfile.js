/* jshint node: true */
'use strict';

var gulp        = require('gulp');
var browserify  = require('browserify');
var sourcemaps  = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');
var transform   = require('vinyl-transform');
var source      = require('vinyl-source-stream');
var streamify   = require('gulp-streamify');
var to5ify      = require('6to5ify');
var util        = require('gulp-util');

gulp.task('browserify', function() {
  var bundle;

  bundle = transform(function(filename) {
    util.log('bundling ' + filename);

    return browserify( filename, { debug: true, paths:['./client/src/js', './']})
        .transform( to5ify.configure({
          sourceMapRelative: __dirname,
          ignore: /(^|\/)lib\//
        }) )
      .bundle()
    ;
  });
  
  return gulp.src('./client/src/js/entry/*.js')
    .pipe( bundle )
    //.pipe(streamify(sourcemaps.init( {loadMaps: true} )))
    //.pipe(streamify(uglify()))
    //.pipe(streamify(sourcemaps.write()))
    .pipe( gulp.dest('./dist/js/') )
  ;
});