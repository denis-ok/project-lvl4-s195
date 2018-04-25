import Koa from 'koa';
import serve from 'koa-static';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import flash from 'koa-flash-simple';
import session from 'koa-session';
import debugLib from 'debug';
// import methodOverride from 'koa-override';
// import Rollbar from 'rollbar';
import path from 'path';
import dotenv from 'dotenv';
import addRoutes from './routes';

dotenv.config();

export default () => {
  const log = debugLib('app:index.js');
  log('Starting app...');

  const app = new Koa();
  app.keys = ['some secret hurr'];

  app.use(koaLogger());

  // const rollbar = new Rollbar('31d585b41bd147c3b1d3300644e7bdba');

  // app.use(async (ctx, next) => {
  //   ctx.rollbar = rollbar;
  //   ctx.rollbar.info(`Request to: ${ctx.path}`, { headers: ctx.headers });
  //   await next();
  // });

  app.use(session(app));
  app.use(flash());

  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
    };
    await next();
  });

  app.use(bodyParser());

  // app.use(methodOverride({ allowedMethods: ['DELETE', 'POST'] }));

  app.use(serve(path.join(__dirname, 'public')));


  const router = new Router();
  addRoutes(router);
  app.use(router.allowedMethods());
  app.use(router.routes());

  // app.use(async (ctx, next) => {
  //   log('ctx.body:', ctx.body);
  //   log('ctx.request.body:', ctx.request.body);
  //   log('ctx.method:', ctx.method);
  //   log('ctx.headers:', ctx.headers);
  //   log('ctx.request.method:', ctx.request.method);
  //   await next();
  // });

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
  // pug.locals = { title: 'page title' };
  // global object of locals to pass to views (merge with ctx.state)

  pug.use(app);

  app.on('error', (err) => {
    console.error(err);
    log('Error event:', err);
    // rollbar.error(`Error obj: ${err}`);
  });

  // log('process.env', process.env);

  return app;
};

