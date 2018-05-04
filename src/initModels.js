import dotenv from 'dotenv';
import models from './models';

const f = async () => {
  dotenv.config();

  await models.User.sync({ force: true });
  await models.Task.sync({ force: true });
  await models.TaskStatus.sync({ force: true });
  await models.Tag.sync({ force: true });

  await models.User.create({
    firstName: 'Denis',
    lastName: 'Strelkov',
    email: 'strelkov.d.d@mail.ru',
    password: process.env.TM_PASSWORD || 'qqqqqq',
  });

  await models.TaskStatus.bulkCreate([
    { name: 'New' },
    { name: 'In progress' },
    { name: 'Finished' },
  ]);

  await models.Task.create({
    name: 'First Task Title',
    description: 'This is task description. Need to do many things.',
    assignedTo: 'no assignment',
    tags: 'tag1, tag2',
    status: 'New',
    creator: '1',
  });
};

export default f;

