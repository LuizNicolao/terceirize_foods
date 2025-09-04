/**
 * Controller de CRUD de Patrimônios
 * Responsável por criar, atualizar e excluir patrimônios
 */

const { executeQuery } = require('../../config/database');

/**
 * Criar novo patrimônio
 */
const criarPatrimonio = async (req, res) => {
  try {
    const {
      produto_id,
      numero_patrimonio,
      local_atual_id,
      status = 'ativo',
      data_aquisicao,
      observacoes
    } = req.body;

    // Verificar se o produto é do grupo EQUIPAMENTO
    const produtoQuery = `
      SELECT g.nome as grupo
      FROM produtos p
      INNER JOIN grupos g ON p.grupo_id = g.id
      WHERE p.id = ?
    `;
    
    const produto = await executeQuery(produtoQuery, [produto_id]);
    
    if (produto.length === 0) {
      return res.status(400).json({ error: 'Produto não encontrado' });
    }

    if (produto[0].grupo !== 'EQUIPAMENTO') {
      return res.status(400).json({ error: 'Apenas produtos do grupo EQUIPAMENTO podem ser patrimônios' });
    }

    // Verificar se o número do patrimônio já existe
    const patrimonioExistente = await executeQuery(
      'SELECT id FROM patrimonios WHERE numero_patrimonio = ?',
      [numero_patrimonio]
    );

    if (patrimonioExistente.length > 0) {
      return res.status(400).json({ error: 'Número do patrimônio já existe' });
    }

    // Verificar se a filial atual existe
    const filial = await executeQuery(
      'SELECT id FROM filiais WHERE id = ?',
      [local_atual_id]
    );

    if (filial.length === 0) {
      return res.status(400).json({ error: 'Filial atual não encontrada' });
    }

    // Inserir patrimônio
    const insertQuery = `
      INSERT INTO patrimonios (
        produto_id, numero_patrimonio, local_atual_id,
        status, data_aquisicao, observacoes, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await executeQuery(insertQuery, [
      produto_id, numero_patrimonio, local_atual_id,
      status, data_aquisicao, observacoes
    ]);

    // Buscar patrimônio criado
    const patrimonioCriado = await executeQuery(
      'SELECT * FROM patrimonios WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: patrimonioCriado[0],
      message: 'Patrimônio criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar patrimônio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar patrimônio
 */
const atualizarPatrimonio = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se o patrimônio existe
    const patrimonioExistente = await executeQuery(
      'SELECT * FROM patrimonios WHERE id = ?',
      [id]
    );

    if (patrimonioExistente.length === 0) {
      return res.status(404).json({ error: 'Patrimônio não encontrado' });
    }

    // Construir query de atualização dinamicamente
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    fields.push('atualizado_em = NOW()');
    values.push(id);

    const updateQuery = `UPDATE patrimonios SET ${fields.join(', ')} WHERE id = ?`;
    await executeQuery(updateQuery, values);

    // Buscar patrimônio atualizado
    const patrimonioAtualizado = await executeQuery(
      'SELECT * FROM patrimonios WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: patrimonioAtualizado[0],
      message: 'Patrimônio atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar patrimônio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Excluir patrimônio
 */
const excluirPatrimonio = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o patrimônio existe
    const patrimonioExistente = await executeQuery(
      'SELECT * FROM patrimonios WHERE id = ?',
      [id]
    );

    if (patrimonioExistente.length === 0) {
      return res.status(404).json({ error: 'Patrimônio não encontrado' });
    }

    // Verificar se tem movimentações
    const movimentacoes = await executeQuery(
      'SELECT id FROM patrimonios_movimentacoes WHERE patrimonio_id = ?',
      [id]
    );

    if (movimentacoes.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir patrimônio com movimentações. Use inativação.' 
      });
    }

    // Excluir patrimônio
    await executeQuery('DELETE FROM patrimonios WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Patrimônio excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir patrimônio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  criarPatrimonio,
  atualizarPatrimonio,
  excluirPatrimonio
};
