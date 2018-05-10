import dotenv from 'dotenv';
import { User, Task, TaskStatus, TaskTag, Tag } from './models';

const f = async () => {
  dotenv.config();

  Task.belongsToMany(Tag, { through: 'TaskTag' });
  Tag.belongsToMany(Task, { through: 'TaskTag' });

  TaskStatus.hasMany(Task, { foreignKey: 'TaskStatusId', as: 'Tasks' });
  Task.belongsTo(TaskStatus);

  await User.sync({ force: true });
  await TaskStatus.sync({ force: true });
  await Task.sync({ force: true });
  await Tag.sync({ force: true });
  await TaskTag.sync({ force: true });

  await User.create({
    firstName: 'Denis',
    lastName: 'Strelkov',
    email: 'strelkov.d.d@mail.ru',
    password: process.env.TM_PASSWORD || 'qqqqqq',
  });

  await TaskStatus.bulkCreate([
    { name: 'No Status' },
    { name: 'New' },
    { name: 'In progress' },
    { name: 'Finished' },
  ]);

  await Task.create({
    name: 'First Task Title',
    description: 'This is task description. Need to do many things.',
    creator: '1',
  });
};

export default f;

