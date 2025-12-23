const { createBackup } = require('../../services/backup');

/**
 * POST /api/backups
 * Cria um novo backup (manual ou agendado)
 */
async function createBackupHandler(req, res) {
  try {
    const { databaseName, backupType = 'manual', selectedTables = null } = req.body;
    
    if (!databaseName) {
      return res.status(400).json({
        success: false,
        message: 'databaseName is required'
      });
    }
    
    // Validar selectedTables se fornecido
    let tables = null;
    if (selectedTables && Array.isArray(selectedTables) && selectedTables.length > 0) {
      tables = selectedTables;
    }
    
    // Executar backup em background
    createBackup(databaseName, backupType, tables)
      .then(result => {
        // Sucesso já tratado no serviço
      })
      .catch(error => {
        // Erro já tratado no serviço
      });
    
    res.json({
      success: true,
      message: tables 
        ? `Backup de ${tables.length} tabela(s) iniciado`
        : 'Backup completo iniciado',
      databaseName,
      backupType,
      selectedTables: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = createBackupHandler;

