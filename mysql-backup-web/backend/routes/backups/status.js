const { getBackupStatus, formatBytes } = require('../../services/backup');
const { executeQuery } = require('../../services/database');

/**
 * GET /api/backups/:id/status
 * Obtém o status de um backup em execução
 */
async function getBackupStatusHandler(req, res) {
  try {
    const status = getBackupStatus(parseInt(req.params.id));
    
    if (!status) {
      // Buscar no banco se não estiver rodando
      const backups = await executeQuery('SELECT * FROM backups WHERE id = ?', [req.params.id]);
      
      if (!backups || backups.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Backup not found'
        });
      }
      
      return res.json({
        success: true,
        data: {
          running: false,
          status: backups[0].status,
          databaseName: backups[0].database_name,
          fileSize: backups[0].file_size,
          fileSizeFormatted: formatBytes(backups[0].file_size || 0),
          createdAt: backups[0].created_at,
          completedAt: backups[0].completed_at
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

module.exports = getBackupStatusHandler;

