import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import tasks from './tasks';

const controllers = [welcome, users, sessions, tasks];

export default router => controllers.forEach(f => f(router));
