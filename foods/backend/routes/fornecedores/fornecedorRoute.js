/**
 * Rotas de Fornecedores
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { fornecedorValidations, commonValidations } = require('./fornecedorValidator');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const FornecedoresController = require('../../controllers/fornecedores');

const router = express.Router();

// Aplicar middlewares globais
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('fornecedores'));

// GET /api/fornecedores - Listar fornecedores com paginação e busca
router.get('/', 
  checkPermission('visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  FornecedoresController.listarFornecedores
);

// GET /api/fornecedores/buscar-cnpj/:cnpj - Buscar dados do CNPJ via API externa
router.get('/buscar-cnpj/:cnpj',
  checkPermission('visualizar'),
  FornecedoresController.buscarCNPJ
);

// GET /api/fornecedores/uf/:uf - Buscar fornecedores por UF
router.get('/uf/:uf',
  checkPermission('visualizar'),
  FornecedoresController.buscarPorUF
);

// GET /api/fornecedores/estatisticas - Buscar estatísticas totais
router.get('/estatisticas',
  checkPermission('visualizar'),
  FornecedoresController.buscarEstatisticas
);

// GET /api/fornecedores/ativos - Buscar fornecedores ativos
router.get('/ativos',
  checkPermission('visualizar'),
  FornecedoresController.buscarAtivos
);

// GET /api/fornecedores/:id - Buscar fornecedor por ID
router.get('/:id', 
  checkPermission('visualizar'),
  commonValidations.id,
  FornecedoresController.buscarFornecedorPorId
);

// POST /api/fornecedores - Criar novo fornecedor
router.post('/', 
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'fornecedores'),
  fornecedorValidations.create,
  FornecedoresController.criarFornecedor
);

// PUT /api/fornecedores/:id - Atualizar fornecedor
router.put('/:id', 
  checkPermission('editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'fornecedores'),
  fornecedorValidations.update,
  FornecedoresController.atualizarFornecedor
);

// DELETE /api/fornecedores/:id - Excluir fornecedor (soft delete)
router.delete('/:id', 
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'fornecedores'),
  commonValidations.id,
  FornecedoresController.excluirFornecedor
);

// GET /api/fornecedores/export/xlsx - Exportar fornecedores para XLSX
router.get('/export/xlsx',
  checkPermission('visualizar'),
  FornecedoresController.exportarXLSX
);

// GET /api/fornecedores/export/pdf - Exportar fornecedores para PDF
router.get('/export/pdf',
  checkPermission('visualizar'),
  FornecedoresController.exportarPDF
);

module.exports = router;
