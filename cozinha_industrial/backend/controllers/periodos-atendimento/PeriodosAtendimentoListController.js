const { executeQuery } = require('../../config/database');
const { successResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const axios = require('axios');

/**
 * Controller para listagem de Períodos de Atendimento
 * Segue padrão de excelência do sistema
 */
class PeriodosAtendimentoListController {
  /**
   * Listar períodos de atendimento com filtros e paginação
   */
  static listar = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id,
        nome,
        codigo,
        status,
        usuario_criador_id,
        usuario_atualizador_id,
        criado_em,
        atualizado_em
      FROM periodos_atendimento
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (
        nome LIKE ? OR 
        codigo LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    if (status) {
      baseQuery += ` AND status = ?`;
      params.push(status);
    }

    // Ordenação
    const sortBy = req.query.sortBy || 'criado_em';
    const sortOrder = req.query.sortOrder || 'DESC';
    baseQuery += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Contar total de registros
    const countQuery = baseQuery.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

    // Executar query
    const periodos = await executeQuery(query, params);

    // Buscar contagem de unidades vinculadas para cada período
    for (const periodo of periodos) {
      const countUnidades = await executeQuery(
        'SELECT COUNT(*) as total FROM cozinha_industrial_periodos_atendimento WHERE periodo_atendimento_id = ? AND status = "ativo"',
        [periodo.id]
      );
      periodo.total_unidades_vinculadas = countUnidades[0]?.total || 0;
    }

    // Preparar resposta com paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(total, '/api/periodos-atendimento', queryParams);
    
    const response = {
      items: periodos,
      pagination: meta.pagination
    };

    return successResponse(res, response, 'Períodos de atendimento listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Exportar períodos de atendimento em JSON
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    const periodos = await executeQuery(
      `SELECT 
        id,
        nome,
        codigo,
        status,
        criado_em,
        atualizado_em
      FROM periodos_atendimento
      ORDER BY criado_em DESC`
    );

    // Adicionar contagem de unidades vinculadas
    for (const periodo of periodos) {
      const countUnidades = await executeQuery(
        'SELECT COUNT(*) as total FROM cozinha_industrial_periodos_atendimento WHERE periodo_atendimento_id = ? AND status = "ativo"',
        [periodo.id]
      );
      periodo.total_unidades_vinculadas = countUnidades[0]?.total || 0;
    }

    return successResponse(res, periodos, 'Períodos de atendimento exportados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar unidades vinculadas a um período de atendimento
   */
  static buscarUnidadesVinculadas = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar vínculos (já inclui o nome da unidade salvo no banco)
    const vinculos = await executeQuery(
      `SELECT 
        cipa.id,
        cipa.cozinha_industrial_id,
        cipa.unidade_nome,
        cipa.status,
        cipa.criado_em,
        cipa.atualizado_em
      FROM cozinha_industrial_periodos_atendimento cipa
      WHERE cipa.periodo_atendimento_id = ?
      ORDER BY cipa.criado_em DESC`,
      [id]
    );

    // Formatar unidades vinculadas usando o nome salvo no banco
    const unidadesCompletas = vinculos.map(vinculo => ({
      ...vinculo,
      unidade_escolar: {
        id: vinculo.cozinha_industrial_id,
        nome_escola: vinculo.unidade_nome || `ID ${vinculo.cozinha_industrial_id}`,
        codigo_teknisa: null,
        cidade: null,
        filial_nome: null
      }
    }));

    return successResponse(
      res,
      unidadesCompletas,
      'Unidades vinculadas encontradas com sucesso',
      STATUS_CODES.OK
    );
  });
}

module.exports = PeriodosAtendimentoListController;

