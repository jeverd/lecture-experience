/* eslint-disable no-undef */
const request = require('request');
const io = require('socket.io-client');
// const { should } = require('chai');
const assert = require('assert');
const { client: redisClient } = require('../server/servers');
const { createLecture } = require('./helpers/apiHelpers');

require('../index'); // used to start the server


describe('Socket.io Tests', () => {
  it('/lecture/:id should return status 404 when lecture id is not found', (done) => {
    const options = {
      uri: 'http://localhost:8080/lecture/id', // note this is hardcoded in change this afterwards
      method: 'GET',
    };
    request(options, (err, response) => {
      assert.equal(err, null);
      assert.equal(response.statusCode, 404);
      done();
    });
  });

  it('/lecture/managerId should return status 200 when managerId is valid', (done) => {
    createLecture((error, response, body) => {
      const { redirectUrl } = body;
      const managerId = (redirectUrl.split('/'))[2];
      const getEndPointOption = {
        uri: `http://localhost:8080/lecture/${managerId}`, // note this is hardcoded in change this afterwards
        method: 'GET',
      };
      request(getEndPointOption, (getErr, getResponse) => {
        assert.equal(getResponse.statusCode, 200);
        assert.equal(getErr, null);
        done();
      });
      // const managerId = ((body.redirectUrl).split('/'))[2];
      // const socket = io('http://localhost:8080', { query: `id=${managerId}` });
      // done();
    });
  });


  it('/lecture/stats/:id should return status 404 when lecture id is not found', (done) => {
    const options = {
      uri: 'http://localhost:8080/lecture/stats/id', // note this is hardcoded in change this afterwards
      method: 'GET',
    };
    request(options, (err, response) => {
      assert.equal(response.statusCode, 404);
      done();
    });
  });

  it('/lecture/stats/:id should return status 404 when lecutre id is found but not deleted', (done) => {
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
          assert.equal(getErr, null);
          assert.equal(getResponse.statusCode, 404);
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
