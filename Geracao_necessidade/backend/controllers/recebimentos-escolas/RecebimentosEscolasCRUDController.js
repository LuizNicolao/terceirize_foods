const { query } = require('../../config/database');
const { calcularStatusEntrega } = require('../../utils/recebimentosUtils');

const criar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      escola_id, 
      data_recebimento, 
      tipo_recebimento, 
      tipo_entrega, 
      pendencia_anterior, 
      precisa_reentrega, 
      observacoes,
      produtos 
    } = req.body;

    // Validar campos obrigatórios
    if (!escola_id || !data_recebimento || !tipo_recebimento || !tipo_entrega || !pendencia_anterior) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'É necessário informar escola, data, tipo de recebimento, tipo de entrega e pendência anterior'
      });
    }

    // Verificar se a escola existe
    const escolaExiste = await query('SELECT id FROM escolas WHERE id = ? AND ativo = 1', [escola_id]);
    if (escolaExiste.length === 0) {
      return res.status(400).json({
        error: 'Escola inválida',
        message: 'A escola selecionada não existe ou está inativa'
      });
    }

    // Se for recebimento parcial, validar produtos
    if (tipo_recebimento === 'Parcial') {
      if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({
          error: 'Produtos obrigatórios',
          message: 'Para recebimento parcial, é necessário informar pelo menos um produto'
        });
      }

      if (!precisa_reentrega) {
        return res.status(400).json({
          error: 'Campo obrigatório',
          message: 'Para recebimento parcial, é necessário informar se precisa de reentrega'
        });
      }
    }

    // Calcular status de entrega
    const statusEntrega = calcularStatusEntrega(data_recebimento, tipo_entrega);

    // Inserir recebimento
    const resultado = await query(`
      INSERT INTO recebimentos_escolas (
        escola_id, usuario_id, data_recebimento, tipo_recebimento, 
        tipo_entrega, status_entrega, pendencia_anterior, precisa_reentrega, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [escola_id, userId, data_recebimento, tipo_recebimento, tipo_entrega, statusEntrega, pendencia_anterior, precisa_reentrega, observacoes]);

    const recebimentoId = resultado.insertId;

    // Se for recebimento parcial, inserir produtos
    if (tipo_recebimento === 'Parcial' && produtos.length > 0) {
      for (const produto of produtos) {
        if (produto.produto_id && produto.quantidade > 0) {
          await query(`
            INSERT INTO recebimentos_produtos (recebimento_id, produto_id, quantidade)
            VALUES (?, ?, ?)
          `, [recebimentoId, produto.produto_id, produto.quantidade]);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Recebimento criado com sucesso',
      data: { id: recebimentoId }
    });
  } catch (error) {
    console.error('Erro ao criar recebimento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar recebimento'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { id } = req.params;
    const { 
      escola_id, 
      data_recebimento, 
      tipo_recebimento, 
      tipo_entrega, 
      pendencia_anterior, 
      precisa_reentrega, 
      observacoes,
      produtos 
    } = req.body;

    // Verificar se o recebimento existe
    let whereClause = 'WHERE id = ?';
    let params = [id];

    if (userType === 'Nutricionista') {
      whereClause += ' AND usuario_id = ?';
      params.push(userId);
    }

    const recebimentoExiste = await query(`
      SELECT id FROM recebimentos_escolas ${whereClause}
    `, params);

    if (recebimentoExiste.length === 0) {
      return res.status(404).json({
        error: 'Recebimento não encontrado',
        message: 'Recebimento não encontrado ou você não tem permissão para editá-lo'
      });
    }

    // Validar campos obrigatórios
    if (!escola_id || !data_recebimento || !tipo_recebimento || !tipo_entrega || !pendencia_anterior) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'É necessário informar escola, data, tipo de recebimento, tipo de entrega e pendência anterior'
      });
    }

    // Verificar se a escola existe
    const escolaExiste = await query('SELECT id FROM escolas WHERE id = ? AND ativo = 1', [escola_id]);
    if (escolaExiste.length === 0) {
      return res.status(400).json({
        error: 'Escola inválida',
        message: 'A escola selecionada não existe ou está inativa'
      });
    }

    // Se for recebimento parcial, validar produtos
    if (tipo_recebimento === 'Parcial') {
      if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({
          error: 'Produtos obrigatórios',
          message: 'Para recebimento parcial, é necessário informar pelo menos um produto'
        });
      }

      if (!precisa_reentrega) {
        return res.status(400).json({
          error: 'Campo obrigatório',
          message: 'Para recebimento parcial, é necessário informar se precisa de reentrega'
        });
      }
    }

    // Calcular status de entrega
    const statusEntrega = calcularStatusEntrega(data_recebimento, tipo_entrega);

    // Atualizar recebimento
    await query(`
      UPDATE recebimentos_escolas SET
        escola_id = ?, data_recebimento = ?, tipo_recebimento = ?,
        tipo_entrega = ?, status_entrega = ?, pendencia_anterior = ?, precisa_reentrega = ?,
        observacoes = ?, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [escola_id, data_recebimento, tipo_recebimento, tipo_entrega, statusEntrega, pendencia_anterior, precisa_reentrega, observacoes, id]);

    // Se for recebimento parcial, atualizar produtos
    if (tipo_recebimento === 'Parcial') {
      // Deletar produtos existentes
      await query('DELETE FROM recebimentos_produtos WHERE recebimento_id = ?', [id]);

      // Inserir novos produtos
      for (const produto of produtos) {
        if (produto.produto_id && produto.quantidade > 0) {
          await query(`
            INSERT INTO recebimentos_produtos (recebimento_id, produto_id, quantidade)
            VALUES (?, ?, ?)
          `, [id, produto.produto_id, produto.quantidade]);
        }
      }
    } else {
      // Se mudou para completo, deletar produtos
      await query('DELETE FROM recebimentos_produtos WHERE recebimento_id = ?', [id]);
    }

    res.json({
      success: true,
      message: 'Recebimento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar recebimento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar recebimento'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { id } = req.params;

    // Verificar se o recebimento existe
    let whereClause = 'WHERE id = ?';
    let params = [id];

    if (userType === 'Nutricionista') {
      whereClause += ' AND usuario_id = ?';
      params.push(userId);
    }

    const recebimentoExiste = await query(`
      SELECT id FROM recebimentos_escolas ${whereClause}
    `, params);

    if (recebimentoExiste.length === 0) {
      return res.status(404).json({
        error: 'Recebimento não encontrado',
        message: 'Recebimento não encontrado ou você não tem permissão para deletá-lo'
      });
    }

    // Deletar recebimento (produtos serão deletados automaticamente por CASCADE)
    await query('DELETE FROM recebimentos_escolas WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Recebimento deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar recebimento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar recebimento'
    });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar
};
