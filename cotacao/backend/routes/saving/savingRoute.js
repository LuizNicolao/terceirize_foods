const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../../middleware/auth');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const SavingController = require('../../controllers/saving/SavingController');

// Middleware de autenticação para todas as rotas
router.use(auth);

// Middleware HATEOAS para saving
router.use(hateoasMiddleware('saving'));

/**
 * @route   GET /api/saving
 * @desc    Listar registros de Saving com filtros e paginação
 * @access  Private
 */
router.get('/', SavingController.listarSaving);

/**
 * @route   GET /api/saving/estatisticas
 * @desc    Obter estatísticas de saving
 * @access  Private
 */
router.get('/estatisticas', SavingController.obterEstatisticas);

/**
 * @route   GET /api/saving/:id
 * @desc    Obter detalhes de um registro de Saving
 * @access  Private
 */
router.get('/:id', SavingController.obterSaving);
router.get('/:id/itens', SavingController.obterSavingItens);

/**
 * @route   POST /api/saving
 * @desc    Criar novo registro de Saving
 * @access  Private
 */
router.post('/', SavingController.criarSaving);

/**
 * @route   PUT /api/saving/:id
 * @desc    Atualizar registro de Saving
 * @access  Private
 */
router.put('/:id', SavingController.atualizarSaving);

/**
 * @route   DELETE /api/saving/:id
 * @desc    Excluir registro de Saving
 * @access  Private
 */
router.delete('/:id', SavingController.excluirSaving);

/**
 * @route   GET /api/saving/:id/resumo
 * @desc    Obter resumo de um registro de Saving
 * @access  Private
 */
router.get('/:id/resumo', SavingController.obterResumoSaving);

/**
 * @route   POST /api/saving/:id/aprovar
 * @desc    Aprovar registro de Saving
 * @access  Private
 */
router.post('/:id/aprovar', SavingController.aprovarSaving);

/**
 * @route   POST /api/saving/:id/rejeitar
 * @desc    Rejeitar registro de Saving
 * @access  Private
 */
router.post('/:id/rejeitar', SavingController.rejeitarSaving);

module.exports = router;
