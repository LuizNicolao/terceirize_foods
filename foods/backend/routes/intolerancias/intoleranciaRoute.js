const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const IntoleranciasController = require('../../controllers/intolerancias');
const { intoleranciaValidations, intoleranciaAtualizacaoValidations, commonValidations } = require('./intoleranciaValidator');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('intolerancias'));

// ===== ROTAS PRINCIPAIS DE INTOLERÂNCIAS =====

// Listar intolerâncias com paginação, busca e filtros
router.get('/', 
  commonValidations.search,
  ...commonValidations.pagination,
  IntoleranciasController.listarIntolerancias
);

// Buscar intolerância por ID
router.get('/:id', 
  commonValidations.id,
  IntoleranciasController.buscarIntoleranciaPorId
);

// Criar intolerância
router.post('/', 
  intoleranciaValidations,
  IntoleranciasController.criarIntolerancia
);

// Atualizar intolerância
router.put('/:id', 
  commonValidations.id,
  intoleranciaAtualizacaoValidations,
  IntoleranciasController.atualizarIntolerancia
);

// Excluir intolerância
router.delete('/:id', 
  commonValidations.id,
  IntoleranciasController.excluirIntolerancia
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar intolerâncias ativas
router.get('/ativas/listar', 
  IntoleranciasController.buscarIntoleranciasAtivas
);

// Buscar estatísticas
router.get('/stats/geral', 
  IntoleranciasController.buscarEstatisticas
);

router.get('/export/xlsx', checkScreenPermission('intolerancias', 'visualizar'), IntoleranciasController.exportarXLSX);
router.get('/export/pdf', checkScreenPermission('intolerancias', 'visualizar'), IntoleranciasController.exportarPDF);

module.exports = router;
