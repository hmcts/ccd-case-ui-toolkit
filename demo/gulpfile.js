const gulp = require('gulp');
const ncp = require('ncp').ncp;

const LIBRARY_SRC = '../dist';
const LIBRARY_DIST = 'node_modules/@hmcts/ccd-case-ui-toolkit/dist';

gulp.task('copy-lib', (callback) => {
  ncp( LIBRARY_SRC, LIBRARY_DIST, callback );
});

gulp.task('copy-lib:watch', () => {
  gulp.watch(LIBRARY_SRC, ['copy-lib']);
});
