const express = require('express');
const router = express.Router();
const SubstituicoesNutricionistaController = require('../../controllers/necessidades-substituicoes/SubstituicoesNutricionistaController');
const { authenticateToken } = require('../../middleware/auth');
const { hasAccessToAdjustment } = require('../../middleware/permissoes');

/**
 * Rotas para substituições do nutricionista
 * Status: 'pendente' (criação e edição)
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Middleware de permissão para substituições do nutricionista
router.use(hasAccessToAdjustment);

/**
 * @route GET /necessidades-substituicoes/nutricionista
 * @desc Listar necessidades para nutricionista (sem substituições)
 * @access Private (Nutricionista)
 */
router.get('/', SubstituicoesNutricionistaController.listarParaNutricionista);

/**
 * @route POST /necessidades-substituicoes/nutricionista/iniciar-ajustes
 * @desc Iniciar ajustes (criar registros iniciais)
 * @access Private (Nutricionista)
 */
router.post('/iniciar-ajustes', SubstituicoesNutricionistaController.iniciarAjustes);

/**
 * @route PUT /necessidades-substituicoes/nutricionista/liberar-coordenacao
 * @desc Liberar para coordenação (mudar status para 'conf')
 * @access Private (Nutricionista)
 */
router.put('/liberar-coordenacao', SubstituicoesNutricionistaController.liberarParaCoordenacao);

module.exports = router;
