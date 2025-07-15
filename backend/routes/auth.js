const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

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

    // Buscar usuário
    const users = await executeQuery(
      'SELECT id, nome, email, senha, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = users[0];

    // Verificar se usuário está ativo
    if (user.status !== 'ativo') {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token
    const token = generateToken(user.id);

    // Remover senha do objeto de resposta
    const { senha: _, ...userWithoutPassword } = user;

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
    const JWT_SECRET = process.env.JWT_SECRET || 'foods_jwt_secret_key_2024';

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