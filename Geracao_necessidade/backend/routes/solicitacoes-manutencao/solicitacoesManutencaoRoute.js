const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');
const { 
  listar, 
  listarTodas,
  criar, 
  atualizar, 
  deletar, 
  buscarPorId,
  obterEstatisticas,
  obterResumo
} = require('../../controllers/solicitacoes-manutencao');
const { listar: listarEscolas } = require('../../controllers/escolas/EscolasListController');
const { 
  validateCriarSolicitacao, 
  validateAtualizarSolicitacao 
} = require('./solicitacoesManutencaoValidator');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.get('/escolas', canView('solicitacoes-manutencao'), listarEscolas);

// ===== ROTAS CRUD =====
router.get('/', canView('solicitacoes-manutencao'), listar);
router.get('/todas', canView('solicitacoes-manutencao'), listarTodas);
router.get('/:id', canView('solicitacoes-manutencao'), buscarPorId);
router.post('/', canCreate('solicitacoes-manutencao'), validateCriarSolicitacao, criar);
router.put('/:id', canEdit('solicitacoes-manutencao'), validateAtualizarSolicitacao, atualizar);
router.delete('/:id', canDelete('solicitacoes-manutencao'), deletar);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', canView('solicitacoes-manutencao'), obterEstatisticas);
router.get('/stats/resumo', canView('solicitacoes-manutencao'), obterResumo);

module.exports = router;
