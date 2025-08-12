const express = require('express');
const router = express.Router();
const SubgruposController = require('../../controllers/subgruposController');
const { 
  subgrupoValidations, 
  commonValidations 
} = require('./subgrupoValidator');
const { auditMiddleware, auditChangesMiddleware } = require('../../middleware/audit');
const { getUserPermissions } = require('../../middleware/auth');

// Middleware para verificar permissões
const checkPermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req.user);
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }
    next();
  };
};

// Rotas com validação e auditoria
router.get('/', 
  commonValidations.pagination,
  SubgruposController.listarSubgrupos
);

router.get('/ativos',
  commonValidations.pagination,
  SubgruposController.buscarAtivos
);

router.get('/:id',
  commonValidations.id,
  SubgruposController.buscarSubgrupoPorId
);

router.post('/',
  checkPermission('subgrupos:create'),
  auditMiddleware('subgrupos', 'create'),
  subgrupoValidations.create,
  SubgruposController.criarSubgrupo
);

router.put('/:id',
  checkPermission('subgrupos:update'),
  auditChangesMiddleware('subgrupos', 'update'),
  subgrupoValidations.update,
  SubgruposController.atualizarSubgrupo
);

router.delete('/:id',
  checkPermission('subgrupos:delete'),
  auditMiddleware('subgrupos', 'delete'),
  commonValidations.id,
  SubgruposController.excluirSubgrupo
);

module.exports = router;
