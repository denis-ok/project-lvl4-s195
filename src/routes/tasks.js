import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { Task, TaskStatus } from '../models';

const debugLog = debugLib('app:routes:tasks.js');

const checkAuth = (router, msg = 'You must be logged in') => async (ctx, next) => {
  if (ctx.state.isSignedIn()) {
    await next();
    return;
  }

  ctx.flash.set(msg);
  ctx.redirect(router.url('newSession'));
};

const isExistTask = router => async (ctx, next) => {
  const { id } = ctx.params;
  const task = await Task.findById(id);

  if (task) {
    await next();
    return;
  }

  ctx.flash.set('Sorry, task not exist');
  ctx.redirect(router.url('tasks'));
};


export default (router) => {
  const checkAuthMw = checkAuth(router, 'You must be logged in to add task');
  const isExistTaskMw = isExistTask(router);

  router
    .get('tasks', '/tasks', async (ctx) => {
      const tasks = await Task.findAll();
      ctx.render('tasks', { tasks, title: 'Task List' });
    })


    .get('newTask', '/tasks/new', checkAuthMw, async (ctx) => {
      const task = await Task.build();
      ctx.render('tasks/new', { formObj: buildFormObj(task), title: 'New Task' });
    })


    .get('editTask', '/tasks/:id/edit', checkAuthMw, isExistTaskMw, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findById(id);

      const statusList = await TaskStatus.findAll();
      ctx.render('tasks/edit', { statusList, formObj: buildFormObj(task), title: 'Edit Task' });
    })


    .post('tasks', '/tasks', checkAuthMw, async (ctx) => {
      debugLog('\nctx.request.body:\n', ctx.request.body);
      debugLog('\nctx.session:\n', ctx.session);

      const { userId } = ctx.session;
      const form = await ctx.request.body;
      form.creator = userId;
      form.status = 'New';

      const task = await Task.build(form);
      const statusList = await TaskStatus.findAll();

      try {
        await task.save();
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('tasks/new', { statusList, formObj: buildFormObj(task, e), title: 'Edit Task (errors)' });
      }
    })


    .patch('patchTask', '/tasks/:id', checkAuthMw, async (ctx) => {
      const form = await ctx.request.body;

      const { id } = ctx.params;
      const task = await Task.findOne({
        where: {
          id,
        },
      });

      debugLog('PATCH Route..........');
      debugLog('\nid:\n', id);
      debugLog('\ntask:\n', task);
      debugLog('\form:\n', form);

      const statusList = await TaskStatus.findAll();

      try {
        await task.update(form);
        ctx.flash.set('Task has been updated');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('tasks/edit', { statusList, formObj: buildFormObj(task, e), title: 'Edit Task (errors)' });
      }
    });
};

