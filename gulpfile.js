// Core node modules.
var path = require('path');
var fs = require('fs');

// Third party node modules.
var browserify = require('browserify');
var babelify = require('babelify');
var gulp = require('gulp');

// Vinyl modules.
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');

// Gulp modules.
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var minifyCSS = require('gulp-minify-css');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');

/**
 *
 */
gulp.task('browserify', function () {
  return browserify('./scripts/main.js', { debug: true })
    .transform(babelify)
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./template/assets/scripts/'));
});

/**
 * Runs your CSS through the JavaScript version of Less rather than the
 * Squarespace custom Less compiler.
 */
gulp.task('less', function () {
  var autoprefix = new LessPluginAutoPrefix({ browsers: ["last 3 versions"] });

  return gulp.src('./styles/*.less')
    .pipe(less({
      plugins: [ autoprefix ],
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./template/assets/styles'));
});

/**
 * The /assets/ folder caches files aggressively. This task targets each file
 * loaded up in the /assets/ folder and alters the URL to force a cache
 * invalidation on Squarespace's servers.
 */
gulp.task('invalidate-cached-assets', function () {
  var files = [
    './template/*.region',
    './template/collections/*.list',
    './template/collections/*.item',
    './template/blocks/*.block',
    './template/pages/*.page'
  ];

  // Loops through selected files looking for things that are stored in /assets/
  // and busts the cache on these resources by adding a search parameter.
  return gulp.src(files)
    .pipe(replace(/\<link.*?href="assets\/([^\'\"]+)/g, function(match) {
      if ((/.*?href="http/i).test(match)) {
        return match;
      }

      if ((/\?v=[1-9].*/).test(match)) {
        return match.replace(/\?v=[1-9].*/, '?v=' + Date.now());
      }

      return match + '?v=' + Date.now();
    }))
    .pipe(replace(/\<.*?src="assets\/([^\'\"]+)/g, function(match) {
      if ((/.*?src="http"/i).test(match)) {
        return match;
      }

      if ((/\?v=[1-9].*/).test(match)) {
        return match.replace(/\?v=[1-9].*/, '?v=' + Date.now());
      }

      return match + '?v=' + Date.now();
    }))
    .pipe(gulp.dest('./'));
});