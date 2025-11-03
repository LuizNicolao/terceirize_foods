const express = require('express');
const router = express.Router();

// Controllers
const {
  NecessidadesPadroesListController,
  NecessidadesPadroesCRUDController,
  NecessidadesPadroesGeracaoController
} = require('../../controllers/necessidades-padroes');

// Middleware de autenticação e permissões
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas CRUD
router.get('/', canView('necessidades_padroes'), NecessidadesPadroesListController.listar);
router.get('/:id', canView('necessidades_padroes'), NecessidadesPadroesCRUDController.buscarPorId);
router.post('/', canCreate('necessidades_padroes'), NecessidadesPadroesCRUDController.criar);
router.put('/:id', canEdit('necessidades_padroes'), NecessidadesPadroesCRUDController.atualizar);
router.delete('/:id', canDelete('necessidades_padroes'), NecessidadesPadroesCRUDController.excluir);

// Rotas específicas
router.get('/escola/:escola_id/grupo/:grupo_id', canView('necessidades_padroes'), NecessidadesPadroesListController.buscarPorEscolaGrupo);
router.post('/salvar-padrao', canCreate('necessidades_padroes'), NecessidadesPadroesCRUDController.salvarPadrao);

// Rotas de geração
router.post('/gerar-necessidades', canCreate('necessidades_padroes'), NecessidadesPadroesGeracaoController.gerarNecessidadesPadrao);
router.get('/buscar-semana-consumo', canView('necessidades_padroes'), NecessidadesPadroesGeracaoController.buscarSemanaConsumoPorAbastecimento);

module.exports = router;
