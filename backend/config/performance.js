// Configurações de Performance para o Servidor
// Otimizações para lidar com 5mil+ registros

const performanceConfig = {
  // Configurações de paginação
  pagination: {
    defaultPageSize: 50,
    maxPageSize: 100,
    minPageSize: 10
  },

  // Configurações de cache
  cache: {
    enabled: true,
    ttl: 300, // 5 minutos
    maxSize: 1000 // Máximo de 1000 itens em cache
  },

  // Configurações de consulta
  query: {
    timeout: 30000, // 30 segundos
    maxResults: 10000, // Máximo de 10k resultados por consulta
    enableIndexes: true
  },

  // Configurações de compressão
  compression: {
    enabled: true,
    threshold: 1024, // Comprimir respostas maiores que 1KB
    level: 6 // Nível de compressão (1-9)
  },

  // Configurações de rate limiting
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // Máximo 100 requests por IP por janela
  },

  // Configurações de pool de conexões
  database: {
    connectionLimit: 20,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  },

  // Configurações de logging
  logging: {
    slowQueryThreshold: 1000, // Log queries mais lentas que 1 segundo
    enableQueryLog: false, // Desabilitar log de queries em produção
    enablePerformanceLog: true
  }
};

module.exports = performanceConfig; 