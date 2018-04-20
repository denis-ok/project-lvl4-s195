import Koa from 'koa';
import serve from 'koa-static';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import flash from 'koa-flash-simple';
import session from 'koa-generic-session';
import path from 'path';
import addRoutes from './routes';


export default () => {
  const app = new Koa();

  app.use(koaLogger());
  app.use(bodyParser());

  app.use(session(app));
  app.use(flash());

  app.use(serve(path.join(__dirname, 'public')));

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
      { urlFor: (...args) => router.url(...args) }, // build string of path parts. route must exist
    ],
  });
  // pug.locals = { title: 'test', name: 'denis' };
  // global object of locals to pass to views (merge with ctx.state)

  pug.use(app);
  return app;
};

