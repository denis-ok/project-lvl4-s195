import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { encrypt } from '../utils/secure';
import { User } from '../models';

const debugLog = debugLib('app:routes:sessions.js');


export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { formObj: buildFormObj(data), title: 'Login Page' });
    })
    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body;
      const user = await User.findOne({
        where: {
          email,
        },
      });

      debugLog(user ? `User with email: '${email}' found in DB` : `User with email: ${email} NOT exist in DB`);

      if (user && user.passwordEncrypted === encrypt(password)) {
        ctx.session.userId = user.id;
        debugLog('Correct password, redirecting to root');
        debugLog('ctx.session:', ctx.session);

        ctx.flash.set(`Welcome, ${user.getFullname()}`);
        ctx.redirect(router.url('root'));
        return;
      }

      ctx.flash.set('email or password were wrong');
      ctx.redirect(router.url('newSession'));
      // ctx.render('sessions/new', { formObj: buildFormObj({}), title: 'Login Page' });
    })
    .get('sessionDelete', '/session/delete', async (ctx) => {
      ctx.session = {};
      ctx.flash.set('Session Deleted');
      ctx.redirect(router.url('root'));
    });
};


// .delete('session', '/session', (ctx) => {
//   log('Deleting Session');
//   ctx.session = {};
//   ctx.redirect(router.url('root'));
// })
// .get('sessionAdd', '/session/add', async (ctx) => {
//   let n = ctx.session.views || 0;
//   n += 1;
//   ctx.session.views = n;
//   ctx.body = `${n} views`;
// })
// .get('flash', '/session/flash', async (ctx) => {
//   ctx.flash.set('This is flash message from /flash');
//   ctx.body = 'flash added';
// })
