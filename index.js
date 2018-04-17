import Koa from 'koa';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import addRoutes from './routes';

export default () => {
  const app = new Koa();
  app.use(koaLogger());

  const router = new Router();
  addRoutes(router);
  app.use(router.allowedMethods());
  app.use(router.routes());

  return app;
};

