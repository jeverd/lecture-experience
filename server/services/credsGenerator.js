const crypto = require('crypto');

const credsGenerator = (name, secret) => { // https://stackoverflow.com/questions/35766382/coturn-how-to-use-turn-rest-api
  const unixTimeStamp = parseInt(Date.now() / 1000, 10) + 24 * 3600;
  console.log(secret)
  const username = [unixTimeStamp, name].join(':');
  let password;
  const hmac = crypto.createHmac('sha1', secret);
  hmac.setEncoding('base64');
  hmac.write(username);
  hmac.end();
  // eslint-disable-next-line prefer-const
  password = hmac.read();
  return {
    username,
    password,
  };
};

module.exports = credsGenerator;
