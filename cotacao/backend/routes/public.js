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
    console.log(`✅ Cotação - IP autorizado: ${clientIP}`);
    next();
  } else {
    console.log(`❌ Cotação - IP negado: ${clientIP}`);
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
  console.log(`[${new Date().toISOString()}] Cotação Public API - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

// Aplicar middlewares a todas as rotas
router.use(logAccess);
router.use(validateInternalIP);

/**
 * GET /api/public/cotacoes
 * Retorna lista de cotações para consulta por outros sistemas
 */
router.get('/cotacoes', async (req, res) => {
  try {
    const cotacoes = await executeQuery(`
      SELECT 
        id,
        titulo,
        descricao,
        status,
        created_at,
        updated_at
      FROM cotacoes 
      WHERE status IN ('ativa', 'finalizada')
      ORDER BY created_at DESC
      LIMIT 100
    `);
    
    res.json({
      success: true,
      data: cotacoes,
      total: cotacoes.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/public/fornecedores
 * Retorna lista de fornecedores do sistema de cotação
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
 * GET /api/public/produtos/:cotacao_id
 * Retorna produtos de uma cotação específica
 */
router.get('/produtos/:cotacao_id', async (req, res) => {
  try {
    const { cotacao_id } = req.params;
    
    const produtos = await executeQuery(`
      SELECT 
        p.id,
        p.nome,
        p.qtde,
        p.un,
        p.entrega,
        p.prazo_entrega,
        c.titulo as cotacao_titulo
      FROM produtos p
      JOIN cotacoes c ON p.cotacao_id = c.id
      WHERE p.cotacao_id = ? AND c.status IN ('ativa', 'finalizada')
      ORDER BY p.nome ASC
    `, [cotacao_id]);
    
    res.json({
      success: true,
      data: produtos,
      total: produtos.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar produtos da cotação:', error);
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
        name,
        email,
        role,
        status,
        created_at
      FROM users 
      WHERE status = 'ativo'
      ORDER BY name ASC
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
        name,
        email,
        role,
        status,
        created_at
      FROM users 
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
    message: 'Cotação Public API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
