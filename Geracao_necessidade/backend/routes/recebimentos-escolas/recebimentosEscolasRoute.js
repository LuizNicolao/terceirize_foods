const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { 
  listar, 
  listarTodas,
  buscarPorId, 
  criar, 
  atualizar, 
  deletar,
  obterEstatisticas,
  obterResumo,
  listarProdutosPorTipo
} = require('../../controllers/recebimentos-escolas');
const { 
  canView, 
  canCreate, 
  canEdit, 
  canDelete 
} = require('../../middleware/permissoes');

// Importar função para listar escolas
const { listarEscolasNutricionista } = require('../../controllers/medias-escolas');

router.use(authenticateToken);

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.get('/escolas', canView('recebimentos-escolas'), listarEscolasNutricionista);
router.get('/produtos', canView('recebimentos-escolas'), listarProdutosPorTipo);

// ===== ROTAS CRUD =====
router.get('/', canView('recebimentos-escolas'), listar);
router.get('/todas', canView('recebimentos-escolas'), listarTodas);
router.get('/:id', canView('recebimentos-escolas'), buscarPorId);
router.post('/', canCreate('recebimentos-escolas'), criar);
router.put('/:id', canEdit('recebimentos-escolas'), atualizar);
router.delete('/:id', canDelete('recebimentos-escolas'), deletar);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', canView('recebimentos-escolas'), obterEstatisticas);
router.get('/stats/resumo', canView('recebimentos-escolas'), obterResumo);

module.exports = router;
