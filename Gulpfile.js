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

/**
 * Setup Tasks
 */
gulp.task('_installDependencies', function() {
  return gulp.src('')
    .pipe(shell([
      'npm install'
    ]));
});

gulp.task('_downloadatomshell', function(cb){
  downloadAtomShell({
    version: atomShellVersion,
    outputDir: 'bin'
  }, cb);
});

/**
 * Build Tasks
 */
gulp.task('_cleanBuildDirectory', function(cb) {
  del(['build/**', 'dist/**'], cb);
});

gulp.task('_copyBuildFiles', ['_cleanBuildDirectory'], function() {
  return gulp.src('src/**')
    .pipe(gulp.dest('build'));
});

gulp.task('_cleanBuildFiles', ['_copyBuildFiles'], function(cb) {
  del([
    'build/assets/**',
    'build/html/js/.module-cache/**',
    'build/html/js/react/**'
  ], cb);
});

gulp.task('_compileJsx', ['_cleanBuildFiles'], function(cb) {
  var jsx;

  jsx = child_process.spawn('jsx', ['build/react', 'build/html/js/react']);
  jsx.on('exit', function() {
    cb();
  });
});

gulp.task('_prepareBuildFiles', ['_compileJsx'], function(cb) {
  del([
    'build/html/js/react/.module-cache/**',
    'build/react/**'
  ], cb);
});

gulp.task('_packageApplication', ['_prepareBuildFiles'], function() {
  return atomshell({
    srcPath: 'build',
    releasePath: 'dist',
    cachePath: 'tmp',
    version: 'v' + atomShellVersion,
    rebuild: false,
    platforms: ['win32-ia32', 'darwin-x64']
  });
});

gulp.task('_renamePackage', ['_packageApplication'], function(cb) {
  fs.rename('dist/v0.21.3/darwin-x64/Atom.app', 'dist/v0.21.3/darwin-x64/GoogleHero.app', cb);
});

gulp.task('_copyAssets', ['_renamePackage'], function() {
  return gulp.src('src/assets/osx/**')
    .pipe(gulp.dest('dist/v0.21.3/darwin-x64/GoogleHero.app/Contents/'));
});

/**
 * Development Tasks
 */
gulp.task('_jsxDevelopment', function() {
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

gulp.task('_startDevelopmentEnvironment', function() {
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

gulp.task('_watchFilesForChanges', function() {
    gulp.watch('src/core/**', ['start']);
});

gulp.task('build', ['_cleanBuildDirectory', '_copyBuildFiles', '_compileJsx',
  '_prepareBuildFiles', '_packageApplication', '_renamePackage', '_copyAssets']);
gulp.task('setup', ['_installDependencies', '_downloadatomshell']);
gulp.task('default', ['_jsxDevelopment', '_startDevelopmentEnvironment', '_watchFilesForChanges']);
