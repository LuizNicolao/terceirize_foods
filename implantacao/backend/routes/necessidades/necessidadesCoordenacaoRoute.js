const express = require('express');
const router = express.Router();
const NecessidadesCoordenacaoController = require('../../controllers/necessidades/NecessidadesCoordenacaoController');
const { authenticateToken } = require('../../middleware/auth');

// Middleware para verificar se o usuário é Coordenador ou Supervisor
const hasAccessToCoordenacao = (req, res, next) => {
  const userRole = req.user?.role;
  
  if (!userRole) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }
  
  const allowedRoles = ['coordenador', 'supervisor', 'administrador'];
  
  if (!allowedRoles.includes(userRole.toLowerCase())) {
    return res.status(403).json({
      success: false,
      message: 'Apenas coordenadores e supervisores podem acessar esta funcionalidade'
    });
  }
  
  next();
};

// Aplicar autenticação e permissões em todas as rotas
router.use(authenticateToken);
router.use(hasAccessToCoordenacao);

// Listar necessidades para coordenação
router.get('/coordenacao', NecessidadesCoordenacaoController.listarParaCoordenacao);

// Listar nutricionistas para filtro
router.get('/coordenacao/nutricionistas', NecessidadesCoordenacaoController.listarNutricionistas);

// Salvar ajustes da coordenação
router.put('/coordenacao/ajustes', NecessidadesCoordenacaoController.salvarAjustesCoordenacao);

// Liberar para logística
router.post('/coordenacao/liberar-logistica', NecessidadesCoordenacaoController.liberarParaLogistica);

// Buscar produtos para modal
router.get('/coordenacao/produtos', NecessidadesCoordenacaoController.buscarProdutosParaModal);

// Incluir produto extra
router.post('/coordenacao/produto-extra', NecessidadesCoordenacaoController.incluirProdutoExtra);

module.exports = router;
