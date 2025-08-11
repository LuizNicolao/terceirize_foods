const express = require('express');
const router = express.Router();
const cotacoesController = require('../../controllers/cotacoesController');
const { authenticateToken } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const {
  validateCreateCotacao,
  validateUpdateCotacao,
  validateGetCotacoes,
  validateCotacaoId,
  validateAprovarCotacao,
  validateRejeitarCotacao
} = require('./cotacaoValidator');

// Rotas principais
router.get('/', authenticateToken, validateGetCotacoes, validate, cotacoesController.getCotacoes);
router.get('/stats/overview', authenticateToken, cotacoesController.getStats);
router.get('/pendentes-supervisor', authenticateToken, cotacoesController.getCotacoesPendentesSupervisor);
router.get('/aprovacoes', authenticateToken, cotacoesController.getCotacoesAprovacao);
router.post('/', authenticateToken, validateCreateCotacao, validate, cotacoesController.createCotacao);

// Rotas de workflow
router.post('/:id/enviar-supervisor', authenticateToken, validateCotacaoId, validate, cotacoesController.enviarParaSupervisor);
router.post('/:id/aprovar', authenticateToken, validateAprovarCotacao, validate, cotacoesController.aprovarCotacao);
router.post('/:id/rejeitar', authenticateToken, validateRejeitarCotacao, validate, cotacoesController.rejeitarCotacao);

// Rotas com parâmetros (devem vir por último para evitar conflitos)
router.get('/:id', authenticateToken, validateCotacaoId, validate, cotacoesController.getCotacaoById);
router.put('/:id', authenticateToken, validateUpdateCotacao, validate, cotacoesController.updateCotacao);
router.delete('/:id', authenticateToken, validateCotacaoId, validate, cotacoesController.deleteCotacao);

module.exports = router;
