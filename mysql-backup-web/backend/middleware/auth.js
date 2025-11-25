const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const JWT_SECRET = process.env.JWT_SECRET || 'mysql-backup-web-secret-key-change-in-production';
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT) || 3306;
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'root123456';

// Pool de conexão com o banco foods_db
const foodsDbPool = mysql.createPool({
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: 'foods_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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
      // Log para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Acesso negado para usuário ${user.email} (tipo: ${user.tipo_de_acesso})`);
      }
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem acessar.',
        userType: user.tipo_de_acesso // Informar o tipo do usuário para debug
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

