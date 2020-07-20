const crypto = require('crypto');

const turnCredsGenerator = (name, secret) => { // https://stackoverflow.com/questions/35766382/coturn-how-to-use-turn-rest-api
  const unixTimeStamp = parseInt(Date.now() / 1000, 10) + 24 * 3600;
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

const janusCredsGenerator = (data = [], secret, timeout = 24 * 60 * 60) => { // https://janus.conf.meetecho.com/docs/auth.html
  const expiry = Math.floor(Date.now() / 1000) + timeout;
  const strdata = [expiry.toString(), 'janus', ...data].join(','); // relm is always janus
  const hmac = crypto.createHmac('sha1', secret);
  hmac.setEncoding('base64');
  hmac.write(strdata);
  hmac.end();

  return [strdata, hmac.read()].join(':'); // format <timestamp>,janus,<plugin1>[,plugin2...]:<signature>
};


module.exports = {
  turnCredsGenerator,
  janusCredsGenerator,
};
