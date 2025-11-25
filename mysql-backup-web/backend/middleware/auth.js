const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const JWT_SECRET = process.env.JWT_SECRET || 'mysql-backup-web-secret-key-change-in-production';
// Usar FOODS_DB_* se definido, senão usar DB_* como fallback (seguindo padrão dos outros projetos)
const FOODS_DB_HOST = process.env.FOODS_DB_HOST || process.env.DB_HOST || 'localhost';
const FOODS_DB_PORT = parseInt(process.env.FOODS_DB_PORT || process.env.DB_PORT) || 3306;
const FOODS_DB_USER = process.env.FOODS_DB_USER || process.env.DB_USER || 'foods_user';
const FOODS_DB_PASSWORD = process.env.FOODS_DB_PASSWORD || process.env.DB_PASSWORD || 'foods123456';
const FOODS_DB_NAME = process.env.FOODS_DB_NAME || 'foods_db';

// Pool de conexão com o banco foods_db
const poolConfig = {
  host: FOODS_DB_HOST,
  port: FOODS_DB_PORT,
  user: FOODS_DB_USER,
  password: FOODS_DB_PASSWORD,
  database: FOODS_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Forçar IPv4 se o host for localhost (evita problemas com IPv6)
if (FOODS_DB_HOST === 'localhost' || FOODS_DB_HOST === '127.0.0.1') {
  poolConfig.ipFamily = 4;
}

const foodsDbPool = mysql.createPool(poolConfig);

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso não fornecido'
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Token inválido'
        });
      }
      throw jwtError;
    }

    // Buscar usuário no banco foods_db
    let users;
    try {
      [users] = await foodsDbPool.execute(
        `SELECT id, nome, email, tipo_de_acesso, nivel_de_acesso, status 
         FROM usuarios 
         WHERE id = ?`,
        [decoded.userId]
      );
    } catch (dbError) {
      console.error('Erro ao buscar usuário no banco de dados:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar autenticação'
      });
    }

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Verificar se o usuário está ativo
    if (user.status !== 'ativo') {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      });
    }

    // Verificar se é administrador
    if (user.tipo_de_acesso !== 'administrador') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem acessar.'
      });
    }

    // Adicionar usuário à requisição
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno na autenticação'
    });
  }
};

module.exports = {
  authenticateToken
};

