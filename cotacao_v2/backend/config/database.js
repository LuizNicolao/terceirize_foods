const mysql = require('mysql2/promise');

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cotacao_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Pool de conexões
const pool = mysql.createPool(dbConfig);

// Teste de conexão (opcional, pode ser removido em produção)
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar com banco de dados:', err.message);
  });

module.exports = pool; 