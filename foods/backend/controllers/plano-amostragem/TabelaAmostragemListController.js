/**
 * Controller de Listagem de Tabela de Amostragem
 * Responsável por listar e buscar faixas de amostragem
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class TabelaAmostragemListController {
  
  /**
   * Listar faixas de amostragem com paginação, busca e HATEOAS
   */
  static listarFaixas = asyncHandler(async (req, res) => {
    const { search = '', nqa_id, ativo } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        ta.id,
        ta.nqa_id,
        ta.faixa_inicial,
        ta.faixa_final,
        ta.tamanho_amostra,
        ta.ac,
        ta.re,
        ta.meses_validade,
        ta.dias_validade,
        ta.dias_70,
        ta.observacoes,
        ta.ativo,
        ta.criado_em,
        ta.atualizado_em,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome
      FROM tabela_amostragem ta
      INNER JOIN nqa n ON ta.nqa_id = n.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (n.codigo LIKE ? OR n.nome LIKE ? OR ta.observacoes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (nqa_id) {
      baseQuery += ' AND ta.nqa_id = ?';
      params.push(nqa_id);
    }

    if (ativo !== undefined) {
      baseQuery += ' AND ta.ativo = ?';
      params.push(ativo === 1 || ativo === '1' ? 1 : 0);
    }

    baseQuery += ' ORDER BY ta.faixa_inicial ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const faixas = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM tabela_amostragem ta INNER JOIN nqa n ON ta.nqa_id = n.id WHERE 1=1${search ? ' AND (n.codigo LIKE ? OR n.nome LIKE ? OR ta.observacoes LIKE ?)' : ''}${nqa_id ? ' AND ta.nqa_id = ?' : ''}${ativo !== undefined ? ' AND ta.ativo = ?' : ''}`;
    const countParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    if (nqa_id) countParams.push(nqa_id);
    if (ativo !== undefined) countParams.push(ativo === 1 || ativo === '1' ? 1 : 0);
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN ta.ativo = 1 THEN 1 ELSE 0 END) as ativos,
      SUM(CASE WHEN ta.ativo = 0 THEN 1 ELSE 0 END) as inativos
      FROM tabela_amostragem ta WHERE 1=1${search ? ' AND (n.codigo LIKE ? OR n.nome LIKE ? OR ta.observacoes LIKE ?)' : ''}${nqa_id ? ' AND ta.nqa_id = ?' : ''}${ativo !== undefined ? ' AND ta.ativo = ?' : ''}`;
    const statsParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    if (nqa_id) statsParams.push(nqa_id);
    if (ativo !== undefined) statsParams.push(ativo === 1 || ativo === '1' ? 1 : 0);
    const statsResult = await executeQuery(statsQuery, statsParams);
    const statistics = statsResult[0];

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/plano-amostragem/tabela-amostragem', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, faixas, 'Faixas de amostragem listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      actions,
      _links: res.addListLinks(faixas, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar faixa por ID
   */
  static buscarFaixaPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const faixas = await executeQuery(
      `SELECT 
        ta.id,
        ta.nqa_id,
        ta.faixa_inicial,
        ta.faixa_final,
        ta.tamanho_amostra,
        ta.ac,
        ta.re,
        ta.meses_validade,
        ta.dias_validade,
        ta.dias_70,
        ta.observacoes,
        ta.ativo,
        ta.criado_em,
        ta.atualizado_em,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome
       FROM tabela_amostragem ta
       INNER JOIN nqa n ON ta.nqa_id = n.id
       WHERE ta.id = ?`,
      [id]
    );

    if (faixas.length === 0) {
      return notFoundResponse(res, 'Faixa de amostragem não encontrada');
    }

    const faixa = faixas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(faixa);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, faixa.id);

    return successResponse(res, data, 'Faixa de amostragem encontrada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Buscar faixas por NQA (para exibição em cards)
   */
  static buscarFaixasPorNQA = asyncHandler(async (req, res) => {
    const { nqa_id } = req.params;

    const faixas = await executeQuery(
      `SELECT 
        ta.id,
        ta.nqa_id,
        ta.faixa_inicial,
        ta.faixa_final,
        ta.tamanho_amostra,
        ta.ac,
        ta.re,
        ta.meses_validade,
        ta.dias_validade,
        ta.dias_70,
        ta.observacoes,
        ta.ativo,
        ta.criado_em,
        ta.atualizado_em
       FROM tabela_amostragem ta
       WHERE ta.nqa_id = ? AND ta.ativo = 1
       ORDER BY ta.faixa_inicial ASC`,
      [nqa_id]
    );

    return successResponse(res, faixas, 'Faixas de amostragem listadas com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar plano de amostragem por tamanho de lote
   */
  static buscarPlanoPorLote = asyncHandler(async (req, res) => {
    const { lote } = req.query;

    if (!lote || isNaN(lote) || parseInt(lote) < 1) {
      return errorResponse(res, 'Tamanho do lote deve ser um número positivo', STATUS_CODES.BAD_REQUEST);
    }

    const tamanhoLote = parseInt(lote);

    // Buscar faixa que engloba o tamanho do lote
    let plano = await executeQuery(
      `SELECT 
        ta.*,
        n.codigo as nqa_codigo,
        n.nome as nqa_nome,
        n.nivel_inspecao
       FROM tabela_amostragem ta
       INNER JOIN nqa n ON ta.nqa_id = n.id
       WHERE ta.faixa_inicial <= ? 
         AND ta.faixa_final >= ?
         AND ta.ativo = 1
       ORDER BY ta.faixa_inicial ASC
       LIMIT 1`,
      [tamanhoLote, tamanhoLote]
    );

    // Se não encontrou, buscar próxima faixa maior
    if (plano.length === 0) {
      plano = await executeQuery(
        `SELECT 
          ta.*,
          n.codigo as nqa_codigo,
          n.nome as nqa_nome,
          n.nivel_inspecao
         FROM tabela_amostragem ta
         INNER JOIN nqa n ON ta.nqa_id = n.id
         WHERE ta.faixa_inicial > ?
           AND ta.ativo = 1
         ORDER BY ta.faixa_inicial ASC
         LIMIT 1`,
        [tamanhoLote]
      );
    }

    if (plano.length === 0) {
      return notFoundResponse(res, 'Nenhum plano de amostragem encontrado para o tamanho de lote informado');
    }

    const planoEncontrado = plano[0];
    
    // Verificar se é inspeção 100%
    const inspecao100 = planoEncontrado.tamanho_amostra >= tamanhoLote;
    
    // Adicionar informações calculadas
    planoEncontrado.tamanho_lote_informado = tamanhoLote;
    planoEncontrado.inspecao_100 = inspecao100;
    planoEncontrado.recomendacao = inspecao100 
      ? `Inspecionar 100% das unidades (${tamanhoLote} unidades)`
      : `Inspecionar ${planoEncontrado.tamanho_amostra} unidades de ${tamanhoLote} (AC: ${planoEncontrado.ac}, RE: ${planoEncontrado.re})`;

    return successResponse(res, planoEncontrado, 'Plano de amostragem encontrado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    // Por enquanto, retorna permissões básicas
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = TabelaAmostragemListController;

