import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { Task } from '../models';

const debugLog = debugLib('app:routes:tasks.js');

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const tasks = await Task.findAll();
      ctx.render('tasks', { tasks, title: 'Task List' });
    })


    .get('newTask', '/tasks/new', async (ctx) => {
      const { userId } = ctx.session;
      if (!userId) {
        ctx.flash.set('You must be logged in to add task');
        ctx.redirect(router.url('newSession'));
        return;
      }

      const task = await Task.build();
      ctx.render('tasks/new', { formObj: buildFormObj(task), title: 'New Task' });
    })


    .post('tasks', '/tasks', async (ctx) => {
      const { userId } = ctx.session;
      if (!userId) {
        ctx.flash.set('You must be logged in to add task');
        ctx.redirect(router.url('newSession'));
        return;
      }

      const form = await ctx.request.body;
      form.creator = userId;

      const task = await Task.build(form);

      try {
        await task.save();
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('tasks/new', { formObj: buildFormObj(task, e), title: 'New Task' });
      }
    });
};

