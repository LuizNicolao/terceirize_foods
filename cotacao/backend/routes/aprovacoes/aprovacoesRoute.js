/**
 * Rotas de Aprovações
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const router = express.Router();
const AprovacoesController = require('../../controllers/aprovacoes/AprovacoesController');

// Debug: verificar se o controller foi importado (comentado para limpeza)
// console.log('📦 AprovacoesController importado:', !!AprovacoesController);
const { authenticateToken, checkPermission } = require('../../middleware/auth');

// Debug: verificar se o middleware foi importado (comentado para limpeza)
// console.log('📦 Middleware de auth importado:', !!authenticateToken, !!checkPermission);
const { 
  aprovacoesValidation, 
  aprovacaoValidation, 
  aprovarCotacaoValidation, 
  rejeitarCotacaoValidation 
} = require('./aprovacoesValidator');

// Debug: verificar se o validator foi importado (comentado para limpeza)
// console.log('📦 Validators importados:', !!aprovacoesValidation, !!aprovacaoValidation, !!aprovarCotacaoValidation, !!rejeitarCotacaoValidation);

// Rotas básicas de aprovações
router.get('/', authenticateToken, checkPermission('visualizar'), aprovacoesValidation, AprovacoesController.getAprovacoes);

// Rotas de estatísticas
router.get('/stats/overview', authenticateToken, checkPermission('visualizar'), AprovacoesController.getStatsOverview);

// Rotas de exportação
router.get('/export/xlsx', authenticateToken, checkPermission('visualizar'), AprovacoesController.exportXLSX);
router.get('/export/pdf', authenticateToken, checkPermission('visualizar'), AprovacoesController.exportPDF);

// Rotas de teste removidas

// Rotas com parâmetros (deve vir depois das rotas específicas)
router.get('/:id', authenticateToken, checkPermission('visualizar'), aprovacaoValidation, AprovacoesController.getAprovacao);
router.post('/:id/aprovar', authenticateToken, checkPermission('editar'), aprovacaoValidation, aprovarCotacaoValidation, AprovacoesController.aprovarCotacao);
router.post('/:id/rejeitar', authenticateToken, checkPermission('editar'), aprovacaoValidation, rejeitarCotacaoValidation, AprovacoesController.rejeitarCotacao);
router.post('/:id/renegociar', authenticateToken, checkPermission('editar'), aprovacaoValidation, AprovacoesController.renegociarCotacao);

// Debug: verificar se o router foi criado (comentado para limpeza)
// console.log('📦 Router de aprovações criado:', !!router);

module.exports = router;
