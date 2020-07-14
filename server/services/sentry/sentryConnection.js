const Sentry = require('@sentry/node');
// or use es6 import statements
// import * as Sentry from '@sentry/node';

// This is required since it patches functions on the hub
const Apm = require('@sentry/apm');
// or use es6 import statements
// import * as Apm from '@sentry/apm';

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'test', // make sure to source .env file, before running this, alternatively maunally add it in here, remove prior to commiting.
  tracesSampleRate: 1.0, // Be sure to lower this in production
});

// Your test code to verify it works

const transaction = Sentry.startTransaction({
  op: 'test',
  name: 'My First Test Transaction',
});

setTimeout(() => {
  try {
    foo();
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    transaction.finish();
  }
}, 99);
