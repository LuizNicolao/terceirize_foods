const { query } = require('../../config/database');

const criar = async (req, res) => {
  try {
    const { nome_escola, rota, cidade, estado, email_nutricionista } = req.body;

    // Validar dados obrigatórios
    if (!nome_escola || !rota || !cidade || !estado) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Nome da escola, rota, cidade e estado são obrigatórios'
      });
    }

    // Verificar se escola já existe
    const existing = await query(
      'SELECT id FROM escolas WHERE nome_escola = ? AND rota = ?',
      [nome_escola, rota]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Escola já existe',
        message: 'Já existe uma escola com este nome e rota'
      });
    }

    // Inserir nova escola
    const result = await query(`
      INSERT INTO escolas (nome_escola, rota, cidade, estado, email_nutricionista, ativo)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [nome_escola, rota, cidade, estado, email_nutricionista || null]);

    res.status(201).json({
      success: true,
      message: 'Escola criada com sucesso',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar escola:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar escola'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_escola, rota, cidade, estado, email_nutricionista, ativo } = req.body;

    // Verificar se escola existe
    const existing = await query(
      'SELECT id FROM escolas WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Escola não encontrada',
        message: 'Escola não encontrada'
      });
    }

    // Verificar se nome e rota já existem em outra escola
    if (nome_escola && rota) {
      const duplicate = await query(
        'SELECT id FROM escolas WHERE nome_escola = ? AND rota = ? AND id != ?',
        [nome_escola, rota, id]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({
          error: 'Escola já existe',
          message: 'Já existe outra escola com este nome e rota'
        });
      }
    }

    // Construir query de atualização dinamicamente
    const updates = [];
    const values = [];

    if (nome_escola) {
      updates.push('nome_escola = ?');
      values.push(nome_escola);
    }
    if (rota) {
      updates.push('rota = ?');
      values.push(rota);
    }
    if (cidade) {
      updates.push('cidade = ?');
      values.push(cidade);
    }
    if (estado) {
      updates.push('estado = ?');
      values.push(estado);
    }
    if (email_nutricionista !== undefined) {
      updates.push('email_nutricionista = ?');
      values.push(email_nutricionista);
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
      UPDATE escolas 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values);

    res.json({
      success: true,
      message: 'Escola atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar escola:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar escola'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se escola existe
    const existing = await query(
      'SELECT id FROM escolas WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Escola não encontrada',
        message: 'Escola não encontrada'
      });
    }

    // Deletar escola
    await query('DELETE FROM escolas WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Escola deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar escola:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar escola'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const escolas = await query(`
      SELECT 
        id, 
        nome_escola, 
        rota, 
        cidade, 
        estado, 
        email_nutricionista,
        ativo,
        data_cadastro
      FROM escolas 
      WHERE id = ?
    `, [id]);

    if (escolas.length === 0) {
      return res.status(404).json({
        error: 'Escola não encontrada',
        message: 'Escola não encontrada'
      });
    }

    res.json({
      success: true,
      data: escolas[0]
    });
  } catch (error) {
    console.error('Erro ao buscar escola:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar escola'
    });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar,
  buscarPorId
};
