import request from 'supertest';
import faker from 'faker';
import { User } from '../models';
import app from '..';

// console.log('test environment:', process.env.NODE_ENV);
describe('requests', () => {
  let server;

  const genUser = () => ({
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    password: faker.internet.password(),
  });

  beforeEach(async () => {
    await User.sync({ force: true });
    server = app().listen();
  });

  afterEach((done) => {
    server.close();
    done();
  });

  it('GET 200, Should show Users page', async () => {
    const res = await request(server).get('/users');
    expect(res.status).toEqual(200);
  });

  it('GET 200, Should Show Sign Up page', async () => {
    const res = await request(server).get('/users/new');
    expect(res.status).toEqual(200);
  });

  it('POST, Should Create New User In Database', async () => {
    const form = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.internet.password(),
    };
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
    expect(user.password).toEqual(null);
  });

  it('POST, Should NOT Create Same Users In Database', async () => {
    const usersBefore = await User.findAll();

    const form = {
      email: 'john@gmail.com',
      firstName: 'John',
      lastName: 'Brown',
      password: 'qqqqqq',
    };

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
});
