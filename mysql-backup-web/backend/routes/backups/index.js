const express = require('express');
const router = express.Router();

// Importar handlers
const listBackupsHandler = require('./list');
const createBackupHandler = require('./create');
const downloadBackupHandler = require('./download');
const { restoreBackupHandler, getRestoreStatusHandler } = require('./restore');
const getBackupLogsHandler = require('./logs');
const getBackupStatusHandler = require('./status');
const cancelBackupHandler = require('./cancel');
const deleteBackupHandler = require('./delete');

// Rotas principais
router.get('/', listBackupsHandler);
router.post('/', createBackupHandler);

// Rotas específicas por backup (rotas mais específicas primeiro)
router.get('/:id/restore/status', getRestoreStatusHandler);
router.get('/:id/logs', getBackupLogsHandler);
router.get('/:id/download', downloadBackupHandler);
router.get('/:id/status', getBackupStatusHandler);
router.post('/:id/restore', restoreBackupHandler);
router.post('/:id/cancel', cancelBackupHandler);
router.delete('/:id', deleteBackupHandler);

module.exports = router;

