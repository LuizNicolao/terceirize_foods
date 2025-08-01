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

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE id = ?',
      [decoded.userId]
    );

    if (user.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (user[0].status === 'bloqueado') {
      return res.status(403).json({ error: 'Usuário bloqueado. Procure o administrador.' });
    }

    if (user[0].status !== 'ativo') {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar permissões específicas
const checkPermission = (permission) => {
  return (req, res, next) => {
    console.log('Debug - checkPermission chamado');
    console.log('Debug - permission:', permission);
    console.log('Debug - user:', req.user);
    
    const user = req.user;
    
    // Administradores têm todas as permissões
    if (user.tipo_de_acesso === 'administrador') {
      console.log('Debug - Usuário é administrador, permitindo acesso');
      return next();
    }

    // Verificar nível de acesso
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    const userPermissions = accessLevels[user.nivel_de_acesso] || [];
    console.log('Debug - userPermissions:', userPermissions);
    console.log('Debug - user.nivel_de_acesso:', user.nivel_de_acesso);
    
    if (userPermissions.includes(permission)) {
      console.log('Debug - Permissão concedida');
      return next();
    }

    console.log('Debug - Permissão negada');
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
        `SELECT pode_visualizar, pode_criar, pode_editar, pode_excluir 
         FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [user.id, screen]
      );

      if (permissoes.length === 0) {
        // Temporariamente permitir acesso se não encontrar permissões específicas
        console.log(`Permissão não encontrada para usuário ${user.id} na tela ${screen} - permitindo acesso`);
        return next();
      }

      const permissao = permissoes[0];
      
      // Mapear permissões
      const permissionMap = {
        'visualizar': permissao.pode_visualizar,
        'criar': permissao.pode_criar,
        'editar': permissao.pode_editar,
        'excluir': permissao.pode_excluir
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
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkScreenPermission,
  checkAccessType,
  generateToken
}; 