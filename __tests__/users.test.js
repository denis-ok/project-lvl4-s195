import request from 'supertest';
import faker from 'faker';
import { User } from '../models';
import app from '..';

const prepareCookies = str => str.split(',').map(item => item.split(' ')[0]).join(' ');

const genUser = () => ({
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.internet.password(),
});

const form = {
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  password: faker.internet.password(),
};

describe('requests', () => {
  let server;

  beforeEach(async () => {
    await User.sync({ force: true });
    server = app().listen();
  });

  afterEach((done) => {
    server.close();
    done();
  });

  it('GET, Should show Users page', async () => {
    const res = await request(server).get('/users');
    expect(res.status).toEqual(200);
  });

  it('GET, Should Show Sign Up page', async () => {
    const res = await request(server).get('/users/new');
    expect(res.status).toEqual(200);
  });

  it('GET, Should show profile page (user exist)', async () => {
    await request(server).post('/users').send(form);

    const res = await request(server).get('/users/profile/1');
    expect(res.status).toEqual(200);
    expect(res.text).toEqual(expect.stringContaining(form.firstName));
  });

  it('GET, Should Redirect to main page (user NOT exist)', async () => {
    const res1 = await request(server).get('/users/profile/notexist');
    expect(res1.status).toEqual(302);
  });

  it('POST, Should Create New User In Database', async () => {
    const res = await request(server).post('/users').send(form);
    const user = await User.findOne({
      where: {
        email: form.email,
      },
    });

    expect(res.status).toEqual(302);
    expect(user.firstName).toEqual(form.firstName);
    expect(user.lastName).toEqual(form.lastName);
    expect(user.email).toEqual(form.email);
  });

  it('POST, Should NOT Create Same Users In Database', async () => {
    const usersBefore = await User.findAll();

    const res1 = await request(server).post('/users').send(form);
    const res2 = await request(server).post('/users').send(form);

    const usersAfter = await User.findAll();

    expect(res1.status).toEqual(302);
    expect(res2.status).toEqual(200);
    expect(usersAfter).toHaveLength(usersBefore.length + 1);
  });

  it('POST, Should Create 10 Users In Database', async () => {
    const regRandomUser = async () => {
      await request(server).post('/users').send(genUser());
    };

    for (let i = 0; i < 10; i += 1) {
      regRandomUser();
    }

    const usersAfter = await User.findAll();
    expect(usersAfter).toHaveLength(10);
  });

  it('GET, Should NOT show edit profile page (not logged in)', async () => {
    const res = await request(server).get('/users/edit');
    expect(res.status).toEqual(302);
  });

  it('GET, PATCH, Should edit profile page (logged in)', async () => {
    await request(server).post('/users').send(form);

    const res1 = await request(server)
      .post('/session')
      .send({ email: form.email, password: form.password });

    const cookieString = res1.headers['set-cookie'][0];
    const cookieForSet = prepareCookies(cookieString);

    const res2 = await request(server).get('/users/edit').set('cookie', cookieForSet);

    expect(res2.status).toEqual(200);
    expect(res2.text).toEqual(expect.stringContaining('Edit Profile'));

    const userAfter = {
      email: 'john@brown.com',
      firstName: 'John',
      lastName: 'Brown',
    };

    await request(server)
      .patch('/users')
      .set('cookie', cookieForSet)
      .send(userAfter);

    const res3 = await request(server).get('/users/profile/1');

    expect(res3.text).toEqual(expect.stringContaining(userAfter.firstName));
    expect(res3.text).toEqual(expect.stringContaining(userAfter.lastName));
  });
});
