import debugLib from 'debug';

const debugLog = debugLib('app:routes:welcome.js');

export default (router) => {
  router.get('root', '/', (ctx) => {
    debugLog('ctx.session:', ctx.session);
    debugLog('ctx.headers:', ctx.headers);
    ctx.render('welcome/index', { title: 'welcome page' });
  });
};
