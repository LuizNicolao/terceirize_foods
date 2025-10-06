const { query, pool } = require('../../config/database');

const criar = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir } = req.body;

    // Validar campos obrigatórios
    if (!usuario_id || !tela) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'Usuário e tela são obrigatórios'
      });
    }

    // Verificar se usuário existe
    const [usuario] = await connection.execute(
      'SELECT id FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    if (usuario.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se já existe permissão para esta tela
    const [permissaoExistente] = await connection.execute(
      'SELECT id FROM permissoes_usuario WHERE usuario_id = ? AND tela = ?',
      [usuario_id, tela]
    );

    if (permissaoExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Permissão já existe',
        message: 'Já existe uma permissão para esta tela'
      });
    }

    // Criar permissão
    const [resultado] = await connection.execute(`
      INSERT INTO permissoes_usuario 
      (usuario_id, tela, pode_visualizar, pode_criar, pode_editar, pode_excluir)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      usuario_id,
      tela,
      pode_visualizar ? 1 : 0,
      pode_criar ? 1 : 0,
      pode_editar ? 1 : 0,
      pode_excluir ? 1 : 0
    ]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Permissão criada com sucesso',
      data: { id: resultado.insertId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar permissão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar permissão'
    });
  } finally {
    connection.release();
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

const deletar = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;

    // Verificar se a permissão existe
    const [permissao] = await connection.execute(
      'SELECT id FROM permissoes_usuario WHERE id = ?',
      [id]
    );

    if (permissao.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Permissão não encontrada',
        message: 'Permissão não encontrada'
      });
    }

    // Deletar permissão
    await connection.execute(
      'DELETE FROM permissoes_usuario WHERE id = ?',
      [id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Permissão deletada com sucesso'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao deletar permissão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar permissão'
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
        'produtos-per-capita': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'solicitacoes-manutencao': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true }
      },
      'Supervisao': {
        usuarios: { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        necessidades: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        produtos: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        escolas: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'tipos-entrega': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'medias-escolas': { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        'registros-diarios': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'produtos-per-capita': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'solicitacoes-manutencao': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true }
      },
      'Nutricionista': {
        usuarios: { pode_visualizar: false, pode_criar: false, pode_editar: false, pode_excluir: false },
        necessidades: { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: false },
        produtos: { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        escolas: { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        'tipos-entrega': { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        'medias-escolas': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: true },
        'registros-diarios': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: false },
        'produtos-per-capita': { pode_visualizar: true, pode_criar: false, pode_editar: false, pode_excluir: false },
        'solicitacoes-manutencao': { pode_visualizar: true, pode_criar: true, pode_editar: true, pode_excluir: false }
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

module.exports = {
  criar,
  atualizar,
  deletar,
  resetarPadrao
};
