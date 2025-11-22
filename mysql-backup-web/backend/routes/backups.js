const express = require('express');
const router = express.Router();
const { createBackup, restoreBackup, listBackups, formatBytes, cancelBackup, getBackupStatus, getRestoreStatus } = require('../services/backup');
const { executeQuery } = require('../services/database');
const fs = require('fs').promises;
const path = require('path');

// Listar backups
router.get('/', async (req, res) => {
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
});

// Criar backup manual
router.post('/', async (req, res) => {
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
      })
      .catch(error => {
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
});

// Download backup
router.get('/:id/download', async (req, res) => {
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
});

// Restaurar backup (pode receber lista de tabelas opcional)
router.post('/:id/restore', async (req, res) => {
  try {
    const { tables } = req.body; // Array opcional de nomes de tabelas
    
    // Executar restore em background
    restoreBackup(req.params.id, tables)
      .then(result => {
      })
      .catch(error => {
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
});

// Obter status do restore em execução
router.get('/:id/restore/status', async (req, res) => {
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
});

// Obter status de backup em execução
router.get('/:id/status', async (req, res) => {
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
});

// Cancelar backup em execução
router.post('/:id/cancel', async (req, res) => {
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
});

// Obter status de backup em execução
router.get('/:id/status', async (req, res) => {
  try {
    const backupId = parseInt(req.params.id);
    const status = getBackupStatus(backupId);
    
    if (!status) {
      // Buscar no banco se não estiver rodando
      const backups = await executeQuery('SELECT * FROM backups WHERE id = ?', [backupId]);
      
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
});

// Cancelar backup em execução
router.post('/:id/cancel', async (req, res) => {
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
});

// Deletar backup
router.delete('/:id', async (req, res) => {
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
      await fs.unlink(backup.file_path);
    } catch (error) {
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
});

module.exports = router;

