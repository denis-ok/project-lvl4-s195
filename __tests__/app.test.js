import request from 'supertest';

import app from '..';

describe('requests', () => {
  let server;

  beforeEach(() => {
    server = app().listen();
  });

  afterEach((done) => {
    server.close();
    done();
  });

  it('GET 200', async () => {
    const res = await request(server).get('/');
    expect(res.status).toEqual(200);
  });

  it('GET 404', async () => {
    const res = await request(server).get('/wrong-path');
    expect(res.status).toEqual(404);
  });
});
