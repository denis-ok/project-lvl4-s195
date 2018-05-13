import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import setTagsToTask from '../utils/setTagsToTask';
import { Task, TaskStatus, Tag, User } from '../models';
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

const getTagNames = coll => Promise.all(coll.map(t => t.name));

const prepareTaskForView = async (task) => {
  const obj = task.dataValues;
  const status = await task.getTaskStatus();
  const creator = await task.getCreator();
  const worker = await task.getWorker();
  const tagsColl = await task.getTags();
  const tagsArr = await getTagNames(tagsColl);
  const tagsString = tagsArr.join(', ');

  obj.status = status ? status.name : '';
  obj.creator = creator ? creator.getFullname() : '';
  obj.worker = worker ? worker.getFullname() : '';
  obj.tagsString = tagsString || '';

  return obj;
};

const prepareTasksForView = coll => Promise.all(coll.map(t => prepareTaskForView(t)));

const normalizeTags = tagsStr => tagsStr.split(/\W/).filter(el => el !== '').map(tag => tag.toLowerCase());


export default (router) => {
  const checkAuthMw = checkAuth(router, 'You must be logged in to add task');
  const isExistTaskMw = isExistTask(router);

  router
    .get('tasks', '/tasks', checkAuthMw, async (ctx) => {
      const allTasks = await Task.findAll();
      const preparedTasks = await prepareTasksForView(allTasks);
      ctx.render('tasks', { tasks: preparedTasks, title: 'Task List' });
    })


    .get('newTask', '/tasks/new', checkAuthMw, async (ctx) => {
      const task = await Task.build();
      const users = await User.findAll();
      ctx.render('tasks/new', { users, formObj: buildFormObj(task), title: 'New Task' });
    })


    .get('viewTask', '/tasks/:id', checkAuthMw, isExistTaskMw, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findById(id);
      ctx.render('tasks/view', { task: await prepareTaskForView(task), title: `Task: ${task.name}` });
    })


    .get('editTask', '/tasks/:id/edit', checkAuthMw, isExistTaskMw, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findById(id);
      const tagsColl = await task.getTags();
      const tagsArr = await getTagNames(tagsColl);
      const tagsString = tagsArr.join(', ');

      const users = await User.findAll();
      const statuses = await TaskStatus.findAll();

      ctx.render('tasks/edit', {
        tags: tagsString, users, statuses, formObj: buildFormObj(task), title: 'Edit Task',
      });
    })


    .post('tasks', '/tasks', checkAuthMw, async (ctx) => {
      debugLog('POST Route..........');
      const { userId } = await ctx.session;
      const form = await ctx.request.body;

      const tagNameArr = normalizeTags(form.tags);

      const task = await Task.build(form);

      const workerId = form.worker.split(' ')[0];

      const statuses = await TaskStatus.findAll();
      const users = await User.findAll();

      try {
        await task.save();
        await setTagsToTask(Tag, tagNameArr, task);
        task.setCreator(userId);
        task.setWorker(workerId);

        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('tasks/new', {
          statuses, users, formObj: buildFormObj(task, e), title: 'Edit Task (errors)',
        });
      }
    })


    .patch('patchTask', '/tasks/:id', checkAuthMw, isExistTaskMw, async (ctx) => {
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
      const tagNameArr = normalizeTags(form.tags);
      const statuses = await TaskStatus.findAll();
      const users = await User.findAll();


      try {
        await task.update(form);
        await setTagsToTask(Tag, tagNameArr, task);
        task.setTaskStatus(taskStatus);
        task.setWorker(workerId);

        ctx.flash.set('Task has been updated');
        ctx.redirect(router.url('viewTask', { id }));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('tasks/edit', {
          users, statuses, formObj: buildFormObj(task, e), title: 'Edit Task (errors)',
        });
      }
    });
};

