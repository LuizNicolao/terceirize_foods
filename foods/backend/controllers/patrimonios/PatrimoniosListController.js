/**
 * Controller de Listagem de Patrimônios
 * Responsável por listar, buscar e obter patrimônios
 */

const { executeQuery } = require('../../config/database');

/**
 * Listar patrimônios com filtros e paginação
 */
const listarPatrimonios = async (req, res) => {
  try {
    // Primeiro, verificar se a tabela patrimonios existe
    try {
      const tableCheck = await executeQuery('SHOW TABLES LIKE "patrimonios"');
      if (tableCheck.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 50,
            pages: 0
          }
        });
      }
    } catch (tableError) {
      console.error('Erro ao verificar tabela patrimonios:', tableError);
      return res.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
          pages: 0
        }
      });
    }

    const {
      search,
      limit = 50,
      page = 1,
      status,
      escola_id,
      produto_id,
      data_inicio,
      data_fim,
      local_atual_id,
      tipo_local
    } = req.query;

    // Consulta para incluir patrimônios em filiais e unidades escolares
    let baseQuery = `
      SELECT
        p.id,
        p.numero_patrimonio,
        p.status,
        p.data_aquisicao,
        p.observacoes,
        p.criado_em,
        p.atualizado_em,
        p.produto_id,
        p.local_origem_id,
        p.local_atual_id,

        -- Dados do produto
        prod.codigo_produto as codigo_produto,
        prod.nome as nome_produto,
        um.nome as unidade_medida,
        g.nome as grupo,
        sg.nome as subgrupo,
        c.nome as classe,
        m.marca as marca,
        prod.fabricante as fabricante,

        -- Dados do local atual (filial ou unidade escolar)
        CASE
          WHEN f_atual.id IS NOT NULL THEN f_atual.filial
          WHEN ue_atual.id IS NOT NULL THEN ue_atual.nome_escola
          ELSE 'Local não informado'
        END as local_atual_nome,

        -- Endereço do local atual
        CASE
          WHEN f_atual.id IS NOT NULL THEN CONCAT(f_atual.logradouro, ', ', f_atual.numero, ' - ', f_atual.bairro, ', ', f_atual.cidade, '/', f_atual.estado)
          WHEN ue_atual.id IS NOT NULL THEN CONCAT(ue_atual.endereco, ', ', COALESCE(ue_atual.numero, ''), ' - ', COALESCE(ue_atual.bairro, ''), ', ', ue_atual.cidade, '/', ue_atual.estado)
          ELSE 'Endereço não informado'
        END as local_atual_endereco,

        -- Dados do local de origem (filial ou unidade escolar)
        CASE
          WHEN f_origem.id IS NOT NULL THEN f_origem.filial
          WHEN ue_origem.id IS NOT NULL THEN ue_origem.nome_escola
          ELSE 'N/A'
        END as local_origem_nome,

        -- Tipo do local atual
        CASE
          WHEN f_atual.id IS NOT NULL THEN 'filial'
          WHEN ue_atual.id IS NOT NULL THEN 'unidade_escolar'
          ELSE 'desconhecido'
        END as tipo_local_atual
      FROM patrimonios p
      INNER JOIN produtos prod ON p.produto_id = prod.id
      INNER JOIN unidades_medida um ON prod.unidade_id = um.id
      INNER JOIN grupos g ON prod.grupo_id = g.id
      INNER JOIN subgrupos sg ON prod.subgrupo_id = sg.id
      LEFT JOIN classes c ON prod.classe_id = c.id
      LEFT JOIN marcas m ON prod.marca_id = m.id

      -- JOINs para filiais (local atual e origem)
      LEFT JOIN filiais f_atual ON p.local_atual_id = f_atual.id
      LEFT JOIN filiais f_origem ON p.local_origem_id = f_origem.id

      -- JOINs para unidades escolares (local atual e origem)
      LEFT JOIN unidades_escolares ue_atual ON p.local_atual_id = ue_atual.id
      LEFT JOIN unidades_escolares ue_origem ON p.local_origem_id = ue_origem.id

      WHERE 1=1
    `;

    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (prod.nome LIKE ? OR prod.codigo_produto LIKE ? OR p.numero_patrimonio LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      baseQuery += ' AND p.status = ?';
      params.push(status);
    }

    // Aplicar filtro por local (priorizar local_atual_id sobre escola_id)
    if (local_atual_id) {
      baseQuery += ' AND p.local_atual_id = ?';
      params.push(local_atual_id);
    } else if (escola_id) {
      baseQuery += ' AND p.local_atual_id = ?';
      params.push(escola_id);
    }

    // Filtro adicional por tipo de local se especificado
    if (tipo_local) {
      if (tipo_local === 'filial') {
        // Para filiais, garantir que o local_atual_id existe na tabela filiais
        baseQuery += ' AND EXISTS (SELECT 1 FROM filiais f WHERE f.id = p.local_atual_id)';
      } else if (tipo_local === 'unidade_escolar') {
        // Para unidades escolares, garantir que o local_atual_id existe na tabela unidades_escolares
        baseQuery += ' AND EXISTS (SELECT 1 FROM unidades_escolares ue WHERE ue.id = p.local_atual_id)';
      }
    }

    if (produto_id) {
      baseQuery += ' AND p.produto_id = ?';
      params.push(produto_id);
    }

    if (data_inicio) {
      baseQuery += ' AND p.data_aquisicao >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      baseQuery += ' AND p.data_aquisicao <= ?';
      params.push(data_fim);
    }

    baseQuery += ' ORDER BY p.criado_em DESC';

    // Aplicar paginação
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    // Executar query paginada
    const patrimonios = await executeQuery(query, params);

    // Contar total
    const countQuery = baseQuery.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const totalResult = await executeQuery(countQuery, params);
    const totalItems = totalResult && totalResult[0] ? totalResult[0].total : 0;

    // Aplicar HATEOAS se disponível
    if (req.hateoasData) {
      res.json(req.hateoasData);
    } else {
      res.json({
        success: true,
        data: patrimonios,
        pagination: {
          total: totalItems,
          page: parseInt(page),
          limit: limitNum,
          pages: Math.ceil(totalItems / limitNum)
        }
      });
    }

  } catch (error) {
    console.error('Erro ao listar patrimônios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Obter patrimônio específico
 */
const obterPatrimonio = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        p.*,
        prod.codigo_produto as codigo_produto,
        prod.nome as nome_produto,
        um.nome as unidade_medida,
        g.nome as grupo,
        sg.nome as subgrupo,
        c.nome as classe,
        m.marca as marca,
        prod.fabricante as fabricante,

        -- Dados do local atual (filial ou unidade escolar)
        CASE
          WHEN f_atual.id IS NOT NULL THEN f_atual.filial
          WHEN ue_atual.id IS NOT NULL THEN ue_atual.nome_escola
          ELSE 'Local não informado'
        END as local_atual_nome,

        -- Endereço do local atual
        CASE
          WHEN f_atual.id IS NOT NULL THEN CONCAT(f_atual.logradouro, ', ', f_atual.numero, ' - ', f_atual.bairro, ', ', f_atual.cidade, '/', f_atual.estado)
          WHEN ue_atual.id IS NOT NULL THEN CONCAT(ue_atual.endereco, ', ', COALESCE(ue_atual.numero, ''), ' - ', COALESCE(ue_atual.bairro, ''), ', ', ue_atual.cidade, '/', ue_atual.estado)
          ELSE 'Endereço não informado'
        END as local_atual_endereco,

        -- Tipo do local atual
        CASE
          WHEN f_atual.id IS NOT NULL THEN 'filial'
          WHEN ue_atual.id IS NOT NULL THEN 'unidade_escolar'
          ELSE 'desconhecido'
        END as tipo_local_atual
      FROM patrimonios p
      INNER JOIN produtos prod ON p.produto_id = prod.id
      INNER JOIN unidades_medida um ON prod.unidade_id = um.id
      INNER JOIN grupos g ON prod.grupo_id = g.id
      INNER JOIN subgrupos sg ON prod.subgrupo_id = sg.id
      LEFT JOIN classes c ON prod.classe_id = c.id
      LEFT JOIN marcas m ON prod.marca_id = m.id

      -- JOINs para filiais e unidades escolares
      LEFT JOIN filiais f_atual ON p.local_atual_id = f_atual.id
      LEFT JOIN unidades_escolares ue_atual ON p.local_atual_id = ue_atual.id
      WHERE p.id = ?
    `;

    const patrimonios = await executeQuery(query, [id]);

    if (patrimonios.length === 0) {
      return res.status(404).json({ error: 'Patrimônio não encontrado' });
    }

    res.json({
      success: true,
      data: patrimonios[0]
    });

  } catch (error) {
    console.error('Erro ao obter patrimônio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar patrimônios de uma escola
 */
const listarPatrimoniosEscola = async (req, res) => {
  try {
    const { escolaId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Verificar se a escola existe
    const escola = await executeQuery(
      'SELECT id FROM unidades_escolares WHERE id = ?',
      [escolaId]
    );

    if (escola.length === 0) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    // Buscar patrimônios
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    const query = `
      SELECT
        p.*,
        prod.codigo as codigo_produto,
        prod.nome as nome_produto,
        prod.descricao as descricao_produto,
        um.nome as unidade_medida,
        g.nome as grupo,
        sg.nome as subgrupo,
        c.nome as classe,
        m.marca as marca,
        prod.fabricante as fabricante
      FROM patrimonios p
      INNER JOIN produtos prod ON p.produto_id = prod.id
      INNER JOIN unidades_medida um ON prod.unidade_id = um.id
      INNER JOIN grupos g ON prod.grupo_id = g.id
      INNER JOIN subgrupos sg ON prod.subgrupo_id = sg.id
      INNER JOIN classes c ON prod.classe_id = c.id
      LEFT JOIN marcas m ON prod.marca_id = m.id
      WHERE p.local_atual_id = ?
      ORDER BY p.criado_em DESC
      LIMIT ? OFFSET ?
    `;

    const patrimonios = await executeQuery(query, [escolaId, limitNum, offset]);

    // Contar total
    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM patrimonios WHERE local_atual_id = ?',
      [escolaId]
    );
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;

    res.json({
      success: true,
      data: patrimonios,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      }
    });

  } catch (error) {
    console.error('Erro ao listar patrimônios da escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarPatrimonios,
  obterPatrimonio,
  listarPatrimoniosEscola
};
