const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return Promise.resolve();
  }
  
  const data = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML'
  });
  
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          if (json.ok) {
            resolve(json);
          } else {
            resolve(json); // Não rejeitar para não quebrar o fluxo
          }
        } catch (error) {
          resolve();
        }
      });
    });
    
    req.on('error', (error) => {
      resolve(); // Não rejeitar para não quebrar o fluxo
    });
    
    req.write(data);
    req.end();
  });
}

module.exports = {
  sendTelegram
};

