const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Middleware de autenticação com SSO do Foods
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Verificar se é uma rota pública (não precisa de autenticação)
  if (req.path.startsWith('/public/')) {
    return next();
  }

  // Se não há token, verificar se há dados do SSO no body (para login via Foods)
  if (!token && req.body && (req.body.ssoToken || req.body.userData)) {
    try {
      let userData = null;
      
      // Se há token SSO, validar
      if (req.body.ssoToken) {
        const decoded = jwt.verify(req.body.ssoToken, process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET);
        
        if (decoded.system === 'foods') {
          userData = {
            id: decoded.userId,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
          };
        }
      }
      
      // Se há dados do usuário diretamente (fallback)
      if (req.body.userData && !userData) {
        userData = req.body.userData;
      }
      
      if (userData) {
        // Buscar usuário no sistema de cotação
        const users = await executeQuery(
          'SELECT id, name, email, role, status FROM users WHERE email = ? AND status = "ativo"',
          [userData.email]
        );
        
        if (users.length > 0) {
          req.user = users[0];
          next();
          return;
        } else {
          // Usuário não encontrado no cotação, criar automaticamente
          const result = await executeQuery(
            'INSERT INTO users (name, email, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [userData.name, userData.email, userData.role, 'ativo']
          );
          
          req.user = {
            id: result.insertId,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: 'ativo'
          };
          next();
          return;
        }
      }
    } catch (error) {
      console.error('❌ Erro na validação SSO:', error.message);
    }
  }

  // Autenticação tradicional com JWT
  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// Middleware de verificação de permissões
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Verificar se req.user existe e tem id
      if (!req.user || !req.user.id) {
        console.error('❌ req.user ou req.user.id está undefined:', req.user);
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Se o usuário é administrador, permitir tudo
      if (req.user.role === 'administrador') {
        return next();
      }

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