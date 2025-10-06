const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../../config/database');

/**
 * POST /api/auth/sso-login
 * Login via SSO do sistema Foods
 */
router.post('/sso-login', async (req, res) => {
  try {
    const { ssoToken, userData } = req.body;
    
    if (!ssoToken && !userData) {
      return res.status(400).json({
        success: false,
        error: 'Token SSO ou dados do usuário são obrigatórios'
      });
    }

    let user;
    
    // Se há token SSO, validar
    if (ssoToken) {
      try {
        const decoded = jwt.verify(ssoToken, process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET);
        
        if (decoded.system !== 'foods') {
          return res.status(400).json({
            success: false,
            error: 'Token SSO inválido'
          });
        }
        
        user = {
          id: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role
        };
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Token SSO inválido ou expirado'
        });
      }
    }
    
    // Se há dados do usuário (fallback)
    if (userData) {
      user = userData;
    }

    // Verificar se usuário existe no sistema de cotação
    const existingUsers = await executeQuery(
      'SELECT id, name, email, role, status FROM users WHERE email = ?',
      [user.email]
    );

    let cotacaoUser;
    
    if (existingUsers.length > 0) {
      // Usuário existe no cotação
      cotacaoUser = existingUsers[0];
      
      // Atualizar dados se necessário
      if (cotacaoUser.name !== user.name || cotacaoUser.role !== user.role) {
        await executeQuery(
          'UPDATE users SET name = ?, role = ?, updated_at = NOW() WHERE email = ?',
          [user.name, user.role, user.email]
        );
        cotacaoUser.name = user.name;
        cotacaoUser.role = user.role;
      }
    } else {
      // Criar usuário no cotação
      const result = await executeQuery(
        'INSERT INTO users (name, email, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [user.name, user.email, user.role, 'ativo']
      );
      
      cotacaoUser = {
        id: result.insertId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'ativo'
      };
    }

    // Gerar token JWT para o cotação
    const cotacaoToken = jwt.sign(
      {
        id: cotacaoUser.id,
        name: cotacaoUser.name,
        email: cotacaoUser.email,
        role: cotacaoUser.role,
        system: 'cotacao'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso via SSO',
      token: cotacaoToken,
      user: {
        id: cotacaoUser.id,
        name: cotacaoUser.name,
        email: cotacaoUser.email,
        role: cotacaoUser.role,
        status: cotacaoUser.status
      }
    });

  } catch (error) {
    console.error('Erro no login SSO:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/auth/validate-sso
 * Validar token SSO do Foods
 */
router.post('/validate-sso', async (req, res) => {
  try {
    const { ssoToken } = req.body;
    
    if (!ssoToken) {
      return res.status(400).json({
        success: false,
        error: 'Token SSO é obrigatório'
      });
    }

    const decoded = jwt.verify(ssoToken, process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET);
    
    if (decoded.system !== 'foods') {
      return res.status(400).json({
        success: false,
        error: 'Token SSO inválido'
      });
    }

    res.json({
      success: true,
      message: 'Token SSO válido',
      user: {
        id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('Erro na validação SSO:', error);
    res.status(400).json({
      success: false,
      error: 'Token SSO inválido ou expirado'
    });
  }
});

module.exports = router;
