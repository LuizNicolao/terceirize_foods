const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const SubstituicoesController = require('../../controllers/necessidades-substituicoes');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS DE LISTAGEM =====

// GET /api/necessidades-substituicoes/listar
// Lista necessidades com status CONF agrupadas por produto origem
router.get(
  '/listar',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.listarParaSubstituicao
);

// GET /api/necessidades-substituicoes/buscar-semana-consumo
// Busca semana de consumo por semana de abastecimento
router.get(
  '/buscar-semana-consumo',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.buscarSemanaConsumo
);

// GET /api/necessidades-substituicoes/produtos-genericos
// Busca produtos genéricos do Foods
router.get(
  '/produtos-genericos',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.buscarProdutosGenericos
);

// ===== ROTAS CRUD =====

// POST /api/necessidades-substituicoes
// Salvar substituição (consolidada ou individual)
router.post(
  '/',
  checkScreenPermission('necessidades', 'criar'),
  SubstituicoesController.salvarSubstituicao
);

// DELETE /api/necessidades-substituicoes/:id
// Deletar substituição (soft delete)
router.delete(
  '/:id',
  checkScreenPermission('necessidades', 'excluir'),
  SubstituicoesController.deletarSubstituicao
);

// PUT /api/necessidades-substituicoes/:id/aprovar
// Aprovar substituição
router.put(
  '/:id/aprovar',
  checkScreenPermission('necessidades', 'editar'),
  SubstituicoesController.aprovarSubstituicao
);

module.exports = router;
