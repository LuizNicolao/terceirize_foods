const { executeQuery } = require('../config/database');

/**
 * Middleware para verificar se usuário tem permissão para visualizar
 */
const canView = (screenName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // TEMPORÁRIO: Permitir acesso para teste
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

/**
 * Middleware para verificar se tem acesso à funcionalidade de ajuste
 */
const hasAccessToAdjustment = (req, res, next) => {
  const tiposComAcesso = ['nutricionista', 'coordenador', 'supervisor', 'administrador'];
  
  if (!tiposComAcesso.includes(req.user.tipo_de_acesso)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado',
      message: 'Você não tem permissão para acessar esta funcionalidade'
    });
  }
  next();
};

/**
 * Middleware para verificar se tem permissão para aprovar
 */
const canApprove = (screenName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // TEMPORÁRIO: Permitir acesso para teste
      next();
      
      // TODO: Implementar verificação de permissões corretamente
    } catch (error) {
      console.error('Erro ao verificar permissão de aprovação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

module.exports = {
  canView,
  canCreate,
  canEdit,
  canDelete,
  hasAccessToAdjustment,
  canApprove
};
