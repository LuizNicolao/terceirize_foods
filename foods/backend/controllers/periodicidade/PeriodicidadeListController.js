/**
 * Controller de Listagem de Periodicidade
 * Responsável por listar agrupamentos com filtros e paginação
 */

const { executeQuery } = require('../../config/database');

/**
 * Listar agrupamentos de periodicidade com filtros e paginação
 */
const listarAgrupamentos = async (req, res) => {
  try {
    const {
      search,
      limit = 50,
      page = 1,
      tipo_id,
      ativo
    } = req.query;

    let baseQuery = `
      SELECT 
        a.id,
        a.nome,
        a.descricao,
        a.tipo_id,
        t.nome as tipo_nome,
        t.descricao as tipo_descricao,
        a.regras_calendario,
        a.ativo,
        a.criado_em,
        a.atualizado_em,
        COUNT(DISTINCT ae.unidade_escolar_id) as total_escolas,
        COUNT(DISTINCT ap.produto_id) as total_produtos
      FROM agrupamentos_periodicidade a
      LEFT JOIN tipos_periodicidade t ON a.tipo_id = t.id
      LEFT JOIN agrupamentos_escolas ae ON a.id = ae.agrupamento_id AND ae.ativo = TRUE
      LEFT JOIN agrupamentos_produtos ap ON a.id = ap.agrupamento_id AND ap.ativo = TRUE
      WHERE 1=1
    `;

    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (a.nome LIKE ? OR a.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tipo_id) {
      baseQuery += ' AND a.tipo_id = ?';
      params.push(tipo_id);
    }

    if (ativo !== undefined) {
      baseQuery += ' AND a.ativo = ?';
      params.push(ativo === 'true');
    }

    baseQuery += ' GROUP BY a.id, a.nome, a.descricao, a.tipo_id, t.nome, t.descricao, a.regras_calendario, a.ativo, a.criado_em, a.atualizado_em';
    baseQuery += ' ORDER BY a.criado_em DESC';

    // Aplicar paginação
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    // Executar query paginada
    const agrupamentos = await executeQuery(query, params);

    // Parse das regras do calendário
    agrupamentos.forEach(agrupamento => {
      if (agrupamento.regras_calendario) {
        try {
          // Se já é um objeto, não precisa fazer parse
          if (typeof agrupamento.regras_calendario === 'object') {
            // Já é um objeto, manter como está
          } else {
            // Se é string, fazer parse
            agrupamento.regras_calendario = JSON.parse(agrupamento.regras_calendario);
          }
        } catch (e) {
          console.error('Erro ao parsear regras_calendario:', e);
          agrupamento.regras_calendario = null;
        }
      }
    });

    // Contar total
    const countQuery = baseQuery.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT a.id) as total FROM');
    const totalResult = await executeQuery(countQuery, params);
    const totalItems = totalResult && totalResult[0] ? totalResult[0].total : 0;

    res.json({
      success: true,
      data: agrupamentos,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      }
    });

  } catch (error) {
    console.error('Erro ao listar agrupamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar agrupamentos por escola
 */
const buscarAgrupamentosPorEscola = async (req, res) => {
  try {
    const { escolaId } = req.params;

    const agrupamentos = await executeQuery(`
      SELECT 
        a.id,
        a.nome,
        a.descricao,
        a.ativo,
        a.criado_em,
        a.atualizado_em,
        ae.criado_em as data_vinculacao
      FROM agrupamentos_periodicidade a
      LEFT JOIN agrupamentos_escolas ae ON a.id = ae.agrupamento_id
      WHERE ae.unidade_escolar_id = ? 
        AND a.ativo = TRUE 
        AND ae.ativo = TRUE
      ORDER BY a.nome ASC
    `, [escolaId]);

    res.json({
      success: true,
      data: agrupamentos,
      message: 'Agrupamentos listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar agrupamentos por escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar produtos vinculados ao agrupamento
 */
const buscarProdutosVinculados = async (req, res) => {
  try {
    const { id } = req.params;

    const produtos = await executeQuery(`
      SELECT 
        ap.id,
        ap.agrupamento_id,
        ap.produto_id,
        p.nome as produto_nome,
        p.codigo_produto as produto_codigo,
        p.informacoes_adicionais as produto_descricao,
        ap.quantidade,
        ap.unidade_medida,
        ap.observacoes,
        ap.ativo,
        ap.criado_em
      FROM agrupamentos_produtos ap
      LEFT JOIN produtos p ON ap.produto_id = p.id
      WHERE ap.agrupamento_id = ? AND ap.ativo = TRUE
      ORDER BY p.nome ASC
    `, [id]);

    res.json({
      success: true,
      data: produtos,
      message: 'Produtos vinculados listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produtos vinculados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar histórico de aplicações do agrupamento
 */
const buscarHistoricoAplicacoes = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    const historico = await executeQuery(`
      SELECT 
        h.id,
        h.agrupamento_id,
        h.unidade_escolar_id,
        ue.nome as escola_nome,
        ue.codigo as escola_codigo,
        h.data_aplicacao,
        h.produtos_aplicados,
        h.status,
        h.observacoes,
        h.criado_em,
        h.atualizado_em
      FROM historico_periodicidade h
      LEFT JOIN unidades_escolares ue ON h.unidade_escolar_id = ue.id
      WHERE h.agrupamento_id = ?
      ORDER BY h.data_aplicacao DESC, h.criado_em DESC
      LIMIT ? OFFSET ?
    `, [id, limitNum, offset]);

    // Parse dos produtos aplicados JSON
    historico.forEach(item => {
      if (item.produtos_aplicados) {
        try {
          item.produtos_aplicados = JSON.parse(item.produtos_aplicados);
        } catch (e) {
          item.produtos_aplicados = null;
        }
      }
    });

    // Contar total
    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM historico_periodicidade WHERE agrupamento_id = ?',
      [id]
    );
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;

    res.json({
      success: true,
      data: historico,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      },
      message: 'Histórico de aplicações listado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de aplicações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar tipos de periodicidade
 */
const listarTipos = async (req, res) => {
  try {
    const tipos = await executeQuery(`
      SELECT 
        id,
        nome,
        descricao,
        ativo,
        criado_em,
        atualizado_em
      FROM tipos_periodicidade
      WHERE ativo = TRUE
      ORDER BY nome ASC
    `);

    res.json({
      success: true,
      data: tipos,
      message: 'Tipos de periodicidade listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar tipos de periodicidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar estatísticas dos agrupamentos
 */
const buscarEstatisticas = async (req, res) => {
  try {
    // Estatísticas gerais
    const stats = await executeQuery(`
      SELECT 
        COUNT(DISTINCT a.id) as total_agrupamentos,
        COUNT(DISTINCT CASE WHEN a.ativo = TRUE THEN a.id END) as agrupamentos_ativos,
        COUNT(DISTINCT ae.unidade_escolar_id) as escolas_vinculadas,
        COUNT(DISTINCT ap.produto_id) as produtos_vinculados
      FROM agrupamentos_periodicidade a
      LEFT JOIN agrupamentos_escolas ae ON a.id = ae.agrupamento_id AND ae.ativo = TRUE
      LEFT JOIN agrupamentos_produtos ap ON a.id = ap.agrupamento_id AND ap.ativo = TRUE
    `);

    res.json({
      success: true,
      data: stats[0] || {
        total_agrupamentos: 0,
        agrupamentos_ativos: 0,
        escolas_vinculadas: 0,
        produtos_vinculados: 0
      },
      message: 'Estatísticas listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar produtos por grupo para periodicidade
 */
const buscarProdutosPorGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params;

    const produtos = await executeQuery(`
      SELECT 
        p.id,
        p.nome,
        p.codigo_produto,
        p.grupo_id,
        p.informacoes_adicionais,
        p.status
      FROM produtos p
      WHERE p.grupo_id = ? AND p.status = 1
      ORDER BY p.nome ASC
    `, [grupoId]);

    res.json({
      success: true,
      data: produtos,
      message: 'Produtos do grupo listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produtos por grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar contagem de produtos por grupo
 */
const buscarContagemProdutosPorGrupo = async (req, res) => {
  try {
    const contagens = await executeQuery(`
      SELECT 
        g.id as grupo_id,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM grupos g
      LEFT JOIN produtos p ON g.id = p.grupo_id AND p.status = 1
      WHERE g.status = 'ativo'
      GROUP BY g.id, g.nome
      ORDER BY g.nome ASC
    `);

    // Transformar em objeto chave-valor para fácil acesso
    const contagensPorGrupo = {};
    contagens.forEach(item => {
      contagensPorGrupo[item.grupo_id] = {
        grupo_id: item.grupo_id,
        grupo_nome: item.grupo_nome,
        total: parseInt(item.total_produtos)
      };
    });

    res.json({
      success: true,
      data: contagensPorGrupo,
      message: 'Contagem de produtos por grupo listada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar contagem de produtos por grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarAgrupamentos,
  listarTipos,
  buscarAgrupamentosPorEscola,
  buscarProdutosVinculados,
  buscarHistoricoAplicacoes,
  buscarEstatisticas,
  buscarProdutosPorGrupo,
  buscarContagemProdutosPorGrupo
};