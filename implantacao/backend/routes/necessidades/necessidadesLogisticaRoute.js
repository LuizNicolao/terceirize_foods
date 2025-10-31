const express = require('express');
const router = express.Router();
const NecessidadesLogisticaController = require('../../controllers/necessidades/NecessidadesLogisticaController');
const { authenticateToken } = require('../../middleware/auth');

// Middleware para verificar se é logística, coordenador ou supervisor
const hasAccessToLogistica = (req, res, next) => {
  const userType = req.user.tipo_de_acesso;
  
  if (!['logistica', 'coordenador', 'supervisor', 'administrador'].includes(userType)) {
    return res.status(403).json({
      success: false,
      message: 'Apenas logística, coordenadores e supervisores podem acessar esta funcionalidade'
    });
  }
  
  next();
};

// Aplicar autenticação e verificação de acesso em todas as rotas
router.use(authenticateToken);
router.use(hasAccessToLogistica);

// Listar necessidades para logística
router.get('/logistica', NecessidadesLogisticaController.listarParaLogistica);

// Salvar ajustes da logística
router.put('/logistica/ajustes', NecessidadesLogisticaController.salvarAjustesLogistica);

// Enviar para confirmação da nutricionista
router.post('/logistica/enviar-nutri', NecessidadesLogisticaController.enviarParaNutricionista);

// Buscar produtos para modal
router.get('/logistica/produtos-modal', NecessidadesLogisticaController.buscarProdutosParaModal);

// Incluir produto extra
router.post('/logistica/produto-extra', NecessidadesLogisticaController.incluirProdutoExtra);

module.exports = router;
