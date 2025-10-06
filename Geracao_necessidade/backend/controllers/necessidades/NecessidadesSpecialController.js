const { query } = require('../../config/database');

const gerarNecessidade = async (req, res) => {
  try {
    const { escola_id, data_consumo, semana_abastecimento, produtos } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !data_consumo || !produtos || !Array.isArray(produtos)) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Escola, data de consumo e produtos são obrigatórios'
      });
    }

    // Verificar se a escola existe
    const escola = await query(`
      SELECT id, nome_escola FROM escolas WHERE id = ?
    `, [escola_id]);

    if (escola.length === 0) {
      return res.status(400).json({
        error: 'Escola não encontrada',
        message: 'A escola selecionada não existe'
      });
    }

    // Inserir necessidades para cada produto
    const necessidadesCriadas = [];
    
    for (const produto of produtos) {
      const { produto_id, ajuste } = produto;

      // Verificar se o produto existe
      const produtoExiste = await query(`
        SELECT id, nome, tipo FROM produtos WHERE id = ?
      `, [produto_id]);

      if (produtoExiste.length === 0) {
        continue; // Pular produto inexistente
      }

      // Verificar se já existe necessidade para este produto/escola/data
      const existing = await query(`
        SELECT id FROM necessidades 
        WHERE usuario_email = ? AND produto = ? AND escola = ? AND data_consumo = ?
      `, [req.user.email, produtoExiste[0].nome, escola[0].nome_escola, data_consumo]);

      if (existing.length > 0) {
        // Atualizar necessidade existente
        await query(`
          UPDATE necessidades 
          SET ajuste = ?, semana_abastecimento = ?, data_atualizacao = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [ajuste, semana_abastecimento || null, existing[0].id]);
        
        necessidadesCriadas.push({
          id: existing[0].id,
          produto: produtoExiste[0].nome,
          ajuste,
          status: 'atualizada'
        });
      } else {
        // Criar nova necessidade
        const result = await query(`
          INSERT INTO necessidades (
            usuario_email, 
            produto, 
            escola, 
            codigo_teknisa,
            ajuste, 
            data_consumo,
            semana_abastecimento
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          req.user.email, 
          produtoExiste[0].nome, 
          escola[0].nome_escola, 
          escola[0].codigo_teknisa,
          ajuste, 
          data_consumo,
          semana_abastecimento || null
        ]);

        necessidadesCriadas.push({
          id: result.insertId,
          produto: produtoExiste[0].nome,
          ajuste,
          status: 'criada'
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Necessidade gerada com sucesso! ${necessidadesCriadas.length} produtos processados.`,
      data: {
        escola: escola[0].nome_escola,
        data_consumo,
        necessidades: necessidadesCriadas
      }
    });
  } catch (error) {
    console.error('Erro ao gerar necessidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar necessidade'
    });
  }
};

module.exports = {
  gerarNecessidade
};
