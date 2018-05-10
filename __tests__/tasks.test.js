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

// const genTaskForm = () => ({
//   name: 'do something',
//   description: 'task description text',
//   tags: 'tag1, tag2, tag3',
// });

const taskForm1 = {
  name: 'do something',
  description: 'task description text',
  tags: 'tag1, tag2, tag3',
};

const taskForm2 = {
  name: 'do something more',
  description: 'another task description text',
  tags: 'tag1, tag2, tag3, tag4',
  status: 'finished',
};

const taskForm3 = {
  name: 'do',
  description: '',
  tags: '',
  status: '',
};

const taskForm4 = {
  name: '',
  description: '',
  tags: '',
  status: '',
};


describe('requests', () => {
  let server;

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

  it('POST, Should not add new Task (validation error)', async () => {
    const cookieForSet = await getSessionCookie(request, server, userForm);

    const res1 = await request(server)
      .post('/tasks')
      .set('cookie', cookieForSet)
      .send(taskForm3);

    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('Title length must be between'));

    const res2 = await request(server)
      .post('/tasks')
      .set('cookie', cookieForSet)
      .send(taskForm4);

    expect(res2.status).toEqual(200);
    expect(res2.text).toEqual(expect.stringContaining('Title cannot be blank'));
  });

  it('POST, Should add new Task (logged in)', async () => {
    const tasksBefore = await Task.findAll();
    const tagsBefore = await Tag.findAll();

    const cookieForSet = await getSessionCookie(request, server, userForm);

    const res1 = await request(server)
      .post('/tasks')
      .set('cookie', cookieForSet)
      .send(taskForm1);

    const tasksAfter = await Task.findAll();
    const tagsAfter = await Tag.findAll();

    expect(res1.status).toEqual(302);
    expect(tasksAfter).toHaveLength(tasksBefore.length + 1);
    expect(tagsAfter).toHaveLength(tagsBefore.length + 3);

    const res2 = await request(server)
      .post('/tasks')
      .set('cookie', cookieForSet)
      .send(taskForm2);

    expect(res2.status).toEqual(302);
    expect(await Task.findAll()).toHaveLength(tasksAfter.length + 1);
    expect(await Tag.findAll()).toHaveLength(4);
  });

  it('PATCH, Should edit Task (logged in)', async () => {
    const cookieForSet = await getSessionCookie(request, server, userForm);

    await request(server)
      .post('/tasks')
      .set('cookie', cookieForSet)
      .send(taskForm1);

    await request(server)
      .patch('/tasks/1')
      .set('cookie', cookieForSet)
      .send(taskForm2);

    const resGet = await request(server)
      .get('/tasks/1')
      .set('cookie', cookieForSet);

    expect(resGet.text).toEqual(expect.stringContaining('do something more'));
    expect(resGet.text).toEqual(expect.stringContaining('another task description text'));
    expect(resGet.text).toEqual(expect.stringContaining('finished'));
    expect(resGet.text).toEqual(expect.stringContaining('tag4'));
  });

  it('PATCH, Should not edit Task (validation error)', async () => {
    const cookieForSet = await getSessionCookie(request, server, userForm);

    await request(server)
      .post('/tasks')
      .set('cookie', cookieForSet)
      .send(taskForm1);

    const resPatch = await request(server)
      .patch('/tasks/1')
      .set('cookie', cookieForSet)
      .send(taskForm4);

    expect(resPatch.status).toEqual(200);
    expect(resPatch.text).toEqual(expect.stringContaining('Title length must be between'));
  });
});
