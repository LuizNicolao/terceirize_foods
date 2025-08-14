/**
 * Rotas de Cotações
 * Implementa padrões RESTful com validação, paginação, HATEOAS e organização modular
 */

const express = require('express');
const { auth } = require('../../middleware/auth');
const { validateCotacao } = require('./cotacaoValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { asyncErrorHandler } = require('../../middleware/errorHandler');
const cotacoesController = require('../../controllers/cotacoes');

const router = express.Router();

// Aplicar middlewares globais
router.use(auth);
// router.use(paginationMiddleware); // Comentado temporariamente para debug
// router.use(hateoasMiddleware('cotacoes')); // Comentado temporariamente para debug

// ===== ROTAS PRINCIPAIS DE COTAÇÕES =====

// Listar cotações
router.get('/', asyncErrorHandler(cotacoesController.listarCotacoes));

// Buscar cotação por ID
router.get('/:id', asyncErrorHandler(cotacoesController.buscarCotacaoPorId));

// Criar cotação
router.post('/', validateCotacao, asyncErrorHandler(cotacoesController.criarCotacao));

// Atualizar cotação
router.put('/:id', validateCotacao, asyncErrorHandler(cotacoesController.atualizarCotacao));

// Excluir cotação
router.delete('/:id', asyncErrorHandler(cotacoesController.excluirCotacao));

// ===== ROTAS ESPECÍFICAS =====

// Enviar para supervisor
router.post('/:id/enviar-supervisor', asyncErrorHandler(cotacoesController.enviarParaSupervisor));

// Cotações pendentes para supervisor
router.get('/pendentes-supervisor/listar', asyncErrorHandler(cotacoesController.listarPendentesSupervisor));

// Aprovações
router.get('/aprovacoes/listar', asyncErrorHandler(cotacoesController.listarAprovacoes));

// ===== ROTAS DE ESTATÍSTICAS =====

// Estatísticas gerais
router.get('/stats/overview', asyncErrorHandler(cotacoesController.buscarEstatisticas));

// Estatísticas por período
router.get('/stats/por-periodo', asyncErrorHandler(cotacoesController.buscarEstatisticasPorPeriodo));

// Estatísticas por usuário
router.get('/stats/por-usuario', asyncErrorHandler(cotacoesController.buscarEstatisticasPorUsuario));

// Estatísticas por tipo de compra
router.get('/stats/por-tipo', asyncErrorHandler(cotacoesController.buscarEstatisticasPorTipo));

// Resumo geral
router.get('/stats/resumo', asyncErrorHandler(cotacoesController.buscarResumoGeral));

module.exports = router;
