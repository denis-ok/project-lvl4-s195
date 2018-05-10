const checkAuth = (router, msg = 'You must be logged in') => async (ctx, next) => {
  if (ctx.state.isSignedIn()) {
    await next();
    return;
  }

  ctx.flash.set(msg);
  ctx.redirect(router.url('newSession'));
};

export default checkAuth;
