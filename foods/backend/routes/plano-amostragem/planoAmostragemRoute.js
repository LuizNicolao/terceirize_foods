/**
 * Rotas de Plano de Amostragem
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { query, body } = require('express-validator');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { 
  nqaValidations, 
  tabelaAmostragemValidations, 
  gruposNQAValidations,
  commonValidations 
} = require('./planoAmostragemValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const PlanoAmostragemController = require('../../controllers/plano-amostragem');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('plano-amostragem'));

// ========== ROTAS NQA ==========

// GET /api/plano-amostragem/nqa - Listar NQAs
router.get('/nqa', 
  checkScreenPermission('plano_amostragem', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  PlanoAmostragemController.listarNQAs
);

// GET /api/plano-amostragem/nqa/ativos - Buscar NQAs ativos
router.get('/nqa/ativos',
  checkScreenPermission('plano_amostragem', 'visualizar'),
  PlanoAmostragemController.buscarNQAsAtivos
);

// GET /api/plano-amostragem/nqa/:id - Buscar NQA por ID
router.get('/nqa/:id', 
  checkScreenPermission('plano_amostragem', 'visualizar'),
  commonValidations.id,
  PlanoAmostragemController.buscarNQAPorId
);

// POST /api/plano-amostragem/nqa - Criar novo NQA
router.post('/nqa', 
  checkScreenPermission('plano_amostragem', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'nqa'),
  nqaValidations.create,
  PlanoAmostragemController.criarNQA
);

// PUT /api/plano-amostragem/nqa/:id - Atualizar NQA
router.put('/nqa/:id', 
  checkScreenPermission('plano_amostragem', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'nqa'),
  nqaValidations.update,
  PlanoAmostragemController.atualizarNQA
);

// DELETE /api/plano-amostragem/nqa/:id - Excluir NQA
router.delete('/nqa/:id', 
  checkScreenPermission('plano_amostragem', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'nqa'),
  commonValidations.id,
  PlanoAmostragemController.excluirNQA
);

// ========== ROTAS TABELA DE AMOSTRAGEM ==========

// GET /api/plano-amostragem/tabela-amostragem - Listar faixas
router.get('/tabela-amostragem', 
  checkScreenPermission('plano_amostragem', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  PlanoAmostragemController.listarFaixas
);

// GET /api/plano-amostragem/tabela-amostragem/nqa/:nqa_id - Buscar faixas por NQA
router.get('/tabela-amostragem/nqa/:nqa_id',
  checkScreenPermission('plano_amostragem', 'visualizar'),
  PlanoAmostragemController.buscarFaixasPorNQA
);

// GET /api/plano-amostragem/tabela-amostragem/buscar-por-lote - Buscar plano por tamanho de lote
router.get('/tabela-amostragem/buscar-por-lote',
  checkScreenPermission('plano_amostragem', 'visualizar'),
  [
    query('lote')
      .isInt({ min: 1 })
      .withMessage('Tamanho do lote deve ser um número positivo'),
    require('./planoAmostragemValidator').handleValidationErrors
  ],
  PlanoAmostragemController.buscarPlanoPorLote
);

// GET /api/plano-amostragem/tabela-amostragem/:id - Buscar faixa por ID
router.get('/tabela-amostragem/:id', 
  checkScreenPermission('plano_amostragem', 'visualizar'),
  commonValidations.id,
  PlanoAmostragemController.buscarFaixaPorId
);

// POST /api/plano-amostragem/tabela-amostragem - Criar nova faixa
router.post('/tabela-amostragem', 
  checkScreenPermission('plano_amostragem', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'tabela_amostragem'),
  tabelaAmostragemValidations.create,
  PlanoAmostragemController.criarFaixa
);

// POST /api/plano-amostragem/tabela-amostragem/criar-nqa-automatico - Criar NQA automaticamente
router.post('/tabela-amostragem/criar-nqa-automatico',
  checkScreenPermission('plano_amostragem', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'nqa'),
  [
    body('codigo')
      .isLength({ min: 1, max: 20 })
      .withMessage('Código deve ter entre 1 e 20 caracteres')
      .trim(),
    require('./planoAmostragemValidator').handleValidationErrors
  ],
  PlanoAmostragemController.criarNQAAutomatico
);

// PUT /api/plano-amostragem/tabela-amostragem/:id - Atualizar faixa
router.put('/tabela-amostragem/:id', 
  checkScreenPermission('plano_amostragem', 'editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'tabela_amostragem'),
  tabelaAmostragemValidations.update,
  PlanoAmostragemController.atualizarFaixa
);

// DELETE /api/plano-amostragem/tabela-amostragem/:id - Excluir faixa
router.delete('/tabela-amostragem/:id', 
  checkScreenPermission('plano_amostragem', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'tabela_amostragem'),
  commonValidations.id,
  PlanoAmostragemController.excluirFaixa
);

// ========== ROTAS GRUPOS ↔ NQA ==========

// GET /api/plano-amostragem/grupos-nqa - Listar todos os vínculos
router.get('/grupos-nqa',
  checkScreenPermission('plano_amostragem', 'visualizar'),
  PlanoAmostragemController.listarTodosVinculos
);

// GET /api/plano-amostragem/grupos-nqa/nqa/:nqa_id - Listar grupos por NQA
router.get('/grupos-nqa/nqa/:nqa_id',
  checkScreenPermission('plano_amostragem', 'visualizar'),
  PlanoAmostragemController.listarGruposPorNQA
);

// GET /api/plano-amostragem/grupos-nqa/grupo/:grupo_id - Buscar NQA por grupo
router.get('/grupos-nqa/grupo/:grupo_id',
  checkScreenPermission('plano_amostragem', 'visualizar'),
  PlanoAmostragemController.buscarNQAPorGrupo
);

// POST /api/plano-amostragem/grupos-nqa - Vincular grupo a NQA
router.post('/grupos-nqa',
  checkScreenPermission('plano_amostragem', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'grupos_nqa'),
  gruposNQAValidations.vincular,
  PlanoAmostragemController.vincularGrupo
);

// DELETE /api/plano-amostragem/grupos-nqa/:grupo_id - Desvincular grupo
router.delete('/grupos-nqa/:grupo_id',
  checkScreenPermission('plano_amostragem', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'grupos_nqa'),
  PlanoAmostragemController.desvincularGrupo
);

module.exports = router;

