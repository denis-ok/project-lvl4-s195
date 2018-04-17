import Koa from 'koa';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import debugLib from 'debug';
import addRoutes from './routes';


const logInfo = debugLib('app:info');

const app = new Koa();

app.use(koaLogger());

const router = new Router();
addRoutes(router);
app.use(router.allowedMethods());
app.use(router.routes());

app.listen(3000);
logInfo('Listening on port 3000...');
