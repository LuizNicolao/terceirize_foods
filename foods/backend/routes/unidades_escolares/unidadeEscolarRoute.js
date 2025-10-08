/**
 * Rotas de Unidades Escolares
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { unidadeEscolarValidations, commonValidations } = require('./unidadeEscolarValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { uploadExcel, handleUploadError } = require('../../middleware/upload');
const unidadesEscolaresController = require('../../controllers/unidades-escolares');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('unidades_escolares'));

// ===== ROTAS PRINCIPAIS DE UNIDADES ESCOLARES =====

// Listar unidades escolares com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  unidadesEscolaresController.listarUnidadesEscolares
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar unidades escolares ativas
router.get('/ativas/listar', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresAtivas
);

// Buscar unidades escolares por estado
router.get('/estado/:estado', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresPorEstado
);

// Buscar unidades escolares por rota
router.get('/rota/:rotaId', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresPorRota
);

// Buscar unidades escolares por filial
router.get('/filial/:filialId', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresPorFilial
);

// Buscar unidades escolares disponíveis por filial (não vinculadas a rota)
router.get('/disponiveis/filial/:filialId', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresDisponiveisPorFilial
);

// Listar estados disponíveis
router.get('/estados/listar', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.listarEstados
);

// Buscar estatísticas totais
router.get('/estatisticas', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarEstatisticas
);

// Listar centros de distribuição disponíveis
router.get('/centros-distribuicao/listar', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.listarCentrosDistribuicao
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar unidades escolares por IDs específicos (deve vir antes da rota /:id)
router.post('/buscar-por-ids', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.buscarUnidadesEscolaresPorIds
);

// Buscar unidade escolar por ID
router.get('/:id', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  commonValidations.id,
  unidadesEscolaresController.buscarUnidadeEscolarPorId
);

// Criar unidade escolar
router.post('/', [
  checkScreenPermission('unidades_escolares', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'unidades_escolares'),
  unidadeEscolarValidations.create
], unidadesEscolaresController.criarUnidadeEscolar);

// Atualizar unidade escolar
router.put('/:id', [
  checkScreenPermission('unidades_escolares', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'unidades_escolares'),
  unidadeEscolarValidations.update
], unidadesEscolaresController.atualizarUnidadeEscolar);

// Excluir unidade escolar
router.delete('/:id', [
  checkScreenPermission('unidades_escolares', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'unidades_escolares'),
  commonValidations.id
], unidadesEscolaresController.excluirUnidadeEscolar);

// ===== ROTAS DE IMPORTAÇÃO =====

// Gerar template de planilha para download
router.get('/importar/template', 
  checkScreenPermission('unidades_escolares', 'criar'),
  unidadesEscolaresController.gerarTemplate
);

// Importar unidades escolares de planilha
router.post('/importar', [
  checkScreenPermission('unidades_escolares', 'criar'),
  uploadExcel,
  handleUploadError,
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'unidades_escolares'),
], unidadesEscolaresController.importarUnidadesEscolares);

// ===== ROTAS DE TIPOS DE CARDÁPIO =====

// Listar tipos de cardápio vinculados à unidade escolar
router.get('/:id/tipos-cardapio', 
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.getTiposCardapioUnidade
);

// Vincular tipo de cardápio à unidade escolar
router.post('/:id/tipos-cardapio', [
  checkScreenPermission('unidades_escolares', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'unidades_escolares'),
], unidadesEscolaresController.vincularTipoCardapio);

// Desvincular tipo de cardápio da unidade escolar
router.delete('/:id/tipos-cardapio/:tipoId', [
  checkScreenPermission('unidades_escolares', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'unidades_escolares'),
], unidadesEscolaresController.desvincularTipoCardapio);

// ===== ROTAS PARA PERÍODOS DE REFEIÇÃO =====

// Buscar períodos de refeição da unidade escolar
router.get('/:id/periodos-refeicao', [
  checkScreenPermission('unidades_escolares', 'visualizar'),
], unidadesEscolaresController.getPeriodosRefeicao);

// Vincular período de refeição à unidade escolar
router.post('/:id/periodos-refeicao', [
  checkScreenPermission('unidades_escolares', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'unidades_escolares'),
], unidadesEscolaresController.vincularPeriodoRefeicao);

// Atualizar quantidades de efetivos de um período vinculado
router.put('/:id/periodos-refeicao/:periodoId/quantidades', [
  checkScreenPermission('unidades_escolares', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'unidades_escolares'),
], unidadesEscolaresController.atualizarQuantidadesEfetivos);

// Desvincular período de refeição da unidade escolar
router.delete('/:id/periodos-refeicao/:periodoId', [
  checkScreenPermission('unidades_escolares', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'unidades_escolares'),
], unidadesEscolaresController.desvincularPeriodoRefeicao);

// ===== ROTAS DE EXPORTAÇÃO =====

// GET /api/unidades-escolares/export/xlsx - Exportar para XLSX
router.get('/export/xlsx',
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.exportarXLSX
);

// GET /api/unidades-escolares/export/pdf - Exportar para PDF
router.get('/export/pdf',
  checkScreenPermission('unidades_escolares', 'visualizar'),
  unidadesEscolaresController.exportarPDF
);

module.exports = router;
