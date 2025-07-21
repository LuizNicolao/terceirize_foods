const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

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
      SELECT id, nome, email, senha, nivel_de_acesso, tipo_de_acesso, status
      FROM usuarios WHERE email = ?
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
    const isValidPassword = await bcrypt.compare(password, user.senha);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        nivel_de_acesso: user.nivel_de_acesso,
        tipo_de_acesso: user.tipo_de_acesso
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remover sessão antiga se existir
    const connection2 = await pool.getConnection();
    await connection2.execute(`
      DELETE FROM user_sessions WHERE user_id = ?
    `, [user.id]);
    
    // Salvar nova sessão no banco
    await connection2.execute(`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
    `, [user.id, token]);
    await connection2.release();

    // Remover senha do objeto de resposta
    const { senha: _, ...userWithoutPassword } = user;

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
      SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status, criado_em, atualizado_em
      FROM usuarios WHERE id = ?
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

module.exports = router; 