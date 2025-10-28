const express = require('express');
const router = express.Router();
const SubstituicoesCoordenacaoController = require('../../controllers/necessidades-substituicoes/SubstituicoesCoordenacaoController');
const { authenticateToken } = require('../../middleware/auth');
const { canApprove } = require('../../middleware/permissions');

/**
 * Rotas para substituições da coordenação
 * Status: 'conf' (aprovação e edição final)
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Middleware de permissão para coordenação
router.use(canApprove);

/**
 * @route GET /necessidades-substituicoes/coordenacao
 * @desc Listar necessidades para coordenação (status 'conf')
 * @access Private (Coordenação)
 */
router.get('/', SubstituicoesCoordenacaoController.listarParaCoordenacao);

/**
 * @route PUT /necessidades-substituicoes/coordenacao/:id/aprovar
 * @desc Aprovar substituição individual
 * @access Private (Coordenação)
 */
router.put('/:id/aprovar', SubstituicoesCoordenacaoController.aprovarSubstituicao);

/**
 * @route PUT /necessidades-substituicoes/coordenacao/:id/rejeitar
 * @desc Rejeitar substituição individual
 * @access Private (Coordenação)
 */
router.put('/:id/rejeitar', SubstituicoesCoordenacaoController.rejeitarSubstituicao);

/**
 * @route PUT /necessidades-substituicoes/coordenacao/aprovar-todas
 * @desc Aprovar todas as substituições
 * @access Private (Coordenação)
 */
router.put('/aprovar-todas', SubstituicoesCoordenacaoController.aprovarTodas);

module.exports = router;
