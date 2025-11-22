const express = require('express');
const router = express.Router();
const { executeQuery } = require('../services/database');
const { loadSchedules } = require('../services/scheduler');
const cron = require('node-cron');

// Listar agendamentos
router.get('/', async (req, res) => {
  try {
    const schedules = await executeQuery('SELECT * FROM schedules ORDER BY database_name, schedule_type');
    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao listar agendamentos'
    });
  }
});

// Criar/atualizar agendamento
router.post('/', async (req, res) => {
  try {
    const { databaseName, scheduleType, cronExpression, enabled = true, status = 'ativo', selectedTables = null } = req.body;
    
    if (!databaseName || !scheduleType || !cronExpression) {
      return res.status(400).json({
        success: false,
        message: 'databaseName, scheduleType and cronExpression are required'
      });
    }
    
    // Validar expressão cron
    if (!cron.validate(cronExpression)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cron expression'
      });
    }
    
    // Preparar selectedTables como JSON
    let selectedTablesJson = null;
    if (selectedTables && Array.isArray(selectedTables) && selectedTables.length > 0) {
      selectedTablesJson = JSON.stringify(selectedTables);
    }
    
    await executeQuery(
      `INSERT INTO schedules (database_name, schedule_type, cron_expression, enabled, status, selected_tables)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       cron_expression = VALUES(cron_expression),
       enabled = VALUES(enabled),
       status = VALUES(status),
       selected_tables = VALUES(selected_tables),
       updated_at = NOW()`,
      [databaseName, scheduleType, cronExpression, enabled, status, selectedTablesJson]
    );
    
    // Recarregar agendamentos
    loadSchedules().catch(() => {});
    
    res.json({
      success: true,
      message: 'Schedule created/updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    const { databaseName, scheduleType, cronExpression, enabled = true, status = 'ativo', selectedTables = null } = req.body;
    const { id } = req.params;
    
    if (!databaseName || !scheduleType || !cronExpression) {
      return res.status(400).json({
        success: false,
        message: 'databaseName, scheduleType and cronExpression are required'
      });
    }
    
    // Validar expressão cron
    if (!cron.validate(cronExpression)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cron expression'
      });
    }
    
    // Verificar se o agendamento existe
    const existing = await executeQuery('SELECT * FROM schedules WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Preparar selectedTables como JSON
    let selectedTablesJson = null;
    if (selectedTables && Array.isArray(selectedTables) && selectedTables.length > 0) {
      selectedTablesJson = JSON.stringify(selectedTables);
    }
    
    // Atualizar agendamento
    await executeQuery(
      `UPDATE schedules 
       SET database_name = ?, schedule_type = ?, cron_expression = ?, enabled = ?, status = ?, selected_tables = ?, updated_at = NOW()
       WHERE id = ?`,
      [databaseName, scheduleType, cronExpression, enabled, status, selectedTablesJson, id]
    );
    
    // Recarregar agendamentos
    loadSchedules().catch(() => {});
    
    res.json({
      success: true,
      message: 'Schedule updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Deletar agendamento
router.delete('/:id', async (req, res) => {
  try {
    await executeQuery('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    
    // Recarregar agendamentos
    loadSchedules().catch(() => {});
    
    res.json({
      success: true,
      message: 'Schedule deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

