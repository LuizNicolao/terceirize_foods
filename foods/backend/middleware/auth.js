const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido nas variáveis de ambiente!');
}

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log(`[AUTH_TOKEN] Verificando token JWT`);
  console.log(`[AUTH_TOKEN] Authorization header:`, authHeader ? 'Presente' : 'Ausente');

  if (!token) {
    console.log(`[AUTH_TOKEN] Token não fornecido - 401 Unauthorized`);
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`[AUTH_TOKEN] Token decodificado:`, { userId: decoded.userId, email: decoded.email });
    
    // Se o token contém email, validar por email (para compatibilidade com outros sistemas)
    // Caso contrário, validar por ID (comportamento padrão)
    let user;
    
    if (decoded.email) {
      console.log(`[AUTH_TOKEN] Buscando usuário por email: ${decoded.email}`);
      user = await executeQuery(
        'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE email = ?',
        [decoded.email]
      );
    } else {
      console.log(`[AUTH_TOKEN] Buscando usuário por ID: ${decoded.userId}`);
      user = await executeQuery(
        'SELECT id, nome, email, nivel_de_acesso, tipo_de_acesso, status FROM usuarios WHERE id = ?',
        [decoded.userId]
      );
    }

    console.log(`[AUTH_TOKEN] Resultado da busca:`, user.length > 0 ? 'Usuário encontrado' : 'Usuário não encontrado');

    if (user.length === 0) {
      console.log(`[AUTH_TOKEN] Usuário não encontrado - 401 Unauthorized`);
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const userData = user[0];
    console.log(`[AUTH_TOKEN] Dados do usuário:`, {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      nivel_de_acesso: userData.nivel_de_acesso,
      tipo_de_acesso: userData.tipo_de_acesso,
      status: userData.status
    });

    if (userData.status === 'bloqueado') {
      console.log(`[AUTH_TOKEN] Usuário bloqueado - 403 Forbidden`);
      return res.status(403).json({ error: 'Usuário bloqueado. Procure o administrador.' });
    }

    if (userData.status !== 'ativo') {
      console.log(`[AUTH_TOKEN] Usuário inativo - 401 Unauthorized`);
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    console.log(`[AUTH_TOKEN] Usuário autenticado com sucesso`);
    req.user = userData;
    next();
  } catch (error) {
    console.log(`[AUTH_TOKEN] Erro ao verificar token:`, error.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar permissões específicas
const checkPermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    
    console.log(`[AUTH] Verificando permissão: ${permission}`);
    console.log(`[AUTH] Usuário:`, {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo_de_acesso: user.tipo_de_acesso,
      nivel_de_acesso: user.nivel_de_acesso,
      status: user.status
    });
    
    // Administradores têm todas as permissões
    if (user.tipo_de_acesso === 'administrador') {
      console.log(`[AUTH] Usuário é administrador - permissão concedida`);
      return next();
    }

    // Verificar nível de acesso
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    const userPermissions = accessLevels[user.nivel_de_acesso] || [];
    console.log(`[AUTH] Nível de acesso: ${user.nivel_de_acesso}`);
    console.log(`[AUTH] Permissões disponíveis:`, userPermissions);
    console.log(`[AUTH] Permissão solicitada: ${permission}`);
    console.log(`[AUTH] Tem permissão?`, userPermissions.includes(permission));
    
    if (userPermissions.includes(permission)) {
      console.log(`[AUTH] Permissão concedida`);
      return next();
    }

    console.log(`[AUTH] Permissão negada - 403 Forbidden`);
    return res.status(403).json({ error: 'Permissão insuficiente' });
  };
};

// Middleware para verificar permissões por tela (screen)
const checkScreenPermission = (screen, permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      console.log(`[SCREEN_AUTH] Verificando permissão de tela: ${screen} - ${permission}`);
      console.log(`[SCREEN_AUTH] Usuário:`, {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo_de_acesso: user.tipo_de_acesso,
        nivel_de_acesso: user.nivel_de_acesso,
        status: user.status
      });
      
      // Administradores têm todas as permissões
      if (user.tipo_de_acesso === 'administrador') {
        console.log(`[SCREEN_AUTH] Usuário é administrador - permissão concedida`);
        return next();
      }

      // Buscar permissões do usuário para a tela específica
      console.log(`[SCREEN_AUTH] Buscando permissões na tabela permissoes_usuario...`);
      const permissoes = await executeQuery(
        `SELECT pode_visualizar, pode_criar, pode_editar, pode_excluir, pode_movimentar 
         FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [user.id, screen]
      );

      console.log(`[SCREEN_AUTH] Resultado da consulta:`, permissoes);

      if (permissoes.length === 0) {
        console.log(`[SCREEN_AUTH] Nenhuma permissão específica encontrada - permitindo acesso temporariamente`);
        // Temporariamente permitir acesso se não encontrar permissões específicas
        return next();
      }

      const permissao = permissoes[0];
      console.log(`[SCREEN_AUTH] Permissão encontrada:`, permissao);
      
      // Mapear permissões
      const permissionMap = {
        'visualizar': permissao.pode_visualizar,
        'criar': permissao.pode_criar,
        'editar': permissao.pode_editar,
        'excluir': permissao.pode_excluir,
        'movimentar': permissao.pode_movimentar
      };

      console.log(`[SCREEN_AUTH] Mapa de permissões:`, permissionMap);
      console.log(`[SCREEN_AUTH] Permissão solicitada: ${permission}`);
      console.log(`[SCREEN_AUTH] Tem permissão?`, permissionMap[permission]);

      if (permissionMap[permission]) {
        console.log(`[SCREEN_AUTH] Permissão concedida`);
        return next();
      }

      console.log(`[SCREEN_AUTH] Permissão negada - 403 Forbidden`);
      return res.status(403).json({ error: 'Permissão insuficiente para esta ação' });
      
    } catch (error) {
      console.error('[SCREEN_AUTH] Erro ao verificar permissões da tela:', error);
      return res.status(500).json({ error: 'Erro interno ao verificar permissões' });
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
const generateToken = (userId, expiresIn = '24h') => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkScreenPermission,
  checkAccessType,
  generateToken
}; 