const { restoreBackup, getRestoreStatus } = require('../../services/backup');

/**
 * POST /api/backups/:id/restore
 * Restaura um backup (completo ou tabelas específicas)
 */
async function restoreBackupHandler(req, res) {
  try {
    const { tables } = req.body; // Array opcional de nomes de tabelas
    
    // Executar restore em background
    restoreBackup(req.params.id, tables)
      .then(result => {
        // Sucesso já tratado no serviço
      })
      .catch(error => {
        // Erro já tratado no serviço
      });
    
    const message = tables && tables.length > 0
      ? `Restore de ${tables.length} tabela(s) iniciado`
      : 'Restore completo iniciado';
    
    res.json({
      success: true,
      message: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/backups/:id/restore/status
 * Obtém o status de um restore em execução
 */
async function getRestoreStatusHandler(req, res) {
  try {
    const status = getRestoreStatus(req.params.id);
    
    if (!status) {
      return res.json({
        success: true,
        data: {
          running: false,
          message: 'Restore não está em execução ou já foi concluído'
        }
      });
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  restoreBackupHandler,
  getRestoreStatusHandler
};

