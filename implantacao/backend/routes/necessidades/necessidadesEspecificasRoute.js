const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const { canView, canCreate } = require('../../middleware/permissoes');
const { 
  gerarNecessidade,
  listarEscolasNutricionista
} = require('../../controllers/necessidades');
const { 
  validateGerarNecessidade
} = require('./necessidadesValidator');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ===== ROTAS ESPECÍFICAS QUE DEVEM VIR ANTES DAS ROTAS DE AJUSTE =====
router.post('/gerar', canCreate('necessidades'), validateGerarNecessidade, gerarNecessidade);
router.get('/escolas-nutricionista/:usuarioId', canView('necessidades'), listarEscolasNutricionista);

module.exports = router;
