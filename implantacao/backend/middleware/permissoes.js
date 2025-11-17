const { executeQuery } = require('../config/database');

/**
 * Middleware para verificar se usuário tem permissão para visualizar
 */
const canView = (screenName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Administradores têm todas as permissões
      if (req.user?.tipo_de_acesso === 'administrador') {
        return next();
      }

      const permissoes = await executeQuery(
        `SELECT pode_visualizar FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [userId, screenName]
      );

      const permissao = permissoes[0];

      if (!permissao || !permissao.pode_visualizar) {
        if (
          req.user?.tipo_de_acesso === 'nutricionista' &&
          ['necessidades', 'analise_necessidades', 'consulta_status_necessidade', 'calendario', 'registros_diarios']
            .includes(screenName)
        ) {
          return next();
        }

        return res.status(403).json({ 
          error: 'Acesso negado', 
          message: 'Você não tem permissão para visualizar esta tela' 
        });
      }
      
      next();
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

      // Administradores têm todas as permissões
      if (req.user?.tipo_de_acesso === 'administrador') {
        return next();
      }

      const permissoes = await executeQuery(
        `SELECT pode_criar FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [userId, screenName]
      );

      const permissao = permissoes[0];

      if (!permissao || !permissao.pode_criar) {
        if (
          req.user?.tipo_de_acesso === 'nutricionista' &&
          ['necessidades', 'calendario', 'registros_diarios'].includes(screenName)
        ) {
          return next();
        }

        return res.status(403).json({ 
          error: 'Acesso negado', 
          message: 'Você não tem permissão para realizar esta ação' 
        });
      }
      
      next();
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

      // Administradores têm todas as permissões
      if (req.user?.tipo_de_acesso === 'administrador') {
        return next();
      }

      const permissoes = await executeQuery(
        `SELECT pode_editar FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [userId, screenName]
      );

      const permissao = permissoes[0];

      if (!permissao || !permissao.pode_editar) {
        if (
          req.user?.tipo_de_acesso === 'nutricionista' &&
          ['necessidades', 'calendario', 'registros_diarios'].includes(screenName)
        ) {
          return next();
        }

        return res.status(403).json({ 
          error: 'Acesso negado', 
          message: 'Você não tem permissão para realizar esta ação' 
        });
      }
      
      next();
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
