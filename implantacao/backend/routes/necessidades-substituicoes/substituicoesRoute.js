const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const SubstituicoesController = require('../../controllers/necessidades-substituicoes');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS DE LISTAGEM =====

// GET /api/necessidades-substituicoes/listar
// Lista necessidades com status CONF agrupadas por produto origem (Nutricionista)
router.get(
  '/listar',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.listarParaSubstituicao
);

// GET /api/necessidades-substituicoes/listar-coordenacao
// Lista necessidades com status conf log agrupadas por produto origem (Coordenação)
router.get(
  '/listar-coordenacao',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.listarParaCoordenacao
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

// GET /api/necessidades-substituicoes/tipos-rota-disponiveis
// Busca tipos de rota disponíveis do foods_db
router.get(
  '/tipos-rota-disponiveis',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.buscarTiposRotaDisponiveis
);

// GET /api/necessidades-substituicoes/rotas-disponiveis
// Busca rotas disponíveis do foods_db
router.get(
  '/rotas-disponiveis',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.buscarRotasDisponiveis
);

// GET /api/necessidades-substituicoes/grupos-disponiveis
// Busca grupos disponíveis para substituição (apenas com status CONF)
router.get(
  '/grupos-disponiveis',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.buscarGruposDisponiveisParaSubstituicao
);

// GET /api/necessidades-substituicoes/semanas-abastecimento-disponiveis
// Busca semanas de abastecimento disponíveis para substituição (apenas com status CONF)
router.get(
  '/semanas-abastecimento-disponiveis',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.buscarSemanasAbastecimentoDisponiveisParaSubstituicao
);

// GET /api/necessidades-substituicoes/buscar-dados-impressao
// Busca dados para impressão de romaneio
router.get(
  '/buscar-dados-impressao',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.buscarDadosImpressao
);

// POST /api/necessidades-substituicoes/marcar-como-impresso
// Marca necessidades como impressas (conf log → impressao)
router.post(
  '/marcar-como-impresso',
  checkScreenPermission('necessidades', 'editar'),
  SubstituicoesController.marcarComoImpresso
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

// POST /api/necessidades-substituicoes/liberar-analise
// Liberar análise (conf → conf log)
router.post(
  '/liberar-analise',
  checkScreenPermission('necessidades', 'editar'),
  SubstituicoesController.liberarAnalise
);

router.post(
  '/trocar-produto',
  checkScreenPermission('necessidades', 'editar'),
  SubstituicoesController.trocarProdutoOrigem
);

router.post(
  '/desfazer-troca',
  checkScreenPermission('necessidades', 'editar'),
  SubstituicoesController.desfazerTrocaProduto
);

// ===== ROTAS DE EXPORTAÇÃO =====

// GET /api/necessidades-substituicoes/exportar/xlsx
// Exportar substituições para XLSX (Coordenação)
router.get(
  '/exportar/xlsx',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.exportarXLSX
);

// GET /api/necessidades-substituicoes/exportar/pdf
// Exportar substituições para PDF (Coordenação)
router.get(
  '/exportar/pdf',
  checkScreenPermission('necessidades', 'visualizar'),
  SubstituicoesController.exportarPDF
);

module.exports = router;
