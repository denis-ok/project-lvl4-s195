import 'babel-polyfill';

import gulp from 'gulp';
import repl from 'repl';
import container from './container';
import getServer from '.';


gulp.task('console', () => {
  const replServer = repl.start({
    prompt: 'Application console > ',
  });

  Object.keys(container).forEach((key) => {
    replServer.context[key] = container[key];
  });
});

gulp.task('server', (cb) => {
  getServer().listen(process.env.PORT || 5000, cb);
});
