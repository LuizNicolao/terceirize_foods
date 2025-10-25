const express = require('express');
const router = express.Router();
const NecessidadesCoordenacaoController = require('../../controllers/necessidades/NecessidadesCoordenacaoController');
const { authenticateToken } = require('../../middleware/auth');

// Middleware para verificar se é coordenador ou supervisor
const hasAccessToCoordenacao = (req, res, next) => {
  const userType = req.user.tipo_de_acesso;
  
  if (!['coordenador', 'supervisor', 'administrador'].includes(userType)) {
    return res.status(403).json({
      success: false,
      message: 'Apenas coordenadores e supervisores podem acessar esta funcionalidade'
    });
  }
  
  next();
};

// Aplicar autenticação e verificação de acesso em todas as rotas
router.use(authenticateToken);
router.use(hasAccessToCoordenacao);

// Listar necessidades para coordenação
router.get('/coordenacao', NecessidadesCoordenacaoController.listarParaCoordenacao);

// Salvar ajustes da coordenação
router.put('/coordenacao/ajustes', NecessidadesCoordenacaoController.salvarAjustesCoordenacao);

// Liberar para logística
router.post('/coordenacao/liberar-logistica', NecessidadesCoordenacaoController.liberarParaLogistica);

// Buscar produtos para modal
router.get('/coordenacao/produtos-modal', NecessidadesCoordenacaoController.buscarProdutosParaModal);

// Incluir produto extra
router.post('/coordenacao/produto-extra', NecessidadesCoordenacaoController.incluirProdutoExtra);

// Listar nutricionistas para filtro
router.get('/coordenacao/nutricionistas', NecessidadesCoordenacaoController.listarNutricionistas);

module.exports = router;
