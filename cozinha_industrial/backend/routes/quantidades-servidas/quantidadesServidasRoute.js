const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');
const { paginationMiddleware } = require('../../middleware/pagination');
const { quantidadesServidasValidations, handleValidationErrors } = require('./quantidadesServidasValidator');
const QuantidadesServidasController = require('../../controllers/quantidades-servidas');
const { QuantidadesServidasImportController, upload } = require('../../controllers/quantidades-servidas/QuantidadesServidasImportController');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/quantidades-servidas - Listar registros diários com paginação
router.get('/',
  checkScreenPermission('quantidades_servidas', 'visualizar'),
  paginationMiddleware,
  quantidadesServidasValidations.listar,
  handleValidationErrors,
  QuantidadesServidasController.listar
);

// GET /api/quantidades-servidas/medias - Listar médias por unidade
router.get('/medias',
  checkScreenPermission('quantidades_servidas', 'visualizar'),
  QuantidadesServidasController.listarMedias
);

// GET /api/quantidades-servidas/historico - Listar histórico completo de uma unidade
router.get('/historico',
  checkScreenPermission('quantidades_servidas', 'visualizar'),
  QuantidadesServidasController.listarHistorico
);

// GET /api/quantidades-servidas/medias-periodo - Calcular médias por período (necessidades)
router.get('/medias-periodo',
  checkScreenPermission('quantidades_servidas', 'visualizar'),
  QuantidadesServidasController.calcularMediasPorPeriodo
);

// GET /api/quantidades-servidas/estatisticas - Obter estatísticas
router.get('/estatisticas',
  checkScreenPermission('quantidades_servidas', 'visualizar'),
  QuantidadesServidasController.obterEstatisticas
);

// GET /api/quantidades-servidas/export/xlsx - Exportar registros em XLSX
router.get('/export/xlsx',
  checkScreenPermission('quantidades_servidas', 'visualizar'),
  QuantidadesServidasController.exportarXLSX
);

// GET /api/quantidades-servidas/export/pdf - Exportar registros em PDF
router.get('/export/pdf',
  checkScreenPermission('quantidades_servidas', 'visualizar'),
  QuantidadesServidasController.exportarPDF
);

// GET /api/quantidades-servidas/buscar - Buscar registros de uma unidade em uma data
router.get('/buscar',
  checkScreenPermission('quantidades_servidas', 'visualizar'),
  quantidadesServidasValidations.buscarPorUnidadeData,
  handleValidationErrors,
  QuantidadesServidasController.buscarPorUnidadeData
);

// GET /api/quantidades-servidas/modelo - Baixar modelo de planilha para importação
router.get('/modelo',
  checkScreenPermission('quantidades_servidas', 'criar'),
  QuantidadesServidasImportController.baixarModelo
);

// POST /api/quantidades-servidas/importar - Importar registros diários via Excel
// Timeout aumentado para 10 minutos (600000ms) para arquivos grandes
router.post('/importar',
  checkScreenPermission('quantidades_servidas', 'criar'),
  upload.single('file'),
  (req, res, next) => {
    // Aumentar timeout para 10 minutos
    req.setTimeout(600000);
    res.setTimeout(600000);
    next();
  },
  QuantidadesServidasImportController.importar
);

// POST /api/quantidades-servidas - Criar/atualizar registros diários
router.post('/',
  checkScreenPermission('quantidades_servidas', 'criar'),
  quantidadesServidasValidations.criar,
  handleValidationErrors,
  QuantidadesServidasController.criar
);

// DELETE /api/quantidades-servidas - Excluir registros de uma data
router.delete('/',
  checkScreenPermission('quantidades_servidas', 'excluir'),
  quantidadesServidasValidations.excluir,
  handleValidationErrors,
  QuantidadesServidasController.excluir
);

module.exports = router;

