/**
 * Rotas de Tipo de Rota
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { tipoRotaValidations, commonValidations } = require('./tipoRotaValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const tipoRotaController = require('../../controllers/tipo-rota');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('tipo_rota'));

// ===== ROTAS PRINCIPAIS DE TIPO DE ROTA =====

// Listar tipos de rota com paginação, busca e filtros
router.get('/', 
  checkScreenPermission('tipo_rota', 'visualizar'),
  commonValidations.search,
  ...commonValidations.pagination,
  tipoRotaController.listarTipoRotas
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar tipos de rota ativos
router.get('/ativas/listar', 
  checkScreenPermission('tipo_rota', 'visualizar'),
  tipoRotaController.buscarTipoRotasAtivas
);

// Buscar tipos de rota por filial
router.get('/filial/:filialId', 
  checkScreenPermission('tipo_rota', 'visualizar'),
  tipoRotaController.buscarTipoRotasPorFilial
);

// Buscar tipos de rota por grupo
router.get('/grupo/:grupoId', 
  checkScreenPermission('tipo_rota', 'visualizar'),
  tipoRotaController.buscarTipoRotasPorGrupo
);

// Buscar estatísticas dos tipos de rota
router.get('/estatisticas', 
  checkScreenPermission('tipo_rota', 'visualizar'),
  tipoRotaController.buscarEstatisticasTipoRotas
);

// Buscar unidades escolares de um tipo de rota
router.get('/:id/unidades-escolares', 
  checkScreenPermission('tipo_rota', 'visualizar'),
  tipoRotaController.buscarUnidadesEscolaresTipoRota
);

// Buscar unidades escolares disponíveis por filial e grupo (não vinculadas ao mesmo grupo)
router.get('/disponiveis/filial/:filialId/grupo/:grupoId', 
  checkScreenPermission('tipo_rota', 'visualizar'),
  tipoRotaController.buscarUnidadesEscolaresDisponiveis
);

// Buscar grupos disponíveis por filial (excluindo grupos já vinculados a outros tipos de rota)
router.get('/grupos-disponiveis/filial/:filialId', 
  checkScreenPermission('tipo_rota', 'visualizar'),
  tipoRotaController.buscarGruposDisponiveisPorFilial
);

// ===== ROTAS CRUD PRINCIPAIS =====

// Buscar tipo de rota por ID
router.get('/:id', 
  checkScreenPermission('tipo_rota', 'visualizar'),
  commonValidations.id,
  tipoRotaController.buscarTipoRotaPorId
);

// Criar tipo de rota
router.post('/', [
  checkScreenPermission('tipo_rota', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'tipo_rota'),
  tipoRotaValidations.create
], tipoRotaController.criarTipoRota);

// Atualizar tipo de rota
router.put('/:id', [
  checkScreenPermission('tipo_rota', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'tipo_rota'),
  tipoRotaValidations.update
], tipoRotaController.atualizarTipoRota);

// Excluir tipo de rota
router.delete('/:id', [
  checkScreenPermission('tipo_rota', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'tipo_rota'),
  commonValidations.id
], tipoRotaController.excluirTipoRota);

// ===== ROTAS DE EXPORTAÇÃO =====

// GET /api/tipo-rota/export/xlsx - Exportar para XLSX
router.get('/export/xlsx',
  checkScreenPermission('tipo_rota', 'visualizar'),
  tipoRotaController.exportarXLSX
);

// GET /api/tipo-rota/export/pdf - Exportar para PDF
router.get('/export/pdf',
  checkScreenPermission('tipo_rota', 'visualizar'),
  tipoRotaController.exportarPDF
);

module.exports = router;

