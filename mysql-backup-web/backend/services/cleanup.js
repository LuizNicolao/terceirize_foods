const { executeQuery } = require('./database');
const fs = require('fs').promises;
const { sendTelegram } = require('./telegram');

/**
 * Limpar backups antigos baseado na política de retenção
 * Exclui apenas backups 'completed' (bem-sucedidos)
 * NÃO exclui backups 'manual' nem 'incremental'
 */
async function cleanupOldBackups() {
  try {
    const retentionDaily = parseInt(process.env.BACKUP_RETENTION_DAILY) || 7;
    const retentionWeekly = parseInt(process.env.BACKUP_RETENTION_WEEKLY) || 4;
    const retentionMonthly = parseInt(process.env.BACKUP_RETENTION_MONTHLY) || 3;

    let deletedCount = 0;
    let errors = [];

    // Limpar backups diários (dias)
    const dailyCutoffDate = new Date();
    dailyCutoffDate.setDate(dailyCutoffDate.getDate() - retentionDaily);
    
    const dailyBackups = await executeQuery(
      `SELECT id, file_path, remote_path FROM backups 
       WHERE backup_type = 'daily' 
       AND status = 'completed'
       AND completed_at < ?`,
      [dailyCutoffDate]
    );

    for (const backup of dailyBackups) {
      try {
        // Deletar arquivo físico se existir
        if (backup.file_path) {
          try {
            await fs.unlink(backup.file_path);
          } catch (error) {
            // Arquivo já não existe, ignorar
          }
        }

        // Deletar registro do banco
        await executeQuery('DELETE FROM backups WHERE id = ?', [backup.id]);
        deletedCount++;
      } catch (error) {
        errors.push(`Erro ao deletar backup diário ${backup.id}: ${error.message}`);
      }
    }

    // Limpar backups semanais (semanas)
    const weeklyCutoffDate = new Date();
    weeklyCutoffDate.setDate(weeklyCutoffDate.getDate() - (retentionWeekly * 7));
    
    const weeklyBackups = await executeQuery(
      `SELECT id, file_path, remote_path FROM backups 
       WHERE backup_type = 'weekly' 
       AND status = 'completed'
       AND completed_at < ?`,
      [weeklyCutoffDate]
    );

    for (const backup of weeklyBackups) {
      try {
        // Deletar arquivo físico se existir
        if (backup.file_path) {
          try {
            await fs.unlink(backup.file_path);
          } catch (error) {
            // Arquivo já não existe, ignorar
          }
        }

        // Deletar registro do banco
        await executeQuery('DELETE FROM backups WHERE id = ?', [backup.id]);
        deletedCount++;
      } catch (error) {
        errors.push(`Erro ao deletar backup semanal ${backup.id}: ${error.message}`);
      }
    }

    // Limpar backups mensais (meses)
    const monthlyCutoffDate = new Date();
    monthlyCutoffDate.setMonth(monthlyCutoffDate.getMonth() - retentionMonthly);
    
    const monthlyBackups = await executeQuery(
      `SELECT id, file_path, remote_path FROM backups 
       WHERE backup_type = 'monthly' 
       AND status = 'completed'
       AND completed_at < ?`,
      [monthlyCutoffDate]
    );

    for (const backup of monthlyBackups) {
      try {
        // Deletar arquivo físico se existir
        if (backup.file_path) {
          try {
            await fs.unlink(backup.file_path);
          } catch (error) {
            // Arquivo já não existe, ignorar
          }
        }

        // Deletar registro do banco
        await executeQuery('DELETE FROM backups WHERE id = ?', [backup.id]);
        deletedCount++;
      } catch (error) {
        errors.push(`Erro ao deletar backup mensal ${backup.id}: ${error.message}`);
      }
    }

    // Enviar notificação se houver limpeza
    if (deletedCount > 0) {
      const message = `🧹 Limpeza de backups concluída\n📊 ${deletedCount} backup(s) removido(s)\n${errors.length > 0 ? `⚠️ ${errors.length} erro(s)` : ''}`;
      sendTelegram(message).catch(() => {});
    }

    return {
      success: true,
      deletedCount,
      errors: errors.length > 0 ? errors : null
    };
  } catch (error) {
    console.error('Erro na limpeza de backups:', error);
    sendTelegram(`❌ Erro na limpeza de backups: ${error.message}`).catch(() => {});
    throw error;
  }
}

module.exports = {
  cleanupOldBackups
};

