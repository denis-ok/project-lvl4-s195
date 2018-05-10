import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import setTagsToTask from '../utils/setTagsToTask';
import { Task, TaskStatus, Tag } from '../models';
import checkAuth from '../utils/middlewares';

const debugLog = debugLib('app:routes:tasks.js');

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

const attachStatusName = async (task) => {
  const status = await task.getTaskStatus();
  const newTask = task;
  newTask.status = status.name;
  return newTask;
};

const normalizeTags = tagsStr => tagsStr.split(/\W/).filter(el => el !== '').map(tag => tag.toLowerCase());


export default (router) => {
  const checkAuthMw = checkAuth(router, 'You must be logged in to add task');
  const isExistTaskMw = isExistTask(router);

  router
    .get('tasks', '/tasks', checkAuthMw, async (ctx) => {
      const allTasks = await Task.findAll();
      const tasks = await Promise.all(allTasks.map(t => attachStatusName(t, t.TaskStatusId)));
      ctx.render('tasks', { tasks, title: 'Task List' });
    })


    .get('newTask', '/tasks/new', checkAuthMw, async (ctx) => {
      const task = await Task.build();
      ctx.render('tasks/new', { formObj: buildFormObj(task), title: 'New Task' });
    })


    .get('viewTask', '/tasks/:id', checkAuthMw, isExistTaskMw, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findById(id);
      const tags = await task.getTags();
      ctx.render('tasks/view', { task: await attachStatusName(task), tags, title: `Task: ${task.name}` });
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

      const { userId } = await ctx.session;
      const form = await ctx.request.body;
      const tagNameArr = normalizeTags(form.tags);

      form.creator = userId;

      const task = await Task.build(form);
      const statusList = await TaskStatus.findAll();

      try {
        await task.save();
        await setTagsToTask(Tag, tagNameArr, task);
        await task.update({ tags: tagNameArr.join(', ') });

        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('tasks/new', { statusList, formObj: buildFormObj(task, e), title: 'Edit Task (errors)' });
      }
    })


    .patch('patchTask', '/tasks/:id', checkAuthMw, async (ctx) => {
      debugLog('PATCH Route..........');
      const form = await ctx.request.body;

      const { id } = ctx.params;
      const task = await Task.findOne({
        where: {
          id,
        },
      });

      const statusName = form.status;

      const taskStatus = await TaskStatus.findOne({
        where: {
          name: statusName,
        },
      });

      task.setTaskStatus(taskStatus);

      const tagNameArr = normalizeTags(form.tags);

      debugLog('\nid:\n', id);
      debugLog('\ntask:\n', task);
      debugLog('\nform:\n', form);

      const statusList = await TaskStatus.findAll();

      try {
        await task.update(form);
        await setTagsToTask(Tag, tagNameArr, task);
        await task.update({ tags: tagNameArr.join(', ') });

        ctx.flash.set('Task has been updated');
        ctx.redirect(router.url('viewTask', { id }));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('tasks/edit', { statusList, formObj: buildFormObj(task, e), title: 'Edit Task (errors)' });
      }
    });
};

