/**
 * Rotas para gerenciar entregas agendadas
 */

const express = require('express');
const router = express.Router();
const {
  listarEntregas,
  criarEntrega,
  atualizarEntrega,
  excluirEntrega,
  buscarEntregaPorId
} = require('../../controllers/periodicidade/EntregasController');

// Middleware de autenticação (se necessário)
// const auth = require('../../middleware/auth');

/**
 * @route GET /api/periodicidade/:agrupamentoId/entregas
 * @desc Listar entregas de um agrupamento
 * @access Private
 */
router.get('/:agrupamentoId/entregas', listarEntregas);

/**
 * @route POST /api/periodicidade/:agrupamentoId/entregas
 * @desc Criar nova entrega
 * @access Private
 */
router.post('/:agrupamentoId/entregas', criarEntrega);

/**
 * @route GET /api/periodicidade/entregas/:id
 * @desc Buscar entrega por ID
 * @access Private
 */
router.get('/entregas/:id', buscarEntregaPorId);

/**
 * @route PUT /api/periodicidade/entregas/:id
 * @desc Atualizar entrega
 * @access Private
 */
router.put('/entregas/:id', atualizarEntrega);

/**
 * @route DELETE /api/periodicidade/entregas/:id
 * @desc Excluir entrega
 * @access Private
 */
router.delete('/entregas/:id', excluirEntrega);

module.exports = router;
