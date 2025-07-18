const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'foods_jwt_secret_key_2024';

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await executeQuery(
      'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE id = ? AND status = "ativo"',
      [decoded.userId]
    );

    if (user.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar permissões específicas
const checkPermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user;
    
    // Administradores têm todas as permissões
    if (user.tipo_de_acesso === 'administrador') {
      return next();
    }

    try {
      // Buscar permissões do usuário na tabela permissoes_usuario
      const permissoes = await executeQuery(
        'SELECT * FROM permissoes_usuario WHERE usuario_id = ?',
        [user.id]
      );

      // Se não há permissões na tabela, usar o sistema antigo baseado em nível de acesso
      if (permissoes.length === 0) {
        const accessLevels = {
          'I': ['visualizar'],
          'II': ['visualizar', 'criar', 'editar'],
          'III': ['visualizar', 'criar', 'editar', 'excluir']
        };

        const userPermissions = accessLevels[user.nivel_de_acesso] || [];
        
        if (userPermissions.includes(permission)) {
          return next();
        }
      } else {
        // Verificar se o usuário tem a permissão específica para a tela
        // Para isso, precisamos saber qual tela está sendo acessada
        // Por enquanto, vamos verificar se tem a permissão geral
        const hasPermission = permissoes.some(perm => {
          switch (permission) {
            case 'visualizar':
              return perm.pode_visualizar === 1;
            case 'criar':
              return perm.pode_criar === 1;
            case 'editar':
              return perm.pode_editar === 1;
            case 'excluir':
              return perm.pode_excluir === 1;
            default:
              return false;
          }
        });

        if (hasPermission) {
          return next();
        }
      }

      return res.status(403).json({ error: 'Permissão insuficiente' });
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

// Middleware para verificar permissões específicas por tela
const checkPermissionForResource = (permission, resource) => {
  return async (req, res, next) => {
    const user = req.user;
    
    // Administradores têm todas as permissões
    if (user.tipo_de_acesso === 'administrador') {
      return next();
    }

    try {
      // Buscar permissões específicas da tela
      const permissao = await executeQuery(
        'SELECT * FROM permissoes_usuario WHERE usuario_id = ? AND tela = ?',
        [user.id, resource]
      );

      // Se não há permissão específica, usar o sistema antigo
      if (permissao.length === 0) {
        const accessLevels = {
          'I': ['visualizar'],
          'II': ['visualizar', 'criar', 'editar'],
          'III': ['visualizar', 'criar', 'editar', 'excluir']
        };

        const userPermissions = accessLevels[user.nivel_de_acesso] || [];
        
        if (userPermissions.includes(permission)) {
          return next();
        }
      } else {
        // Verificar permissão específica da tela
        const perm = permissao[0];
        let hasPermission = false;

        switch (permission) {
          case 'visualizar':
            hasPermission = perm.pode_visualizar === 1;
            break;
          case 'criar':
            hasPermission = perm.pode_criar === 1;
            break;
          case 'editar':
            hasPermission = perm.pode_editar === 1;
            break;
          case 'excluir':
            hasPermission = perm.pode_excluir === 1;
            break;
          default:
            hasPermission = false;
        }

        if (hasPermission) {
          return next();
        }
      }

      return res.status(403).json({ error: 'Permissão insuficiente' });
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

// Middleware para verificar tipo de acesso
const checkAccessType = (allowedTypes) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (allowedTypes.includes(user.tipo_de_acesso)) {
      return next();
    }

    return res.status(403).json({ error: 'Tipo de acesso não autorizado' });
  };
};

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkPermissionForResource,
  checkAccessType,
  generateToken
}; 