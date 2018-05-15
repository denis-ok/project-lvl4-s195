import { User, TaskStatus } from '../models';

const checkAuth = (router, msg = 'You must be logged in') => async (ctx, next) => {
  if (ctx.state.isSignedIn()) {
    await next();
    return;
  }

  ctx.flash.set(msg);
  ctx.redirect(router.url('newSession'));
};


const checkRightsEditUserMw = router => async (ctx, next) => {
  const { userId } = ctx.session;
  const { id } = ctx.params;

  if (Number(userId) === Number(id)) {
    await next();
    return;
  }

  ctx.flash.set('Sorry, you can edit only your own profile');
  ctx.redirect(router.url('root'));
};


const isExistTask = (router, Task) => async (ctx, next) => {
  const { id } = ctx.params;
  const task = await Task.findById(id);

  if (task) {
    await next();
    return;
  }

  ctx.flash.set('Sorry, task not exist');
  ctx.redirect(router.url('tasks'));
};


const includeUsersMw = userModel => async (ctx, next) => {
  const users = await userModel.findAll();
  ctx.state.users = users;
  await next();
};

const includeUsers = includeUsersMw(User);


const includeStatusesMw = taskStatusModel => async (ctx, next) => {
  const statuses = await taskStatusModel.findAll();
  ctx.state.statuses = statuses;
  await next();
};

const includeStatuses = includeStatusesMw(TaskStatus);


export { checkAuth, checkRightsEditUserMw, isExistTask, includeStatuses, includeUsers };
