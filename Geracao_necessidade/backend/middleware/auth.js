const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        message: 'Você precisa estar logado para acessar este recurso'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco para verificar se ainda está ativo
    const usuarios = await query(
      'SELECT id, email, nome, tipo_usuario, rota, setor, ativo FROM usuarios WHERE email = ? AND ativo = 1',
      [decoded.email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado ou inativo',
        message: 'Sua conta pode ter sido desativada'
      });
    }

    // Adicionar informações do usuário ao request
    req.user = usuarios[0];
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'O token fornecido não é válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Sua sessão expirou. Faça login novamente'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar autenticação'
    });
  }
};

// Middleware para verificar tipo de usuário
const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        message: 'Você precisa estar logado'
      });
    }

    if (!allowedTypes.includes(req.user.tipo_usuario)) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso'
      });
    }

    next();
  };
};

// Middleware para verificar se é nutricionista
const requireNutricionista = requireUserType(['Nutricionista']);

// Middleware para verificar se é coordenação ou supervisão
const requireCoordenacao = requireUserType(['Coordenacao', 'Supervisao']);

module.exports = {
  authenticateToken,
  requireUserType,
  requireNutricionista,
  requireCoordenacao
};
