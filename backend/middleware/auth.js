const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'foods_jwt_secret_key_2024';

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  console.log('Verificando autenticação para:', req.path);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Token não fornecido');
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decodificado para usuário ID:', decoded.userId);
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE id = ? AND status = "ativo"',
      [decoded.userId]
    );

    if (user.length === 0) {
      console.log('Usuário não encontrado ou inativo');
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    console.log('Usuário autenticado:', user[0].nome);
    req.user = user[0];
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar permissões específicas
const checkPermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    console.log('Verificando permissão:', permission, 'para usuário:', user.nome);
    console.log('Tipo de acesso:', user.tipo_de_acesso, 'Nível:', user.nivel_de_acesso);
    
    // Administradores têm todas as permissões
    if (user.tipo_de_acesso === 'administrador') {
      console.log('Usuário é administrador, permissão concedida');
      return next();
    }

    // Verificar nível de acesso
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    const userPermissions = accessLevels[user.nivel_de_acesso] || [];
    console.log('Permissões do usuário:', userPermissions);
    
    if (userPermissions.includes(permission)) {
      console.log('Permissão concedida');
      return next();
    }

    console.log('Permissão negada');
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