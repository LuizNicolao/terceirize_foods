/**
 * Utilitários para Permissões
 * Funções auxiliares para gerenciamento de permissões
 */

const { executeQuery } = require('../../config/database');
const { PERMISSOES_PADRAO, TODAS_TELAS } = require('./permissoesPadrao');

/**
 * Função para atualizar permissões quando tipo/nível de acesso for alterado
 */
const atualizarPermissoesPorTipoNivel = async (usuarioId, tipoAcesso, nivelAcesso, req = null) => {
  try {
    const permissoes = PERMISSOES_PADRAO[tipoAcesso]?.[nivelAcesso];
    
    if (!permissoes) {
      console.error('Combinação de tipo e nível de acesso não encontrada:', tipoAcesso, nivelAcesso);
      return false;
    }

    // Deletar permissões existentes
    await executeQuery(
      'DELETE FROM permissoes_usuario WHERE usuario_id = ?',
      [usuarioId]
    );

    // Inserir novas permissões padrão
    for (const [tela, permissoesTela] of Object.entries(permissoes)) {
      // Para telas que não são chamados, usar apenas permissões básicas
      const query = tela === 'chamados'
        ? `INSERT INTO permissoes_usuario 
           (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir, pode_movimentar, 
            pode_assumir, pode_concluir, pode_reabrir, pode_atribuir) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        : `INSERT INTO permissoes_usuario 
           (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir, pode_movimentar,
            pode_assumir, pode_concluir, pode_reabrir, pode_atribuir) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0)`;
      
      const params = tela === 'chamados'
        ? [
          usuarioId,
          tela,
          permissoesTela.visualizar ? 1 : 0,
          permissoesTela.criar ? 1 : 0,
          permissoesTela.editar ? 1 : 0,
          permissoesTela.excluir ? 1 : 0,
            (permissoesTela.movimentar ? 1 : 0),
            permissoesTela.assumir ? 1 : 0,
            permissoesTela.concluir ? 1 : 0,
            permissoesTela.reabrir ? 1 : 0,
            permissoesTela.atribuir ? 1 : 0
          ]
        : [
            usuarioId,
            tela,
            permissoesTela.visualizar ? 1 : 0,
            permissoesTela.criar ? 1 : 0,
            permissoesTela.editar ? 1 : 0,
            permissoesTela.excluir ? 1 : 0,
            permissoesTela.movimentar || 0 ? 1 : 0
          ];
      
      await executeQuery(query, params);
    }

    // Registrar auditoria se req estiver disponível
    if (req) {
      try {
        const { logAction } = require('../../../utils/audit');
        const { AUDIT_ACTIONS } = require('../../../utils/audit');
        const details = {
          method: 'PUT',
          url: `/permissoes/usuario/${usuarioId}`,
          statusCode: 200,
          userAgent: req.get('User-Agent'),
          requestBody: { tipoAcesso, nivelAcesso },
          resourceId: usuarioId,
          changes: {
            tipo_acesso: { from: 'alterado', to: tipoAcesso },
            nivel_acesso: { from: 'alterado', to: nivelAcesso }
          }
        };
        
        await logAction(
          req.user?.id,
          AUDIT_ACTIONS.UPDATE,
          'permissoes',
          details,
          req.ip
        );
      } catch (auditError) {
        console.error('Erro ao registrar auditoria:', auditError);
      }
    }

    return true;

  } catch (error) {
    console.error('Erro ao atualizar permissões por tipo/nível:', error);
    return false;
  }
};

/**
 * Converter permissões para formato da tabela
 */
const converterPermissoesParaFormatoTabela = (permissoes) => {
  return Object.keys(permissoes).map(tela => ({
    tela,
    pode_visualizar: permissoes[tela].visualizar ? 1 : 0,
    pode_criar: permissoes[tela].criar ? 1 : 0,
    pode_editar: permissoes[tela].editar ? 1 : 0,
    pode_excluir: permissoes[tela].excluir ? 1 : 0,
    pode_movimentar: permissoes[tela].movimentar ? 1 : 0
  }));
};

/**
 * Gerar lista completa de permissões para um usuário
 */
const gerarPermissoesCompletas = async (usuarioId) => {
  // Buscar permissões existentes do usuário
  const permissoesExistentes = await executeQuery(
    'SELECT * FROM permissoes_usuario WHERE usuario_id = ? ORDER BY tela',
    [usuarioId]
  );

  // Criar um mapa das permissões existentes
  const mapaPermissoes = {};
  permissoesExistentes.forEach(perm => {
    mapaPermissoes[perm.tela] = perm;
  });

  // Gerar lista completa de permissões, incluindo telas sem permissões definidas
  const permissoesCompletas = TODAS_TELAS.map(tela => {
    if (mapaPermissoes[tela]) {
      return mapaPermissoes[tela];
    } else {
      return {
        tela,
        usuario_id: parseInt(usuarioId),
        pode_visualizar: 0,
        pode_criar: 0,
        pode_editar: 0,
        pode_excluir: 0,
        pode_movimentar: 0,
        pode_assumir: 0,
        pode_concluir: 0,
        pode_reabrir: 0,
        pode_atribuir: 0
      };
    }
  });

  return permissoesCompletas;
};

/**
 * Sincronizar permissões de todos os usuários
 */
const sincronizarPermissoesUsuarios = async () => {
  try {
    // Buscar todos os usuários
    const usuarios = await executeQuery(
      'SELECT id, tipo_de_acesso, nivel_de_acesso FROM usuarios WHERE status = "ativo"'
    );

    let usuariosAtualizados = 0;
    let telasAdicionadas = 0;

    for (const usuario of usuarios) {
      // Buscar permissões existentes do usuário
      const permissoesExistentes = await executeQuery(
        'SELECT tela FROM permissoes_usuario WHERE usuario_id = ?',
        [usuario.id]
      );

      const telasExistentes = permissoesExistentes.map(p => p.tela);
      
      // Obter permissões padrão para o tipo e nível do usuário
      const permissoesPadrao = PERMISSOES_PADRAO[usuario.tipo_de_acesso]?.[usuario.nivel_de_acesso];
      
      if (permissoesPadrao) {
        const telasEsperadas = Object.keys(permissoesPadrao);
        const telasFaltantes = telasEsperadas.filter(tela => !telasExistentes.includes(tela));
        
        if (telasFaltantes.length > 0) {
          // Adicionar telas faltantes
          for (const tela of telasFaltantes) {
            const permissoesTela = permissoesPadrao[tela];
            const query = tela === 'chamados'
              ? `INSERT INTO permissoes_usuario 
                 (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir, pode_movimentar,
                  pode_assumir, pode_concluir, pode_reabrir, pode_atribuir)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
              : `INSERT INTO permissoes_usuario 
                 (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir, pode_movimentar,
                  pode_assumir, pode_concluir, pode_reabrir, pode_atribuir)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0)`;
            
            const params = tela === 'chamados'
              ? [
                usuario.id,
                tela,
                permissoesTela.visualizar ? 1 : 0,
                permissoesTela.criar ? 1 : 0,
                permissoesTela.editar ? 1 : 0,
                permissoesTela.excluir ? 1 : 0,
                  (permissoesTela.movimentar ? 1 : 0),
                  permissoesTela.assumir ? 1 : 0,
                  permissoesTela.concluir ? 1 : 0,
                  permissoesTela.reabrir ? 1 : 0,
                  permissoesTela.atribuir ? 1 : 0
                ]
              : [
                  usuario.id,
                  tela,
                  permissoesTela.visualizar ? 1 : 0,
                  permissoesTela.criar ? 1 : 0,
                  permissoesTela.editar ? 1 : 0,
                  permissoesTela.excluir ? 1 : 0,
                  permissoesTela.movimentar || 0 ? 1 : 0
                ];
            
            await executeQuery(query, params);
          }
          
          usuariosAtualizados++;
          telasAdicionadas += telasFaltantes.length;
          

        }
      }
    }

    return {
      usuarios_atualizados: usuariosAtualizados,
      telas_adicionadas: telasAdicionadas
    };

  } catch (error) {
    console.error('Erro ao sincronizar permissões:', error);
    throw error;
  }
};

/**
 * Atualizar permissões de um usuário
 */
const atualizarPermissoesUsuario = async (usuarioId, permissoes) => {
  try {
    // Buscar permissões existentes para auditoria
    const permissoesAnteriores = await executeQuery(
      'SELECT * FROM permissoes_usuario WHERE usuario_id = ?',
      [usuarioId]
    );

    // Deletar permissões existentes
    await executeQuery(
      'DELETE FROM permissoes_usuario WHERE usuario_id = ?',
      [usuarioId]
    );

    // Inserir novas permissões (apenas para telas com alguma permissão)
    for (const permissao of permissoes) {
      // Só insere se tiver alguma permissão básica
      const temPermissaoBasica = permissao.pode_visualizar || permissao.pode_criar || 
                                  permissao.pode_editar || permissao.pode_excluir || 
                                  permissao.pode_movimentar;
      
      // Para chamados, também verificar permissões específicas
      const temPermissaoChamados = permissao.tela === 'chamados' && 
                                   (permissao.pode_assumir || permissao.pode_concluir || 
                                    permissao.pode_reabrir || permissao.pode_atribuir);
      
      if (temPermissaoBasica || temPermissaoChamados) {
        const query = permissao.tela === 'chamados'
          ? `INSERT INTO permissoes_usuario 
             (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir, pode_movimentar,
              pode_assumir, pode_concluir, pode_reabrir, pode_atribuir) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          : `INSERT INTO permissoes_usuario 
             (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir, pode_movimentar,
              pode_assumir, pode_concluir, pode_reabrir, pode_atribuir) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0)`;
        
        const params = permissao.tela === 'chamados'
          ? [
              usuarioId,
              permissao.tela,
              permissao.pode_visualizar ? 1 : 0,
              permissao.pode_criar ? 1 : 0,
              permissao.pode_editar ? 1 : 0,
              permissao.pode_excluir ? 1 : 0,
              permissao.pode_movimentar ? 1 : 0,
              permissao.pode_assumir ? 1 : 0,
              permissao.pode_concluir ? 1 : 0,
              permissao.pode_reabrir ? 1 : 0,
              permissao.pode_atribuir ? 1 : 0
            ]
          : [
            usuarioId,
            permissao.tela,
            permissao.pode_visualizar ? 1 : 0,
            permissao.pode_criar ? 1 : 0,
            permissao.pode_editar ? 1 : 0,
            permissao.pode_excluir ? 1 : 0,
            permissao.pode_movimentar ? 1 : 0
            ];
        
        await executeQuery(query, params);
      }
    }

    return {
      success: true,
      permissoes_anteriores: permissoesAnteriores
    };

  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    throw error;
  }
};

module.exports = {
  atualizarPermissoesPorTipoNivel,
  converterPermissoesParaFormatoTabela,
  gerarPermissoesCompletas,
  sincronizarPermissoesUsuarios,
  atualizarPermissoesUsuario
};
