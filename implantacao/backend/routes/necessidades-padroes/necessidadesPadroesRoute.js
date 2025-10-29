const express = require('express');
const router = express.Router();

// Controllers
const {
  NecessidadesPadroesListController,
  NecessidadesPadroesCRUDController
} = require('../../controllers/necessidades-padroes');

// Middleware de autenticação e permissões
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas CRUD
router.get('/', canView('necessidades-padroes'), NecessidadesPadroesListController.listar);
router.get('/:id', canView('necessidades-padroes'), NecessidadesPadroesCRUDController.buscarPorId);
router.post('/', canCreate('necessidades-padroes'), NecessidadesPadroesCRUDController.criar);
router.put('/:id', canEdit('necessidades-padroes'), NecessidadesPadroesCRUDController.atualizar);
router.delete('/:id', canDelete('necessidades-padroes'), NecessidadesPadroesCRUDController.excluir);

// Rotas específicas
router.get('/escola/:escola_id/grupo/:grupo_id', canView('necessidades-padroes'), NecessidadesPadroesListController.buscarPorEscolaGrupo);
router.post('/salvar-padrao', canCreate('necessidades-padroes'), NecessidadesPadroesCRUDController.salvarPadrao);

module.exports = router;
