const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const {
  listarParaAjuste,
  salvarAjustes,
  incluirProdutoExtra,
  liberarCoordenacao,
  buscarProdutosParaModal
} = require('../../controllers/necessidades/NecessidadesAjusteController');

// Middleware para verificar se é nutricionista
const isNutricionista = (req, res, next) => {
  if (req.user.tipo_de_acesso !== 'nutricionista') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado',
      message: 'Apenas nutricionistas podem acessar esta funcionalidade'
    });
  }
  next();
};

// GET /api/necessidades/ajuste - Listar necessidades para ajuste
router.get('/ajuste', authenticateToken, isNutricionista, listarParaAjuste);

// PUT /api/necessidades/ajustes - Salvar ajustes da nutricionista
router.put('/ajustes', authenticateToken, isNutricionista, salvarAjustes);

// POST /api/necessidades/produto-extra - Incluir produto extra
router.post('/produto-extra', authenticateToken, isNutricionista, incluirProdutoExtra);

// POST /api/necessidades/liberar-coordenacao - Liberar para coordenação
router.post('/liberar-coordenacao', authenticateToken, isNutricionista, liberarCoordenacao);

// GET /api/necessidades/produtos-modal - Buscar produtos para modal
router.get('/produtos-modal', authenticateToken, isNutricionista, buscarProdutosParaModal);

module.exports = router;
