const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona o usuário ao request
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Token de acesso necessário',
          code: 'TOKEN_REQUIRED'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar dados completos do usuário no banco
    const user = await executeQuery(
      'SELECT id, name, email, role, status FROM users WHERE id = ? AND status = "ativo"',
      [decoded.userId]
    );

    if (!user || user.length === 0) {
      return res.status(401).json({
        error: {
          message: 'Usuário não encontrado ou inativo',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    req.user = user[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          message: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        }
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      error: {
        message: 'Erro interno na autenticação',
        code: 'AUTH_ERROR'
      }
    });
  }
};

/**
 * Middleware de verificação de permissões
 * @param {string} resource - Recurso a ser verificado
 * @param {string} action - Ação a ser verificada (criar, visualizar, editar, excluir)
 */
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      // Administradores têm acesso total
      if (req.user.role === 'administrador') {
        return next();
      }

      // Buscar permissões do usuário
      const permissions = await executeQuery(
        `SELECT permission FROM user_permissions 
         WHERE user_id = ? AND resource = ? AND action = ?`,
        [req.user.id, resource, action]
      );

      if (permissions.length === 0) {
        return res.status(403).json({
          error: {
            message: 'Acesso negado. Permissão insuficiente.',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: { resource, action }
          }
        });
      }

      next();
    } catch (error) {
      console.error('Erro na verificação de permissões:', error);
      return res.status(500).json({
        error: {
          message: 'Erro interno na verificação de permissões',
          code: 'PERMISSION_ERROR'
        }
      });
    }
  };
};

/**
 * Middleware para verificar se o usuário é gestor ou administrador
 */
const requireGestorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      }
    });
  }

  if (!['gestor', 'administrador'].includes(req.user.role)) {
    return res.status(403).json({
      error: {
        message: 'Acesso negado. Apenas gestores e administradores.',
        code: 'INSUFFICIENT_ROLE'
      }
    });
  }

  next();
};

/**
 * Middleware para verificar se o usuário é supervisor ou superior
 */
const requireSupervisorOrHigher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      }
    });
  }

  if (!['supervisor', 'gestor', 'administrador'].includes(req.user.role)) {
    return res.status(403).json({
      error: {
        message: 'Acesso negado. Apenas supervisores e superiores.',
        code: 'INSUFFICIENT_ROLE'
      }
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  checkPermission,
  requireGestorOrAdmin,
  requireSupervisorOrHigher
};
