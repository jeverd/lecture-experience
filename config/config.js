const dotenv = require('dotenv');
const path = require('path');

const ICE_PUBLIC_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { url: 'stun:stun01.sipphone.com' },
  { url: 'stun:stun.ekiga.net' },
  { url: 'stun:stunserver.org' },
  { url: 'stun:stun.softjoys.com' },
  { url: 'stun:stun.voiparound.com' },
  { url: 'stun:stun.voipbuster.com' },
  { url: 'stun:stun.voipstunt.com' },
  { url: 'stun:stun.voxgratia.org' },
  { url: 'stun:stun.xten.com' },
];

dotenv.config({ path: path.resolve(__dirname, './.env') }); // requires providing full path, due to some issues with dotenv and node versions

module.exports = {
  redisPort: process.env.REDIS_PORT,
  expressPort: process.env.EXPRESS_PORT,
  environment: process.env.NODE_ENV,
  ptHost: process.env.PT_HOST,
  ptPort: process.env.PT_PORT,
  redisUrl: process.env.REDIS_URL,
  email: process.env.EMAIL,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailService: process.env.EMAIL_SERVICE,
  loggerFlag: (process.env.LOGGER === 'true'),
  iceServers: ICE_PUBLIC_SERVERS,
  sessionSecret: process.env.SESSION_SECRET,
  sessionName: process.env.SESSION_NAME,
  redisTurnDbNumber: process.env.REDIS_TURN_DB_NUMBER,
  turnServerSecret: process.env.TURN_SERVER_SECRET,
  turnServerPort: process.env.TURN_SERVER_PORT,
  turnServerActive: (process.env.TURN_SERVER_ACTIVE === 'true'),
  turnServerUrl: process.env.TURN_SERVER_URL,
};
