const { cancelBackup } = require('../../services/backup');

/**
 * POST /api/backups/:id/cancel
 * Cancela um backup em execução
 */
async function cancelBackupHandler(req, res) {
  try {
    const result = await cancelBackup(parseInt(req.params.id));
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = cancelBackupHandler;

