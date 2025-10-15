const express = require('express');
const { authenticateToken, checkPermission } = require('../../middleware/auth');
const { registrosDiariosValidations, handleValidationErrors } = require('./registrosDiariosValidator');
const RegistrosDiariosController = require('../../controllers/registros-diarios');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/registros-diarios - Listar registros diários com paginação
router.get('/',
  checkPermission('visualizar'),
  registrosDiariosValidations.listar,
  handleValidationErrors,
  RegistrosDiariosController.listar
);

// GET /api/registros-diarios/medias - Listar médias por escola
router.get('/medias',
  checkPermission('visualizar'),
  RegistrosDiariosController.listarMedias
);

// GET /api/registros-diarios/estatisticas - Obter estatísticas
router.get('/estatisticas',
  checkPermission('visualizar'),
  RegistrosDiariosController.obterEstatisticas
);

// GET /api/registros-diarios/buscar - Buscar registros de uma escola em uma data
router.get('/buscar',
  checkPermission('visualizar'),
  registrosDiariosValidations.buscarPorEscolaData,
  handleValidationErrors,
  RegistrosDiariosController.buscarPorEscolaData
);

// POST /api/registros-diarios - Criar/atualizar registros diários
router.post('/',
  checkPermission('criar'),
  registrosDiariosValidations.criar,
  handleValidationErrors,
  RegistrosDiariosController.criar
);

// DELETE /api/registros-diarios - Excluir registros de uma data
router.delete('/',
  checkPermission('excluir'),
  registrosDiariosValidations.excluir,
  handleValidationErrors,
  RegistrosDiariosController.excluir
);

module.exports = router;

