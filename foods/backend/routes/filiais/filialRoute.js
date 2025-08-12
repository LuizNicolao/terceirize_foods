const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const filiaisController = require('../../controllers/filiaisController');
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
  filiaisController.listarFiliais
);

// Buscar filial por ID
router.get('/:id', 
  commonValidations.id,
  filiaisController.buscarFilialPorId
);

// Criar filial
router.post('/', 
  filialValidations,
  filiaisController.criarFilial
);

// Atualizar filial
router.put('/:id', 
  commonValidations.id,
  filialAtualizacaoValidations,
  filiaisController.atualizarFilial
);

// Excluir filial
router.delete('/:id', 
  commonValidations.id,
  filiaisController.excluirFilial
);

// ===== ROTAS ESPECÍFICAS =====

// Buscar filiais ativas
router.get('/ativas/listar', 
  filiaisController.buscarFiliaisAtivas
);

// Buscar filiais por estado
router.get('/estado/:estado', 
  filiaisController.buscarFiliaisPorEstado
);

// Listar estados disponíveis
router.get('/estados/listar', 
  filiaisController.listarEstados
);

// Listar supervisões disponíveis
router.get('/supervisoes/listar', 
  filiaisController.listarSupervisoes
);

// Listar coordenações disponíveis
router.get('/coordenacoes/listar', 
  filiaisController.listarCoordenacoes
);

// Consultar CNPJ na API externa
router.get('/consulta-cnpj/:cnpj', 
  filiaisController.consultarCNPJ
);

// ===== ROTAS DE ALMOXARIFADOS =====

// Listar almoxarifados de uma filial
router.get('/:filialId/almoxarifados', 
  commonValidations.id,
  filiaisController.listarAlmoxarifados
);

// Criar almoxarifado para uma filial
router.post('/:filialId/almoxarifados', 
  commonValidations.id,
  filiaisController.criarAlmoxarifado
);

// Atualizar almoxarifado
router.put('/almoxarifados/:id', 
  commonValidations.id,
  filiaisController.atualizarAlmoxarifado
);

// Excluir almoxarifado
router.delete('/almoxarifados/:id', 
  commonValidations.id,
  filiaisController.excluirAlmoxarifado
);

// Listar itens de um almoxarifado
router.get('/almoxarifados/:almoxarifadoId/itens', 
  commonValidations.id,
  filiaisController.listarItensAlmoxarifado
);

// Adicionar item ao almoxarifado
router.post('/almoxarifados/:almoxarifadoId/itens', 
  commonValidations.id,
  filiaisController.adicionarItemAlmoxarifado
);

// Remover item do almoxarifado
router.delete('/almoxarifados/:almoxarifadoId/itens/:itemId', 
  commonValidations.id,
  filiaisController.removerItemAlmoxarifado
);

module.exports = router;
