const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { logAction, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Controle de tentativas de login (em memória)
const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MINUTES = 30;

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { email, senha } = req.body;
    const now = Date.now();

    // Inicializar tentativas
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 0, lastAttempt: now, blockedUntil: null };
    }

    // Verificar se está bloqueado temporariamente
    if (loginAttempts[email].blockedUntil && now < loginAttempts[email].blockedUntil) {
      return res.status(403).json({ error: `Usuário temporariamente bloqueado por tentativas inválidas. Tente novamente em alguns minutos.` });
    }

    // Buscar usuário
    const users = await executeQuery(
      'SELECT id, nome, email, senha, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      loginAttempts[email].count++;
      loginAttempts[email].lastAttempt = now;
      if (loginAttempts[email].count >= MAX_ATTEMPTS) {
        loginAttempts[email].blockedUntil = now + BLOCK_TIME_MINUTES * 60 * 1000;
      }
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = users[0];

    // Se já estiver bloqueado permanentemente
    if (user.status === 'bloqueado') {
      return res.status(403).json({ error: 'Usuário bloqueado. Procure o administrador.' });
    }

    // Se não estiver ativo
    if (user.status !== 'ativo') {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, user.senha);

    if (!isValidPassword) {
      loginAttempts[email].count++;
      loginAttempts[email].lastAttempt = now;
      if (loginAttempts[email].count >= MAX_ATTEMPTS) {
        // Bloquear usuário no banco
        await executeQuery('UPDATE usuarios SET status = ? WHERE id = ?', ['bloqueado', user.id]);
        loginAttempts[email].blockedUntil = now + BLOCK_TIME_MINUTES * 60 * 1000;
        return res.status(403).json({ error: 'Usuário bloqueado por tentativas inválidas. Procure o administrador.' });
      }
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Login bem-sucedido: resetar tentativas
    loginAttempts[email] = { count: 0, lastAttempt: now, blockedUntil: null };

    // Gerar token
    const token = generateToken(user.id);

    // Remover senha do objeto de resposta
    const { senha: _, ...userWithoutPassword } = user;

    // Registrar auditoria de login
    await logAction(
      user.id,
      AUDIT_ACTIONS.LOGIN,
      'auth',
      { email: user.email, userAgent: req.get('User-Agent') },
      req.ip
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET não definido nas variáveis de ambiente!');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário atualizado
    const users = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE id = ? AND status = "ativo"',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    res.json({
      valid: true,
      user: users[0]
    });

  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Logout (opcional - o frontend pode apenas remover o token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});



// Alterar senha
router.post('/change-password', [
  body('senha_atual').isLength({ min: 6 }).withMessage('Senha atual deve ter pelo menos 6 caracteres'),
  body('nova_senha').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { senha_atual, nova_senha } = req.body;
    const userId = req.user.id;

    // Buscar usuário atual
    const users = await executeQuery(
      'SELECT senha FROM usuarios WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(senha_atual, users[0].senha);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Criptografar nova senha
    const hashedPassword = await bcrypt.hash(nova_senha, 12);

    // Atualizar senha
    await executeQuery(
      'UPDATE usuarios SET senha = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Senha alterada com sucesso' });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 