const express = require('express');
const router = express.Router();

// Obter configurações
router.get('/', (req, res) => {
  const telegramToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const telegramChatId = (process.env.TELEGRAM_CHAT_ID || '').trim();
  
  // Verificar se ambos estão configurados e não são strings vazias
  const telegramEnabled = !!(telegramToken && telegramChatId);
  
  res.json({
    success: true,
    data: {
      backupBaseDir: process.env.BACKUP_BASE_DIR || '/backups',
      retentionDaily: parseInt(process.env.BACKUP_RETENTION_DAILY) || 7,
      retentionWeekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY) || 4,
      retentionMonthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY) || 3,
      timezone: process.env.TZ || 'UTC',
      telegramEnabled: telegramEnabled
    }
  });
});

module.exports = router;

