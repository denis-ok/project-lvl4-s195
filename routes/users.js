export default (router) => {
  router.get('users', '/users', (ctx) => {
    ctx.body = 'Users page';
  });
};
