const express = require('express');
const { authenticateToken, checkPermission, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const FiliaisController = require('../../controllers/filiais');
const { filialValidations, filialAtualizacaoValidations, commonValidations } = require('./filialValidator');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('filiais'));

// ===== ROTAS PRINCIPAIS DE FILIAIS =====

// Listar filiais com paginação, busca e filtros
router.get('/', 
  commonValidations.search,
  ...commonValidations.pagination,
  FiliaisController.listarFiliais
);

// Buscar estatísticas de filiais (DEVE vir ANTES de /:id)
router.get('/estatisticas', 
  FiliaisController.buscarEstatisticas
);

// Buscar filial por ID
router.get('/:id', 
  commonValidations.id,
  FiliaisController.buscarFilialPorId
);

// Criar filial
router.post('/', 
  filialValidations,
  FiliaisController.criarFilial
);

// Atualizar filial
router.put('/:id', 
  commonValidations.id,
  filialAtualizacaoValidations,
  FiliaisController.atualizarFilial
);

// Excluir filial
router.delete('/:id', 
  commonValidations.id,
  FiliaisController.excluirFilial
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar filiais ativas
router.get('/ativas/listar', 
  FiliaisController.buscarFiliaisAtivas
);

// Buscar filiais por estado
router.get('/estado/:estado', 
  FiliaisController.buscarFiliaisPorEstado
);

// Listar estados disponíveis
router.get('/estados/listar', 
  FiliaisController.listarEstados
);

// Listar supervisões disponíveis
router.get('/supervisoes/listar', 
  FiliaisController.listarSupervisoes
);

// Listar coordenações disponíveis
router.get('/coordenacoes/listar', 
  FiliaisController.listarCoordenacoes
);

// Consultar CNPJ na API externa
router.get('/buscar-cnpj/:cnpj', 
  checkPermission('visualizar'),
  FiliaisController.buscarCNPJ
);


// ===== ROTAS DE ALMOXARIFADOS =====

// Listar almoxarifados de uma filial
router.get('/:filialId/almoxarifados', 
  commonValidations.id,
  FiliaisController.listarAlmoxarifados
);

// Criar almoxarifado para uma filial
router.post('/:filialId/almoxarifados', 
  commonValidations.id,
  FiliaisController.criarAlmoxarifado
);

// Atualizar almoxarifado
router.put('/almoxarifados/:id', 
  commonValidations.id,
  FiliaisController.atualizarAlmoxarifado
);

// Excluir almoxarifado
router.delete('/almoxarifados/:id', 
  commonValidations.id,
  FiliaisController.excluirAlmoxarifado
);

// Listar itens de um almoxarifado
router.get('/almoxarifados/:almoxarifadoId/itens', 
  commonValidations.id,
  FiliaisController.listarItensAlmoxarifado
);

// Adicionar item ao almoxarifado
router.post('/almoxarifados/:almoxarifadoId/itens', 
  commonValidations.id,
  FiliaisController.adicionarItemAlmoxarifado
);

// Remover item do almoxarifado
router.delete('/almoxarifados/:almoxarifadoId/itens/:itemId', 
  commonValidations.id,
  FiliaisController.removerItemAlmoxarifado
);

router.get('/export/xlsx', checkScreenPermission('filiais', 'visualizar'), FiliaisController.exportarXLSX);
router.get('/export/pdf', checkScreenPermission('filiais', 'visualizar'), FiliaisController.exportarPDF);

module.exports = router;
