/**
 * Rotas de Receitas
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const multer = require('multer');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { hateoasMiddleware } = require('../../middleware/hateoas');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');
const { receitasLimiter } = require('../../middleware/rateLimiter');
const { createEntityValidationHandler } = require('../../middleware/validationHandler');
const { commonValidations, receitasValidations } = require('./receitaValidator');
const ReceitasController = require('../../controllers/receitas');

const router = express.Router();

// Aplicar middlewares globais
router.use(receitasLimiter);
router.use(authenticateToken);
router.use(paginationMiddleware);
router.use(hateoasMiddleware('receitas'));

// ===== ROTAS CRUD =====
router.get('/',
  checkScreenPermission('receitas', 'visualizar'),
  commonValidations.search,
  commonValidations.pagination,
  commonValidations.sort,
  receitasValidations.filtros,
  ReceitasController.listar
);

router.get('/:id',
  checkScreenPermission('receitas', 'visualizar'),
  commonValidations.id,
  ReceitasController.buscarPorId
);

router.post('/',
  checkScreenPermission('receitas', 'criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'receitas'),
  receitasValidations.criar,
  ReceitasController.criar
);

router.put('/:id',
  checkScreenPermission('receitas', 'editar'),
  auditMiddleware(AUDIT_ACTIONS.UPDATE, 'receitas'),
  commonValidations.id,
  receitasValidations.atualizar,
  ReceitasController.atualizar
);

router.delete('/:id',
  checkScreenPermission('receitas', 'excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'receitas'),
  commonValidations.id,
  ReceitasController.excluir
);

// ===== ROTAS DE EXPORTAÇÃO =====
router.get('/exportar/json',
  checkScreenPermission('receitas', 'visualizar'),
  ReceitasController.exportarJSON
);

router.get('/exportar/xlsx',
  checkScreenPermission('receitas', 'visualizar'),
  commonValidations.search,
  receitasValidations.filtros,
  ReceitasController.exportarXLSX
);

router.get('/exportar/pdf',
  checkScreenPermission('receitas', 'visualizar'),
  commonValidations.search,
  receitasValidations.filtros,
  ReceitasController.exportarPDF
);

// ===== ROTA DE VERIFICAÇÃO =====
router.post('/verificar-por-centro-custo-produtos',
  checkScreenPermission('receitas', 'visualizar'),
  ReceitasController.verificarReceitaPorCentroCustoEProdutos
);

// ===== ROTAS DE IMPORTAÇÃO =====
router.get('/importar/modelo',
  checkScreenPermission('receitas', 'criar'),
  ReceitasController.baixarModelo
);

router.post('/importar',
  checkScreenPermission('receitas', 'criar'),
  ReceitasController.upload,
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
  ReceitasController.importar
);

module.exports = router;

