/**
 * Rotas para Motoristas
 * Implementa padrão RESTful com HATEOAS, paginação e auditoria
 */

const express = require('express');
const router = express.Router();
const motoristasController = require('../../controllers/motoristasController');
const { motoristaValidations, commonValidations } = require('./motoristaValidator');
const { authMiddleware } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware } = require('../../middleware/audit');
const { param } = require('express-validator');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rota para listar motoristas com paginação, busca e filtros
router.get('/', 
  commonValidations.pagination,
  commonValidations.search,
  paginationMiddleware,
  hateoasMiddleware,
  motoristasController.listarMotoristas
);

// Rota para buscar motorista por ID
router.get('/:id', 
  commonValidations.id,
  hateoasMiddleware,
  motoristasController.buscarMotoristaPorId
);

// Rota para criar motorista
router.post('/', 
  motoristaValidations.create,
  auditMiddleware('motoristas', 'create'),
  motoristasController.criarMotorista
);

// Rota para atualizar motorista
router.put('/:id', 
  motoristaValidations.update,
  auditMiddleware('motoristas', 'update'),
  motoristasController.atualizarMotorista
);

// Rota para excluir motorista
router.delete('/:id', 
  commonValidations.id,
  auditMiddleware('motoristas', 'delete'),
  motoristasController.excluirMotorista
);

// Rota para buscar motoristas ativos
router.get('/ativos/listar', 
  hateoasMiddleware,
  motoristasController.buscarMotoristasAtivos
);

// Rota para buscar motoristas por filial
router.get('/filial/:filialId', 
  param('filialId').isInt({ min: 1 }).withMessage('ID da filial deve ser um número inteiro positivo'),
  hateoasMiddleware,
  motoristasController.buscarMotoristasPorFilial
);

// Rota para buscar motoristas por status
router.get('/status/:status', 
  param('status').isIn(['ativo', 'inativo', 'ferias', 'licenca']).withMessage('Status deve ser ativo, inativo, ferias ou licenca'),
  hateoasMiddleware,
  motoristasController.buscarMotoristasPorStatus
);

// Rota para buscar motoristas com CNH vencendo
router.get('/cnh/vencendo', 
  hateoasMiddleware,
  motoristasController.buscarMotoristasCNHVencendo
);

// Rota para buscar auditoria de motoristas
router.get('/auditoria/listar', 
  hateoasMiddleware,
  motoristasController.buscarAuditoria
);

// Rota para exportar motoristas em XLSX
router.get('/exportar/xlsx', 
  motoristasController.exportarXLSX
);

// Rota para exportar motoristas em PDF
router.get('/exportar/pdf', 
  motoristasController.exportarPDF
);

// Rota para exportar auditoria em XLSX
router.get('/auditoria/exportar/xlsx', 
  motoristasController.exportarAuditoriaXLSX
);

// Rota para exportar auditoria em PDF
router.get('/auditoria/exportar/pdf', 
  motoristasController.exportarAuditoriaPDF
);

module.exports = router;
