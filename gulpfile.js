'use strict';

var browserify = require('browserify'),
  del = require('del'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  livereload = require('gulp-livereload'),
  notify = require('gulp-notify'),
  source = require('vinyl-source-stream'),
  watchify = require('watchify');


var staticDir = './openfisca_web_ui/static';
var jsDir = staticDir + '/js';
var indexJsFile = jsDir + '/index.js';
var distDir = staticDir + '/dist';
var vendorJsFiles = [
  './node_modules/html5shiv/src/html5shiv.js',
  './node_modules/react/dist/react-with-addons.js',
  './node_modules/react/dist/react-with-addons.min.js',
  './node_modules/jquery/dist/jquery.js',
  './node_modules/lazy.js/lazy.js',
  './node_modules/respond/respond.src.js',
  './node_modules/es6ify/node_modules/traceur/bin/traceur-runtime.js',
];
var vendorDir = distDir + '/vendor',
  vendorBootstrapDir = vendorDir + '/bootstrap',
  vendorIntlDir = vendorDir + '/intl',
  vendorReactIntlDir = vendorDir + '/react-intl';


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


gulp.task('bundle:dev', function() {
  var bundler = browserify(indexJsFile);
  var stream = bundler.bundle({debug: true})
    .on('error', handleError)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(distDir));
  return stream;
});


gulp.task('bundle:prod', function() {
  var bundler = browserify(indexJsFile);
  bundler.plugin('minifyify', {
    map: '/dist/bundle.map.json',
    output: distDir + '/bundle.map.json',
  });
  var stream = bundler.bundle()
    .on('error', handleError)
    .pipe(source('bundle.min.js'))
    .pipe(gulp.dest(distDir));
  return stream;
});


gulp.task('clean:dist', function() {
  del.sync([distDir]);
});


gulp.task('default', ['dev']);


gulp.task('dev', ['clean:dist', 'bundle:dev', 'vendor']);


gulp.task('prod', ['clean:dist', 'bundle:prod', 'bundle:dev', 'vendor']);


gulp.task('vendor', ['vendor:bootstrap', 'vendor:intl', 'vendor:react-intl', 'vendor:js']);


gulp.task('vendor:bootstrap', function() {
  return gulp.src('./node_modules/bootstrap/dist/**')
    .pipe(gulp.dest(vendorBootstrapDir));
});


gulp.task('vendor:intl', function() {
  return gulp.src('./node_modules/intl/**')
    .pipe(gulp.dest(vendorIntlDir));
});


gulp.task('vendor:react-intl', function() {
  return gulp.src('./node_modules/react-intl/dist/**')
    .pipe(gulp.dest(vendorReactIntlDir));
});


gulp.task('vendor:js', function() {
  return gulp.src(vendorJsFiles)
    .pipe(gulp.dest(vendorDir));
});


gulp.task('watch', ['clean:dist', 'vendor'], function() {
  function rebundle() {
    return bundler.bundle({debug: true})
      .on('error', handleError)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(distDir));
  }

  var bundler = watchify(indexJsFile, {fullPaths: true});
  bundler.on('update', function() {
    gutil.log('Rebundle in progress...');
    rebundle().on('end', function() { gutil.log('Rebundle done.'); });
  });
  gutil.log('Initial bundle in progress...');
  var stream = rebundle().on('end', function() { gutil.log('Initial bundle done.'); });
  // startLiveReload();
  return stream;
});
