const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

let redisClient = null;
let isReady = false;
let connectionAttempted = false;
let connectionFailed = false;

// Criar stub básico primeiro (será substituído se Redis estiver habilitado)
const createRedisStub = () => ({
  isOpen: false,
  connect: async () => {},
  on: () => createRedisStub(),
  incr: async () => 0,
  expire: async () => {},
  ttl: async () => -1,
  set: async () => {},
  del: async () => {},
  get: async () => null
});

// Criar cliente Redis apenas se não estiver desabilitado
if (process.env.REDIS_ENABLED !== 'false') {
  redisClient = createClient({ 
    url: redisUrl,
    socket: {
      reconnectStrategy: false, // Desabilitar reconexão automática (fazemos manualmente)
      connectTimeout: 3000 // Timeout de 3 segundos
    }
  });

  // Tratamento de erros com fallback gracioso (apenas uma vez)
  redisClient.on('error', (error) => {
    if (!connectionFailed) {
      connectionFailed = true;
      isReady = false;
      console.warn('⚠️ Redis não disponível:', error.message);
      console.warn('⚠️ Sistema continuará funcionando sem Redis (rate limiting local apenas)');
    }
  });

  redisClient.on('ready', () => {
    isReady = true;
    connectionFailed = false;
    console.log('✅ Redis conectado com sucesso - Rate limiting distribuído ativado');
  });
} else {
  console.log('ℹ️ Redis desabilitado via variável de ambiente REDIS_ENABLED=false');
}

// Função para conectar Redis com tratamento de erro gracioso
const connectRedis = async () => {
  // Se Redis estiver explicitamente desabilitado via env, retornar stub
  if (process.env.REDIS_ENABLED === 'false') {
    return redisClient || createRedisStub();
  }
  
  // Se redisClient não foi criado, usar stub
  if (!redisClient) {
    redisClient = createRedisStub();
    return redisClient;
  }

  // Se já tentamos conectar e falhou, não tentar novamente
  if (connectionAttempted && connectionFailed) {
    return redisClient;
  }

  // Se já está conectado, retornar
  if (redisClient.isOpen) {
    isReady = true;
    return redisClient;
  }

  // Tentar conectar apenas uma vez
  if (!connectionAttempted) {
    connectionAttempted = true;
    try {
      await redisClient.connect();
      isReady = true;
      connectionFailed = false;
    } catch (error) {
      connectionFailed = true;
      isReady = false;
      console.warn('⚠️ Falha ao conectar no Redis:', error.message);
      console.warn('⚠️ Sistema continuará funcionando com rate limiting em memória');
    }
  }

  return redisClient;
};

const isRedisReady = () => isReady;

// Garantir que redisClient sempre tenha um valor (usar stub se necessário)
if (!redisClient) {
  redisClient = createRedisStub();
}

module.exports = {
  redisClient,
  connectRedis,
  isRedisReady
};

