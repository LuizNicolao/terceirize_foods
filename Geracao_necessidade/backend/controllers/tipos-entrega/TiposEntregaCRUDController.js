const { query } = require('../../config/database');

const criar = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    // Validar dados obrigatórios
    if (!nome) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Nome é obrigatório'
      });
    }

    // Verificar se tipo de entrega já existe
    const existing = await query(
      'SELECT id FROM tipos_entrega WHERE nome = ?',
      [nome]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Tipo de entrega já existe',
        message: 'Já existe um tipo de entrega com este nome'
      });
    }

    // Inserir novo tipo de entrega
    const result = await query(`
      INSERT INTO tipos_entrega (nome, descricao, ativo)
      VALUES (?, ?, 1)
    `, [nome, descricao || null]);

    res.status(201).json({
      success: true,
      message: 'Tipo de entrega criado com sucesso',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar tipo de entrega:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar tipo de entrega'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo } = req.body;

    // Verificar se tipo de entrega existe
    const existing = await query(
      'SELECT id FROM tipos_entrega WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Tipo de entrega não encontrado',
        message: 'Tipo de entrega não encontrado'
      });
    }

    // Verificar se nome já existe em outro tipo de entrega
    if (nome) {
      const nomeExists = await query(
        'SELECT id FROM tipos_entrega WHERE nome = ? AND id != ?',
        [nome, id]
      );

      if (nomeExists.length > 0) {
        return res.status(400).json({
          error: 'Nome já existe',
          message: 'Já existe outro tipo de entrega com este nome'
        });
      }
    }

    // Construir query de atualização dinamicamente
    const updates = [];
    const values = [];

    if (nome) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (descricao !== undefined) {
      updates.push('descricao = ?');
      values.push(descricao);
    }
    if (ativo !== undefined) {
      updates.push('ativo = ?');
      values.push(ativo ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar',
        message: 'Nenhum campo válido foi fornecido para atualização'
      });
    }

    values.push(id);

    await query(`
      UPDATE tipos_entrega 
      SET ${updates.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);

    res.json({
      success: true,
      message: 'Tipo de entrega atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar tipo de entrega:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar tipo de entrega'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se tipo de entrega existe
    const existing = await query(
      'SELECT id FROM tipos_entrega WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Tipo de entrega não encontrado',
        message: 'Tipo de entrega não encontrado'
      });
    }

    // Verificar se está sendo usado em recebimentos
    const emUso = await query(
      'SELECT COUNT(*) as total FROM recebimentos_escolas WHERE tipo_entrega = (SELECT nome FROM tipos_entrega WHERE id = ?)',
      [id]
    );

    if (emUso[0].total > 0) {
      return res.status(400).json({
        error: 'Tipo de entrega em uso',
        message: 'Este tipo de entrega está sendo usado em recebimentos e não pode ser excluído'
      });
    }

    // Deletar tipo de entrega (soft delete - marcar como inativo)
    await query(
      'UPDATE tipos_entrega SET ativo = 0, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Tipo de entrega excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar tipo de entrega:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar tipo de entrega'
    });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar
};
