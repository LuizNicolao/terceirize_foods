const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const redisClient = createClient({ url: redisUrl });

let isReady = false;

redisClient.on('error', (error) => {
  console.error('Erro na conexão com Redis:', error.message);
  isReady = false;
});

redisClient.on('ready', () => {
  isReady = true;
  console.log('✅ Redis conectado com sucesso');
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch (error) {
      console.error('❌ Falha ao conectar no Redis:', error.message);
    }
  }
  return redisClient;
};

const isRedisReady = () => isReady && redisClient.isOpen;

module.exports = {
  redisClient,
  connectRedis,
  isRedisReady
};

