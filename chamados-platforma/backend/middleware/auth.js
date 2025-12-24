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
    console.warn('[authenticateToken] Token não fornecido', { ip: req.ip, path: req.path });
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (verifyError) {
      console.error('[authenticateToken] Falha ao verificar token', {
        message: verifyError.message,
        name: verifyError.name,
        path: req.path,
        ip: req.ip
      });
      return res.status(403).json({ error: 'Token inválido' });
    }

    const user = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE id = ?',
      [decoded.userId]
    );

    if (user.length === 0) {
      console.warn('[authenticateToken] Usuário não encontrado', {
        userId: decoded.userId,
        path: req.path
      });
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (user[0].status === 'bloqueado') {
      console.warn('[authenticateToken] Usuário bloqueado', {
        userId: decoded.userId,
        path: req.path
      });
      return res.status(403).json({ error: 'Usuário bloqueado. Procure o administrador.' });
    }

    if (user[0].status !== 'ativo') {
      console.warn('[authenticateToken] Usuário inativo', {
        userId: decoded.userId,
        status: user[0].status
      });
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    console.error('[authenticateToken] Erro inesperado', {
      message: error.message,
      stack: error.stack,
      path: req.path
    });
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar permissões específicas
const checkPermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    
    // Verificar se o usuário está autenticado
    if (!user) {
      console.warn('[checkPermission] Usuário não autenticado', { path: req.path, ip: req.ip });
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
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

    return res.status(403).json({ 
      error: 'Permissão insuficiente',
      details: {
        requiredPermission: permission,
        userLevel: user.nivel_de_acesso,
        userType: user.tipo_de_acesso,
        availablePermissions: userPermissions
      }
    });
  };
};

// Middleware para verificar permissões por tela (screen)
const checkScreenPermission = (screen, permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Verificar se o usuário está autenticado
      if (!user) {
        console.warn('[checkScreenPermission] Usuário não autenticado', { path: req.path, ip: req.ip });
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      // Administradores têm todas as permissões
      if (user.tipo_de_acesso === 'administrador') {
        return next();
      }

      // Buscar permissões do usuário para a tela específica (incluindo permissões específicas de chamados)
      const permissoes = await executeQuery(
        `SELECT pode_visualizar, pode_criar, pode_editar, pode_excluir, pode_movimentar,
                pode_assumir, pode_concluir, pode_reabrir, pode_atribuir
         FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [user.id, screen]
      );

      if (permissoes.length === 0) {
        // NEGAR acesso se não encontrar permissões específicas (segurança por padrão)
        console.warn('[checkScreenPermission] Nenhuma permissão específica encontrada - ACESSO NEGADO', {
          userId: user.id,
          tipo_de_acesso: user.tipo_de_acesso,
          nivel_de_acesso: user.nivel_de_acesso,
          screen,
          permission,
          path: req.path
        });
        return res.status(403).json({ 
          error: 'Permissão não configurada para esta tela',
          details: {
            screen,
            requiredPermission: permission,
            userLevel: user.nivel_de_acesso,
            userType: user.tipo_de_acesso,
            message: 'Permissões não foram configuradas para este usuário nesta tela. Contate o administrador.'
          }
        });
      }

      const permissao = permissoes[0];
      
      // Mapear permissões - converter explicitamente 0/1 para boolean
      // Incluir permissões específicas de chamados se disponíveis
      const permissionMap = {
        'visualizar': permissao.pode_visualizar === 1 || permissao.pode_visualizar === true,
        'criar': permissao.pode_criar === 1 || permissao.pode_criar === true,
        'editar': permissao.pode_editar === 1 || permissao.pode_editar === true,
        'excluir': permissao.pode_excluir === 1 || permissao.pode_excluir === true,
        'movimentar': permissao.pode_movimentar === 1 || permissao.pode_movimentar === true,
        // Permissões específicas de chamados (retornam false se não existirem na tabela)
        'assumir': (permissao.pode_assumir === 1 || permissao.pode_assumir === true) || false,
        'concluir': (permissao.pode_concluir === 1 || permissao.pode_concluir === true) || false,
        'reabrir': (permissao.pode_reabrir === 1 || permissao.pode_reabrir === true) || false,
        'atribuir': (permissao.pode_atribuir === 1 || permissao.pode_atribuir === true) || false
      };

      // Verificar se a permissão específica está habilitada
      if (permissionMap[permission] === true) {
        return next();
      }

      return res.status(403).json({ 
        error: 'Permissão insuficiente para esta ação',
        details: {
          screen,
          requiredPermission: permission,
          userLevel: user.nivel_de_acesso,
          userType: user.tipo_de_acesso,
          availablePermissions: permissionMap
        }
      });
      
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
    
    // Verificar se o usuário está autenticado
    if (!user) {
      console.warn('[checkAccessType] Usuário não autenticado', { path: req.path, ip: req.ip });
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (allowedTypes.includes(user.tipo_de_acesso)) {
      return next();
    }

    return res.status(403).json({ error: 'Tipo de acesso não autorizado' });
  };
};

// Gerar token JWT
const generateToken = async (userId, expiresIn = '24h') => {
  try {
    const user = await executeQuery(
      'SELECT email FROM usuarios WHERE id = ?',
      [userId]
    );
    
    if (user.length === 0) {
      throw new Error('Usuário não encontrado para gerar token');
    }
    
    return jwt.sign({ 
      userId, 
      email: user[0].email 
    }, JWT_SECRET, { expiresIn });
  } catch (error) {
    console.error('Erro ao gerar token:', error);
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

