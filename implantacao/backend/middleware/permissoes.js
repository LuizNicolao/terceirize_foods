const { executeQuery } = require('../config/database');

/**
 * Middleware para verificar se usuário tem permissão para visualizar
 */
const canView = (screenName) => {
  return async (req, res, next) => {
    try {
      console.log(`=== MIDDLEWARE PERMISSÕES - canView(${screenName}) ===`);
      const userId = req.user.id;
      console.log('userId:', userId);
      
      // TEMPORÁRIO: Permitir acesso para teste
      console.log('Permitindo acesso (temporário)');
      next();
      
      // TODO: Implementar verificação de permissões corretamente
      /*
      const permissions = await executeQuery(
        `SELECT pode_visualizar FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [userId, screenName]
      );
      
      const permission = permissions[0];
      
      if (!permission || !permission.pode_visualizar) {
        return res.status(403).json({ 
          error: 'Acesso negado', 
          message: 'Você não tem permissão para visualizar esta tela' 
        });
      }
      
      next();
      */
    } catch (error) {
      console.error('Erro ao verificar permissão de visualização:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

/**
 * Middleware para verificar se usuário tem permissão para criar
 */
const canCreate = (screenName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // TEMPORÁRIO: Permitir acesso para teste
      next();
      
      // TODO: Implementar verificação de permissões corretamente
    } catch (error) {
      console.error('Erro ao verificar permissão de criação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

/**
 * Middleware para verificar se usuário tem permissão para editar
 */
const canEdit = (screenName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // TEMPORÁRIO: Permitir acesso para teste
      next();
      
      // TODO: Implementar verificação de permissões corretamente
    } catch (error) {
      console.error('Erro ao verificar permissão de edição:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

/**
 * Middleware para verificar se usuário tem permissão para excluir
 */
const canDelete = (screenName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // TEMPORÁRIO: Permitir acesso para teste
      next();
      
      // TODO: Implementar verificação de permissões corretamente
    } catch (error) {
      console.error('Erro ao verificar permissão de exclusão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

module.exports = {
  canView,
  canCreate,
  canEdit,
  canDelete
};
