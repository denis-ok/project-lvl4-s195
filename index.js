import Koa from 'koa';
import koaLogger from 'koa-logger';
import debugLib from 'debug';

const logInfo = debugLib('app:info');

const app = new Koa();

app.use(koaLogger());


app.use(async (ctx) => {
  ctx.body = 'Hello World!';
});


app.listen(3000);
logInfo('Listening on port 3000...');

