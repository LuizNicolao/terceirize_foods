const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');
const { commonValidations, tipoAtendimentoEscolaValidations } = require('./tipoAtendimentoEscolaValidator');
const TipoAtendimentoEscolaController = require('../../controllers/tipo-atendimento-escola');
const TipoAtendimentoEscolaImportController = require('../../controllers/tipo-atendimento-escola/TipoAtendimentoEscolaImportController');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('tipo-atendimento-escola'));

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS) =====
router.get('/por-escola/:escola_id',
  checkScreenPermission('tipo_atendimento_escola', 'visualizar'),
  TipoAtendimentoEscolaController.buscarPorEscola
);

router.get('/por-tipo/:tipo_atendimento',
  checkScreenPermission('tipo_atendimento_escola', 'visualizar'),
  TipoAtendimentoEscolaController.buscarEscolasPorTipo
);

// ===== ROTAS DE IMPORTAÇÃO =====
router.get('/importar/modelo',
  checkScreenPermission('tipo_atendimento_escola', 'criar'),
  TipoAtendimentoEscolaImportController.baixarModelo
);

router.post('/importar',
  checkScreenPermission('tipo_atendimento_escola', 'criar'),
  TipoAtendimentoEscolaImportController.uploadMiddleware,
  TipoAtendimentoEscolaImportController.importarExcel
);

// ===== ROTAS CRUD =====
router.get('/',
  checkScreenPermission('tipo_atendimento_escola', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  TipoAtendimentoEscolaController.listar
);

router.get('/:id',
  checkScreenPermission('tipo_atendimento_escola', 'visualizar'),
  commonValidations.id,
  TipoAtendimentoEscolaController.buscarPorId
);

router.post('/',
  checkScreenPermission('tipo_atendimento_escola', 'criar'),
  tipoAtendimentoEscolaValidations.criar,
  TipoAtendimentoEscolaController.criar
);

router.put('/:id',
  checkScreenPermission('tipo_atendimento_escola', 'editar'),
  commonValidations.id,
  tipoAtendimentoEscolaValidations.atualizar,
  TipoAtendimentoEscolaController.atualizar
);

router.delete('/:id',
  checkScreenPermission('tipo_atendimento_escola', 'deletar'),
  commonValidations.id,
  TipoAtendimentoEscolaController.deletar
);

module.exports = router;

