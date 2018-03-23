const gulp = require('gulp');
const sass = require('node-sass');
const inlineTemplates = require('gulp-inline-ng2-template');
const exec = require('child_process').exec;
const merge = require('merge-stream');

/**
 * Inline templates configuration.
 * @see  https://github.com/ludohenin/gulp-inline-ng2-template
 */
const INLINE_TEMPLATES = {
  SRC: './src/**/*.ts',
  DIST: './tmp/src-inlined',
  CONFIG: {
    base: '/src',
    target: 'es6',
    useRelativePaths: true,
    styleProcessor: compileSass
  }
};

/**
 * Inline external HTML and SCSS templates into Angular component files.
 * @see: https://github.com/ludohenin/gulp-inline-ng2-template
 */
gulp.task('inline-templates', () => {
  return gulp.src(INLINE_TEMPLATES.SRC)
    .pipe(inlineTemplates(INLINE_TEMPLATES.CONFIG))
    .pipe(gulp.dest(INLINE_TEMPLATES.DIST));
});

/**
 * Build ESM by running npm task.
 * This is a temporary solution until ngc is supported --watch mode.
 * @see: https://github.com/angular/angular/issues/12867
 */
gulp.task('build:esm', ['inline-templates', 'copy-cut-styles'], (callback) => {
  exec('npm run ngcompile', function (error, stdout, stderr) {
    console.log(stdout, stderr);
    callback(error)
  });
});

/**
 * Implements ESM build watch mode.
 * This is a temporary solution until ngc is supported --watch mode.
 * @see: https://github.com/angular/angular/issues/12867
 */
gulp.task('build:esm:watch', ['build:esm'], () => {
  gulp.watch('src/**/*', ['build:esm']);
});

gulp.task('copy-cut-styles', () => {
  return merge(
    gulp.src('components/**/*.scss', {base: 'src', cwd: 'src'})
  ).pipe(gulp.dest('dist/cut-styles'));
});

/**
 * Copy Case UI Toolkit styles.
 */
gulp.task('copy-cut-styles', () => {
  return merge(
    gulp.src('components/**/*.scss', {base: 'src', cwd: 'src'})
  ).pipe(gulp.dest('dist/cut-styles'));
});

/**
 * Compile SASS to CSS.
 * @see https://github.com/ludohenin/gulp-inline-ng2-template
 * @see https://github.com/sass/node-sass
 */
function compileSass(path, ext, file, callback) {
  let compiledCss = sass.renderSync({
    data: file,
    outputStyle: 'compressed',
  });
  callback(null, compiledCss.css);
}
