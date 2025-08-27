const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Middleware de autenticação - Agora usa SSO
const authenticateToken = async (req, res, next) => {
  try {
    // Verificar se há token SSO na query string ou header
    const ssoToken = req.query.sso_token || req.headers['x-sso-token'];
    
    if (!ssoToken) {
      return res.status(401).json({ message: 'Token SSO necessário' });
    }

    // Verificar se o token é válido
    const decoded = jwt.verify(ssoToken, process.env.JWT_SECRET);
    
    // Buscar dados do usuário no banco
    const users = await executeQuery(`
      SELECT id, name, email, role, status, created_at, updated_at
      FROM users WHERE id = ? AND status = 'ativo'
    `, [decoded.id]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado ou inativo' });
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

    next();
  } catch (error) {
    console.error('❌ Erro na autenticação SSO:', error.message);
    return res.status(403).json({ message: 'Token SSO inválido' });
  }
};

// Middleware de verificação de permissões
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const permissions = await executeQuery(`
        SELECT screen, can_view, can_create, can_edit, can_delete
        FROM user_permissions WHERE user_id = ?
      `, [req.user.id]);

      // Verificar se o usuário tem a permissão necessária
      const hasPermission = permissions.some(p => {
        switch (permission) {
          case 'visualizar':
            return p.can_view;
          case 'criar':
            return p.can_create;
          case 'editar':
            return p.can_edit;
          case 'excluir':
            return p.can_delete;
          default:
            return false;
        }
      });

      if (!hasPermission) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

module.exports = {
  authenticateToken,
  checkPermission
}; 