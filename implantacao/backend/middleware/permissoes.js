const { executeQuery } = require('../config/database');

/**
 * Middleware para verificar se usuário tem permissão para visualizar
 */
const canView = (screenName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      console.log('[canView] Checando permissão', {
        userId,
        email: req.user.email,
        screenName
      });

      // Administradores têm todas as permissões
      if (req.user?.tipo_de_acesso === 'administrador') {
        console.log('[canView] Acesso liberado - administrador');
        return next();
      }

      const permissoes = await executeQuery(
        `SELECT pode_visualizar FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [userId, screenName]
      );

      const permissao = permissoes[0];

      console.log('[canView] Resultado base de permissões', {
        registros: permissoes.length,
        permissao
      });

      if (!permissao || !permissao.pode_visualizar) {
        if (
          req.user?.tipo_de_acesso === 'nutricionista' &&
          ['necessidades', 'analise_necessidades', 'consulta_status_necessidade', 'calendario', 'registros_diarios']
            .includes(screenName)
        ) {
          console.log('[canView] Acesso liberado por tipo nutricionista', {
            screenName
          });
          return next();
        }

        console.log('[canView] Acesso negado', {
          userId,
          screenName,
          tipo: req.user?.tipo_de_acesso
        });
        return res.status(403).json({ 
          error: 'Acesso negado', 
          message: 'Você não tem permissão para visualizar esta tela' 
        });
      }
      
      console.log('[canView] Acesso liberado por permissão explícita', {
        userId,
        screenName
      });
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
      
      console.log('[canCreate] Checando permissão', {
        userId,
        email: req.user.email,
        screenName
      });

      // Administradores têm todas as permissões
      if (req.user?.tipo_de_acesso === 'administrador') {
        console.log('[canCreate] Acesso liberado - administrador');
        return next();
      }

      const permissoes = await executeQuery(
        `SELECT pode_criar FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [userId, screenName]
      );

      const permissao = permissoes[0];

      console.log('[canCreate] Resultado base de permissões', {
        registros: permissoes.length,
        permissao
      });

      if (!permissao || !permissao.pode_criar) {
        if (
          req.user?.tipo_de_acesso === 'nutricionista' &&
          ['necessidades', 'calendario', 'registros_diarios'].includes(screenName)
        ) {
          console.log('[canCreate] Acesso liberado por tipo nutricionista', {
            screenName
          });
          return next();
        }

        console.log('[canCreate] Acesso negado', {
          userId,
          screenName,
          tipo: req.user?.tipo_de_acesso
        });
        return res.status(403).json({ 
          error: 'Acesso negado', 
          message: 'Você não tem permissão para realizar esta ação' 
        });
      }
      
      console.log('[canCreate] Acesso liberado por permissão explícita', {
        userId,
        screenName
      });
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
      
      console.log('[canEdit] Checando permissão', {
        userId,
        email: req.user.email,
        screenName
      });

      // Administradores têm todas as permissões
      if (req.user?.tipo_de_acesso === 'administrador') {
        console.log('[canEdit] Acesso liberado - administrador');
        return next();
      }

      const permissoes = await executeQuery(
        `SELECT pode_editar FROM permissoes_usuario 
         WHERE usuario_id = ? AND tela = ?`,
        [userId, screenName]
      );

      const permissao = permissoes[0];

      console.log('[canEdit] Resultado base de permissões', {
        registros: permissoes.length,
        permissao
      });

      if (!permissao || !permissao.pode_editar) {
        if (
          req.user?.tipo_de_acesso === 'nutricionista' &&
          ['necessidades', 'calendario', 'registros_diarios'].includes(screenName)
        ) {
          console.log('[canEdit] Acesso liberado por tipo nutricionista', {
            screenName
          });
          return next();
        }

        console.log('[canEdit] Acesso negado', {
          userId,
          screenName,
          tipo: req.user?.tipo_de_acesso
        });
        return res.status(403).json({ 
          error: 'Acesso negado', 
          message: 'Você não tem permissão para realizar esta ação' 
        });
      }
      
      console.log('[canEdit] Acesso liberado por permissão explícita', {
        userId,
        screenName
      });
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
