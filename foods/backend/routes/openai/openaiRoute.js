/**
 * OpenAI Routes - Rotas para processamento de ingredientes com IA
 */

const express = require('express');
const router = express.Router();
const OpenAIController = require('../../controllers/openai/OpenAIController');

// Middleware de rate limiting (opcional)
const rateLimit = require('express-rate-limit');

// Rate limiting para evitar abuso da API
const openaiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP a cada 15 minutos
  message: {
    sucesso: false,
    erro: 'Muitas requisições. Tente novamente em 15 minutos.',
    codigo: 'RATE_LIMIT_EXCEDIDO'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware de validação básica
const validarRequisicao = (req, res, next) => {
  // Verifica se é POST para endpoints que precisam de body
  if (req.method === 'POST' && !req.body) {
    return res.status(400).json({
      sucesso: false,
      erro: 'Body da requisição é obrigatório',
      codigo: 'BODY_OBRIGATORIO'
    });
  }
  next();
};

// Aplicar rate limiting e validação
router.use(openaiRateLimit);
router.use(validarRequisicao);

/**
 * @route POST /api/openai/extrair-ingredientes
 * @desc Extrai ingredientes de um texto de receita usando IA
 * @access Public (com rate limiting)
 */
router.post('/extrair-ingredientes', OpenAIController.extrairIngredientes);

/**
 * @route GET /api/openai/testar-conexao
 * @desc Testa a conexão com a API OpenAI
 * @access Public
 */
router.get('/testar-conexao', OpenAIController.testarConexao);

/**
 * @route GET /api/openai/info
 * @desc Retorna informações sobre o serviço OpenAI
 * @access Public
 */
router.get('/info', OpenAIController.obterInfo);

// Middleware de tratamento de rotas não encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: 'Rota não encontrada',
    codigo: 'ROTA_NAO_ENCONTRADA',
    rota: req.originalUrl,
    metodo: req.method
  });
});

// Middleware de tratamento de erros
router.use((error, req, res, next) => {
  console.error('❌ Erro na rota OpenAI:', error);
  
  res.status(500).json({
    sucesso: false,
    erro: 'Erro interno do servidor',
    codigo: 'ERRO_INTERNO_ROTA',
    detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;
