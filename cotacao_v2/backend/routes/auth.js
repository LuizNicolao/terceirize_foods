const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cotacao_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexões
const pool = mysql.createPool(dbConfig);

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// POST /api/auth/login - Login do usuário
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(`
      SELECT id, name, email, password, role, status
      FROM users WHERE email = ?
    `, [email]);

    await connection.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const user = users[0];

    // Verificar se o usuário está ativo
    if (user.status !== 'ativo') {
      return res.status(401).json({ message: 'Usuário inativo. Entre em contato com o administrador.' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Salvar sessão no banco
    const connection2 = await pool.getConnection();
    await connection2.execute(`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
    `, [user.id, token]);
    await connection2.release();

    // Remover senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/auth/me - Verificar status de autenticação
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(`
      SELECT id, name, email, role, status, created_at, updated_at
      FROM users WHERE id = ?
    `, [req.user.id]);

    await connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const user = users[0];

    // Verificar se o usuário ainda está ativo
    if (user.status !== 'ativo') {
      return res.status(401).json({ message: 'Usuário inativo' });
    }

    res.json(user);

  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/auth/logout - Logout do usuário
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const connection = await pool.getConnection();
      
      // Remover sessão do banco
      await connection.execute(`
        DELETE FROM user_sessions WHERE token = ?
      `, [token]);

      await connection.release();
    }

    res.json({ message: 'Logout realizado com sucesso' });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de integração para autenticação automática
router.get('/integration', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        error: 'Token não fornecido',
        message: 'Token de integração é obrigatório'
      });
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o token é do sistema principal
    if (decoded.system !== 'terceirize_foods') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Token não é do sistema principal'
      });
    }

    // Verificar se o usuário existe no sistema de cotação
    let [user] = await db.execute(
      'SELECT id, nome, email, tipo_acesso, nivel_acesso FROM usuarios WHERE email = ?',
      [decoded.email]
    );

    // Se não existir, criar o usuário
    if (user.length === 0) {
      // Criar usuário no sistema de cotação
      const [result] = await db.execute(
        'INSERT INTO usuarios (nome, email, tipo_acesso, nivel_acesso, senha, status) VALUES (?, ?, ?, ?, ?, ?)',
        [
          decoded.name,
          decoded.email,
          decoded.role.split('_')[0] || 'usuario',
          decoded.role.split('_')[1] || 'I',
          await bcrypt.hash('senha123', 10), // Senha padrão
          1 // Ativo
        ]
      );

      // Buscar usuário criado
      [user] = await db.execute(
        'SELECT id, nome, email, tipo_acesso, nivel_acesso FROM usuarios WHERE id = ?',
        [result.insertId]
      );
    }

    const userData = user[0];

    // Criar token JWT para o sistema de cotação
    const cotacaoToken = jwt.sign(
      {
        id: userData.id,
        name: userData.nome,
        email: userData.email,
        role: `${userData.tipo_acesso}_${userData.nivel_acesso}`
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Redirecionar para o frontend com o token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
    const redirectUrl = `${frontendUrl}/auth/integration?token=${cotacaoToken}`;
    
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Erro na integração:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Token de integração expirou'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Token de integração inválido'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Erro ao processar integração'
    });
  }
});

module.exports = router; 