const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Rota de teste (sem autenticação)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Rota de integração funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste de autenticação
router.get('/auth-test', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Autenticação funcionando!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Rota para integração com sistema de cotação
router.post('/cotacao', authenticateToken, async (req, res) => {
  try {
    console.log('🔗 Iniciando integração com cotação...');
    console.log('👤 Usuário:', req.user);
    console.log('🔐 Headers:', req.headers);
    console.log('🔐 Rota chamada:', req.path);
    console.log('🔐 Método:', req.method);
    
    if (!req.user) {
      console.log('❌ req.user está undefined');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const userId = req.user.id;
    
    // Verificar se o usuário existe no sistema principal
    console.log('🔍 Buscando usuário ID:', userId);
    
    const [user] = await executeQuery(
      'SELECT id, nome, email, tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE id = ?',
      [userId]
    );

    console.log('📋 Resultado da busca:', user);

    if (user.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userData = user[0];
    console.log('✅ Usuário encontrado:', userData);

    // Verificar se JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET não definido');
      return res.status(500).json({ error: 'Configuração de segurança não encontrada' });
    }

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
    const cotacaoUrl = process.env.COTACAO_URL || 'http://82.29.57.43:5000';
    
    // URL de integração com token
    const integrationUrl = `${cotacaoUrl}/auth/integration?token=${cotacaoToken}`;
    
    console.log('🔗 URL de integração gerada:', integrationUrl);

    res.json({
      success: true,
      url: integrationUrl,
      message: 'URL de integração gerada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro na integração com cotação:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar URL de integração',
      details: error.message
    });
  }
});

module.exports = router; 