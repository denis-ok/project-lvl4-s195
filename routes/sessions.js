export default (router) => {
  router.get('sessions', '/sessions', (ctx) => {
    ctx.body = 'Sessions page';
  });
};
