import request from 'supertest';
// import faker from 'faker';
import { User } from '../models';
import app from '..';

const form = {
  email: 'john@gmail.com',
  firstName: 'John',
  lastName: 'Brown',
  password: 'qqqqqq',
};

const prepareCookies = str => str.split(',').map(item => item.split(' ')[0]).join(' ');

describe('requests', () => {
  let server;

  beforeEach(async () => {
    await User.sync({ force: true });
    server = app().listen();
    await request(server).post('/users').send(form);
  });

  afterEach((done) => {
    server.close();
    done();
  });

  it('GET 200, Should show Login Page', async () => {
    const res = await request(server).get('/session/new');
    expect(res.status).toEqual(200);
  });

  it('Should create session and delete after', async () => {
    const res1 = await request(server)
      .post('/session')
      .send({ email: form.email, password: form.password });

    const sessionCookieStr = res1.headers['set-cookie'][0];

    const res2 = await request(server).get('/').set('cookie', prepareCookies(sessionCookieStr));
    expect(res2.text).toEqual(expect.stringContaining('Sign Out'));

    const res3 = await request(server).delete('/session');
    const delSessionCookieStr = res3.headers['set-cookie'][0];

    const res4 = await request(server).get('/').set('cookie', prepareCookies(delSessionCookieStr));
    expect(res4.text).toEqual(expect.stringContaining('Session Deleted'));
  });

  it('Should NOT create session', async () => {
    const res1 = await request(server)
      .post('/session')
      .send({ email: form.email, password: '123' });

    expect(res1.headers).toHaveProperty('set-cookie');

    const cookieString = res1.headers['set-cookie'][0];
    const cookieForSet = prepareCookies(cookieString);

    const res2 = await request(server).get('/').set('cookie', cookieForSet);

    expect(res2.text).toEqual(expect.stringContaining('email or password were wrong'));
  });
});
