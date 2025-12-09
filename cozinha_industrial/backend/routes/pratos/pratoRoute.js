const express = require('express');
const router = express.Router();
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { pratosLimiter } = require('../../middleware/rateLimiter');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

const PratosController = require('../../controllers/pratos');
const { pratosValidations, commonValidations } = require('./pratoValidator');
const multer = require('multer');

/**
 * Rotas para Pratos
 * Segue padrão RESTful e excelência do sistema
 */

// Aplicar middlewares globais
router.use(pratosLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('pratos'));

// GET /pratos - Listar pratos
router.get(
  '/',
  checkScreenPermission('pratos', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  pratosValidations.filtros,
  PratosController.listar
);

// GET /pratos/exportar/json - Exportar pratos em JSON
router.get(
  '/exportar/json',
  checkScreenPermission('pratos', 'visualizar'),
  PratosController.exportarJSON
);

// GET /pratos/exportar/xlsx - Exportar pratos em XLSX
router.get(
  '/exportar/xlsx',
  checkScreenPermission('pratos', 'visualizar'),
  PratosController.exportarXLSX
);

// GET /pratos/exportar/pdf - Exportar pratos em PDF
router.get(
  '/exportar/pdf',
  checkScreenPermission('pratos', 'visualizar'),
  PratosController.exportarPDF
);

// GET /pratos/:id - Buscar prato por ID
router.get(
  '/:id',
  checkScreenPermission('pratos', 'visualizar'),
  commonValidations.id,
  PratosController.buscarPorId
);

// POST /pratos - Criar novo prato
router.post(
  '/',
  checkScreenPermission('pratos', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'pratos'),
  pratosValidations.criar,
  PratosController.criar
);

// PUT /pratos/:id - Atualizar prato
router.put(
  '/:id',
  checkScreenPermission('pratos', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'pratos'),
  commonValidations.id,
  pratosValidations.atualizar,
  PratosController.atualizar
);

// DELETE /pratos/:id - Excluir prato
router.delete(
  '/:id',
  checkScreenPermission('pratos', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'pratos'),
  commonValidations.id,
  PratosController.excluir
);

// ===== ROTAS DE IMPORTAÇÃO =====
router.get('/importar/modelo',
  checkScreenPermission('pratos', 'criar'),
  PratosController.baixarModelo
);

router.post('/importar',
  checkScreenPermission('pratos', 'criar'),
  PratosController.upload,
  (err, req, res, next) => {
    // Middleware para tratar erros do multer
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Arquivo muito grande. Tamanho máximo: 10MB',
            error: err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Erro ao processar arquivo',
          error: err.message
        });
      }
      // Erro de validação do fileFilter
      return res.status(400).json({
        success: false,
        message: err.message || 'Erro ao processar arquivo',
        error: err.message
      });
    }
    next();
  },
  PratosController.importar
);

module.exports = router;

