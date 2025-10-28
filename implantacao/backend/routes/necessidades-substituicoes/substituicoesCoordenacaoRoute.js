const express = require('express');
const router = express.Router();
const SubstituicoesCoordenacaoController = require('../../controllers/necessidades-substituicoes/SubstituicoesCoordenacaoController');
const { authenticateToken } = require('../../middleware/auth');

// Middleware para verificar se é coordenador ou supervisor
const canApprove = (req, res, next) => {
  const userType = req.user.tipo_de_acesso;
  
  if (!['coordenador', 'supervisor', 'administrador'].includes(userType)) {
    return res.status(403).json({
      success: false,
      message: 'Apenas coordenadores e supervisores podem acessar esta funcionalidade'
    });
  }
  
  next();
};

/**
 * Rotas para substituições da coordenação
 * Status: 'conf' (aprovação e edição final)
 */

// GET /necessidades-substituicoes/coordenacao - Listar necessidades para coordenação
router.get('/', authenticateToken, canApprove, SubstituicoesCoordenacaoController.listarParaCoordenacao);

// PUT /necessidades-substituicoes/coordenacao/:id/aprovar - Aprovar substituição individual
router.put('/:id/aprovar', authenticateToken, canApprove, SubstituicoesCoordenacaoController.aprovarSubstituicao);

// PUT /necessidades-substituicoes/coordenacao/:id/rejeitar - Rejeitar substituição individual
router.put('/:id/rejeitar', authenticateToken, canApprove, SubstituicoesCoordenacaoController.rejeitarSubstituicao);

// PUT /necessidades-substituicoes/coordenacao/aprovar-todas - Aprovar todas as substituições
router.put('/aprovar-todas', authenticateToken, canApprove, SubstituicoesCoordenacaoController.aprovarTodas);

module.exports = router;
