const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { registrosDiariosValidations, handleValidationErrors } = require('./registrosDiariosValidator');
const RegistrosDiariosController = require('../../controllers/registros-diarios');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/registros-diarios - Listar registros diários com paginação
router.get('/',
  checkScreenPermission('registros_diarios', 'visualizar'),
  registrosDiariosValidations.listar,
  handleValidationErrors,
  RegistrosDiariosController.listar
);

// GET /api/registros-diarios/medias - Listar médias por escola
router.get('/medias',
  checkScreenPermission('registros_diarios', 'visualizar'),
  RegistrosDiariosController.listarMedias
);

// GET /api/registros-diarios/historico - Listar histórico completo de uma escola
router.get('/historico',
  checkScreenPermission('registros_diarios', 'visualizar'),
  RegistrosDiariosController.listarHistorico
);

// GET /api/registros-diarios/medias-periodo - Calcular médias por período (necessidades)
router.get('/medias-periodo',
  checkScreenPermission('registros_diarios', 'visualizar'),
  RegistrosDiariosController.calcularMediasPorPeriodo
);

// GET /api/registros-diarios/estatisticas - Obter estatísticas
router.get('/estatisticas',
  checkScreenPermission('registros_diarios', 'visualizar'),
  RegistrosDiariosController.obterEstatisticas
);

// GET /api/registros-diarios/buscar - Buscar registros de uma escola em uma data
router.get('/buscar',
  checkScreenPermission('registros_diarios', 'visualizar'),
  registrosDiariosValidations.buscarPorEscolaData,
  handleValidationErrors,
  RegistrosDiariosController.buscarPorEscolaData
);

// POST /api/registros-diarios - Criar/atualizar registros diários
router.post('/',
  checkScreenPermission('registros_diarios', 'criar'),
  registrosDiariosValidations.criar,
  handleValidationErrors,
  RegistrosDiariosController.criar
);

// DELETE /api/registros-diarios - Excluir registros de uma data
router.delete('/',
  checkScreenPermission('registros_diarios', 'excluir'),
  registrosDiariosValidations.excluir,
  handleValidationErrors,
  RegistrosDiariosController.excluir
);

module.exports = router;

