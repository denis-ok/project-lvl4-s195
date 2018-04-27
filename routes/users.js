import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { User } from '../models';

const debugLog = debugLib('app:routes:users.js');

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
    .get('userProfile', '/users/profile', (ctx) => {
      ctx.render('users/profile');
    })
    .get('editUser', '/users/edit', async (ctx) => {
      const { userId } = ctx.session;
      if (!userId) {
        ctx.flash.set('You must be logged in to edit profile');
        ctx.redirect(router.url('newSession'));
        return;
      }

      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      const formObj = buildFormObj(user);
      delete formObj.object.password;
      delete formObj.object.passwordEncrypted;

      ctx.render('users/edit', { formObj, title: 'Edit Profile' });
    })
    .post('users', '/users', async (ctx) => {
      const form = await ctx.request.body;
      const user = User.build(form);

      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('users/new', { formObj: buildFormObj(user, e), title });
      }
    })
    .patch('users', '/users', async (ctx) => {
      const { userId } = ctx.session;
      if (!userId) {
        ctx.flash.set('You must be logged in to edit profile');
        ctx.redirect(router.url('newSession'));
        return;
      }

      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      const form = await ctx.request.body;
      debugLog('\form:\n', form);

      try {
        await user.update(form);
        ctx.flash.set('Your profile has been updated');
        ctx.redirect(router.url('root'));
      } catch (e) {
        debugLog('error', e);
        ctx.render('users/edit', { formObj: buildFormObj(user, e), title });
      }
    });
};
