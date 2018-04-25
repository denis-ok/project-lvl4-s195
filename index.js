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
import Rollbar from 'rollbar';
import path from 'path';
import dotenv from 'dotenv';
import addRoutes from './routes';


export default () => {
  dotenv.config();
  const env = process.env.NODE_ENV || 'development';

  const debugLog = debugLib('app:index.js');
  debugLog('Starting app, environment:', env);

  const app = new Koa();
  app.keys = ['some secret hurr'];

  app.use(koaLogger());

  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ID,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      debugLog(err, ctx.request);
      rollbar.error(err, ctx.request);
      console.error(err, ctx.request);
    }
  });

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
  pug.use(app);

  return app;
};

// app.use(methodOverride({ allowedMethods: ['DELETE', 'POST'] }));

// pug.locals = { title: 'page title' };
// its global object of locals to pass to views (merge with ctx.state)
