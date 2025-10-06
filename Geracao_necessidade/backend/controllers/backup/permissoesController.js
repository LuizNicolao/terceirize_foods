const { query, pool } = require('../config/database');


const listar = async (req, res) => {
  try {
    // Se for rota /me, usar o ID do usuário logado
    // Se for rota /:usuario_id, usar o ID dos parâmetros
    const usuario_id = req.params.usuario_id || req.user.id;

    // Buscar permissões do usuário
    const permissoes = await query(`
      SELECT 
        p.id,
        p.tela,
        p.pode_visualizar,
        p.pode_criar,
        p.pode_editar,
        p.pode_excluir,
        p.criado_em,
        p.atualizado_em
      FROM permissoes_usuario p
      WHERE p.usuario_id = ?
      ORDER BY p.tela ASC
    `, [usuario_id]);

    res.json({
      success: true,
      data: permissoes
    });
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar permissões'
    });
  }
};

const atualizar = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { usuario_id } = req.params;
    const { permissoes } = req.body;

    // Verificar se usuário existe
    const [usuario] = await connection.execute(
      'SELECT id FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    if (usuario.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    // Deletar permissões existentes
    await connection.execute(
      'DELETE FROM permissoes_usuario WHERE usuario_id = ?',
      [usuario_id]
    );

    // Inserir novas permissões
    for (const permissao of permissoes) {
      await connection.execute(`
        INSERT INTO permissoes_usuario 
        (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        usuario_id,
        permissao.tela,
        permissao.pode_visualizar ? 1 : 0,
        permissao.pode_criar ? 1 : 0,
        permissao.pode_editar ? 1 : 0,
        permissao.pode_excluir ? 1 : 0
      ]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Permissões atualizadas com sucesso'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar permissões'
    });
  } finally {
    connection.release();
  }
};

const resetarPadrao = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { usuario_id } = req.params;

    // Buscar tipo do usuário
    const [usuario] = await connection.execute(
      'SELECT tipo_usuario FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    if (usuario.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    const tipoUsuario = usuario[0].tipo_usuario;

    // Deletar permissões existentes
    await connection.execute(
      'DELETE FROM permissoes_usuario WHERE usuario_id = ?',
      [usuario_id]
    );

    // Definir permissões padrão por tipo
    const permissoesPadrao = {
      'Coordenacao': {
        usuarios: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        necessidades: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        produtos: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        escolas: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'tipos-entrega': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'medias-escolas': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'registros-diarios': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'produtos-per-capita': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true }
      },
      'Supervisao': {
        usuarios: { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        necessidades: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        produtos: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        escolas: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'tipos-entrega': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'medias-escolas': { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        'registros-diarios': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'produtos-per-capita': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true }
      },
      'Nutricionista': {
        usuarios: { pode_visualizar: false, pode_criar: false, pode_editar: false, pode_excluir: false },
        necessidades: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: false },
        produtos: { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        escolas: { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        'tipos-entrega': { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        'medias-escolas': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'registros-diarios': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: false },
        'produtos-per-capita': { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false }
      }
    };

    const permissoes = permissoesPadrao[tipoUsuario] || {};

    // Inserir permissões padrão
    for (const [tela, permissao] of Object.entries(permissoes)) {
      await connection.execute(`
        INSERT INTO permissoes_usuario 
        (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        usuario_id,
        tela,
        permissao.pode_visualizar ? 1 : 0,
        permissao.pode_criar ? 1 : 0,
        permissao.pode_editar ? 1 : 0,
        permissao.pode_excluir ? 1 : 0
      ]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Permissões resetadas para o padrão do tipo de usuário'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao resetar permissões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao resetar permissões'
    });
  } finally {
    connection.release();
  }
};

const verificarPermissao = async (req, res) => {
  try {
    const { usuario_id, tela, acao } = req.params;

    const permissoes = await query(`
      SELECT pode_visualizar, pode_criar, pode_editar, pode_excluir
      FROM permissoes_usuario
      WHERE usuario_id = ? AND tela = ?
    `, [usuario_id, tela]);

    if (permissoes.length === 0) {
      return res.json({
        success: true,
        data: { temPermissao: false }
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

    res.json({
      success: true,
      data: { temPermissao }
    });
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar permissão'
    });
  }
};

const sincronizarPermissoes = async (req, res) => {
  try {
    const { sincronizarPermissoes } = require('../scripts/sincronizarPermissoes');
    
    await sincronizarPermissoes();

    res.json({
      success: true,
      message: 'Permissões sincronizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao sincronizar permissões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao sincronizar permissões'
    });
  }
};

module.exports = {
  listar,
  atualizar,
  resetarPadrao,
  verificarPermissao,
  sincronizarPermissoes
};
