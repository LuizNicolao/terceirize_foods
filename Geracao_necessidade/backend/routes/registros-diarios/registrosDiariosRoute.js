const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');
const {
  listar,
  listarTodas,
  criar,
  atualizar,
  deletar,
  calcularMedias,
  calcularMediasPorPeriodo
} = require('../../controllers/registros-diarios');

const router = express.Router();

router.use(authenticateToken);

// ===== ROTAS CRUD =====
router.get('/', canView('registros-diarios'), listar);
router.get('/todas', canView('registros-diarios'), listarTodas);
router.post('/', canCreate('registros-diarios'), criar);
router.put('/:id', canEdit('registros-diarios'), atualizar);
router.delete('/:id', canDelete('registros-diarios'), deletar);

// ===== ROTAS ESPECÍFICAS =====
router.post('/calcular-medias', canCreate('registros-diarios'), calcularMedias);
router.get('/medias-periodo', canView('registros-diarios'), calcularMediasPorPeriodo);

module.exports = router;
