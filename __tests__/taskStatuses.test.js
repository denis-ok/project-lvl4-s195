import request from 'supertest';
import faker from 'faker';
import { User, TaskStatus } from '../src/models';
import { initModels } from '../src/initModels';
import app from '../src';
import getSessionCookie from '../src/utils/testUtils';

const userForm = {
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.internet.password(),
};

const taskStatusForm = {
  name: faker.lorem.word(),
};

describe('requests', () => {
  let server;

  beforeAll(async () => {
    await initModels();
  });

  beforeEach(async () => {
    await TaskStatus.sync({ force: true });
    await User.sync({ force: true });
    await User.create(userForm);

    server = app().listen();
  });

  afterEach((done) => {
    server.close();
    done();
  });

  it('GET, Should NOT show Task Statuses page (not logged in)', async () => {
    const res = await request(server).get('/taskstatuses');
    expect(res.status).toEqual(302);
  });

  it('GET, Should show Task Statuses page (logged in)', async () => {
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const resLoggedIn = await request(server).get('/taskstatuses').set('cookie', cookieForSet);
    expect(resLoggedIn.status).toEqual(200);
  });

  it('POST, Should not add new Task Status (not logged in)', async () => {
    const statusesBefore = await TaskStatus.findAll();
    const res = await request(server).post('/taskstatuses').send(taskStatusForm);
    const statusesAfter = await TaskStatus.findAll();
    expect(res.status).toEqual(302);
    expect(statusesBefore).toEqual(statusesAfter);
  });

  it('POST, Should Add Task Status (logged in)', async () => {
    const statusesBefore = await TaskStatus.findAll();
    const cookieForSet = await getSessionCookie(request, server, userForm);
    await request(server)
      .post('/taskstatuses')
      .set('cookie', cookieForSet)
      .send(taskStatusForm);

    const statusesAfter = await TaskStatus.findAll();
    const newStatus = await TaskStatus.findOne({ where: { name: taskStatusForm.name } });

    expect(statusesAfter).toHaveLength(statusesBefore.length + 1);
    expect(newStatus.name).toEqual(taskStatusForm.name);
  });

  it('POST, Should NOT Add Task Status with same name', async () => {
    const statusesBefore = await TaskStatus.findAll();
    const cookieForSet = await getSessionCookie(request, server, userForm);

    await request(server)
      .post('/taskstatuses')
      .set('cookie', cookieForSet)
      .send(taskStatusForm);

    const res = await request(server)
      .post('/taskstatuses')
      .set('cookie', cookieForSet)
      .send(taskStatusForm);

    const statusesAfter = await TaskStatus.findAll();

    expect(statusesAfter).toHaveLength(statusesBefore.length + 1);
    expect(res.text).toEqual(expect.stringContaining('must be unique'));
  });

  it('PATCH, Should not edit Task Status (not logged in)', async () => {
    await TaskStatus.create(taskStatusForm);
    const newName = faker.lorem.word();

    await request(server).patch('/taskstatuses/1').send({ name: newName });

    const status = await TaskStatus.findById(1);

    expect(status.name).toEqual(taskStatusForm.name);
  });

  it('PATCH, Should edit Task Status (logged in)', async () => {
    await TaskStatus.create(taskStatusForm);
    const newName = faker.lorem.word();

    const cookieForSet = await getSessionCookie(request, server, userForm);

    await request(server)
      .patch('/taskstatuses/1')
      .set('cookie', cookieForSet)
      .send({ name: newName });

    const status = await TaskStatus.findById(1);

    expect(status.name).toEqual(newName);

    const emptyName = '';
    await request(server)
      .patch('/taskstatuses/1')
      .set('cookie', cookieForSet)
      .send({ name: emptyName });

    expect(status.name).toEqual(newName);
  });

  it('DELETE, Should not delete Task Status (not logged in)', async () => {
    await TaskStatus.create(taskStatusForm);
    await TaskStatus.create({ name: faker.lorem.word() });
    await request(server).delete('/taskstatuses/2');

    const statuses = await TaskStatus.findAll();

    expect(statuses).toHaveLength(2);
  });

  it('DELETE, Should delete Task Status (logged in)', async () => {
    await TaskStatus.create(taskStatusForm);
    await TaskStatus.create({ name: faker.lorem.word() });

    const cookieForSet = await getSessionCookie(request, server, userForm);
    await request(server).delete('/taskstatuses/2').set('cookie', cookieForSet);

    const statuses = await TaskStatus.findAll();

    expect(statuses).toHaveLength(1);
  });
});
