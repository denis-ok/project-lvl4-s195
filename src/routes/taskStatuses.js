import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { TaskStatus } from '../models';
import checkAuth from '../utils/middlewares';

const debugLog = debugLib('app:routes:taskStatuses.js');

export default (router) => {
  const checkAuthMw = checkAuth(router, 'You must be logged in to add or edit status');

  router
    .get('taskStatuses', '/taskstatuses', async (ctx) => {
      const statuses = await TaskStatus.findAll();
      const status = await TaskStatus.build({});
      ctx.render('taskStatuses', { statuses, formObj: buildFormObj(status), title: 'Task Statuses List' });
    })


    .post('taskStatuses', '/taskstatuses', checkAuthMw, async (ctx) => {
      const form = await ctx.request.body;
      const taskStatus = await TaskStatus.build(form);

      try {
        await taskStatus.save();

        ctx.flash.set(`New Task Status has been created: ${taskStatus.name}`);
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        const statuses = await TaskStatus.findAll();
        ctx.render('taskStatuses', { statuses, formObj: buildFormObj(taskStatus, e), title: 'Error when adding new Task Status' });
      }
    })


    .patch('patchTaskStatus', '/taskstatuses/:id', checkAuthMw, async (ctx) => {
      debugLog('PATCH Route..........');

      const form = await ctx.request.body;
      const { id } = ctx.params;

      const taskStatus = await TaskStatus.findOne({
        where: {
          id,
        },
      });

      debugLog('\nid:\n', id);
      debugLog('\ntask:\n', taskStatus);
      debugLog('\nform:\n', form);

      const oldName = taskStatus.name;
      const newName = form.name;

      try {
        await taskStatus.update(form);
        ctx.flash.set(`Status name has been changed from "${oldName}" to "${newName}"`);
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        debugLog('\nERROR:\n', e);

        const errorString = e.errors.map(err => `${err.type}: ${err.message}`).join(', ');
        ctx.flash.set(`Errors when updating status "${oldName}" to "${newName}": ${errorString}`);
        ctx.redirect(router.url('taskStatuses'));
      }
    })


    .delete('deleteTaskStatus', '/taskstatuses/:id', checkAuthMw, async (ctx) => {
      debugLog('DELETE Route..........');

      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findOne({
        where: {
          id,
        },
      });

      const tasksToChangeStatus = await taskStatus.getTasks();
      const emptyStatus = await TaskStatus.findById(1);
      await emptyStatus.setTasks(tasksToChangeStatus);

      try {
        await taskStatus.destroy();
        ctx.flash.set(`Status "${taskStatus.name}" has been deleted`);
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        const errorString = e.errors.map(err => `${err.type}: ${err.message}`).join(', ');
        ctx.flash.set(`Error when deleting status "${taskStatus.name}": ${errorString}`);
        ctx.redirect(router.url('taskStatuses'));
      }
    });
};

