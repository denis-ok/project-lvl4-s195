// import buildFormObj from '../lib/formObjectBuilder';
// import { encrypt } from '../lib/secure';
// import { User } from '../models';

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      // const data = {};
      // ctx.render('sessions/new', { formObj: buildFormObj(data) });
      ctx.render('sessions/new', { title: 'Login Page' });
    })
    .get('flash', '/session/flash', async (ctx) => {
      ctx.flash.set('This is flash message from /flash');
      ctx.body = 'flash added';
    })
    .get('sessionAdd', '/session/add', async (ctx) => {
      let n = ctx.session.views || 0;
      n += 1;
      ctx.session.views = n;
      ctx.body = `${n} views`;
    })
    .get('sessionDelete', '/session/delete', async (ctx) => {
      ctx.session = {};
      ctx.flash.set('Session deleted');
      ctx.body = 'Cleaned';
    });

  // .post('session', '/session', async (ctx) => {
  //   const { email, password } = ctx.request.body.form;
  //   const user = await User.findOne({
  //     where: {
  //       email,
  //     },
  //   });
  //   if (user && user.passwordDigest === encrypt(password)) {
  //     ctx.session.userId = user.id;
  //     ctx.redirect(router.url('root'));
  //     return;
  //   }

  //   ctx.flash.set('email or password were wrong');
  //   ctx.render('sessions/new', { f: buildFormObj({ email }) });
  // })
  // .delete('session', '/session', (ctx) => {
  //   ctx.session = {};
  //   ctx.redirect(router.url('root'));
  // });
};

