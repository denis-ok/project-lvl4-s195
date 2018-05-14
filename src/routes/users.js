import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { User } from '../models';
import { checkAuth } from '../utils/middlewares';

const debugLog = debugLib('app:routes:users.js');

export default (router) => {
  const title = 'Registration';
  const checkAuthMw = checkAuth(router, 'You must be logged in to add task');

  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users, title: 'Users List' });
    })


    .get('newUser', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { formObj: buildFormObj(user), title });
    })


    .get('userProfile', '/users/profile/:id', async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        ctx.flash.set('User not exist!');
        ctx.redirect(router.url('root'));
        return;
      }
      ctx.render('users/profile', { user, title: user.getFullname() });
    })


    .get('editUser', '/users/edit', checkAuthMw, async (ctx) => {
      const { userId } = ctx.session;

      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      ctx.render('users/edit', { formObj: buildFormObj(user), title: 'Edit Profile' });
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


    .patch('users', '/users', checkAuthMw, async (ctx) => {
      const { userId } = ctx.session;

      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      const form = await ctx.request.body;

      try {
        await user.update(form);
        ctx.flash.set('Your profile has been updated');
        ctx.redirect(router.url('editUser'));
      } catch (e) {
        debugLog('error', e);
        ctx.render('users/edit', { formObj: buildFormObj(user, e), title });
      }
    });
};
