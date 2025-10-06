const { query } = require('../../config/database');

const criar = async (req, res) => {
  try {
    const { nome, unidade_medida, tipo } = req.body;

    // Validar dados obrigatórios
    if (!nome || !unidade_medida || !tipo) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Nome, unidade de medida e tipo são obrigatórios'
      });
    }

    // Verificar se produto já existe
    const existing = await query(
      'SELECT id FROM produtos WHERE nome = ? AND tipo = ?',
      [nome, tipo]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Produto já existe',
        message: 'Já existe um produto com este nome e tipo'
      });
    }

    // Inserir novo produto
    const result = await query(`
      INSERT INTO produtos (nome, unidade_medida, tipo, ativo)
      VALUES (?, ?, ?, 1)
    `, [nome, unidade_medida, tipo]);

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar produto'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, unidade_medida, tipo, ativo } = req.body;

    // Verificar se produto existe
    const existing = await query(
      'SELECT id FROM produtos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado',
        message: 'Produto não encontrado'
      });
    }

    // Verificar se nome e tipo já existem em outro produto
    if (nome && tipo) {
      const duplicate = await query(
        'SELECT id FROM produtos WHERE nome = ? AND tipo = ? AND id != ?',
        [nome, tipo, id]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({
          error: 'Produto já existe',
          message: 'Já existe outro produto com este nome e tipo'
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
    if (unidade_medida) {
      updates.push('unidade_medida = ?');
      values.push(unidade_medida);
    }
    if (tipo) {
      updates.push('tipo = ?');
      values.push(tipo);
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
      UPDATE produtos 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values);

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar produto'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se produto existe
    const existing = await query(
      'SELECT id FROM produtos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado',
        message: 'Produto não encontrado'
      });
    }

    // Deletar produto
    await query('DELETE FROM produtos WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar produto'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const produtos = await query(`
      SELECT 
        id, 
        nome, 
        unidade_medida,
        tipo,
        ativo,
        data_cadastro
      FROM produtos 
      WHERE id = ?
    `, [id]);

    if (produtos.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado',
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: produtos[0]
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produto'
    });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar,
  buscarPorId
};
