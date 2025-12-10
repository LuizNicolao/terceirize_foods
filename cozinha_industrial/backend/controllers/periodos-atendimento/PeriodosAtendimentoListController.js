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

    // Ordenação (será aplicada após agrupamento)
    const sortBy = req.query.sortBy || 'filial_nome';
    const sortOrder = req.query.sortOrder || 'ASC';

    // Buscar TODOS os períodos (sem paginação e sem ordenação SQL) para poder agrupar por filial
    // A paginação será aplicada após o agrupamento
    const periodos = await executeQuery(baseQuery, params);

    // Buscar todos os vínculos de períodos com unidades
    const todosVinculos = await executeQuery(
      `SELECT 
        cipa.periodo_atendimento_id,
        cipa.cozinha_industrial_id,
        cipa.unidade_nome,
        cipa.status
      FROM cozinha_industrial_periodos_atendimento cipa
      WHERE cipa.status = 'ativo'`
    );

    // Buscar informações das unidades do Foods API para obter filiais
    const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
    const authToken = req.headers.authorization;
    
    let todasUnidadesFoods = [];
    try {
      const response = await axios.get(`${foodsApiUrl}/unidades-escolares`, {
        params: {
          status: 'ativo',
          limit: 10000
        },
        headers: {
          'Authorization': authToken || ''
        },
        timeout: 5000
      });

      if (response.data) {
        if (response.data.success) {
          todasUnidadesFoods = response.data.data?.items || response.data.data || [];
        } else if (Array.isArray(response.data)) {
          todasUnidadesFoods = response.data;
        } else if (Array.isArray(response.data.data)) {
          todasUnidadesFoods = response.data.data;
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar unidades do Foods para agrupar por filial:', error.message);
    }

    // Criar mapa de unidades por ID
    const unidadesMap = new Map();
    if (Array.isArray(todasUnidadesFoods)) {
      todasUnidadesFoods.forEach(u => {
        unidadesMap.set(u.id, u);
      });
    }

    // Agrupar vínculos por filial
    const vinculosPorFilial = new Map();
    
    for (const vinculo of todosVinculos) {
      const unidadeFoods = unidadesMap.get(vinculo.cozinha_industrial_id);
      const filialId = unidadeFoods?.filial_id || null;
      const filialNome = unidadeFoods?.filial_nome || 'Sem Filial';
      
      const key = filialId || `sem-filial-${vinculo.cozinha_industrial_id}`;
      
      if (!vinculosPorFilial.has(key)) {
        vinculosPorFilial.set(key, {
          filial_id: filialId,
          filial_nome: filialNome,
          periodos: new Map(),
          unidades: new Set(),
          primaryRecord: null
        });
      }
      
      const entry = vinculosPorFilial.get(key);
      entry.unidades.add(vinculo.cozinha_industrial_id);
      
      // Adicionar período ao mapa de períodos desta filial
      const periodo = periodos.find(p => p.id === vinculo.periodo_atendimento_id);
      if (periodo) {
        if (!entry.periodos.has(periodo.id)) {
          entry.periodos.set(periodo.id, {
            id: periodo.id,
            nome: periodo.nome,
            codigo: periodo.codigo,
            status: periodo.status
          });
        }
        // Guardar o primeiro registro como primaryRecord para ações
        if (!entry.primaryRecord) {
          entry.primaryRecord = periodo;
        }
      }
    }

    // Converter para array e formatar
    let agregadosPorFilial = Array.from(vinculosPorFilial.values()).map(entry => ({
      filial_id: entry.filial_id,
      filial_nome: entry.filial_nome,
      total_unidades: entry.unidades.size,
      periodos: Array.from(entry.periodos.values()),
      primaryRecord: entry.primaryRecord || periodos[0] || null
    }));

    // Aplicar filtro de busca nos agregados (se houver)
    if (search) {
      const searchLower = search.toLowerCase();
      agregadosPorFilial = agregadosPorFilial.filter(item => 
        item.filial_nome?.toLowerCase().includes(searchLower) ||
        item.periodos.some(p => 
          p.nome?.toLowerCase().includes(searchLower) ||
          p.codigo?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Ordenar agregados
    agregadosPorFilial.sort((a, b) => {
      if (sortBy === 'filial_nome') {
        return sortOrder === 'ASC' 
          ? (a.filial_nome || '').localeCompare(b.filial_nome || '')
          : (b.filial_nome || '').localeCompare(a.filial_nome || '');
      }
      // Ordenação padrão por nome da filial
      return (a.filial_nome || '').localeCompare(b.filial_nome || '');
    });

    // Aplicar paginação nos agregados
    const total = agregadosPorFilial.length;
    const limit = pagination.limit;
    const offset = pagination.offset;
    const agregadosPaginados = agregadosPorFilial.slice(offset, offset + limit);

    // Preparar resposta com paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(total, '/api/periodos-atendimento', queryParams);
    
    const response = {
      items: agregadosPaginados,
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
    const includeInactive = req.query.include_inactive === 'true' || req.query.include_inactive === '1';

    // Buscar vínculos (já inclui o nome da unidade salvo no banco)
    // Se includeInactive for true, buscar todos; senão, apenas ativos
    const statusFilter = includeInactive ? '' : "AND cipa.status = 'ativo'";
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
        ${statusFilter}
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

  /**
   * Buscar todos os períodos vinculados a uma lista de unidades
   */
  static buscarPeriodosPorUnidades = asyncHandler(async (req, res) => {
    let unidades_ids = req.query.unidades_ids || req.query['unidades_ids[]'];
    
    // Se não encontrou, tentar buscar todos os parâmetros que começam com unidades_ids
    if (!unidades_ids) {
      const allKeys = Object.keys(req.query);
      unidades_ids = allKeys
        .filter(key => key.startsWith('unidades_ids'))
        .map(key => req.query[key])
        .flat();
    }
    
    // Se for string, tentar parsear como JSON ou dividir por vírgula
    if (typeof unidades_ids === 'string') {
      try {
        unidades_ids = JSON.parse(unidades_ids);
      } catch {
        unidades_ids = unidades_ids.split(',').map(id => id.trim());
      }
    }
    
    // Se não for array, tentar converter
    if (!Array.isArray(unidades_ids)) {
      unidades_ids = [unidades_ids].filter(Boolean);
    }

    if (!unidades_ids || unidades_ids.length === 0) {
      return successResponse(res, { vinculos: {}, periodos: [] }, 'Nenhuma unidade informada', STATUS_CODES.OK);
    }

    // Converter para números
    const unidadesIds = unidades_ids.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);

    if (unidadesIds.length === 0) {
      return successResponse(res, {}, 'IDs de unidades inválidos', STATUS_CODES.OK);
    }

    // Verificar se deve incluir vínculos inativos (para edição)
    const includeInactive = req.query.include_inactive === 'true' || req.query.include_inactive === '1';
    
    // Buscar todos os períodos vinculados a essas unidades
    const placeholders = unidadesIds.map(() => '?').join(',');
    const statusFilter = includeInactive ? '' : "AND cipa.status = 'ativo'";
    const vinculos = await executeQuery(
      `SELECT DISTINCT
        cipa.periodo_atendimento_id,
        cipa.cozinha_industrial_id,
        cipa.status as vinculo_status
      FROM cozinha_industrial_periodos_atendimento cipa
      WHERE cipa.cozinha_industrial_id IN (${placeholders})
        ${statusFilter}
      ORDER BY cipa.periodo_atendimento_id`,
      unidadesIds
    );

    // Buscar informações dos períodos
    const periodoIds = [...new Set(vinculos.map(v => v.periodo_atendimento_id))];
    
    if (periodoIds.length === 0) {
      return successResponse(res, { vinculos: {}, periodos: [] }, 'Nenhum período encontrado', STATUS_CODES.OK);
    }

    const periodosPlaceholders = periodoIds.map(() => '?').join(',');
    const periodos = await executeQuery(
      `SELECT id, nome, codigo, status
       FROM periodos_atendimento
       WHERE id IN (${periodosPlaceholders})
       ORDER BY nome`,
      periodoIds
    );

    // Agrupar vínculos por unidade: { unidade_id: [periodo1, periodo2, ...] }
    // Incluir apenas vínculos ativos no agrupamento (para checkbox)
    const vinculosPorUnidade = {};
    vinculos.forEach(vinculo => {
      // Incluir apenas se o vínculo estiver ativo
      if (vinculo.vinculo_status === 'ativo') {
        const unidadeId = String(vinculo.cozinha_industrial_id);
        if (!vinculosPorUnidade[unidadeId]) {
          vinculosPorUnidade[unidadeId] = [];
        }
        if (!vinculosPorUnidade[unidadeId].includes(vinculo.periodo_atendimento_id)) {
          vinculosPorUnidade[unidadeId].push(vinculo.periodo_atendimento_id);
        }
      }
    });

    return successResponse(
      res,
      {
        vinculos: vinculosPorUnidade,
        periodos: periodos
      },
      'Períodos vinculados encontrados com sucesso',
      STATUS_CODES.OK
    );
  });
}

module.exports = PeriodosAtendimentoListController;

