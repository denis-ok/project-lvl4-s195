import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { User } from '../models';

const log = debugLib('app:routes:users.js');

export default (router) => {
  const title = 'Registration';

  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users, title: 'Users List' });
    })
    .get('newUser', '/users/new', (ctx) => {
      const user = User.build();
      const formObj = buildFormObj(user);
      ctx.render('users/new', { formObj, title });
    })
    .post('users', '/users', async (ctx) => {
      const form = await ctx.request.body;
      const user = User.build(form);
      log('Creating User, input in form:\n', form);

      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        console.log('error', e);
        ctx.render('users/new', { formObj: buildFormObj(user, e), title });
      }
    });
};

