const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
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
  canView('tipo_atendimento_escola'),
  TipoAtendimentoEscolaController.buscarPorEscola
);

router.get('/por-tipo/:tipo_atendimento',
  canView('tipo_atendimento_escola'),
  TipoAtendimentoEscolaController.buscarEscolasPorTipo
);

// ===== ROTAS DE IMPORTAÇÃO =====
router.get('/importar/modelo',
  canCreate('tipo_atendimento_escola'),
  TipoAtendimentoEscolaImportController.baixarModelo
);

router.post('/importar',
  canCreate('tipo_atendimento_escola'),
  TipoAtendimentoEscolaImportController.uploadMiddleware,
  TipoAtendimentoEscolaImportController.importarExcel
);

// ===== ROTAS CRUD =====
router.get('/',
  canView('tipo_atendimento_escola'),
  commonValidations.search,
  commonValidations.pagination,
  TipoAtendimentoEscolaController.listar
);

router.get('/:id',
  canView('tipo_atendimento_escola'),
  commonValidations.id,
  TipoAtendimentoEscolaController.buscarPorId
);

router.post('/',
  canCreate('tipo_atendimento_escola'),
  tipoAtendimentoEscolaValidations.criar,
  TipoAtendimentoEscolaController.criar
);

router.put('/:id',
  canEdit('tipo_atendimento_escola'),
  commonValidations.id,
  tipoAtendimentoEscolaValidations.atualizar,
  TipoAtendimentoEscolaController.atualizar
);

router.delete('/:id',
  canDelete('tipo_atendimento_escola'),
  commonValidations.id,
  TipoAtendimentoEscolaController.deletar
);

module.exports = router;

