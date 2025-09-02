/**
 * Rotas compartilhadas
 * Funcionalidades que precisam estar disponíveis em ambos os prefixos (/api e /foods/api)
 */
const express = require('express');
const router = express.Router();
const TokenValidationController = require('../controllers/shared/tokenValidationController');

// Rota para validar token do sistema de cotação
router.post('/auth/validate-cotacao-token', TokenValidationController.validateCotacaoToken);

// Rota segura para busca de fornecedores (para sistema de cotação)
router.get('/fornecedores/public', TokenValidationController.getPublicFornecedores);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota para resetar rate limiting (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  router.post('/reset-rate-limit', (req, res) => {
    try {
      // Resetar rate limiting para o IP atual
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Limpar rate limiting do login
      if (req.app.locals.loginLimiter && req.app.locals.loginLimiter.resetKey) {
        req.app.locals.loginLimiter.resetKey(clientIP);
      }
      
      // Limpar rate limiting geral
      if (req.app.locals.limiter && req.app.locals.limiter.resetKey) {
        req.app.locals.limiter.resetKey(clientIP);
      }
      
      res.json({ 
        message: 'Rate limiting resetado com sucesso',
        ip: clientIP,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao resetar rate limiting:', error);
      res.status(500).json({ error: 'Erro ao resetar rate limiting' });
    }
  });
}

module.exports = router;
