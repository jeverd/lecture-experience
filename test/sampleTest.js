const request = require('request');
const io = require('socket.io-client');

describe('Socket io connection', () => {
  const options = {
    uri: 'http://localhost:8080/create', // note this is hardcoded in change this afterwards
    method: 'POST',
    json: {
      email: 'testing123@gmail.com',
    },
  };
  it('testing here', (done) => {
    request(options, (err, response, body) => {
      const managerId = ((body.redirectUrl).split('/'))[2];
      const socket = io('http://localhost:8080', { query: `id=${managerId}` });
      done();
    });
  });
});
