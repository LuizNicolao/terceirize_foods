const { query } = require('../config/database');
const { calcularStatusEntrega, validarDadosRecebimento } = require('../utils/recebimentosUtils');

const listar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { 
      search, 
      escola_id, 
      tipo_recebimento, 
      tipo_entrega, 
      data_inicio, 
      data_fim,
      page = 1,
      limit = 10
    } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro por usuário (nutricionistas só veem suas escolas)
    if (userType === 'Nutricionista') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    if (search) {
      whereClause += ' AND (e.nome_escola LIKE ? OR e.rota LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (escola_id) {
      whereClause += ' AND re.escola_id = ?';
      params.push(escola_id);
    }

    if (tipo_recebimento) {
      whereClause += ' AND re.tipo_recebimento = ?';
      params.push(tipo_recebimento);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    // Calcular paginação
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `;
    
    const [countResult] = await query(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Query principal com paginação
    const recebimentos = await query(`
      SELECT 
        re.id,
        re.escola_id,
        e.nome_escola,
        e.rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.status_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        re.ativo,
        re.data_cadastro,
        re.data_atualizacao,
        u.nome as usuario_nome
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, e.nome_escola ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `, params);

    // Calcular estatísticas de status
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN re.status_entrega = 'No Prazo' THEN 1 ELSE 0 END) as noPrazo,
        SUM(CASE WHEN re.status_entrega = 'Atrasado' THEN 1 ELSE 0 END) as atrasado,
        SUM(CASE WHEN re.status_entrega = 'Antecipado' THEN 1 ELSE 0 END) as antecipado
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `;
    
    const [statsResult] = await query(statsQuery, params);
    const stats = statsResult && statsResult[0] ? statsResult[0] : { total: 0, noPrazo: 0, atrasado: 0, antecipado: 0 };

    res.json({
      success: true,
      data: recebimentos,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        noPrazo: stats.noPrazo || 0,
        atrasado: stats.atrasado || 0,
        antecipado: stats.antecipado || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar recebimentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar recebimentos'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { id } = req.params;

    let whereClause = 'WHERE re.id = ?';
    let params = [id];

    // Filtro por usuário (nutricionistas só veem seus recebimentos)
    if (userType === 'Nutricionista') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    const recebimentos = await query(`
      SELECT 
        re.id,
        re.escola_id,
        e.nome_escola,
        e.rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.status_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        re.ativo,
        re.data_cadastro,
        re.data_atualizacao,
        u.nome as usuario_nome
      FROM recebimentos_escolas re
      INNER JOIN escolas e ON re.escola_id = e.id
      INNER JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `, params);

    if (recebimentos.length === 0) {
      return res.status(404).json({
        error: 'Recebimento não encontrado',
        message: 'Recebimento não encontrado'
      });
    }

    const recebimento = recebimentos[0];

    // Se for recebimento parcial, buscar produtos
    if (recebimento.tipo_recebimento === 'Parcial') {
      const produtos = await query(`
        SELECT 
          rp.id,
          rp.produto_id,
          p.nome as nome_produto,
          p.unidade_medida,
          rp.quantidade
        FROM recebimentos_produtos rp
        INNER JOIN produtos p ON rp.produto_id = p.id
        WHERE rp.recebimento_id = ?
        ORDER BY p.nome ASC
      `, [id]);

      recebimento.produtos = produtos;
    }

    res.json({
      success: true,
      data: recebimento
    });
  } catch (error) {
    console.error('Erro ao buscar recebimento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar recebimento'
    });
  }
};

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
  listar,
  buscarPorId,
  criar,
  atualizar,
  deletar
};
