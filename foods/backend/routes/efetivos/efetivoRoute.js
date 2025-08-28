const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const EfetivosController = require('../../controllers/efetivos');
const EfetivosExportController = require('../../controllers/efetivos/EfetivosExportController');
const { efetivoValidations, efetivoAtualizacaoValidations, commonValidations } = require('./efetivoValidator');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('efetivos'));

// ===== ROTAS DE EFETIVOS POR UNIDADE ESCOLAR =====

// Listar efetivos de uma unidade escolar
router.get('/unidade-escolar/:unidade_escolar_id', 
  commonValidations.search,
  ...commonValidations.pagination,
  EfetivosController.listarEfetivos
);

// Criar efetivo para uma unidade escolar
router.post('/unidade-escolar/:unidade_escolar_id', 
  efetivoValidations,
  EfetivosController.criarEfetivo
);

// ===== ROTAS PRINCIPAIS DE EFETIVOS =====

// Listar todos os efetivos
router.get('/', 
  commonValidations.search,
  ...commonValidations.pagination,
  EfetivosController.listarTodosEfetivos
);

// Buscar estatísticas
router.get('/stats/geral', 
  EfetivosController.buscarEstatisticas
);

// Criar efetivo (geral)
router.post('/', 
  efetivoValidations,
  EfetivosController.criarEfetivoGeral
);

// Exportação
router.get('/export/xlsx', 
  EfetivosExportController.exportXLSX
);

router.get('/export/pdf', 
  EfetivosExportController.exportPDF
);

// Buscar efetivo por ID
router.get('/:id', 
  commonValidations.id,
  EfetivosController.buscarEfetivoPorId
);

// Atualizar efetivo
router.put('/:id', 
  commonValidations.id,
  efetivoAtualizacaoValidations,
  EfetivosController.atualizarEfetivo
);

// Excluir efetivo
router.delete('/:id', 
  commonValidations.id,
  EfetivosController.excluirEfetivo
);

module.exports = router;
