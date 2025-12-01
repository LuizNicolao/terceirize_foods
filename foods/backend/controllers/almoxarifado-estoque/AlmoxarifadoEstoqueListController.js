/**
 * Controller de Listagem de Almoxarifado Estoque
 * Responsável por listar e buscar estoques
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class AlmoxarifadoEstoqueListController {
  
  /**
   * Listar estoques com paginação, busca e HATEOAS
   */
  static listarEstoques = asyncHandler(async (req, res) => {
    const { search = '', status, almoxarifado_id, produto_generico_id, filial_id, centro_custo_id, grupo_id, subgrupo_id, classe_id } = req.query;
    const pagination = req.pagination;

    // Query base agrupada por produto genérico
    let baseQuery = `
      SELECT 
        pg.id as produto_generico_id,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo,
        COALESCE(ae.grupo_id, pg.grupo_id) as grupo_id,
        COALESCE(ae.grupo_nome, g.nome) as grupo_nome,
        pg.subgrupo_id,
        sg.nome as subgrupo_nome,
        um.sigla as unidade_medida_sigla,
        um.nome as unidade_medida_nome,
        SUM(ae.quantidade_atual) as quantidade_atual,
        SUM(ae.quantidade_reservada) as quantidade_reservada,
        SUM(ae.quantidade_disponivel) as quantidade_disponivel,
        CASE 
          WHEN SUM(ae.quantidade_atual) > 0 
          THEN SUM(ae.valor_total) / SUM(ae.quantidade_atual)
          ELSE 0
        END as valor_unitario_medio,
        SUM(ae.valor_total) as valor_total,
        MIN(ae.estoque_minimo) as estoque_minimo,
        MAX(ae.estoque_maximo) as estoque_maximo,
        COUNT(DISTINCT ae.id) as total_variacoes,
        COUNT(DISTINCT CASE WHEN ae.lote IS NOT NULL THEN ae.lote END) as total_lotes,
        COUNT(DISTINCT CASE WHEN ae.data_validade IS NOT NULL THEN ae.data_validade END) as total_validades
      FROM almoxarifado_estoque ae
      LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      LEFT JOIN grupos g ON COALESCE(ae.grupo_id, pg.grupo_id) = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (LOWER(pg.nome) LIKE ? OR LOWER(pg.codigo) LIKE ? OR LOWER(a.nome) LIKE ? OR LOWER(ae.lote) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status && status !== '') {
      baseQuery += ' AND ae.status = ?';
      params.push(status);
    }

    if (almoxarifado_id) {
      baseQuery += ' AND ae.almoxarifado_id = ?';
      params.push(almoxarifado_id);
    }

    if (produto_generico_id) {
      baseQuery += ' AND ae.produto_generico_id = ?';
      params.push(produto_generico_id);
    }

    if (filial_id) {
      baseQuery += ' AND a.filial_id = ?';
      params.push(filial_id);
    }

    if (centro_custo_id) {
      baseQuery += ' AND a.centro_custo_id = ?';
      params.push(centro_custo_id);
    }

    if (grupo_id) {
      // Suportar múltiplos grupos (separados por vírgula) ou um único grupo
      const gruposIds = grupo_id.toString().split(',').map(id => id.trim()).filter(id => id);
      if (gruposIds.length > 0) {
        if (gruposIds.length === 1) {
      baseQuery += ' AND COALESCE(ae.grupo_id, pg.grupo_id) = ?';
          params.push(gruposIds[0]);
        } else {
          baseQuery += ` AND COALESCE(ae.grupo_id, pg.grupo_id) IN (${gruposIds.map(() => '?').join(',')})`;
          params.push(...gruposIds);
        }
      }
    }

    if (subgrupo_id) {
      baseQuery += ' AND pg.subgrupo_id = ?';
      params.push(subgrupo_id);
    }

    if (classe_id) {
      baseQuery += ' AND pg.classe_id = ?';
      params.push(classe_id);
    }

    baseQuery += ' GROUP BY pg.id, pg.nome, pg.codigo, COALESCE(ae.grupo_id, pg.grupo_id), COALESCE(ae.grupo_nome, g.nome), pg.subgrupo_id, sg.nome, um.sigla, um.nome';
    baseQuery += ' ORDER BY COALESCE(ae.grupo_nome, g.nome) ASC, pg.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const estoques = await executeQuery(query, params);

    // Contar total de produtos genéricos únicos (agrupados)
    let countQuery = `SELECT COUNT(DISTINCT pg.id) as total 
      FROM almoxarifado_estoque ae 
      LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      WHERE 1=1`;
    let countParams = [];
    
    if (search) {
      countQuery += ' AND (LOWER(pg.nome) LIKE ? OR LOWER(pg.codigo) LIKE ? OR LOWER(a.nome) LIKE ? OR LOWER(ae.lote) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status !== '') {
      countQuery += ' AND ae.status = ?';
      countParams.push(status);
    }
    
    if (almoxarifado_id) {
      countQuery += ' AND ae.almoxarifado_id = ?';
      countParams.push(almoxarifado_id);
    }
    
    if (produto_generico_id) {
      countQuery += ' AND ae.produto_generico_id = ?';
      countParams.push(produto_generico_id);
    }
    
    if (filial_id) {
      countQuery += ' AND a.filial_id = ?';
      countParams.push(filial_id);
    }

    if (centro_custo_id) {
      countQuery += ' AND a.centro_custo_id = ?';
      countParams.push(centro_custo_id);
    }
    
    if (grupo_id) {
      // Suportar múltiplos grupos (separados por vírgula) ou um único grupo
      const gruposIds = grupo_id.toString().split(',').map(id => id.trim()).filter(id => id);
      if (gruposIds.length > 0) {
        if (gruposIds.length === 1) {
      countQuery += ' AND COALESCE(ae.grupo_id, (SELECT grupo_id FROM produto_generico WHERE id = ae.produto_generico_id)) = ?';
          countParams.push(gruposIds[0]);
        } else {
          countQuery += ` AND COALESCE(ae.grupo_id, (SELECT grupo_id FROM produto_generico WHERE id = ae.produto_generico_id)) IN (${gruposIds.map(() => '?').join(',')})`;
          countParams.push(...gruposIds);
        }
      }
    }

    if (subgrupo_id) {
      countQuery += ' AND (SELECT subgrupo_id FROM produto_generico WHERE id = ae.produto_generico_id) = ?';
      countParams.push(subgrupo_id);
    }

    if (classe_id) {
      countQuery += ' AND (SELECT classe_id FROM produto_generico WHERE id = ae.produto_generico_id) = ?';
      countParams.push(classe_id);
    }
    
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    let statsQuery = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN ae.status = 'ATIVO' THEN 1 ELSE 0 END) as ativos,
      SUM(CASE WHEN ae.status = 'BLOQUEADO' THEN 1 ELSE 0 END) as bloqueados,
      SUM(CASE WHEN ae.status = 'INATIVO' THEN 1 ELSE 0 END) as inativos,
      COALESCE(SUM(ae.quantidade_atual), 0) as total_quantidade,
      COALESCE(SUM(ae.valor_total), 0) as valor_total_estoque,
      SUM(CASE WHEN ae.status = 'ATIVO' AND ae.quantidade_atual < ae.estoque_minimo THEN 1 ELSE 0 END) as produtos_abaixo_minimo
      FROM almoxarifado_estoque ae
      LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      WHERE 1=1`;
    let statsParams = [];
    
    if (search) {
      statsQuery += ' AND (LOWER((SELECT nome FROM produto_generico WHERE id = ae.produto_generico_id)) LIKE ? OR LOWER((SELECT nome FROM almoxarifado WHERE id = ae.almoxarifado_id)) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      statsParams.push(searchTerm, searchTerm);
    }
    
    if (status && status !== '') {
      statsQuery += ' AND ae.status = ?';
      statsParams.push(status);
    }
    
    if (almoxarifado_id) {
      statsQuery += ' AND ae.almoxarifado_id = ?';
      statsParams.push(almoxarifado_id);
    }
    
    if (produto_generico_id) {
      statsQuery += ' AND ae.produto_generico_id = ?';
      statsParams.push(produto_generico_id);
    }
    
    if (filial_id) {
      statsQuery += ' AND a.filial_id = ?';
      statsParams.push(filial_id);
    }

    if (centro_custo_id) {
      statsQuery += ' AND a.centro_custo_id = ?';
      statsParams.push(centro_custo_id);
    }
    
    if (grupo_id) {
      // Suportar múltiplos grupos (separados por vírgula) ou um único grupo
      const gruposIds = grupo_id.toString().split(',').map(id => id.trim()).filter(id => id);
      if (gruposIds.length > 0) {
        if (gruposIds.length === 1) {
      statsQuery += ' AND COALESCE(ae.grupo_id, (SELECT grupo_id FROM produto_generico WHERE id = ae.produto_generico_id)) = ?';
          statsParams.push(gruposIds[0]);
        } else {
          statsQuery += ` AND COALESCE(ae.grupo_id, (SELECT grupo_id FROM produto_generico WHERE id = ae.produto_generico_id)) IN (${gruposIds.map(() => '?').join(',')})`;
          statsParams.push(...gruposIds);
        }
      }
    }

    if (subgrupo_id) {
      statsQuery += ' AND (SELECT subgrupo_id FROM produto_generico WHERE id = ae.produto_generico_id) = ?';
      statsParams.push(subgrupo_id);
    }

    if (classe_id) {
      statsQuery += ' AND (SELECT classe_id FROM produto_generico WHERE id = ae.produto_generico_id) = ?';
      statsParams.push(classe_id);
    }
    
    const statsResult = await executeQuery(statsQuery, statsParams);
    const statistics = statsResult[0];

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/almoxarifado-estoque', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, estoques, 'Estoques listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      _links: res.addListLinks(estoques, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar todas as variações (lotes e validades) de um produto genérico
   */
  static buscarVariacoesProduto = asyncHandler(async (req, res) => {
    const { produto_generico_id } = req.params;
    const { almoxarifado_id, filial_id } = req.query;

    let query = `
      SELECT 
        ae.id,
        pg.codigo as produto_generico_codigo,
        pg.nome as produto_generico_nome,
        um.sigla as unidade_medida_sigla,
        um.nome as unidade_medida_nome,
        ae.lote,
        ae.data_validade,
        ae.quantidade_atual,
        ae.valor_unitario_medio,
        ae.valor_total,
        ae.almoxarifado_id,
        a.nome as almoxarifado_nome,
        a.codigo as almoxarifado_codigo
      FROM almoxarifado_estoque ae
      LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      WHERE ae.produto_generico_id = ?
    `;
    
    let params = [produto_generico_id];

    if (almoxarifado_id) {
      query += ' AND ae.almoxarifado_id = ?';
      params.push(almoxarifado_id);
    }

    if (filial_id) {
      query += ' AND a.filial_id = ?';
      params.push(filial_id);
    }

    query += ' ORDER BY ae.data_validade ASC, ae.lote ASC';

    const variacoes = await executeQuery(query, params);

    if (variacoes.length === 0) {
      return notFoundResponse(res, 'Nenhuma variação encontrada para este produto');
    }

    return successResponse(res, variacoes, 'Variações do produto encontradas com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar estoque por ID
   */
  static buscarEstoquePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const estoques = await executeQuery(
      `SELECT 
        ae.id,
        ae.almoxarifado_id,
        a.nome as almoxarifado_nome,
        a.codigo as almoxarifado_codigo,
        ae.produto_generico_id,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo,
        ae.quantidade_atual,
        ae.quantidade_reservada,
        ae.quantidade_disponivel,
        ae.valor_unitario_medio,
        ae.valor_total,
        ae.estoque_minimo,
        ae.estoque_maximo,
        ae.lote,
        ae.data_validade,
        ae.status,
        ae.observacoes,
        ae.criado_em,
        ae.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
       FROM almoxarifado_estoque ae
       LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
       LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
       LEFT JOIN usuarios uc ON ae.usuario_cadastro_id = uc.id
       LEFT JOIN usuarios ua ON ae.usuario_atualizacao_id = ua.id
       WHERE ae.id = ?`,
      [id]
    );

    if (estoques.length === 0) {
      return notFoundResponse(res, 'Estoque não encontrado');
    }

    const estoque = estoques[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(estoque);

    return successResponse(res, data, 'Estoque encontrado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter opções de filtros disponíveis baseadas nos dados reais do banco de dados
   * Suporta hierarquia: Filial -> Centro de Custo -> Almoxarifado
   * E: Grupo -> Subgrupo -> Classes
   */
  static obterOpcoesFiltros = asyncHandler(async (req, res) => {
    const { filial_id, centro_custo_id, grupo_id, subgrupo_id } = req.query;

    // Filiais que têm estoque
    const filiais = await executeQuery(`
      SELECT DISTINCT 
        f.id,
        f.filial,
        f.razao_social
      FROM almoxarifado_estoque ae
      INNER JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      INNER JOIN filiais f ON a.filial_id = f.id
      WHERE f.status = 1
      ORDER BY COALESCE(f.filial, f.razao_social) ASC
    `);

    // Centros de custo que têm estoque (filtrado por filial se fornecido)
    let centrosCustoQuery = `
      SELECT DISTINCT 
        cc.id,
        cc.nome,
        cc.codigo,
        cc.filial_id
      FROM almoxarifado_estoque ae
      INNER JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      INNER JOIN centro_custo cc ON a.centro_custo_id = cc.id
      WHERE cc.status = 1
    `;
    let centrosCustoParams = [];
    if (filial_id) {
      centrosCustoQuery += ' AND cc.filial_id = ?';
      centrosCustoParams.push(filial_id);
    }
    centrosCustoQuery += ' ORDER BY cc.nome ASC';
    const centrosCusto = await executeQuery(centrosCustoQuery, centrosCustoParams);

    // Almoxarifados que têm estoque (filtrado por filial e centro de custo se fornecidos)
    let almoxarifadosQuery = `
      SELECT DISTINCT 
        a.id,
        a.nome,
        a.codigo,
        a.filial_id,
        a.centro_custo_id
      FROM almoxarifado_estoque ae
      INNER JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      WHERE a.status = 1
    `;
    let almoxarifadosParams = [];
    if (filial_id) {
      almoxarifadosQuery += ' AND a.filial_id = ?';
      almoxarifadosParams.push(filial_id);
    }
    if (centro_custo_id) {
      almoxarifadosQuery += ' AND a.centro_custo_id = ?';
      almoxarifadosParams.push(centro_custo_id);
    }
    almoxarifadosQuery += ' ORDER BY a.nome ASC';
    const almoxarifados = await executeQuery(almoxarifadosQuery, almoxarifadosParams);

    // Grupos que têm estoque
    const grupos = await executeQuery(`
      SELECT DISTINCT 
        COALESCE(ae.grupo_id, pg.grupo_id) as id,
        COALESCE(ae.grupo_nome, g.nome) as nome
      FROM almoxarifado_estoque ae
      LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      LEFT JOIN grupos g ON COALESCE(ae.grupo_id, pg.grupo_id) = g.id
      WHERE COALESCE(ae.grupo_id, pg.grupo_id) IS NOT NULL
        AND COALESCE(ae.grupo_nome, g.nome) IS NOT NULL
      ORDER BY COALESCE(ae.grupo_nome, g.nome) ASC
    `);

    // Subgrupos que têm estoque (filtrado por grupo se fornecido)
    let subgruposQuery = `
      SELECT DISTINCT 
        pg.subgrupo_id as id,
        sg.nome,
        COALESCE(ae.grupo_id, pg.grupo_id) as grupo_id
      FROM almoxarifado_estoque ae
      INNER JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      WHERE pg.subgrupo_id IS NOT NULL
        AND sg.nome IS NOT NULL
    `;
    let subgruposParams = [];
    if (grupo_id) {
      subgruposQuery += ' AND COALESCE(ae.grupo_id, pg.grupo_id) = ?';
      subgruposParams.push(grupo_id);
    }
    subgruposQuery += ' ORDER BY sg.nome ASC';
    const subgrupos = await executeQuery(subgruposQuery, subgruposParams);

    // Classes que têm estoque (filtrado por subgrupo se fornecido)
    let classesQuery = `
      SELECT DISTINCT 
        pg.classe_id as id,
        c.nome,
        pg.subgrupo_id
      FROM almoxarifado_estoque ae
      INNER JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      WHERE pg.classe_id IS NOT NULL
        AND c.nome IS NOT NULL
        AND c.status = 'ativo'
    `;
    let classesParams = [];
    if (subgrupo_id) {
      classesQuery += ' AND pg.subgrupo_id = ?';
      classesParams.push(subgrupo_id);
    }
    classesQuery += ' ORDER BY c.nome ASC';
    const classes = await executeQuery(classesQuery, classesParams);

    return successResponse(res, {
      filiais: filiais.map(f => ({
        id: f.id,
        nome: f.filial || f.razao_social || `Filial ${f.id}`
      })),
      centrosCusto: centrosCusto.map(cc => ({
        id: cc.id,
        nome: cc.nome || `Centro de Custo ${cc.id}`,
        codigo: cc.codigo,
        filial_id: cc.filial_id
      })),
      almoxarifados: almoxarifados.map(a => ({
        id: a.id,
        nome: a.nome || `Almoxarifado ${a.id}`,
        codigo: a.codigo,
        filial_id: a.filial_id,
        centro_custo_id: a.centro_custo_id
      })),
      grupos: grupos.map(g => ({
        id: g.id,
        nome: g.nome || `Grupo ${g.id}`
      })),
      subgrupos: subgrupos.map(sg => ({
        id: sg.id,
        nome: sg.nome || `Subgrupo ${sg.id}`,
        grupo_id: sg.grupo_id
      })),
      classes: classes.map(c => ({
        id: c.id,
        nome: c.nome || `Classe ${c.id}`,
        subgrupo_id: c.subgrupo_id
      }))
    }, 'Opções de filtros obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = AlmoxarifadoEstoqueListController;

