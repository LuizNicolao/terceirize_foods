const { query } = require('../config/database');

// Middleware para verificar permissão específica
const checkPermission = (tela, acao) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Buscar permissão do usuário para a tela específica
      const permissoes = await query(`
        SELECT pode_visualizar, pode_criar, pode_editar, pode_excluir
        FROM permissoes_usuario
        WHERE usuario_id = ? AND tela = ?
      `, [userId, tela]);

      if (permissoes.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado',
          message: 'Você não tem permissão para acessar esta funcionalidade'
        });
      }

      const permissao = permissoes[0];
      let temPermissao = false;

      switch (acao) {
        case 'visualizar':
          temPermissao = permissao.pode_visualizar === 1;
          break;
        case 'criar':
          temPermissao = permissao.pode_criar === 1;
          break;
        case 'editar':
          temPermissao = permissao.pode_editar === 1;
          break;
        case 'excluir':
          temPermissao = permissao.pode_excluir === 1;
          break;
        default:
          temPermissao = false;
      }

      if (!temPermissao) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado',
          message: `Você não tem permissão para ${acao} em ${tela}`
        });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao verificar permissões'
      });
    }
  };
};

// Middleware para verificar se pode visualizar
const canView = (tela) => checkPermission(tela, 'visualizar');

// Middleware para verificar se pode criar
const canCreate = (tela) => checkPermission(tela, 'criar');

// Middleware para verificar se pode editar
const canEdit = (tela) => checkPermission(tela, 'editar');

// Middleware para verificar se pode excluir
const canDelete = (tela) => checkPermission(tela, 'excluir');

// Função utilitária para verificar permissão no frontend
const hasPermission = async (userId, tela, acao) => {
  try {
    const permissoes = await query(`
      SELECT pode_visualizar, pode_criar, pode_editar, pode_excluir
      FROM permissoes_usuario
      WHERE usuario_id = ? AND tela = ?
    `, [userId, tela]);

    if (permissoes.length === 0) {
      return false;
    }

    const permissao = permissoes[0];

    switch (acao) {
      case 'visualizar':
        return permissao.pode_visualizar === 1;
      case 'criar':
        return permissao.pode_criar === 1;
      case 'editar':
        return permissao.pode_editar === 1;
      case 'excluir':
        return permissao.pode_excluir === 1;
      default:
        return false;
    }
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return false;
  }
};

module.exports = {
  checkPermission,
  canView,
  canCreate,
  canEdit,
  canDelete,
  hasPermission
};
