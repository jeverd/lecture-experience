const redis  = require("redis");

var client = redis.createClient("6379", "127.0.0.1");


client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

client.set('my test key', 'my test value', redis.print);


// client.hmset('frameworks', 'javascript', 'AngularJS', 'css', 'Bootstrap', 'node', 'Express');

// client.hgetall('frameworks', function(err, object) {
//     console.log(object["javascript"]);
// });


client.rpush(['frameworks', 'angularjs', 'backbone'], function(err, reply) {
    console.log(err); //prints 2
});