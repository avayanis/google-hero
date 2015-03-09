var Promise = require('bluebird');

var atomshell = require('gulp-atom');
var child_process = require('child_process');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var downloadAtomShell = require('gulp-download-atom-shell');
var shell = require('gulp-shell');
var pid;

var atomShellVersion = '0.21.3';

gulp.task('setup:installDependencies', function() {
  return gulp.src('')
    .pipe(shell([
      'npm install'
    ]));
});

gulp.task('setup:downloadatomshell', function(cb){
  downloadAtomShell({
    version: atomShellVersion,
    outputDir: 'bin'
  }, cb);
});

gulp.task('setup', ['setup:installDependencies', 'setup:downloadatomshell']);

gulp.task('build:copyBuildFiles', function() {
  return gulp.src('src/**')
    .pipe(gulp.dest('build'))
});

gulp.task('build:buildApplicationPackage', ['build:copyBuildFiles'], function(cb) {
  new Promise(function(resolve, reject) {
    // Remove development files
    gutil.log('Removing development files.');
    del([
      'build/assets/**',
      'build/html/js/.module-cache/**',
      'build/html/js/react/**'
    ], resolve);
  })
  .then(function() {
    // Compile react files
    gutil.log('Compiling JSX files.');
    var promise;
    var callback;
    var jsx;

    promise = new Promise(function(resolve) {
      callback = resolve;
    });

    jsx = child_process.spawn('jsx', ['build/react', 'build/html/js/react']);
    jsx.on('exit', function() {
      callback();
    });

    return promise;
  })
  .then(function() {
    // Delete remaining unnecessary temporary files
    gutil.log('Delete temporary files.');
    return new Promise(function(resolve, reject) {
      del([
        'build/html/js/react/.module-cache/**',
        'build/react/**'
      ], resolve);
    });
  })
  .then(function() {
    return new Promise(function(resolve) {
      // Create application package
      gutil.log('Building application package.');
      var stream = atomshell({
        srcPath: 'build',
        releasePath: 'dist',
        cachePath: 'tmp',
        version: 'v' + atomShellVersion,
        rebuild: false,
        platforms: ['darwin-x64']
      });
console.log(stream);
      stream.on('end', function() {
        console.log('here', typeof stream);
        resolve();
      });
    });
  })
  .then(function() {
    gutil.log('Rename application package.');
    fs.renameSync('dist/v0.21.3/darwin-x64/Atom.app', 'dist/v0.21.3/darwin-x64/GoogleHero.app');
    return;
  })
  .then(function() {
    cb();
  });
});

gulp.task('build', ['build:buildApplicationPackage'], function() {
  return gulp.src('src/assets/osx/**')
    .pipe(gulp.dest('dist/v0.21.3/darwin-x64/GoogleHero.app/Contents/'))
});

gulp.task('react', function() {
  var rPid;

  gutil.log('React[out]', 'Watching react files for changes.');
  rPid = child_process.spawn('jsx', ['--watch', 'src/react', 'src/html/js/react']);

  rPid.stdout.on('data', function(data) {
    gutil.log('React[out]', data.toString());
  });

  rPid.stderr.on('data', function(data) {
    gutil.log('React[err]', data.toString());
  });
});

gulp.task('start', function() {
  var atomPath;

  if (process.platform === 'darwin') {
    atomPath = 'Atom.app/Contents/MacOS/Atom';
  }

  if (pid) {
    gutil.log('Atom[out]', 'Shutdown down Atom process.');
    pid.kill('SIGHUP');
  }

  gutil.log('Atom[out]', 'Starting up Atom.');
  pid = child_process.spawn('bin/' + atomPath, ['src/core']);

  pid.stdout.on('data', function(data) {
    gutil.log('Atom[out]', data.toString());
  });

  pid.stderr.on('data', function(data) {
    gutil.log('Atom[err]', data.toString());
  });
});

gulp.task('watch', function() {
    gulp.watch('src/core/**', ['start']);
});

gulp.task('default', ['react', 'start', 'watch']);
