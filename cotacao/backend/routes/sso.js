const express = require('express');
const { validateSSO, checkModuleAccess } = require('../middleware/sso');
const { successResponse, errorResponse } = require('../middleware/responseHandler');

const router = express.Router();

// POST /api/sso/validate - Validar token SSO e retornar dados do usuário
router.post('/validate', validateSSO, checkModuleAccess, (req, res) => {
  try {
    // Retornar dados do usuário sem informações sensíveis
    const userData = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      permissions: req.user.permissions
    };

    return successResponse(res, userData, 'Token SSO válido');
  } catch (error) {
    console.error('Erro ao validar SSO:', error);
    return errorResponse(res, 'Erro interno do servidor', 500);
  }
});

// GET /api/sso/user - Obter dados do usuário atual (para uso interno)
router.get('/user', validateSSO, (req, res) => {
  try {
    const userData = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      permissions: req.user.permissions
    };

    return successResponse(res, userData, 'Dados do usuário obtidos com sucesso');
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return errorResponse(res, 'Erro interno do servidor', 500);
  }
});

module.exports = router;
