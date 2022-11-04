// ... Dependencies
const Application = require('./bootstrap/app.js');
const {version} = require('./package.json');

process.env.NODE_ENV = 'development';

(async _ => {
  try {
    const app = new Application("WeBid", version);
    console.log(`Bootstraping application ${app.name} v${app.version}`);
    await app.bootstrap();
  } catch (error) {
    console.error(error);
  }
})();