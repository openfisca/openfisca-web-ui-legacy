'use strict';

var browserify = require('browserify'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  livereload = require('gulp-livereload'),
  notify = require('gulp-notify'),
  reactify = require('reactify'),
  source = require('vinyl-source-stream'),
  watchify = require('watchify');


/** Config variables */
var liveReloadPort = 35731;


/** File paths */
var staticDir = './openfisca_web_ui/static';
var jsDir = staticDir + '/js';
var indexJsFile = jsDir + '/index.js';
var distDir = staticDir + '/dist';
var vendorFiles = [
  './node_modules/react/dist/react-with-addons.js',
];
var vendorBuildDir = distDir + '/vendor';


function buildScripts(entryFile, options) {
  var bundlerConstructor = options && options.watch ? watchify : browserify;
  var bundler = bundlerConstructor(entryFile);
  bundler.transform(reactify, {es6: true});
  function rebundle() {
    var stream = bundler.bundle({debug: true});
    return stream
      .on('error', handleError)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(distDir));
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
  var filePathRegex = /Error: Parsing file (.+): Line \d+/;
  var match = filePathRegex.exec(args[0]);
  var filePath = match[1];
  notify.onError({
    message: '<%= error.message %> <a href="file://<%= options.filePath %>">open</a>',
    templateOptions: {filePath: filePath},
    title: 'Compile Error',
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}


gulp.task('bundle', function() {
  return buildScripts(indexJsFile);
});


gulp.task('default', ['dev']);


gulp.task('dev', ['watch', 'livereload']);


gulp.task('livereload', function() {
  var liveReloadServer = livereload(liveReloadPort);
  var reloadPage = function(event) { liveReloadServer.changed(event.path); };
  gulp.watch([distDir + '/**/*'], reloadPage);
});


gulp.task('prod', ['bundle', 'vendor']);


gulp.task('vendor', function() {
  return gulp.src(vendorFiles).pipe(gulp.dest(vendorBuildDir));
});


gulp.task('watch', function() {
  return buildScripts(indexJsFile, {watch: true});
});
