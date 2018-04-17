import Koa from 'koa';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import path from 'path';
import addRoutes from './routes';

export default () => {
  const app = new Koa();
  app.use(koaLogger());

  const router = new Router();
  addRoutes(router);
  app.use(router.allowedMethods());
  app.use(router.routes());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    debug: true,
    pretty: false, // deprecated, not recommended in pug docs
    compileDebug: true,
    locals: {},
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { urlFor: (...args) => router.url(...args) }, // build string of path parts
    ],
  });
  // pug.locals = { title: 'test', name: 'denis' };
  // global object of locals to pass to views (merge with ctx.state)

  pug.use(app);

  return app;
};

