/* eslint-disable no-undef */
const request = require('request');
const url = require('url');
const io = require('socket.io-client');
// const { should } = require('chai');
const assert = require('assert');
const { client: redisClient } = require('../server/servers');
const { createLecture } = require('./helpers/apiHelpers');

require('../index'); // used to start the server


describe('Socket.io Tests', () => {
  it('/lecture/:id should return status 200 and path with error code 3 when lecture id is not found', (done) => {
    const options = {
      uri: 'http://localhost:8080/lecture/id', // note this is hardcoded in change this afterwards
      method: 'GET',
    };
    request(options, (err, response) => {
      const responseJson = response.toJSON();
      const urlPart = url.parse(responseJson.request.uri);
      assert.equal(urlPart.path, '/error?code=3');
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('/lecture/stats/:id should return status 200 and path with error code 3 when lecture id is not found', (done) => {
    const options = {
      uri: 'http://localhost:8080/lecture/stats/id', // note this is hardcoded in change this afterwards
      method: 'GET',
    };
    request(options, (err, response) => {
      const responseJson = response.toJSON();
      const urlPart = url.parse(responseJson.request.uri);
      assert.equal(urlPart.path, '/error?code=3');
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it('/lecture/stats/:id should return status 200 and path with error code 4 when lecutre id is found but not deleted', (done) => {
    createLecture((err, response, body) => {
      const { redirectUrl } = body;
      const managerId = (redirectUrl.split('/'))[2];
      redisClient.hmget('managers', managerId, (err, manager) => {
        const managerObj = JSON.parse(manager.pop());
        const options = {
          uri: `http://localhost:8080/lecture/stats/${managerObj.roomId}`, // note this is hardcoded in change this afterwards
          method: 'GET',
        };
        request(options, (getErr, getResponse) => {
          const responseJson = getResponse.toJSON();
          const urlPart = url.parse(responseJson.request.uri);
          assert.equal(urlPart.path, '/error?code=4');
          assert.equal(getErr, null);
          assert.equal(getResponse.statusCode, 200);
          done();
        });
      });
    });
  });
  it('/create should return status 200', (done) => {
    createLecture((err, response, body) => {
      assert.equal(response.statusCode, 200);
      const { redirectUrl } = body;
      const managerId = (redirectUrl.split('/'))[2];
      assert.equal(redirectUrl.includes('/lecture/'), true);
      redisClient.hmget('managers', managerId, (error, manager) => {
        assert.equal(error, null);
        const managerObj = JSON.parse(manager.pop());
        assert.equal(managerObj.email, 'testing123@gmail.com');
        done();
      });
    });
  });
});
