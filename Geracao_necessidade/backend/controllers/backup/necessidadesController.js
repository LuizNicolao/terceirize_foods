const { query } = require('../config/database');

const listar = async (req, res) => {
  try {
    const necessidades = await query(`
      SELECT 
        n.*,
        p.nome as produto_nome,
        p.unidade_medida,
        e.nome_escola,
        e.rota,
        te.nome as tipo_entrega_nome
      FROM necessidades n
      LEFT JOIN produtos p ON n.produto = p.nome
      LEFT JOIN escolas e ON n.escola = e.nome_escola
      LEFT JOIN tipos_entrega te ON n.tipo_entrega = te.nome
      WHERE n.usuario_email = ?
      ORDER BY n.data_preenchimento DESC
    `, [req.user.email]);

    res.json({
      success: true,
      data: necessidades
    });
  } catch (error) {
    console.error('Erro ao buscar necessidades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar necessidades'
    });
  }
};

const criar = async (req, res) => {
  try {
    const { produto, escola, quantidade, tipo_entrega } = req.body;

    // Validar dados obrigatórios
    if (!produto || !escola || !quantidade || !tipo_entrega) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Verificar se já existe uma necessidade para este produto/escola/tipo
    const existing = await query(`
      SELECT id FROM necessidades 
      WHERE usuario_email = ? AND produto = ? AND escola = ? AND tipo_entrega = ?
    `, [req.user.email, produto, escola, tipo_entrega]);

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Necessidade já existe',
        message: 'Já existe uma necessidade para este produto nesta escola'
      });
    }

    // Inserir nova necessidade
    const result = await query(`
      INSERT INTO necessidades (usuario_email, produto, escola, quantidade, tipo_entrega)
      VALUES (?, ?, ?, ?, ?)
    `, [req.user.email, produto, escola, quantidade, tipo_entrega]);

    res.status(201).json({
      success: true,
      message: 'Necessidade criada com sucesso',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar necessidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar necessidade'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { produto, escola, quantidade, tipo_entrega } = req.body;

    // Verificar se a necessidade pertence ao usuário
    const existing = await query(`
      SELECT id FROM necessidades 
      WHERE id = ? AND usuario_email = ?
    `, [id, req.user.email]);

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Necessidade não encontrada',
        message: 'Necessidade não encontrada ou não pertence ao usuário'
      });
    }

    // Atualizar necessidade
    await query(`
      UPDATE necessidades 
      SET produto = ?, escola = ?, quantidade = ?, tipo_entrega = ?, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ? AND usuario_email = ?
    `, [produto, escola, quantidade, tipo_entrega, id, req.user.email]);

    res.json({
      success: true,
      message: 'Necessidade atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar necessidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar necessidade'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a necessidade pertence ao usuário
    const existing = await query(`
      SELECT id FROM necessidades 
      WHERE id = ? AND usuario_email = ?
    `, [id, req.user.email]);

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Necessidade não encontrada',
        message: 'Necessidade não encontrada ou não pertence ao usuário'
      });
    }

    // Deletar necessidade
    await query(`
      DELETE FROM necessidades 
      WHERE id = ? AND usuario_email = ?
    `, [id, req.user.email]);

    res.json({
      success: true,
      message: 'Necessidade deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar necessidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar necessidade'
    });
  }
};

const gerarNecessidade = async (req, res) => {
  try {
    const { escola_id, grupo_id, data, produtos } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !grupo_id || !data || !produtos || !Array.isArray(produtos)) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Escola, grupo, data e produtos são obrigatórios'
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

    // Verificar se o grupo existe (baseado no tipo dos produtos)
    const grupos = await query(`
      SELECT DISTINCT tipo as nome
      FROM produtos 
      WHERE ativo = 1 
      ORDER BY tipo ASC
    `);
    
    const grupoNome = grupos[grupo_id - 1]?.nome;
    
    if (!grupoNome) {
      return res.status(400).json({
        error: 'Grupo não encontrado',
        message: 'O grupo selecionado não existe'
      });
    }

    // Inserir necessidades para cada produto
    const necessidadesCriadas = [];
    
    for (const produto of produtos) {
      const { produto_id, quantidade, frequencia, percapita } = produto;

      // Verificar se o produto existe
      const produtoExiste = await query(`
        SELECT id, nome FROM produtos WHERE id = ?
      `, [produto_id]);

      if (produtoExiste.length === 0) {
        continue; // Pular produto inexistente
      }

      // Verificar se já existe necessidade para este produto/escola/data
      const existing = await query(`
        SELECT id FROM necessidades 
        WHERE usuario_email = ? AND produto = ? AND escola = ? AND data_consumo = ?
      `, [req.user.email, produtoExiste[0].nome, escola[0].nome_escola, data]);

      if (existing.length > 0) {
        // Atualizar necessidade existente
        await query(`
          UPDATE necessidades 
          SET quantidade = ?, frequencia = ?, percapita = ?, data_atualizacao = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [quantidade, frequencia, percapita, existing[0].id]);
        
        necessidadesCriadas.push({
          id: existing[0].id,
          produto: produtoExiste[0].nome,
          quantidade,
          status: 'atualizada'
        });
      } else {
        // Criar nova necessidade
        const result = await query(`
          INSERT INTO necessidades (
            usuario_email, 
            produto, 
            escola, 
            quantidade, 
            tipo_entrega, 
            data_consumo,
            frequencia,
            percapita,
            grupo_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          req.user.email, 
          produtoExiste[0].nome, 
          escola[0].nome_escola, 
          quantidade, 
          'gerada', // tipo_entrega padrão para necessidades geradas
          data,
          frequencia,
          percapita,
          grupo_id
        ]);

        necessidadesCriadas.push({
          id: result.insertId,
          produto: produtoExiste[0].nome,
          quantidade,
          status: 'criada'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Necessidade gerada com sucesso! ${necessidadesCriadas.length} produtos processados.`,
      data: {
        escola: escola[0].nome_escola,
        grupo: grupoNome,
        data,
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
  listar,
  criar,
  atualizar,
  deletar,
  gerarNecessidade
};
