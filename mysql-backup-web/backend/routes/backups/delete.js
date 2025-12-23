const { executeQuery } = require('../../services/database');
const fs = require('fs').promises;

/**
 * DELETE /api/backups/:id
 * Deleta um backup (arquivo e registro)
 */
async function deleteBackupHandler(req, res) {
  try {
    const backups = await executeQuery('SELECT * FROM backups WHERE id = ?', [req.params.id]);
    
    if (!backups || backups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }
    
    const backup = backups[0];
    
    // Deletar arquivo
    try {
      if (backup.file_path) {
        await fs.unlink(backup.file_path);
      }
    } catch (error) {
      // Ignorar erro se arquivo não existir
    }
    
    // Deletar registro
    await executeQuery('DELETE FROM backups WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Backup deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = deleteBackupHandler;

