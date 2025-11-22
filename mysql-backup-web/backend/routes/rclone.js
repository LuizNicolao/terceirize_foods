const express = require('express');
const router = express.Router();
const { 
  getRcloneConfig, 
  testRemote, 
  uploadFile, 
  listRemoteFiles,
  checkRcloneInstalled,
  createRemote,
  deleteRemote,
  getRemoteTypes
} = require('../services/rclone');

// Obter configuração do rclone
router.get('/config', async (req, res) => {
  try {
    const config = await getRcloneConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Testar conexão com remoto
router.post('/test', async (req, res) => {
  try {
    const { remoteName } = req.body;
    
    if (!remoteName) {
      return res.status(400).json({
        success: false,
        message: 'Nome do remoto é obrigatório'
      });
    }

    const result = await testRemote(remoteName);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Listar arquivos no remoto
router.get('/list', async (req, res) => {
  try {
    const { remotePath, maxResults } = req.query;
    
    if (!remotePath) {
      return res.status(400).json({
        success: false,
        message: 'Caminho remoto é obrigatório'
      });
    }

    const result = await listRemoteFiles(remotePath, parseInt(maxResults) || 100);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verificar se rclone está instalado
router.get('/check', async (req, res) => {
  try {
    const installed = await checkRcloneInstalled();
    res.json({
      success: true,
      installed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter tipos de remoto disponíveis
router.get('/types', async (req, res) => {
  try {
    const result = await getRemoteTypes();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Criar novo remoto
router.post('/create', async (req, res) => {
  try {
    const { name, type, credentials } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Nome e tipo do remoto são obrigatórios'
      });
    }

    const result = await createRemote({ name, type, credentials });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Deletar remoto
router.delete('/:remoteName', async (req, res) => {
  try {
    const { remoteName } = req.params;
    const result = await deleteRemote(remoteName);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

