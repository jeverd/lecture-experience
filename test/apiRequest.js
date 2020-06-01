const request = require('request');


// method = "GET", "POST", "PATCH" ....etc
// endpoint = refers to various endpoints in the api.
// data, the data you want to send, usually for post/patch request,
// cb = CALLBACK
// query, used for get requests


// TODO Add more capability for types of request, these are the most basics ones

const jobSearchRequest = function (method, endpoint, data, query, cb) { // add capability for doing get requests.
  // /FOR POST REQUEST ONLY
  if (method == 'POST' || method == 'PATCH') {
    var options = {
      uri: `http://localhost:3000/api${endpoint}`, // note this is hardcoded in change this afterwards
      method,
      json: data,
    };

    request(options, (err, response, body) => cb(err, response, body));
  }
  // FOR GET REQUESTS
  if (method == 'GET') {
  	var options = {
  		uri: `http://localhost:3000/api${endpoint}`, // note this is hardcoded in change this afterwards
  		qs: query,
  		method,
  	};
  	request(options, (err, response, body) => cb(err, response, body));
  }
};


module.exports = jobSearchRequest;
