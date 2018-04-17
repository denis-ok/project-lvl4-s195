import welcome from './welcome';
import users from './users';
import sessions from './sessions';

const controllers = [welcome, users, sessions];

export default router => controllers.forEach(f => f(router));
