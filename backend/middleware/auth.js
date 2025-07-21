const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido nas variáveis de ambiente!');
}

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Middleware de autenticação - Headers:', req.headers);
  console.log('🎫 Token recebido:', token ? 'Presente' : 'Ausente');

  if (!token) {
    console.log('❌ Token não fornecido');
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decodificado:', decoded);
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE id = ?',
      [decoded.userId]
    );

    console.log('👤 Usuário encontrado:', user);

    if (user.length === 0) {
      console.log('❌ Usuário não encontrado no banco');
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (user[0].status === 'bloqueado') {
      console.log('🚫 Usuário bloqueado');
      return res.status(403).json({ error: 'Usuário bloqueado. Procure o administrador.' });
    }

    if (user[0].status !== 'ativo') {
      console.log('⚠️ Usuário inativo');
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    req.user = user[0];
    console.log('✅ Autenticação bem-sucedida para usuário:', user[0].nome);
    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar permissões específicas
const checkPermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    
    // Administradores têm todas as permissões
    if (user.tipo_de_acesso === 'administrador') {
      return next();
    }

    // Verificar nível de acesso
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    const userPermissions = accessLevels[user.nivel_de_acesso] || [];
    
    if (userPermissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ error: 'Permissão insuficiente' });
  };
};

// Middleware para verificar tipo de acesso
const checkAccessType = (allowedTypes) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (allowedTypes.includes(user.tipo_de_acesso)) {
      return next();
    }

    return res.status(403).json({ error: 'Tipo de acesso não autorizado' });
  };
};

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkAccessType,
  generateToken
}; 