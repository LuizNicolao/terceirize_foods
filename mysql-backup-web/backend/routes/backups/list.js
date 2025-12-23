const { listBackups, formatBytes } = require('../../services/backup');
const { executeQuery } = require('../../services/database');
const fs = require('fs').promises;

/**
 * GET /api/backups
 * Lista todos os backups com filtros opcionais
 */
async function listBackupsHandler(req, res) {
  try {
    const filters = {
      databaseName: req.query.database,
      backupType: req.query.type,
      status: req.query.status,
      limit: req.query.limit ? parseInt(req.query.limit) : 100
    };
    
    const backups = await listBackups(filters);
    
    // Adicionar informações de arquivo (se o arquivo existir)
    const backupsWithInfo = await Promise.all(
      backups.map(async (backup) => {
        // Para backups em execução, o arquivo pode não existir ainda
        if (!backup.file_path) {
          return {
            ...backup,
            file_exists: false,
            file_size_formatted: '0 Bytes'
          };
        }
        
        try {
          const stats = await fs.stat(backup.file_path);
          return {
            ...backup,
            file_exists: true,
            file_size_formatted: formatBytes(backup.file_size || stats.size),
            last_modified: stats.mtime
          };
        } catch {
          // Arquivo não existe ainda (backup em execução ou falhou antes de criar)
          return {
            ...backup,
            file_exists: false,
            file_size_formatted: formatBytes(backup.file_size || 0)
          };
        }
      })
    );
    
    res.json({
      success: true,
      data: backupsWithInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = listBackupsHandler;

