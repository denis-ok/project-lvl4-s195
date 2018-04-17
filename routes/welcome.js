export default (router) => {
  router.get('root', '/', (ctx) => {
    // ctx.state.title = 'welcome';
    ctx.render('welcome/index', { title: 'welcome page' });
  });
};
