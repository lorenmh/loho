/* jshint node: true */
'use strict';

var gulp        = require('gulp');
var browserify  = require('browserify');
var sourcemaps  = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');
var source      = require('vinyl-source-stream');
var streamify   = require('gulp-streamify');
var to5ify      = require('6to5ify');

gulp.task('browserify', function() {
  var bundleStream = 
      browserify({ debug: true, paths:['./src/js', './']})
        .transform(to5ify.configure({
          sourceMapRelative: __dirname,
          ignore: /(^|\/)lib\//
        }))
        .require('./src/js/index.js', { entry: true })
        .bundle();

  bundleStream
    .pipe(source('app.js'))
    //.pipe(streamify(sourcemaps.init( {loadMaps: true} )))
    //.pipe(streamify(uglify()))
    //.pipe(streamify(sourcemaps.write()))
    .pipe(gulp.dest('./dist/js/'))
  ;
});