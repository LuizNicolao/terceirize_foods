const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { logAction, AUDIT_ACTIONS } = require('../utils/audit');
const { ipRateLimiter, checkEmailLockout } = require('../middleware/loginSecurity');
const { incrementFailedAttempt, resetFailedAttempts } = require('../services/loginAttemptService');

const router = express.Router();

const loginValidationRules = [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

const buildLockoutResponse = (lockoutUntil) => {
  const now = Date.now();
  const lockoutTime = lockoutUntil instanceof Date ? lockoutUntil.getTime() : new Date(lockoutUntil).getTime();
  const remainingSeconds = Math.max(1, Math.ceil((lockoutTime - now) / 1000));
  const minutes = Math.ceil(remainingSeconds / 60);

  const message = minutes <= 1
    ? 'Conta temporariamente bloqueada. Tente novamente em até 1 minuto.'
    : `Conta temporariamente bloqueada. Tente novamente em ${minutes} minutos.`;

  return {
    message,
    remainingSeconds
  };
};

const handleFailedLogin = async (email, res) => {
  const result = await incrementFailedAttempt(email);

  if (result.lockoutUntil) {
    const { message, remainingSeconds } = buildLockoutResponse(result.lockoutUntil);
    return res.status(401).json({
      error: message,
      lockout: true,
      retryAfter: remainingSeconds
    });
  }

  return res.status(401).json({ error: 'Email ou senha incorretos' });
};

// Login
router.post('/login',
  ipRateLimiter,
  loginValidationRules,
  handleValidation,
  checkEmailLockout,
  async (req, res) => {
  try {
    const { email, senha, rememberMe = false } = req.body;

    // Buscar usuário
    const users = await executeQuery(
      'SELECT id, nome, email, senha, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return handleFailedLogin(email, res);
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
      return handleFailedLogin(email, res);
    }

    // Login bem-sucedido: resetar tentativas
    await resetFailedAttempts(user.email);

    // Gerar token com duração baseada na opção "Mantenha-me conectado"
    const tokenExpiration = rememberMe ? '30d' : '24h'; // 30 dias se "lembrar", 24h se não
    const token = generateToken(user.id, tokenExpiration);

    // Gerar token SSO para sistemas externos (Cotação)
    const ssoSecret = process.env.SSO_SECRET || process.env.JWT_SECRET;
    const ssoToken = jwt.sign(
      { 
        email: user.email,
        nome: user.nome,
        tipo_de_acesso: user.tipo_de_acesso,
        nivel_de_acesso: user.nivel_de_acesso,
        sistema: 'foods',
        timestamp: Date.now()
      },
      ssoSecret,
      { expiresIn: '1h' } // Token SSO expira em 1 hora
    );

    // Remover senha do objeto de resposta
    const { senha: _, ...userWithoutPassword } = user;

    // Registrar auditoria de login
    await logAction(
      user.id,
      AUDIT_ACTIONS.LOGIN,
      'auth',
      { 
        email: user.email, 
        userAgent: req.get('User-Agent'),
        rememberMe: rememberMe,
        tokenExpiration: tokenExpiration
      },
      req.ip
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token,
      ssoToken, // Token SSO para sistemas externos
      rememberMe: rememberMe,
      tokenExpiration: tokenExpiration
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