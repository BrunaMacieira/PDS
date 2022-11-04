// ... Dependencies
const webpush = require('web-push');

const PUBLIC_KEY = 'BE4YGYnNT9BKpXawtBUHn2RQMchBas-KXGZXp1xytZ0j5dn_lH1aj6BVSveT_HAiEthXNidwTHczo7NPebP2oc4';
const PRIVATE_KEY = 'xhGxACUifvQiXW3-W0Sb2qoyIkLwbZaWCiqr8_aT8u8';

class WebpushService {
  static generateVAPIDKeys() {
    const vapid = webpush.generateVAPIDKeys();
    return {
      public: vapid.publicKey,
      private: vapid.privateKey
    };
  }

  static async send(sub, payload) {
    if(typeof payload !== 'string') payload = JSON.stringify(payload);
    await webpush.sendNotification(sub, payload);
  }

  static init() {
    webpush.setVapidDetails(
      'mailto:a16445@alunos.ipca.pt',
      PUBLIC_KEY,
      PRIVATE_KEY,
    );
  }
}

module.exports = WebpushService;