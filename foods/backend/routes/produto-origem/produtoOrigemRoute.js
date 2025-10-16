/**
 * Rotas de Produto Origem
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { produtoOrigemValidations, commonValidations } = require('./produtoOrigemValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { uploadExcel, handleUploadError } = require('../../middleware/upload');
const ProdutoOrigemController = require('../../controllers/produto-origem');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('produto-origem'));

// GET /api/produto-origem - Listar produtos origem com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  ProdutoOrigemController.listarProdutosOrigem
);

// GET /api/produto-origem/proximo-codigo - Obter próximo código disponível
router.get('/proximo-codigo',
  checkPermission('visualizar'),
  ProdutoOrigemController.obterProximoCodigo
);

// GET /api/produto-origem/:id - Buscar produto origem por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  ProdutoOrigemController.buscarProdutoOrigemPorId
);

// POST /api/produto-origem - Criar novo produto origem
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'produto_origem'),
  produtoOrigemValidations.create,
  ProdutoOrigemController.criarProdutoOrigem
);

// PUT /api/produto-origem/:id - Atualizar produto origem
router.put('/:id', 
  checkPermission('atualizar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'produto_origem'),
  produtoOrigemValidations.update,
  ProdutoOrigemController.atualizarProdutoOrigem
);

// DELETE /api/produto-origem/:id - Excluir produto origem (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'produto_origem'),
  commonValidations.id,
  ProdutoOrigemController.excluirProdutoOrigem
);

// GET /api/produto-origem/grupo/:grupo_id - Buscar produtos origem por grupo
router.get('/grupo/:grupo_id',
  checkPermission('visualizar'),
  ProdutoOrigemController.buscarProdutosOrigemPorGrupo
);

// GET /api/produto-origem/subgrupo/:subgrupo_id - Buscar produtos origem por subgrupo
router.get('/subgrupo/:subgrupo_id',
  checkPermission('visualizar'),
  ProdutoOrigemController.buscarProdutosOrigemPorSubgrupo
);

// GET /api/produto-origem/classe/:classe_id - Buscar produtos origem por classe
router.get('/classe/:classe_id',
  checkPermission('visualizar'),
  ProdutoOrigemController.buscarProdutosOrigemPorClasse
);

// GET /api/produto-origem/ativos - Buscar produtos origem ativos
router.get('/ativos',
  checkPermission('visualizar'),
  ProdutoOrigemController.buscarProdutosOrigemAtivos
);

// GET /api/produto-origem/codigo/:codigo - Buscar produto origem por código
router.get('/codigo/:codigo',
  checkPermission('visualizar'),
  ProdutoOrigemController.buscarProdutoOrigemPorCodigo
);

// GET /api/produto-origem/grupos - Listar grupos disponíveis
router.get('/grupos',
  checkPermission('visualizar'),
  ProdutoOrigemController.listarGrupos
);

// GET /api/produto-origem/subgrupos - Listar subgrupos disponíveis
router.get('/subgrupos',
  checkPermission('visualizar'),
  ProdutoOrigemController.listarSubgrupos
);

// GET /api/produto-origem/classes - Listar classes disponíveis
router.get('/classes',
  checkPermission('visualizar'),
  ProdutoOrigemController.listarClasses
);

// GET /api/produto-origem/unidades-medida - Listar unidades de medida disponíveis
router.get('/unidades-medida',
  checkPermission('visualizar'),
  ProdutoOrigemController.listarUnidadesMedida
);

// GET /api/produto-origem/produtos-genericos-padrao - Listar produtos genéricos padrão disponíveis
router.get('/produtos-genericos-padrao',
  checkPermission('visualizar'),
  ProdutoOrigemController.listarProdutosGenericosPadrao
);

// ===== ROTAS DE BUSCA AVANÇADA =====

// GET /api/produto-origem/busca/avancada - Busca avançada
router.get('/busca/avancada',
  checkPermission('visualizar'),
  ProdutoOrigemController.buscaAvancada
);

// GET /api/produto-origem/busca/similaridade - Busca por similaridade
router.get('/busca/similaridade',
  checkPermission('visualizar'),
  ProdutoOrigemController.buscarPorSimilaridade
);

// GET /api/produto-origem/busca/codigo - Busca por código
router.get('/busca/codigo',
  checkPermission('visualizar'),
  ProdutoOrigemController.buscarPorCodigo
);

// GET /api/produto-origem/busca/sem-classificacao - Produtos sem classificação
router.get('/busca/sem-classificacao',
  checkPermission('visualizar'),
  ProdutoOrigemController.buscarSemClassificacao
);

// ===== ROTAS DE ESTATÍSTICAS =====

// GET /api/produto-origem/stats/gerais - Estatísticas gerais
router.get('/stats/gerais',
  checkPermission('visualizar'),
  ProdutoOrigemController.estatisticasGerais
);

// GET /api/produto-origem/stats/grupo - Estatísticas por grupo
router.get('/stats/grupo',
  checkPermission('visualizar'),
  ProdutoOrigemController.estatisticasPorGrupo
);

// GET /api/produto-origem/stats/subgrupo - Estatísticas por subgrupo
router.get('/stats/subgrupo',
  checkPermission('visualizar'),
  ProdutoOrigemController.estatisticasPorSubgrupo
);

// GET /api/produto-origem/stats/classe - Estatísticas por classe
router.get('/stats/classe',
  checkPermission('visualizar'),
  ProdutoOrigemController.estatisticasPorClasse
);

// GET /api/produto-origem/stats/unidade-medida - Estatísticas por unidade de medida
router.get('/stats/unidade-medida',
  checkPermission('visualizar'),
  ProdutoOrigemController.estatisticasPorUnidadeMedida
);

// GET /api/produto-origem/stats/recentes - Produtos mais recentes
router.get('/stats/recentes',
  checkPermission('visualizar'),
  ProdutoOrigemController.produtosRecentes
);

// GET /api/produto-origem/stats/atualizados - Produtos mais atualizados
router.get('/stats/atualizados',
  checkPermission('visualizar'),
  ProdutoOrigemController.produtosMaisAtualizados
);

// GET /api/produto-origem/stats/sem-classificacao - Relatório sem classificação
router.get('/stats/sem-classificacao',
  checkPermission('visualizar'),
  ProdutoOrigemController.relatorioSemClassificacao
);

// GET /api/produto-origem/stats/fator-conversao - Distribuição por fator de conversão
router.get('/stats/fator-conversao',
  checkPermission('visualizar'),
  ProdutoOrigemController.distribuicaoFatorConversao
);

// GET /api/produto-origem/stats/peso-liquido - Distribuição por peso líquido
router.get('/stats/peso-liquido',
  checkPermission('visualizar'),
  ProdutoOrigemController.distribuicaoPesoLiquido
);

router.get('/export/xlsx', checkScreenPermission('produto_origem', 'visualizar'), ProdutoOrigemController.exportarXLSX);
router.get('/export/pdf', checkScreenPermission('produto_origem', 'visualizar'), ProdutoOrigemController.exportarPDF);

// ===== ROTAS DE IMPORTAÇÃO =====

// POST /api/produto-origem/import/excel - Importar produtos via Excel
router.post('/import/excel',
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'produto_origem'),
  uploadExcel,
  handleUploadError,
  ProdutoOrigemController.importarExcel
);

// GET /api/produto-origem/import/modelo - Baixar modelo de planilha
router.get('/import/modelo',
  checkPermission('visualizar'),
  ProdutoOrigemController.baixarModelo
);

module.exports = router;
