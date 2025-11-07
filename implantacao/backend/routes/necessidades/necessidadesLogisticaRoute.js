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

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar necessidades para logística
router.get('/logistica', hasAccessToLogistica, NecessidadesLogisticaController.listarParaLogistica);

// Salvar ajustes da logística
router.put('/logistica/ajustes', hasAccessToLogistica, NecessidadesLogisticaController.salvarAjustesLogistica);

// Enviar para confirmação da nutricionista
router.post('/logistica/enviar-nutri', hasAccessToLogistica, NecessidadesLogisticaController.enviarParaNutricionista);

// Buscar produtos para modal
router.get('/logistica/produtos-modal', hasAccessToLogistica, NecessidadesLogisticaController.buscarProdutosParaModal);

// Incluir produto extra
router.post('/logistica/produto-extra', hasAccessToLogistica, NecessidadesLogisticaController.incluirProdutoExtra);

module.exports = router;
