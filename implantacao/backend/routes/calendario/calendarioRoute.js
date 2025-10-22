const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../../middleware/permissoes');

// Controllers
const CalendarioDashboardController = require('../../controllers/calendario/CalendarioDashboardController');
const CalendarioVisualizacaoController = require('../../controllers/calendario/CalendarioVisualizacaoController');
const CalendarioConfiguracaoController = require('../../controllers/calendario/CalendarioConfiguracaoController');
const CalendarioAPIController = require('../../controllers/calendario/CalendarioAPIController');

const router = express.Router();

// Middleware de autenticação
router.use(authenticateToken);

// ===== DASHBOARD =====
router.get('/dashboard/estatisticas', canView('calendario'), CalendarioDashboardController.obterEstatisticas);
router.get('/dashboard/resumo', canView('calendario'), CalendarioDashboardController.obterResumo);

// ===== VISUALIZAÇÃO =====
router.get('/', canView('calendario'), CalendarioVisualizacaoController.listar);
router.get('/mes', canView('calendario'), CalendarioVisualizacaoController.obterPorMes);
router.get('/data/:data', canView('calendario'), CalendarioVisualizacaoController.buscarPorData);

// ===== CONFIGURAÇÃO =====
router.post('/configuracao/dias-uteis', canEdit('calendario'), CalendarioConfiguracaoController.configurarDiasUteis);
router.post('/configuracao/dias-abastecimento', canEdit('calendario'), CalendarioConfiguracaoController.configurarDiasAbastecimento);
router.post('/configuracao/dias-consumo', canEdit('calendario'), CalendarioConfiguracaoController.configurarDiasConsumo);
router.post('/configuracao/feriados', canEdit('calendario'), CalendarioConfiguracaoController.adicionarFeriado);
router.delete('/configuracao/feriados/:data', canDelete('calendario'), CalendarioConfiguracaoController.removerFeriado);
router.get('/configuracao', canView('calendario'), CalendarioConfiguracaoController.obterConfiguracao);

// ===== API DE INTEGRAÇÃO =====
// Semanas
router.get('/api/semanas-consumo/:ano', canView('calendario'), CalendarioAPIController.buscarSemanasConsumo);
router.get('/api/semanas-abastecimento/:ano', canView('calendario'), CalendarioAPIController.buscarSemanasAbastecimento);

// Dias
router.get('/api/dias-uteis/:ano/:mes', canView('calendario'), CalendarioAPIController.buscarDiasUteis);
router.get('/api/dias-abastecimento/:ano/:mes', canView('calendario'), CalendarioAPIController.buscarDiasAbastecimento);
router.get('/api/dias-consumo/:ano/:mes', canView('calendario'), CalendarioAPIController.buscarDiasConsumo);

// Feriados
router.get('/api/feriados/:ano', canView('calendario'), CalendarioAPIController.buscarFeriados);
router.get('/api/verificar-feriado/:data', canView('calendario'), CalendarioAPIController.verificarFeriado);

// Semana por data
router.get('/api/semana-por-data/:data', canView('calendario'), CalendarioAPIController.buscarSemanaPorDataConsumo);

module.exports = router;
