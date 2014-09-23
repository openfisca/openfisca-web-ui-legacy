'use strict';

var browserify = require('browserify'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  livereload = require('gulp-livereload'),
  notify = require('gulp-notify'),
  rename = require('gulp-rename'),
  rimraf = require('gulp-rimraf'),
  source = require('vinyl-source-stream'),
  uglify = require('gulp-uglify'),
  watchify = require('watchify');


var staticDir = './openfisca_web_ui/static';
var jsDir = staticDir + '/js';
var indexJsFile = jsDir + '/index.js';
var distDir = staticDir + '/dist';
var vendorJsFiles = [
  './node_modules/jquery/dist/jquery.js',
  './node_modules/lazy.js/lazy.js',
  './node_modules/es6ify/node_modules/traceur/bin/traceur-runtime.js',
];
var vendorDir = distDir + '/vendor',
  vendorBootstrapDir = vendorDir + '/bootstrap';


function buildScripts(entryFile, options) {
  var debug = options && options.debug,
    watch = options && options.watch;
  var bundlerConstructor = options && watch ? watchify : browserify;
  var bundler = bundlerConstructor(entryFile);
  function rebundle() {
    var stream = bundler.bundle({debug: debug})
      .on('error', handleError)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(distDir));
    return stream;
  }
  bundler.on('update', function() {
    gutil.log('Rebundle...');
    rebundle()
      .on('end', function() { gutil.log('Rebundle done.'); });
  });
  return rebundle();
}


function handleError() {
  /* jshint validthis: true */
  var args = Array.prototype.slice.call(arguments);
  gutil.log(args);
  var errorData = {
    message: '<%= error.message %>',
    title: 'Compile Error',
  };
  var filePath;
  if (args[0] && args[0].fileName) {
    // React JSX source files.
    filePath = args[0].fileName;
  } else {
    // Vanilla JS source files.
    var filePathRegex = /Error: Parsing file (.+): Line \d+/;
    var match = filePathRegex.exec(args[0]);
    if (match) {
      filePath = match[1];
    }
  }
  if (filePath) {
    gutil.log(errorData);
    errorData.message += ' <a href="file://<%= options.filePath %>">open</a>';
    gutil.log(errorData);
    errorData.templateOptions = {filePath: filePath};
  }
  notify.onError(errorData).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}


function startLiveReload() {
  var port = 35731;
  var liveReloadServer = livereload(port);
  var reloadPage = function(event) {
    gutil.log('Reload browser page.');
    liveReloadServer.changed(event.path);
  };
  return gulp.watch([distDir + '/**/*'], reloadPage);
}


gulp.task('bundle', function() {
  return buildScripts(indexJsFile);
});


gulp.task('bundle-dev', function() {
  return buildScripts(indexJsFile, {debug: true});
});


gulp.task('clean', function() {
  return gulp.src(distDir, {read: false})
    .pipe(rimraf());
});


gulp.task('default', ['dev']);


gulp.task('dev', ['bundle-dev', 'vendor']);


gulp.task('prod', ['bundle', 'uglify', 'vendor']);


gulp.task('uglify', ['bundle'], function() {
  gulp.src(distDir + '/bundle.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(distDir));
});


gulp.task('vendor', ['vendor-bootstrap', 'vendor-js']);


gulp.task('vendor-bootstrap', function() {
  return gulp.src('./node_modules/bootstrap/dist/**')
    .pipe(gulp.dest(vendorBootstrapDir));
});


gulp.task('vendor-js', function() {
  return gulp.src(vendorJsFiles)
    .pipe(gulp.dest(vendorDir));
});


gulp.task('watch', ['vendor'], function() {
  startLiveReload();
  buildScripts(indexJsFile, {debug: true, watch: true});
});
