import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import tasks from './tasks';
import taskStatuses from './taskStatuses';

const controllers = [welcome, users, sessions, tasks, taskStatuses];

export default router => controllers.forEach(f => f(router));
