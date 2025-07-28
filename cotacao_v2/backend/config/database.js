const mysql = require('mysql2/promise');

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || '82.29.57.43',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'foods123456',
  database: process.env.DB_NAME || 'cotacao_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Pool de conexões
const pool = mysql.createPool(dbConfig);

// Teste de conexão (opcional, pode ser removido em produção)
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
    console.log('🔧 Configurações do banco:', {
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port
    });
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar com banco de dados:', err.message);
    console.error('🔧 Configurações tentadas:', {
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port
    });
  });

// Função para executar queries
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Erro na execução da query:', error);
    throw error;
  }
};

module.exports = {
  pool,
  executeQuery
}; 