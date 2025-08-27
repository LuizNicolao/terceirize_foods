const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Middleware para validação SSO
const validateSSO = async (req, res, next) => {
  try {
    console.log('🔍 Validando SSO - URL:', req.url);
    console.log('🔍 Query params:', req.query);
    
    // Verificar se há token SSO na query string
    const ssoToken = req.query.sso_token;
    
    console.log('🔍 Token SSO encontrado:', ssoToken ? 'Sim' : 'Não');
    
    if (!ssoToken) {
      console.log('❌ Token SSO não encontrado');
      return res.status(401).json({ 
        success: false, 
        message: 'Token SSO necessário' 
      });
    }

    // Verificar se o token é válido (usando a mesma chave JWT do Foods)
    const decoded = jwt.verify(ssoToken, process.env.JWT_SECRET);
    
    // Buscar dados do usuário no banco
    const users = await executeQuery(`
      SELECT id, name, email, role, status, created_at, updated_at
      FROM users WHERE id = ? AND status = 'ativo'
    `, [decoded.id]);

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado ou inativo' 
      });
    }

    const user = users[0];

    // Buscar permissões do usuário
    const permissions = await executeQuery(`
      SELECT screen, can_view, can_create, can_edit, can_delete
      FROM user_permissions WHERE user_id = ?
    `, [user.id]);

    // Adicionar dados do usuário ao request
    req.user = {
      ...user,
      permissions: permissions.reduce((acc, perm) => {
        if (!acc[perm.screen]) {
          acc[perm.screen] = {};
        }
        acc[perm.screen] = {
          can_view: perm.can_view === 1,
          can_create: perm.can_create === 1,
          can_edit: perm.can_edit === 1,
          can_delete: perm.can_delete === 1
        };
        return acc;
      }, {})
    };

    // Adicionar token ao request para uso posterior
    req.ssoToken = ssoToken;

    next();
  } catch (error) {
    console.error('Erro na validação SSO:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Token SSO inválido' 
    });
  }
};

// Middleware para verificar se o usuário tem permissão para acessar o módulo
const checkModuleAccess = async (req, res, next) => {
  try {
    // Verificar se o usuário tem permissão para acessar o módulo de cotação
    const hasAccess = req.user.permissions.cotacao?.can_view || 
                     req.user.role === 'administrador';
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado ao módulo de cotação' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar acesso ao módulo:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

module.exports = {
  validateSSO,
  checkModuleAccess
};
