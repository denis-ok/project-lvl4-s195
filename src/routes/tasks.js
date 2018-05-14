import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import setTagsToTask from '../utils/setTagsToTask';
import { Task, TaskStatus, Tag } from '../models';
import { checkAuth, isExistTask, includeStatuses, includeUsers } from '../utils/middlewares';
import buildOptionsForFindAll from '../utils/findAllOptionsBuilder';
import getNormalizedTagsArr from '../utils/getNormalizedTagsArr';
import prepareTaskForView from '../utils/prepareTaskForView';

const debugLog = debugLib('app:routes:tasks.js');

const prepareTasksForView = coll => Promise.all(coll.map(t => prepareTaskForView(t)));


export default (router) => {
  const checkAuthMw = checkAuth(router, 'You must be logged in to add task');
  const isExistTaskMw = isExistTask(router, Task);

  router
    .get('tasks', '/tasks', checkAuthMw, includeStatuses, includeUsers, async (ctx) => {
      if (Object.keys(ctx.query).length === 0) {
        const allTasks = await Task.findAll();
        const preparedTasks = await prepareTasksForView(allTasks);
        ctx.render('tasks', { tasks: preparedTasks, title: 'Task List' });
        return;
      }

      debugLog('ctx.query:', ctx.query);

      const queryObject = ctx.query;
      const { userId } = await ctx.session;

      const options = buildOptionsForFindAll(queryObject, userId);

      const filteredTasks = await Task.findAll(options);
      const preparedTasks = await prepareTasksForView(filteredTasks);

      const selectedStatus = queryObject.status;
      const selectedWorker = queryObject.worker;
      const checkboxCond = queryObject.createdByMe;

      ctx.render('tasks', {
        selectedStatus, selectedWorker, checkboxCond, tasks: preparedTasks, title: 'Task List',
      });
    })


    .get('newTask', '/tasks/new', checkAuthMw, includeUsers, async (ctx) => {
      const task = await Task.build();
      ctx.render('tasks/new', { formObj: buildFormObj(task), title: 'New Task' });
    })


    .get('viewTask', '/tasks/:id', checkAuthMw, isExistTaskMw, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findById(id);
      ctx.render('tasks/view', { task: await prepareTaskForView(task), title: `Task: ${task.name}` });
    })


    .get('editTask', '/tasks/:id/edit', checkAuthMw, isExistTaskMw, includeStatuses, includeUsers, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findById(id);
      const tagsColl = await task.getTags();
      const tagsArr = tagsColl.map(t => t.name);
      const tagsString = tagsArr.join(', ');

      ctx.render('tasks/edit', { tags: tagsString, formObj: buildFormObj(task), title: 'Edit Task' });
    })


    .post('tasks', '/tasks', checkAuthMw, includeStatuses, includeUsers, async (ctx) => {
      debugLog('POST Route..........');
      const { userId } = await ctx.session;
      const form = await ctx.request.body;

      const tagNameArr = getNormalizedTagsArr(form.tags);

      const task = await Task.build(form);

      const workerId = form.worker.split(' ')[0];

      try {
        await task.save();
        await setTagsToTask(Tag, tagNameArr, task);
        task.setCreator(userId);
        task.setWorker(workerId);

        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('tasks/new', { formObj: buildFormObj(task, e), title: 'Edit Task (errors)' });
      }
    })


    .patch('patchTask', '/tasks/:id', checkAuthMw, isExistTaskMw, includeStatuses, includeUsers, async (ctx) => {
      debugLog('PATCH Route..........');
      const { id } = ctx.params;
      const form = await ctx.request.body;

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

      const workerId = form.worker.split(' ')[0];
      const tagNameArr = getNormalizedTagsArr(form.tags);

      try {
        await task.update(form);
        await setTagsToTask(Tag, tagNameArr, task);
        task.setTaskStatus(taskStatus);
        task.setWorker(workerId);

        ctx.flash.set('Task has been updated');
        ctx.redirect(router.url('viewTask', { id }));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('tasks/edit', { formObj: buildFormObj(task, e), title: 'Edit Task (errors)' });
      }
    });
};

