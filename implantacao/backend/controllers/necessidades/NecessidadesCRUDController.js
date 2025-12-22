const { executeQuery } = require('../../config/database');

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
    const existing = await executeQuery(`
      SELECT id FROM necessidades 
      WHERE usuario_email = ? AND produto = ? AND escola = ? AND tipo_entrega = ?
    `, [req.user.email, produto, escola, tipo_entrega]);

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Necessidade já existe',
        message: 'Já existe uma necessidade para este produto, escola e tipo de entrega'
      });
    }

    // Gerar ID no formato YYYYMMDD-XXX (data + sequencial do dia)
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const prefixoData = `${ano}${mes}${dia}`;
    
    // Buscar o último sequencial do dia atual
    const ultimoSequencial = await executeQuery(`
      SELECT necessidade_id 
      FROM necessidades 
      WHERE necessidade_id LIKE ?
      ORDER BY necessidade_id DESC
      LIMIT 1
    `, [`${prefixoData}-%`]);
    
    let proximoSequencial = 1;
    if (ultimoSequencial.length > 0) {
      const ultimoId = ultimoSequencial[0].necessidade_id;
      const partes = ultimoId.split('-');
      if (partes.length === 2 && partes[0] === prefixoData) {
        const sequencialAtual = parseInt(partes[1], 10) || 0;
        proximoSequencial = sequencialAtual + 1;
      }
    }
    
    // Formato: YYYYMMDD-XXX (ex: 20241215-001)
    const necessidadeId = `${prefixoData}-${String(proximoSequencial).padStart(3, '0')}`;

    // Inserir nova necessidade
    const resultado = await executeQuery(`
      INSERT INTO necessidades (usuario_email, produto, escola, quantidade, tipo_entrega, data_preenchimento, status, observacoes, necessidade_id)
      VALUES (?, ?, ?, ?, ?, NOW(), 'NEC', NULL, ?)
    `, [req.user.email, produto, escola, quantidade, tipo_entrega, necessidadeId]);

    res.status(201).json({
      success: true,
      message: 'Necessidade criada com sucesso',
      data: { id: resultado.insertId }
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
    const { produto, escola, quantidade, tipo_entrega, status, observacoes } = req.body;

    // Verificar se a necessidade existe
    const existing = await executeQuery(`
      SELECT id, usuario_email FROM necessidades 
      WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Necessidade não encontrada',
        message: 'Necessidade não encontrada'
      });
    }

    // Verificar permissões - coordenador/supervisor/admin podem editar qualquer necessidade
    const userType = req.user.tipo_de_acesso;
    const canEdit = userType === 'coordenador' || userType === 'supervisor' || userType === 'administrador' || 
                   existing[0].usuario_email === req.user.email;

    if (!canEdit) {
      return res.status(403).json({
        error: 'Sem permissão',
        message: 'Você não tem permissão para editar esta necessidade'
      });
    }

    // Construir query de atualização dinamicamente
    let updateFields = [];
    let updateValues = [];

    if (produto !== undefined) {
      updateFields.push('produto = ?');
      updateValues.push(produto);
    }
    if (escola !== undefined) {
      updateFields.push('escola = ?');
      updateValues.push(escola);
    }
    if (quantidade !== undefined) {
      updateFields.push('quantidade = ?');
      updateValues.push(quantidade);
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

    // Sempre atualizar data_atualizacao
    updateFields.push('data_atualizacao = NOW()');
    updateValues.push(id);

    // Atualizar necessidade
    await executeQuery(`
      UPDATE necessidades 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

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

    // Verificar se a necessidade existe e pertence ao usuário
    const existing = await executeQuery(`
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
    await executeQuery(`
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

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const necessidades = await executeQuery(`
      SELECT 
        n.*,
        n.produto as produto_nome,
        n.produto_unidade as unidade_medida,
        n.escola as nome_escola,
        n.escola_rota as rota
      FROM necessidades n
      WHERE n.id = ? AND n.usuario_email = ?
    `, [id, req.user.email]);

    if (necessidades.length === 0) {
      return res.status(404).json({
        error: 'Necessidade não encontrada',
        message: 'Necessidade não encontrada ou não pertence ao usuário'
      });
    }

    res.json({
      success: true,
      data: necessidades[0]
    });
  } catch (error) {
    console.error('Erro ao buscar necessidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar necessidade'
    });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar,
  buscarPorId
};
