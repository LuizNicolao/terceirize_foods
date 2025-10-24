const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido nas variáveis de ambiente!');
}

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token:', token);

  if (!token) {
    console.log('❌ Token não fornecido');
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    console.log('🔍 Verificando token JWT...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token válido, decoded:', decoded);
    
    // Verificar se o usuário ainda existe e está ativo
    console.log('🔍 Buscando usuário no banco...');
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
      return res.status(403).json({ error: 'Usuário bloqueado. Procure o administrador.' });
    }

    if (user[0].status !== 'ativo') {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    req.user = user[0];
    console.log('✅ Autenticação bem-sucedida, prosseguindo...');
    next();
  } catch (error) {
    console.log('❌ Erro na autenticação:', error.message);
    console.log('❌ Erro completo:', error);
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

// Middleware para verificar permissões por tela (screen)
const checkScreenPermission = (screen, permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Administradores têm todas as permissões
      if (user.tipo_de_acesso === 'administrador') {
        return next();
      }

      // Buscar permissões do usuário para a tela específica
      const permissoes = await executeQuery(
        `SELECT pode_visualizar, pode_criar, pode_editar, pode_excluir, pode_movimentar 
         FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [user.id, screen]
      );

      if (permissoes.length === 0) {
        // Temporariamente permitir acesso se não encontrar permissões específicas
        return next();
      }

      const permissao = permissoes[0];
      
      // Mapear permissões
      const permissionMap = {
        'visualizar': permissao.pode_visualizar,
        'criar': permissao.pode_criar,
        'editar': permissao.pode_editar,
        'excluir': permissao.pode_excluir,
        'movimentar': permissao.pode_movimentar
      };

      if (permissionMap[permission]) {
        return next();
      }

      return res.status(403).json({ error: 'Permissão insuficiente para esta ação' });
      
    } catch (error) {
      console.error('Erro ao verificar permissões da tela:', error);
      return res.status(500).json({ error: 'Erro interno ao verificar permissões' });
    }
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
const generateToken = async (userId, expiresIn = '24h') => {
  try {
    // Buscar o email do usuário para incluir no token
    const user = await executeQuery(
      'SELECT email FROM usuarios WHERE id = ?',
      [userId]
    );
    
    if (user.length === 0) {
      throw new Error('Usuário não encontrado para gerar token');
    }
    
    // Incluir userId e email no token para compatibilidade entre sistemas
    return jwt.sign({ 
      userId, 
      email: user[0].email 
    }, JWT_SECRET, { expiresIn });
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    // Fallback: gerar token apenas com userId
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
  }
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkScreenPermission,
  checkAccessType,
  generateToken
};
