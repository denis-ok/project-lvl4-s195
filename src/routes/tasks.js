import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
// import { User } from '../models';

// const debugLog = debugLib('app:routes:users.js');

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      // const tasks = await Task.findAll();
      ctx.render('tasks', { title: 'Task List' });
    });
};

