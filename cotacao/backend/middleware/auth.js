const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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