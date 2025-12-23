const { executeQuery } = require('../../services/database');
const { getBackupBaseDir } = require('../../services/backup');
const fs = require('fs').promises;
const path = require('path');

/**
 * GET /api/backups/:id/logs
 * Obtém os logs de um backup
 */
async function getBackupLogsHandler(req, res) {
  try {
    const backups = await executeQuery('SELECT * FROM backups WHERE id = ?', [req.params.id]);
    
    if (!backups || backups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }
    
    const backup = backups[0];
    
    // Para backups incrementais ou backups que falharam, usar error_message se disponível
    if (backup.backup_type === 'incremental' || backup.status === 'failed') {
      if (backup.error_message) {
        return res.json({
          success: true,
          data: {
            log: `Erro do Backup:\n${backup.error_message}\n\nStatus: ${backup.status}\nCriado em: ${backup.created_at}\nConcluído em: ${backup.completed_at || 'Não concluído'}`,
            logPath: null,
            timestamp: null,
            source: 'database_error_message'
          }
        });
      }
      
      // Se não tem error_message mas falhou, retornar informação básica
      if (backup.status === 'failed') {
        return res.json({
          success: true,
          data: {
            log: `Backup falhou sem mensagem de erro específica.\n\nStatus: ${backup.status}\nCriado em: ${backup.created_at}\nConcluído em: ${backup.completed_at || 'Não concluído'}`,
            logPath: null,
            timestamp: null,
            source: 'database_status'
          }
        });
      }
    }
    
    // Extrair timestamp do file_path ou usar created_at
    let timestamp = null;
    
    // Tentar extrair do file_path: database_name_YYYY-MM-DD_HHMMSS.sql.gz ou table_name_YYYY-MM-DD_HHMMSS_incremental.sql.gz
    if (backup.file_path) {
      const fileName = path.basename(backup.file_path);
      const match = fileName.match(/(\d{4}-\d{2}-\d{2}_\d{6})/);
      if (match) {
        timestamp = match[1];
      }
    }
    
    // Se não encontrou no file_path, usar created_at
    if (!timestamp && backup.created_at) {
      const date = new Date(backup.created_at);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      timestamp = `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
    }
    
    if (!timestamp) {
      // Se não conseguiu determinar timestamp e não tem error_message, retornar info básica
      return res.json({
        success: true,
        data: {
          log: `Informações do Backup:\n\nStatus: ${backup.status}\nTipo: ${backup.backup_type}\nBanco: ${backup.database_name}\nCriado em: ${backup.created_at}\nConcluído em: ${backup.completed_at || 'Não concluído'}\n${backup.error_message ? `\nErro: ${backup.error_message}` : ''}`,
          logPath: null,
          timestamp: null,
          source: 'database_info'
        }
      });
    }
    
    // Construir caminho do log
    const BACKUP_BASE_DIR = getBackupBaseDir();
    const logPath = path.join(BACKUP_BASE_DIR, 'logs', `backup_${timestamp}.log`);
    
    // Verificar se o arquivo existe
    try {
      await fs.access(logPath);
    } catch {
      // Se não tem arquivo de log, retornar informações básicas do backup
      const logMessage = backup.error_message
        ? `Erro do Backup:\n${backup.error_message}\n\n`
        : '';
      
      return res.json({
        success: true,
        data: {
          log: `${logMessage}Informações do Backup:\n\nStatus: ${backup.status}\nTipo: ${backup.backup_type}\nBanco: ${backup.database_name}\nCriado em: ${backup.created_at}\nConcluído em: ${backup.completed_at || 'Não concluído'}\n${backup.file_size ? `Tamanho: ${(backup.file_size / 1024).toFixed(2)} KB` : ''}\n\nArquivo de log físico não encontrado. Este backup pode não ter gerado um arquivo de log ou o arquivo foi removido.`,
          logPath: null,
          timestamp: timestamp,
          source: 'database_info'
        }
      });
    }
    
    // Ler conteúdo do log
    try {
      const logContent = await fs.readFile(logPath, 'utf-8');
      
      res.json({
        success: true,
        data: {
          log: logContent,
          logPath: logPath,
          timestamp: timestamp,
          source: 'log_file'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Erro ao ler arquivo de log: ${error.message}`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = getBackupLogsHandler;

