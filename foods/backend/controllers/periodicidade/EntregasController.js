/**
 * Controller para gerenciar entregas agendadas
 * Responsável por criar, atualizar, excluir e listar entregas individuais
 */

const { executeQuery } = require('../../config/database');

/**
 * Listar entregas de um agrupamento
 */
const listarEntregas = async (req, res) => {
  console.log('📋 [BACKEND] listarEntregas');
  console.log('  - Params:', req.params);
  console.log('  - Query:', req.query);
  
  try {
    const { agrupamentoId } = req.params;
    const { mes, ano } = req.query;

    let query = `
      SELECT 
        e.id,
        e.agrupamento_id,
        e.data_entrega,
        e.tipo_entrega,
        e.status,
        e.observacoes,
        e.criado_em,
        e.atualizado_em,
        a.nome as agrupamento_nome
      FROM entregas_agendadas e
      INNER JOIN agrupamentos_periodicidade a ON e.agrupamento_id = a.id
      WHERE e.agrupamento_id = ?
    `;
    
    const params = [agrupamentoId];

    // Filtrar por mês e ano se fornecidos
    if (mes && ano) {
      query += ` AND MONTH(e.data_entrega) = ? AND YEAR(e.data_entrega) = ?`;
      params.push(parseInt(mes), parseInt(ano));
    }

    query += ` ORDER BY e.data_entrega ASC`;

    console.log('🔍 Executando query:', query);
    console.log('📊 Parâmetros:', params);
    
    const entregas = await executeQuery(query, params);
    console.log('📋 Entregas encontradas:', entregas);

    res.json({
      success: true,
      data: entregas
    });
  } catch (error) {
    console.error('Erro ao listar entregas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

/**
 * Criar nova entrega
 */
const criarEntrega = async (req, res) => {
  try {
    const { agrupamentoId } = req.params;
    const { data_entrega, tipo_entrega = 'manual', observacoes } = req.body;

    // Validar dados obrigatórios
    if (!data_entrega) {
      return res.status(400).json({ 
        success: false,
        error: 'Data da entrega é obrigatória' 
      });
    }

    // Verificar se o agrupamento existe
    const agrupamento = await executeQuery(
      'SELECT id FROM agrupamentos_periodicidade WHERE id = ? AND ativo = TRUE',
      [agrupamentoId]
    );
    
    if (agrupamento.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Agrupamento não encontrado' 
      });
    }

    // Verificar se já existe entrega ativa para esta data (ignorar entregas excluídas)
    const entregaExistente = await executeQuery(
      'SELECT id FROM entregas_agendadas WHERE agrupamento_id = ? AND data_entrega = ? AND tipo_entrega != ?',
      [agrupamentoId, data_entrega, 'excluida']
    );

    if (entregaExistente.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Já existe uma entrega agendada para esta data' 
      });
    }

    // Inserir nova entrega
    const result = await executeQuery(
      'INSERT INTO entregas_agendadas (agrupamento_id, data_entrega, tipo_entrega, observacoes) VALUES (?, ?, ?, ?)',
      [agrupamentoId, data_entrega, tipo_entrega, observacoes]
    );

    // Buscar entrega criada
    const [novaEntrega] = await executeQuery(
      `SELECT 
        e.id,
        e.agrupamento_id,
        e.data_entrega,
        e.tipo_entrega,
        e.status,
        e.observacoes,
        e.criado_em,
        e.atualizado_em,
        a.nome as agrupamento_nome
      FROM entregas_agendadas e
      INNER JOIN agrupamentos_periodicidade a ON e.agrupamento_id = a.id
      WHERE e.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: novaEntrega,
      message: 'Entrega criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar entrega:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

/**
 * Atualizar entrega existente
 */
const atualizarEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const { data_entrega, tipo_entrega, status, observacoes } = req.body;

    // Verificar se a entrega existe
    const entregaExistente = await executeQuery(
      'SELECT * FROM entregas_agendadas WHERE id = ?',
      [id]
    );

    if (entregaExistente.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Entrega não encontrada' 
      });
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateValues = [];

    if (data_entrega !== undefined) {
      updateFields.push('data_entrega = ?');
      updateValues.push(data_entrega);
    }

    if (tipo_entrega !== undefined) {
      updateFields.push('tipo_entrega = ?');
      updateValues.push(tipo_entrega);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (observacoes !== undefined) {
      updateFields.push('observacoes = ?');
      updateValues.push(observacoes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Nenhum campo para atualizar' 
      });
    }

    updateFields.push('atualizado_em = NOW()');
    updateValues.push(id);

    // Atualizar entrega
    await executeQuery(
      `UPDATE entregas_agendadas SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Buscar entrega atualizada
    const [entregaAtualizada] = await executeQuery(
      `SELECT 
        e.id,
        e.agrupamento_id,
        e.data_entrega,
        e.tipo_entrega,
        e.status,
        e.observacoes,
        e.criado_em,
        e.atualizado_em,
        a.nome as agrupamento_nome
      FROM entregas_agendadas e
      INNER JOIN agrupamentos_periodicidade a ON e.agrupamento_id = a.id
      WHERE e.id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: entregaAtualizada,
      message: 'Entrega atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar entrega:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

/**
 * Excluir entrega
 */
const excluirEntrega = async (req, res) => {
  console.log('🗑️ [BACKEND] excluirEntrega');
  console.log('  - Params:', req.params);
  
  try {
    const { id } = req.params;

    // Verificar se a entrega existe
    console.log('🔍 Verificando se entrega existe...');
    const entregaExistente = await executeQuery(
      'SELECT id FROM entregas_agendadas WHERE id = ?',
      [id]
    );
    console.log('📋 Entrega encontrada:', entregaExistente);

    if (entregaExistente.length === 0) {
      console.log('❌ Entrega não encontrada');
      return res.status(404).json({ 
        success: false,
        error: 'Entrega não encontrada' 
      });
    }

    // Excluir entrega
    console.log('🗑️ Executando DELETE...');
    await executeQuery(
      'DELETE FROM entregas_agendadas WHERE id = ?',
      [id]
    );
    console.log('✅ DELETE executado com sucesso');

    res.json({
      success: true,
      message: 'Entrega excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir entrega:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

/**
 * Buscar entrega por ID
 */
const buscarEntregaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [entrega] = await executeQuery(
      `SELECT 
        e.id,
        e.agrupamento_id,
        e.data_entrega,
        e.tipo_entrega,
        e.status,
        e.observacoes,
        e.criado_em,
        e.atualizado_em,
        a.nome as agrupamento_nome
      FROM entregas_agendadas e
      INNER JOIN agrupamentos_periodicidade a ON e.agrupamento_id = a.id
      WHERE e.id = ?`,
      [id]
    );

    if (!entrega) {
      return res.status(404).json({ 
        success: false,
        error: 'Entrega não encontrada' 
      });
    }

    res.json({
      success: true,
      data: entrega
    });
  } catch (error) {
    console.error('Erro ao buscar entrega:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

module.exports = {
  listarEntregas,
  criarEntrega,
  atualizarEntrega,
  excluirEntrega,
  buscarEntregaPorId
};
