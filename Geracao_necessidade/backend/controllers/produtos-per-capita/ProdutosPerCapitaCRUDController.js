const { query } = require('../../config/database');

const criar = async (req, res) => {
  try {
    const {
      produto_id,
      per_capita_lanche_manha,
      per_capita_almoco,
      per_capita_lanche_tarde,
      per_capita_parcial,
      per_capita_eja,
      ativo = 1
    } = req.body;

    // Validar campos obrigatórios
    if (!produto_id) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'Produto é obrigatório'
      });
    }

    // Verificar se o produto existe na tabela produtos
    const produtoExiste = await query(
      'SELECT id, nome FROM produtos WHERE id = ? AND ativo = 1',
      [produto_id]
    );

    if (produtoExiste.length === 0) {
      return res.status(400).json({
        error: 'Produto inválido',
        message: 'O produto selecionado não existe ou está inativo'
      });
    }

    // Verificar se já existe per capita para este produto
    const perCapitaExistente = await query(
      'SELECT id, ativo FROM produtos_per_capita WHERE produto_id = ?',
      [produto_id]
    );

    if (perCapitaExistente.length > 0) {
      const perCapita = perCapitaExistente[0];
      
      // Se já existe per capita ATIVA, retornar erro
      if (perCapita.ativo === 1) {
        return res.status(400).json({
          error: 'Per capita já existe',
          message: 'Já existe per capita definida para este produto'
        });
      }
      
      // Se existe per capita INATIVA, reativar com novos valores
      await query(`
        UPDATE produtos_per_capita SET
          per_capita_lanche_manha = ?,
          per_capita_almoco = ?,
          per_capita_lanche_tarde = ?,
          per_capita_parcial = ?,
          per_capita_eja = ?,
          ativo = ?,
          data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        per_capita_lanche_manha !== undefined ? per_capita_lanche_manha : 0,
        per_capita_almoco !== undefined ? per_capita_almoco : 0,
        per_capita_lanche_tarde !== undefined ? per_capita_lanche_tarde : 0,
        per_capita_parcial !== undefined ? per_capita_parcial : 0,
        per_capita_eja !== undefined ? per_capita_eja : 0,
        ativo,
        perCapita.id
      ]);

      return res.status(200).json({
        success: true,
        message: ativo ? 'Per capita reativada com sucesso' : 'Per capita atualizada com sucesso',
        data: { id: perCapita.id }
      });
    }

    // Criar nova per capita
    const resultado = await query(`
      INSERT INTO produtos_per_capita (
        produto_id,
        per_capita_lanche_manha, per_capita_almoco, per_capita_lanche_tarde, per_capita_parcial, per_capita_eja,
        ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      produto_id,
      per_capita_lanche_manha !== undefined ? per_capita_lanche_manha : 0,
      per_capita_almoco !== undefined ? per_capita_almoco : 0,
      per_capita_lanche_tarde !== undefined ? per_capita_lanche_tarde : 0,
      per_capita_parcial !== undefined ? per_capita_parcial : 0,
      per_capita_eja !== undefined ? per_capita_eja : 0,
      ativo
    ]);

    res.status(201).json({
      success: true,
      message: 'Per capita criada com sucesso',
      data: { id: resultado.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar per capita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar per capita'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      per_capita_lanche_manha,
      per_capita_almoco,
      per_capita_lanche_tarde,
      per_capita_parcial,
      per_capita_eja,
      ativo
    } = req.body;

    // Verificar se a per capita existe
    const perCapitaExistente = await query(
      'SELECT id FROM produtos_per_capita WHERE id = ?',
      [id]
    );

    if (perCapitaExistente.length === 0) {
      return res.status(404).json({
        error: 'Per capita não encontrada',
        message: 'Per capita não encontrada'
      });
    }

    // Tratar valores undefined como null
    const params = [
      per_capita_lanche_manha !== undefined ? per_capita_lanche_manha : null,
      per_capita_almoco !== undefined ? per_capita_almoco : null,
      per_capita_lanche_tarde !== undefined ? per_capita_lanche_tarde : null,
      per_capita_parcial !== undefined ? per_capita_parcial : null,
      per_capita_eja !== undefined ? per_capita_eja : null,
      ativo !== undefined ? ativo : null,
      id
    ];

    // Atualizar per capita
    await query(`
      UPDATE produtos_per_capita SET
        per_capita_lanche_manha = COALESCE(?, per_capita_lanche_manha),
        per_capita_almoco = COALESCE(?, per_capita_almoco),
        per_capita_lanche_tarde = COALESCE(?, per_capita_lanche_tarde),
        per_capita_parcial = COALESCE(?, per_capita_parcial),
        per_capita_eja = COALESCE(?, per_capita_eja),
        ativo = COALESCE(?, ativo),
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `, params);

    res.json({
      success: true,
      message: 'Per capita atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar per capita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar per capita'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o produto existe
    const produtoExistente = await query(
      'SELECT id FROM produtos_per_capita WHERE id = ?',
      [id]
    );

    if (produtoExistente.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado',
        message: 'Produto não encontrado'
      });
    }

    // Deletar produto (soft delete - marcar como inativo)
    await query(
      'UPDATE produtos_per_capita SET ativo = 0, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Produto excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar produto per capita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar produto per capita'
    });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar
};
