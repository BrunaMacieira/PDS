// Serviços que precisam de ser inicializados no arranque do sw
const WebpushService = require('./webpush_service.js');

const services = [
  WebpushService
];

module.exports = async function initServices() {
  for(let i = 0; i < services.length; i++) {
    const s = services[i];
    console.log(`Initializing ${s.name}`);
    await s.init();
  }
};