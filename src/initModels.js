import dotenv from 'dotenv';
import { User, Task, Tag, TaskStatus, TaskTag } from './models';

const initModels = async () => {
  dotenv.config();

  Task.belongsToMany(Tag, { through: 'TaskTag' });
  Tag.belongsToMany(Task, { through: 'TaskTag' });

  TaskStatus.hasMany(Task, { foreignKey: 'taskStatusId', as: 'Tasks' });
  Task.belongsTo(TaskStatus, { foreignKey: 'taskStatusId' });

  User.hasMany(Task, { foreignKey: 'creatorId', as: 'Creator' });
  Task.belongsTo(User, { foreignKey: 'creatorId', as: 'Creator' });

  User.hasMany(Task, { foreignKey: 'assignedTo', as: 'TasksToDo' });
  Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'Worker' });

  await User.sync({ force: true });
  await Task.sync({ force: true });
  await TaskStatus.sync({ force: true });
  await Tag.sync({ force: true });
  await TaskTag.sync({ force: true });
};

const addDummyData = async () => {
  await User.create({
    firstName: 'Denis',
    lastName: 'Strelkov',
    email: 'strelkov.d.d@mail.ru',
    password: process.env.TM_PASSWORD || 'qqqqqq',
  });

  await User.create({
    firstName: 'John',
    lastName: 'Brown',
    email: 'john@brown.ru',
    password: process.env.TM_PASSWORD || 'qqqqqq',
  });

  await User.create({
    firstName: 'James',
    lastName: 'Helfield',
    email: 'James@Helfield.ru',
    password: process.env.TM_PASSWORD || 'qqqqqq',
  });

  await User.create({
    firstName: 'Zakk',
    lastName: 'Wylde',
    email: 'Zakk@Wylde.ru',
    password: process.env.TM_PASSWORD || 'qqqqqq',
  });

  await TaskStatus.bulkCreate([
    { name: 'No Status' },
    { name: 'New' },
    { name: 'In progress' },
    { name: 'Finished' },
  ]);

  await Tag.bulkCreate([
    { name: 'tag1' },
    { name: 'tag2' },
    { name: 'tag3' },
    { name: 'tag4' },
    { name: 'tag5' },
    { name: 'tag6' },
    { name: 'tag7' },
    { name: 'tag8' },
  ]);


  const task1 = await Task.create({
    name: 'First Task Title',
    description: 'This is task description. Need to do many things.',
    taskStatusId: '2',
    creatorId: '1',
    assignedTo: '2',
  });

  const task2 = await Task.create({
    name: 'Second Task Title',
    description: 'This is second task description. Need to do many things.',
    taskStatusId: '2',
    creatorId: '1',
    assignedTo: '3',
  });

  const task3 = await Task.create({
    name: 'Third Task Title',
    description: 'This is third task description. Need to do many things.',
    taskStatusId: '3',
    creatorId: '2',
    assignedTo: '3',
  });

  const task4 = await Task.create({
    name: 'Fourth Task Title',
    description: 'This is fourth task description. Need to do many things.',
    taskStatusId: '4',
    creatorId: '3',
    assignedTo: '4',
  });

  const task5 = await Task.create({
    name: 'Five Task Title',
    description: 'This is five task description. Need to do many things.',
    taskStatusId: '4',
    creatorId: '1',
    assignedTo: '1',
  });

  await task1.setTags([1, 2, 3]);
  await task2.setTags([4, 5, 6]);
  await task3.setTags([7]);
  await task4.setTags([1, 4, 7]);
  await task5.setTags([8]);
};

export { initModels, addDummyData };

