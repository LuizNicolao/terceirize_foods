const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const redisClient = createClient({ url: redisUrl });

let isReady = false;

// Redis desabilitado - comentado para não gerar logs de erro
// redisClient.on('error', (error) => {
//   console.error('Erro na conexão com Redis:', error.message);
//   isReady = false;
// });

// redisClient.on('ready', () => {
//   isReady = true;
//   console.log('✅ Redis conectado com sucesso');
// });

const connectRedis = async () => {
  // Redis desabilitado - comentado para não gerar logs de erro
  // if (!redisClient.isOpen) {
  //   try {
  //     await redisClient.connect();
  //   } catch (error) {
  //     console.error('❌ Falha ao conectar no Redis:', error.message);
  //   }
  // }
  return redisClient;
};

const isRedisReady = () => false; // Sempre retorna false pois Redis está desabilitado

module.exports = {
  redisClient,
  connectRedis,
  isRedisReady
};

