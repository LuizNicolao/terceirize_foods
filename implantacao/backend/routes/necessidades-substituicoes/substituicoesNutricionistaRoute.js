const express = require('express');
const router = express.Router();
const SubstituicoesNutricionistaController = require('../../controllers/necessidades-substituicoes/SubstituicoesNutricionistaController');
const { authenticateToken } = require('../../middleware/auth');

// Middleware para verificar se tem acesso à funcionalidade
const hasAccessToAdjustment = (req, res, next) => {
  const tiposComAcesso = ['nutricionista', 'coordenador', 'supervisor', 'administrador'];
  
  if (!tiposComAcesso.includes(req.user.tipo_de_acesso)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado',
      message: 'Você não tem permissão para acessar esta funcionalidade'
    });
  }
  next();
};

/**
 * Rotas para substituições do nutricionista
 * Status: 'pendente' (criação e edição)
 */

// GET /necessidades-substituicoes/nutricionista - Listar necessidades para nutricionista
router.get('/', authenticateToken, hasAccessToAdjustment, SubstituicoesNutricionistaController.listarParaNutricionista);

// POST /necessidades-substituicoes/nutricionista/iniciar-ajustes - Iniciar ajustes
router.post('/iniciar-ajustes', authenticateToken, hasAccessToAdjustment, SubstituicoesNutricionistaController.iniciarAjustes);

// PUT /necessidades-substituicoes/nutricionista/liberar-coordenacao - Liberar para coordenação
router.put('/liberar-coordenacao', authenticateToken, hasAccessToAdjustment, SubstituicoesNutricionistaController.liberarParaCoordenacao);

module.exports = router;
