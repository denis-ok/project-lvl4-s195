export default (router) => {
  router.get('root', '/', (ctx) => {
    ctx.body = 'Welcome!';
  });
};
