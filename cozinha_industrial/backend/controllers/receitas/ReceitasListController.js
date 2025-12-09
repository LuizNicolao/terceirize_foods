const { executeQuery } = require('../../config/database');
const { successResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para listagem de Receitas
 * Segue padrão de excelência do sistema
 */
class ReceitasListController {
  /**
   * Listar receitas com filtros e paginação
   */
  static listar = asyncHandler(async (req, res) => {
    const { 
      search = '', 
      tipo_receita = '',
      filial = '',
      centro_custo = ''
    } = req.query;
    const pagination = req.pagination;

    // Query base - usar tabelas relacionais
    let baseQuery = `
      SELECT DISTINCT
        r.id,
        r.codigo,
        r.nome,
        r.descricao,
        r.tipo_receita_id,
        r.tipo_receita_nome as tipo_receita,
        r.status,
        r.data_cadastro,
        r.data_atualizacao,
        COUNT(DISTINCT rp.id) as total_produtos,
        GROUP_CONCAT(DISTINCT rf.filial_nome ORDER BY rf.filial_nome SEPARATOR ', ') as filial,
        GROUP_CONCAT(DISTINCT rcc.centro_custo_nome ORDER BY rcc.centro_custo_nome SEPARATOR ', ') as centro_custo
      FROM receitas r
      LEFT JOIN receitas_produtos rp ON r.id = rp.receita_id
      LEFT JOIN receitas_filiais rf ON r.id = rf.receita_id
      LEFT JOIN receitas_centros_custo rcc ON r.id = rcc.receita_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        r.codigo LIKE ? OR 
        r.nome LIKE ? OR 
        r.descricao LIKE ? OR
        r.filial_nome LIKE ? OR
        r.centro_custo_nome LIKE ? OR
        EXISTS (
          SELECT 1 FROM receitas_produtos rp2 
          WHERE rp2.receita_id = r.id 
          AND rp2.produto_origem LIKE ?
        )
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (tipo_receita) {
      baseQuery += ' AND r.tipo_receita_nome LIKE ?';
      params.push(`%${tipo_receita}%`);
    }

    if (filial) {
      // Verificar se é um ID numérico ou nome
      if (!isNaN(filial) && filial !== '') {
        baseQuery += ' AND rf.filial_id = ?';
        params.push(parseInt(filial));
      } else {
        baseQuery += ' AND rf.filial_nome LIKE ?';
      params.push(`%${filial}%`);
      }
    }

    if (centro_custo) {
      // Verificar se é um ID numérico ou nome
      if (!isNaN(centro_custo) && centro_custo !== '') {
        baseQuery += ' AND rcc.centro_custo_id = ?';
        params.push(parseInt(centro_custo));
      } else {
        baseQuery += ' AND rcc.centro_custo_nome LIKE ?';
      params.push(`%${centro_custo}%`);
      }
    }

    baseQuery += ' GROUP BY r.id';

    // Ordenação
    const sortBy = req.query.sortBy || 'data_cadastro';
    const sortOrder = req.query.sortOrder || 'DESC';
    const allowedSortFields = ['id', 'codigo', 'nome', 'tipo_receita_nome', 'filial', 'centro_custo', 'data_cadastro', 'data_atualizacao'];
    let finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'data_cadastro';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Ajustar campos de ordenação
    if (finalSortBy === 'filial') {
      finalSortBy = 'MIN(rf.filial_nome)';
    } else if (finalSortBy === 'centro_custo') {
      finalSortBy = 'MIN(rcc.centro_custo_nome)';
    } else if (finalSortBy === 'tipo_receita_nome') {
      finalSortBy = 'r.tipo_receita_nome';
    } else {
      finalSortBy = `r.${finalSortBy}`;
    }
    
    baseQuery += ` ORDER BY ${finalSortBy} ${finalSortOrder}`;

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const receitas = await executeQuery(query, params);

    // Para cada receita, buscar filiais e centros de custo como arrays
    for (const receita of receitas) {
      // Buscar filiais
      const filiais = await executeQuery(
        'SELECT filial_id as id, filial_nome as nome FROM receitas_filiais WHERE receita_id = ?',
        [receita.id]
      );
      receita.filiais = filiais;
      
      // Buscar centros de custo
      const centrosCusto = await executeQuery(
        'SELECT centro_custo_id as id, centro_custo_nome as nome, filial_id, filial_nome FROM receitas_centros_custo WHERE receita_id = ?',
        [receita.id]
      );
      receita.centros_custo = centrosCusto;
      
      // Manter campos de string concatenada para compatibilidade (filial e centro_custo)
      // Estes já vêm da query principal
    }

    // Contar total de registros
    let countQuery = `
      SELECT COUNT(DISTINCT r.id) as total 
      FROM receitas r
      LEFT JOIN receitas_produtos rp ON r.id = rp.receita_id
      WHERE 1=1
    `;
    
    let countParams = [];

    // Count query - usar tabelas relacionais
    countQuery = `
      SELECT COUNT(DISTINCT r.id) as total 
      FROM receitas r
      LEFT JOIN receitas_produtos rp ON r.id = rp.receita_id
      LEFT JOIN receitas_filiais rf ON r.id = rf.receita_id
      LEFT JOIN receitas_centros_custo rcc ON r.id = rcc.receita_id
      WHERE 1=1
    `;

    if (search) {
      countQuery += ` AND (
        r.codigo LIKE ? OR 
        r.nome LIKE ? OR 
        r.descricao LIKE ? OR
        rf.filial_nome LIKE ? OR
        rcc.centro_custo_nome LIKE ? OR
        EXISTS (
          SELECT 1 FROM receitas_produtos rp2 
          WHERE rp2.receita_id = r.id 
          AND rp2.produto_origem LIKE ?
        )
      )`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (tipo_receita) {
      countQuery += ' AND r.tipo_receita_nome LIKE ?';
      countParams.push(`%${tipo_receita}%`);
    }

    if (filial) {
      // Verificar se é um ID numérico ou nome
      if (!isNaN(filial) && filial !== '') {
        countQuery += ' AND rf.filial_id = ?';
        countParams.push(parseInt(filial));
      } else {
        countQuery += ' AND rf.filial_nome LIKE ?';
      countParams.push(`%${filial}%`);
      }
    }

    if (centro_custo) {
      // Verificar se é um ID numérico ou nome
      if (!isNaN(centro_custo) && centro_custo !== '') {
        countQuery += ' AND rcc.centro_custo_id = ?';
        countParams.push(parseInt(centro_custo));
      } else {
        countQuery += ' AND rcc.centro_custo_nome LIKE ?';
      countParams.push(`%${centro_custo}%`);
      }
    }

    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/receitas', queryParams);

    // Retornar resposta
    res.json({
      success: true,
      data: receitas,
      pagination: {
        currentPage: meta.pagination.currentPage,
        totalPages: meta.pagination.totalPages,
        totalItems: meta.pagination.totalItems,
        itemsPerPage: meta.pagination.itemsPerPage,
        hasNextPage: meta.pagination.hasNextPage,
        hasPrevPage: meta.pagination.hasPrevPage
      },
      message: 'Receitas listadas com sucesso'
    });
  });

  /**
   * Exportar receitas em formato JSON
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    // Buscar todas as receitas com seus produtos - usar nomes salvos diretamente
    const receitas = await executeQuery(
      `SELECT 
        id,
        codigo,
        nome,
        descricao,
        filial_id,
        filial_nome as filial,
        centro_custo_id,
        centro_custo_nome as centro_custo,
        tipo_receita,
        data_cadastro,
        data_atualizacao
      FROM receitas
      ORDER BY codigo`
    );

    // Buscar produtos para cada receita
    for (const receita of receitas) {
      const produtos = await executeQuery(
        `SELECT 
          id,
          produto_origem,
          produto_origem_id,
          unidade_medida_id,
          unidade_medida_sigla,
          grupo_id,
          grupo_nome,
          subgrupo_id,
          subgrupo_nome,
          classe_id,
          classe_nome,
          percapta_sugerida
        FROM receitas_produtos
        WHERE receita_id = ?
        ORDER BY id`,
        [receita.id]
      );
      receita.produtos = produtos;
    }

    // Configurar headers para download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="receitas_${new Date().toISOString().split('T')[0]}.json"`);

    return successResponse(res, receitas, 'Receitas exportadas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = ReceitasListController;

