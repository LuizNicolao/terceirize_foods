/**
 * Rotas de Auditoria
 * Implementa endpoints para visualização e exportação de logs de auditoria
 */

const express = require('express');
const router = express.Router();
const AuditoriaListController = require('../controllers/auditoria/AuditoriaListController');
const AuditoriaExportController = require('../controllers/auditoria/AuditoriaExportController');
const { authenticateToken } = require('../middleware/auth');

// Rota de teste
router.get('/test', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Endpoint de auditoria funcionando',
    user: req.user 
  });
});

// Rota de teste do banco
router.get('/test-db', authenticateToken, async (req, res) => {
  try {
    const { executeQuery } = require('../config/database');
    
    // Verificar se a tabela existe
    const tableCheckQuery = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'auditoria_acoes'
    `;
    
    const tableCheck = await executeQuery(tableCheckQuery);
    const tableExists = tableCheck[0].count > 0;
    
    if (tableExists) {
      // Contar registros
      const countQuery = `SELECT COUNT(*) as total FROM auditoria_acoes`;
      const countResult = await executeQuery(countQuery);
      
      res.json({
        success: true,
        message: 'Conexão com banco funcionando',
        tableExists: true,
        totalRecords: countResult[0].total
      });
    } else {
      res.json({
        success: true,
        message: 'Conexão com banco funcionando',
        tableExists: false,
        totalRecords: 0
      });
    }
  } catch (error) {
    console.error('Erro no teste do banco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na conexão com banco',
      error: error.message
    });
  }
});

// Rota simples para listar logs
router.get('/simple', authenticateToken, async (req, res) => {
  try {
    const { executeQuery } = require('../config/database');
    
    const query = `SELECT * FROM auditoria_acoes LIMIT 10`;
    const logs = await executeQuery(query);
    
    res.json({
      success: true,
      data: logs,
      message: 'Logs carregados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar logs simples:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar logs',
      error: error.message
    });
  }
});

// Rotas de listagem
router.get('/', authenticateToken, AuditoriaListController.listarLogs);
router.get('/stats', authenticateToken, AuditoriaListController.buscarEstatisticas);

// Rotas de exportação
router.get('/export/xlsx', authenticateToken, AuditoriaExportController.exportarXLSX);
router.get('/export/pdf', authenticateToken, AuditoriaExportController.exportarPDF);

module.exports = router;
