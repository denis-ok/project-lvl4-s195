import request from 'supertest';
import faker from 'faker';
import { User, Task, TaskTag, Tag } from '../src/models';
import initModels from '../src/initModels';
import app from '../src';
import getSessionCookie from '../src/utils/testUtils';

const userForm = {
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.internet.password(),
};

const genTaskForm = () => ({
  name: faker.lorem.word(),
  description: faker.lorem.sentence(),
  tags: 'tag1, tag2, tag3',
});


describe('requests', () => {
  let server;

  const taskForm1 = genTaskForm();
  // const taskForm2 = genTaskForm();
  // const taskForm3 = genTaskForm();

  beforeAll(async () => {
    await initModels();
  });

  beforeEach(async () => {
    await User.sync({ force: true });
    await TaskTag.sync({ force: true });
    await Task.sync({ force: true });
    await Tag.sync({ force: true });

    await User.create(userForm);
    server = app().listen();
  });

  afterEach((done) => {
    server.close();
    done();
  });


  it('GET, Should NOT show Tasks List page (not logged in)', async () => {
    const res = await request(server).get('/tasks');
    expect(res.status).toEqual(302);
  });


  it('GET, Should show Tasks List page (logged in)', async () => {
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const resLoggedIn = await request(server).get('/tasks').set('cookie', cookieForSet);
    expect(resLoggedIn.status).toEqual(200);
  });


  it('GET, Should NOT show individual task page (not logged in)', async () => {
    const res = await request(server).get('/tasks/1');
    expect(res.status).toEqual(302);
  });


  it('GET, Should show individual task page (logged in)', async () => {
    await Task.create(taskForm1);
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const res = await request(server).get('/tasks/1').set('cookie', cookieForSet);
    expect(res.status).toEqual(200);
    expect(res.text).toEqual(expect.stringContaining(taskForm1.name));
    expect(res.text).toEqual(expect.stringContaining(taskForm1.description));
  });


  it('GET, Should not show individual task page (not exist)', async () => {
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const res = await request(server).get('/tasks/5').set('cookie', cookieForSet);
    expect(res.status).toEqual(302);
  });


  it('GET, Should NOT show add new task page (not logged in)', async () => {
    const res = await request(server).get('/tasks');
    expect(res.status).toEqual(302);
  });


  it('GET, Should show add new task page (logged in)', async () => {
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const resLoggedIn = await request(server).get('/tasks/new').set('cookie', cookieForSet);
    expect(resLoggedIn.status).toEqual(200);
  });


  it('GET, Should not show edit task page (not logged in)', async () => {
    const res = await request(server).get('/tasks/1/edit');
    expect(res.status).toEqual(302);
  });


  it('GET, Should show edit task page (logged in)', async () => {
    await Task.create(taskForm1);
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const res = await request(server).get('/tasks/1/edit').set('cookie', cookieForSet);
    expect(res.status).toEqual(200);
  });


  it('GET, Should not show edit task page (task not exist)', async () => {
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const res = await request(server).get('/tasks/1/edit').set('cookie', cookieForSet);
    expect(res.status).toEqual(302);
  });


  it('POST, Should not add new Task (not logged in)', async () => {
    const tasksBefore = await Task.findAll();
    const tagsBefore = await Tag.findAll();

    await request(server).post('/tasks').send(taskForm1);

    const tasksAfter = await Task.findAll();
    const tagsAfter = await Tag.findAll();

    expect(tasksBefore).toEqual(tasksAfter);
    expect(tagsBefore).toEqual(tagsAfter);
  });

  it('POST, Should add new Task (logged in)', async () => {
    const tasksBefore = await Task.findAll();
    const tagsBefore = await Tag.findAll();

    const cookieForSet = await getSessionCookie(request, server, userForm);

    await request(server)
      .post('/tasks')
      .set('cookie', cookieForSet)
      .send(taskForm1);

    const tasksAfter = await Task.findAll();
    const tagsAfter = await Tag.findAll();

    expect(tasksAfter).toHaveLength(tasksBefore.length + 1);
    expect(tagsAfter).toHaveLength(tagsBefore.length + 3);

    const newTaskForm = genTaskForm();
    newTaskForm.tags = 'tag1, tag2, tag3, tag4';

    await request(server)
      .post('/tasks')
      .set('cookie', cookieForSet)
      .send(newTaskForm);

    expect(await Task.findAll()).toHaveLength(tasksAfter.length + 1);
    expect(await Tag.findAll()).toHaveLength(4);
  });
});
