const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const router = express.Router();

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

// Login - verifica no banco foods_db, tabela usuarios
router.post('/login', async (req, res) => {
  try {
    const { email, senha, rememberMe = false } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário no banco foods_db
    const [users] = await foodsDbPool.execute(
      `SELECT id, nome, email, senha, tipo_de_acesso, nivel_de_acesso, status 
       FROM usuarios 
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
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
        error: 'Acesso negado. Apenas administradores podem acessar este sistema.'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, user.senha);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
    }

    // Gerar token JWT
    const tokenExpiration = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tipo_de_acesso: user.tipo_de_acesso,
        nivel_de_acesso: user.nivel_de_acesso
      },
      JWT_SECRET,
      { expiresIn: tokenExpiration }
    );

    // Remover senha do objeto de resposta
    const { senha: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Buscar usuário atualizado no banco
    const [users] = await foodsDbPool.execute(
      `SELECT id, nome, email, tipo_de_acesso, nivel_de_acesso, status 
       FROM usuarios 
       WHERE id = ?`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Verificar se o usuário ainda está ativo e é admin
    if (user.status !== 'ativo') {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      });
    }

    if (user.tipo_de_acesso !== 'administrador') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem acessar.'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
});

module.exports = router;

