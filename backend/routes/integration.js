const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rota para integração com sistema de cotação
router.post('/cotacao', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar se o usuário existe no sistema principal
    const [user] = await executeQuery(
      'SELECT id, nome, email, tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userData = user[0];

    // Criar token JWT para o sistema de cotação
    const cotacaoToken = jwt.sign(
      {
        id: userData.id,
        name: userData.nome,
        email: userData.email,
        role: `${userData.tipo_de_acesso}_${userData.nivel_de_acesso}`,
        system: 'terceirize_foods'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // URL do sistema de cotação (ajuste conforme necessário)
    const cotacaoUrl = process.env.COTACAO_URL || 'http://localhost:3002';
    
    // URL de integração com token
    const integrationUrl = `${cotacaoUrl}/auth/integration?token=${cotacaoToken}`;

    res.json({
      success: true,
      url: integrationUrl,
      message: 'URL de integração gerada com sucesso'
    });

  } catch (error) {
    console.error('Erro na integração com cotação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar URL de integração'
    });
  }
});

module.exports = router; 