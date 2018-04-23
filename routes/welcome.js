export default (router) => {
  router.get('root', '/', (ctx) => {
    ctx.render('welcome/index', { title: 'welcome page' });
  });
};
