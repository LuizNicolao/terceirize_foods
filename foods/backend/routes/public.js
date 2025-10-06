const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

/**
 * Middleware para validar IP interno
 */
const validateInternalIP = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  // Redes permitidas
  const allowedNetworks = [
    '172.16.0.0/12',    // Docker networks
    '10.0.0.0/8',       // Internal networks
    '192.168.0.0/16',   // Local networks
    '127.0.0.0/8',      // Localhost
  ];
  
  // Verificar se IP está em rede permitida (simplificado)
  const isAllowed = allowedNetworks.some(network => {
    if (network === '127.0.0.0/8') {
      return clientIP.startsWith('127.') || clientIP === '::1';
    }
    if (network === '172.16.0.0/12') {
      return clientIP.startsWith('172.');
    }
    if (network === '10.0.0.0/8') {
      return clientIP.startsWith('10.');
    }
    if (network === '192.168.0.0/16') {
      return clientIP.startsWith('192.168.');
    }
    return false;
  });
  
  if (isAllowed) {
    console.log(`✅ Foods - IP autorizado: ${clientIP}`);
    next();
  } else {
    console.log(`❌ Foods - IP negado: ${clientIP}`);
    res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Apenas redes internas são permitidas',
      clientIP: clientIP
    });
  }
};

/**
 * Middleware para log de acesso
 */
const logAccess = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Foods Public API - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

// Aplicar middlewares a todas as rotas
router.use(logAccess);
router.use(validateInternalIP);

/**
 * GET /api/public/fornecedores
 * Retorna lista de fornecedores para consulta por outros sistemas
 */
router.get('/fornecedores', async (req, res) => {
  try {
    const fornecedores = await executeQuery(`
      SELECT 
        id,
        nome,
        email,
        telefone,
        status,
        created_at,
        updated_at
      FROM fornecedores 
      WHERE status = 'ativo'
      ORDER BY nome ASC
    `);
    
    res.json({
      success: true,
      data: fornecedores,
      total: fornecedores.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/public/produtos
 * Retorna lista de produtos para consulta por outros sistemas
 */
router.get('/produtos', async (req, res) => {
  try {
    const produtos = await executeQuery(`
      SELECT 
        id,
        nome,
        descricao,
        unidade,
        categoria,
        status,
        created_at,
        updated_at
      FROM produtos 
      WHERE status = 'ativo'
      ORDER BY nome ASC
    `);
    
    res.json({
      success: true,
      data: produtos,
      total: produtos.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/public/usuarios
 * Retorna lista de usuários para validação de SSO
 */
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await executeQuery(`
      SELECT 
        id,
        nome,
        email,
        tipo_de_acesso,
        status,
        created_at
      FROM usuarios 
      WHERE status = 'ativo'
      ORDER BY nome ASC
    `);
    
    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/public/usuario/:email
 * Busca usuário específico por email (para SSO)
 */
router.get('/usuario/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const usuarios = await executeQuery(`
      SELECT 
        id,
        nome,
        email,
        tipo_de_acesso,
        status,
        created_at
      FROM usuarios 
      WHERE email = ? AND status = 'ativo'
    `, [email]);
    
    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: usuarios[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/public/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Foods Public API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
