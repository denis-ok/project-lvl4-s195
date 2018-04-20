// import buildFormObj from '../lib/formObjectBuilder';
// import { User } from '../models/user';
// import _ from 'lodash';

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      ctx.render('users');
    })
    .get('newUser', '/users/new', async (ctx) => {
      ctx.render('users/new', { title: 'Registration' });
    });
};

// .get('users', '/users', async (ctx) => {
//   const users = await User.findAll(); // get all users from db model
//   ctx.render('users', { users });
// })
// .get('newUser', '/users/new', (ctx) => {
//   const user = User.build();  // create empty user model object instance for db (no save)
//   ctx.render('users/new', { f: buildFormObj(user) }); // pass object to
// })
// .post('users', '/users', async (ctx) => {
//   const form = ctx.request.body.form;
//   const user = User.build(form);
//   try {
//     await user.save();
//     ctx.flash.set('User has been created');
//     ctx.redirect(router.url('root'));
//   } catch (e) {
//     ctx.render('users/new', { f: buildFormObj(user, e) });
//   }
// });

// const errors = [{
//   message: 'First or Lastname length must use only Alphabet letters',
//   type: 'Validation error',
//   path: 'firstName',
//   value: '',
// },
// {
//   message: 'First or Lastname length must be from 2 to 16 letters',
//   type: 'Validation error',
//   path: 'firstName',
//   value: '',
// },
// {
//   message: 'First or Lastname length must use only Alphabet letters',
//   type: 'Validation error',
//   path: 'lastName',
//   value: '',
// },
// {
//   message: 'First or Lastname length must be from 2 to 16 letters',
//   type: 'Validation error',
//   path: 'lastName',
//   value: '',
// }];

// const formObj = {
//   name: 'form',
//   object: { firstName: 'denisuka' },
//   errors: _.groupBy(errors, 'path'),
// };

// console.log(_.groupBy(errors, 'path'));
