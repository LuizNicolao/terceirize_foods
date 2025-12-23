const { executeQuery } = require('../../services/database');
const fs = require('fs').promises;
const path = require('path');

/**
 * GET /api/backups/:id/download
 * Download de um arquivo de backup
 */
async function downloadBackupHandler(req, res) {
  try {
    const backups = await executeQuery('SELECT * FROM backups WHERE id = ?', [req.params.id]);
    
    if (!backups || backups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }
    
    const backup = backups[0];
    const filePath = backup.file_path;
    
    // Verificar se arquivo existe
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }
    
    const fileName = path.basename(filePath);
    
    // Configurar headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/gzip');
    
    // Enviar arquivo
    res.download(filePath, fileName, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Erro ao enviar arquivo de backup'
          });
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = downloadBackupHandler;

