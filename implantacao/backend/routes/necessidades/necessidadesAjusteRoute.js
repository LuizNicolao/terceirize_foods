const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const {
  listarParaAjuste,
  salvarAjustes,
  incluirProdutoExtra,
  liberarCoordenacao,
  buscarProdutosParaModal,
  excluirProdutoAjuste
} = require('../../controllers/necessidades/NecessidadesAjusteController');

// Middleware para verificar se tem acesso à funcionalidade
const hasAccessToAdjustment = (req, res, next) => {
  const tiposComAcesso = ['nutricionista', 'coordenador', 'supervisor', 'administrador'];
  
  if (!tiposComAcesso.includes(req.user.tipo_de_acesso)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado',
      message: 'Você não tem permissão para acessar esta funcionalidade'
    });
  }
  next();
};

// GET /api/necessidades/ajuste - Listar necessidades para ajuste
router.get('/ajuste', authenticateToken, hasAccessToAdjustment, listarParaAjuste);

// PUT /api/necessidades/ajustes - Salvar ajustes da nutricionista
router.put('/ajustes', authenticateToken, hasAccessToAdjustment, salvarAjustes);

// POST /api/necessidades/produto-extra - Incluir produto extra
router.post('/produto-extra', authenticateToken, hasAccessToAdjustment, incluirProdutoExtra);

// POST /api/necessidades/liberar-coordenacao - Liberar para coordenação
router.post('/liberar-coordenacao', authenticateToken, hasAccessToAdjustment, liberarCoordenacao);

// GET /api/necessidades/produtos-modal - Buscar produtos para modal
router.get('/produtos-modal', authenticateToken, hasAccessToAdjustment, buscarProdutosParaModal);

// DELETE /api/necessidades/ajuste/:id - Excluir produto de necessidade em ajuste
router.delete('/ajuste/:id', authenticateToken, hasAccessToAdjustment, excluirProdutoAjuste);

module.exports = router;
