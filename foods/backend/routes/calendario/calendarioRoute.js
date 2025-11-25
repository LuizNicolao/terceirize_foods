const express = require('express');
const { authenticateToken, checkScreenPermission } = require('../../middleware/auth');

// Controllers
const CalendarioDashboardController = require('../../controllers/calendario/CalendarioDashboardController');
const CalendarioVisualizacaoController = require('../../controllers/calendario/CalendarioVisualizacaoController');
const CalendarioConfiguracaoController = require('../../controllers/calendario/CalendarioConfiguracaoController');
const CalendarioAPIController = require('../../controllers/calendario/CalendarioAPIController');

const router = express.Router();

// Middleware de autenticação
router.use(authenticateToken);

// ===== DASHBOARD =====
router.get('/dashboard/estatisticas', checkScreenPermission('calendario', 'visualizar'), CalendarioDashboardController.obterEstatisticas);
router.get('/dashboard/resumo', checkScreenPermission('calendario', 'visualizar'), CalendarioDashboardController.obterResumo);

// ===== VISUALIZAÇÃO =====
router.get('/', checkScreenPermission('calendario', 'visualizar'), CalendarioVisualizacaoController.listar);
router.get('/mes', checkScreenPermission('calendario', 'visualizar'), CalendarioVisualizacaoController.obterPorMes);
router.get('/data/:data', checkScreenPermission('calendario', 'visualizar'), CalendarioVisualizacaoController.buscarPorData);

// ===== CONFIGURAÇÃO =====
router.post('/configuracao/dias-uteis', checkScreenPermission('calendario', 'editar'), CalendarioConfiguracaoController.configurarDiasUteis);
router.post('/configuracao/dias-abastecimento', checkScreenPermission('calendario', 'editar'), CalendarioConfiguracaoController.configurarDiasAbastecimento);
router.post('/configuracao/dias-consumo', checkScreenPermission('calendario', 'editar'), CalendarioConfiguracaoController.configurarDiasConsumo);
router.post('/configuracao/feriados', checkScreenPermission('calendario', 'editar'), CalendarioConfiguracaoController.adicionarFeriado);
router.delete('/configuracao/feriados/:data', checkScreenPermission('calendario', 'excluir'), CalendarioConfiguracaoController.removerFeriado);
router.get('/configuracao', checkScreenPermission('calendario', 'visualizar'), CalendarioConfiguracaoController.obterConfiguracao);
router.get('/configuracao/dias-nao-uteis', checkScreenPermission('calendario', 'visualizar'), CalendarioConfiguracaoController.listarDiasNaoUteis);
router.post('/configuracao/dias-nao-uteis', checkScreenPermission('calendario', 'editar'), CalendarioConfiguracaoController.adicionarDiaNaoUtil);
router.put('/configuracao/dias-nao-uteis/:id', checkScreenPermission('calendario', 'editar'), CalendarioConfiguracaoController.atualizarDiaNaoUtil);
router.delete('/configuracao/dias-nao-uteis/:id', checkScreenPermission('calendario', 'excluir'), CalendarioConfiguracaoController.removerDiaNaoUtil);

// ===== API DE INTEGRAÇÃO =====
// Semanas
router.get('/api/semanas-consumo/:ano', checkScreenPermission('calendario', 'visualizar'), CalendarioAPIController.buscarSemanasConsumo);
router.get('/api/semanas-abastecimento/:ano', checkScreenPermission('calendario', 'visualizar'), CalendarioAPIController.buscarSemanasAbastecimento);

// Dias
router.get('/api/dias-uteis/:ano/:mes', checkScreenPermission('calendario', 'visualizar'), CalendarioAPIController.buscarDiasUteis);
router.get('/api/dias-abastecimento/:ano/:mes', checkScreenPermission('calendario', 'visualizar'), CalendarioAPIController.buscarDiasAbastecimento);
router.get('/api/dias-consumo/:ano/:mes', checkScreenPermission('calendario', 'visualizar'), CalendarioAPIController.buscarDiasConsumo);

// Feriados
router.get('/api/feriados/:ano', checkScreenPermission('calendario', 'visualizar'), CalendarioAPIController.buscarFeriados);
router.get('/api/verificar-feriado/:data', checkScreenPermission('calendario', 'visualizar'), CalendarioAPIController.verificarFeriado);

// Semana por data
router.get('/api/semana-por-data/:data', checkScreenPermission('calendario', 'visualizar'), CalendarioAPIController.buscarSemanaPorDataConsumo);

// Semana de abastecimento por semana de consumo (usando query parameter para evitar problemas com caracteres especiais)
router.get('/api/semana-abastecimento-por-consumo', checkScreenPermission('calendario', 'visualizar'), CalendarioAPIController.buscarSemanaAbastecimentoPorConsumo);

module.exports = router;
