/**
 * Middleware de Autenticação
 * Implementa autenticação JWT e verificação de permissões
 */

const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const { 
  unauthorizedResponse, 
  forbiddenResponse,
  errorResponse,
  STATUS_CODES 
} = require('./responseHandler');

// Middleware de autenticação JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return unauthorizedResponse(res, 'Token de acesso necessário');
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return unauthorizedResponse(res, 'Token expirado');
        }
        return unauthorizedResponse(res, 'Token inválido');
      }

      // Buscar usuário no banco para verificar se ainda existe e está ativo
      try {
        const users = await executeQuery(
          'SELECT id, name, email, role, status FROM users WHERE id = ?',
          [decoded.id]
        );

        if (users.length === 0) {
          return unauthorizedResponse(res, 'Usuário não encontrado');
        }

        const user = users[0];

        if (user.status !== 1) {
          return forbiddenResponse(res, 'Usuário inativo');
        }

        // Adicionar informações do usuário ao request
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };

        next();
      } catch (dbError) {
        console.error('Erro ao verificar usuário:', dbError);
        return errorResponse(res, 'Erro interno do servidor', STATUS_CODES.INTERNAL_SERVER_ERROR);
      }
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return errorResponse(res, 'Erro interno do servidor', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// Middleware para verificar permissões por role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, 'Usuário não autenticado');
    }

    const userRole = req.user.role;
    
    if (Array.isArray(roles)) {
      if (!roles.includes(userRole)) {
        return forbiddenResponse(res, 'Acesso negado - permissão insuficiente');
      }
    } else {
      if (userRole !== roles) {
        return forbiddenResponse(res, 'Acesso negado - permissão insuficiente');
      }
    }

    next();
  };
};

// Middleware para verificar se o usuário é o proprietário do recurso
const requireOwnership = (resourceTable, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return unauthorizedResponse(res, 'Usuário não autenticado');
      }

      const userId = req.user.id;
      const userRole = req.user.role;
      const resourceId = req.params[resourceIdField];

      // Gestores e administradores podem acessar qualquer recurso
      if (['gestor', 'administrador'].includes(userRole)) {
        return next();
      }

      // Verificar se o usuário é o proprietário do recurso
      const resource = await executeQuery(
        `SELECT comprador FROM ${resourceTable} WHERE ${resourceIdField} = ?`,
        [resourceId]
      );

      if (resource.length === 0) {
        return errorResponse(res, 'Recurso não encontrado', STATUS_CODES.NOT_FOUND);
      }

      if (resource[0].comprador !== userId) {
        return forbiddenResponse(res, 'Acesso negado - você não é o proprietário deste recurso');
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de ownership:', error);
      return errorResponse(res, 'Erro interno do servidor', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  };
};

// Middleware para verificar se o usuário pode editar a cotação
const canEditCotacao = async (req, res, next) => {
  try {
    if (!req.user) {
      return unauthorizedResponse(res, 'Usuário não autenticado');
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const cotacaoId = req.params.id;

    // Gestores e administradores podem editar qualquer cotação
    if (['gestor', 'administrador'].includes(userRole)) {
      return next();
    }

    // Verificar se a cotação existe e qual o status
    const cotacao = await executeQuery(
      'SELECT comprador, status FROM cotacoes WHERE id = ?',
      [cotacaoId]
    );

    if (cotacao.length === 0) {
      return errorResponse(res, 'Cotação não encontrada', STATUS_CODES.NOT_FOUND);
    }

    const cotacaoData = cotacao[0];

    // Verificar se o usuário é o comprador
    if (cotacaoData.comprador !== userId) {
      return forbiddenResponse(res, 'Acesso negado - você não é o comprador desta cotação');
    }

    // Verificar se a cotação pode ser editada
    if (['em_analise', 'aprovada', 'rejeitada'].includes(cotacaoData.status)) {
      return forbiddenResponse(res, 'Não é possível editar uma cotação em análise, aprovada ou rejeitada');
    }

    next();
  } catch (error) {
    console.error('Erro no middleware canEditCotacao:', error);
    return errorResponse(res, 'Erro interno do servidor', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership,
  canEditCotacao
}; 