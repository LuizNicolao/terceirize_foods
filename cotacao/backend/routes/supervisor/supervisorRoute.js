/**
 * Rotas de Supervisor
 * Implementa padrões RESTful com HATEOAS, paginação e validação
 */

const express = require('express');
const router = express.Router();
const { SupervisorController, SupervisorAnaliseController } = require('../../controllers/supervisor');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { supervisorValidation, analiseValidation } = require('./supervisorValidator');

// Rotas principais do supervisor
router.get('/pendentes', 
  authenticateToken, 
  checkPermission('visualizar'), 
  paginationMiddleware,
  supervisorValidation, 
  SupervisorController.getCotacoesPendentes
);

router.get('/stats', 
  authenticateToken, 
  checkPermission('visualizar'), 
  SupervisorController.getStats
);

// Rotas de análise
router.get('/:id/detalhes', 
  authenticateToken, 
  checkPermission('visualizar'), 
  SupervisorAnaliseController.getDetalhesCotacao
);

router.post('/:id/analisar', 
  authenticateToken, 
  checkPermission('editar'), 
  analiseValidation, 
  SupervisorAnaliseController.analisarCotacao
);

router.post('/:id/enviar-gestor', 
  authenticateToken, 
  checkPermission('editar'), 
  SupervisorAnaliseController.enviarParaGestor
);

// Rotas de exportação
router.get('/:id/export/pdf', 
  authenticateToken, 
  checkPermission('visualizar'), 
  SupervisorAnaliseController.exportarPDF
);

router.get('/:id/export/excel', 
  authenticateToken, 
  checkPermission('visualizar'), 
  SupervisorAnaliseController.exportarExcel
);

module.exports = router;
