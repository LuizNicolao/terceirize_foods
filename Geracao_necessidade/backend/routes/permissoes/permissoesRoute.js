const express = require('express');
const { authenticateToken, requireCoordenacao } = require('../../middleware/auth');
const { 
  listar, 
  atualizar, 
  resetarPadrao, 
  verificarPermissao,
  sincronizarPermissoes,
  obterEstatisticas,
  obterResumo,
  criar,
  deletar,
  buscarPorId
} = require('../../controllers/permissoes');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS CRUD =====
router.get('/me', listar);
router.get('/:usuario_id', requireCoordenacao, listar);
router.get('/:id', requireCoordenacao, buscarPorId);
router.post('/', requireCoordenacao, criar);
router.put('/:usuario_id', requireCoordenacao, atualizar);
router.delete('/:id', requireCoordenacao, deletar);

// ===== ROTAS ESPECÍFICAS =====
router.get('/:usuario_id/:tela/:acao', verificarPermissao);
router.post('/:usuario_id/reset', requireCoordenacao, resetarPadrao);
router.post('/sincronizar', requireCoordenacao, sincronizarPermissoes);

// ===== ROTAS DE ESTATÍSTICAS =====
router.get('/stats/estatisticas', requireCoordenacao, obterEstatisticas);
router.get('/stats/resumo', requireCoordenacao, obterResumo);

module.exports = router;
