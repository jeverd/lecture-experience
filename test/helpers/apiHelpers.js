const request = require('request');


const createLecture = (cb) => {
  const options = {
    uri: 'http://localhost:8080/create', // note this is hardcoded in change this afterwards
    method: 'POST',
    json: {
      email: 'testing123@gmail.com',
    },
  };
  request(options, (err, response, body) => cb(err, response, body));
};


module.exports = {
  createLecture,
};
