const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { calcularPeriodoDiasUteis } = require('../../utils/diasUteisUtils');

/**
 * Controller de Listagem de Quantidades Servidas (Cozinha Industrial)
 * Sistema com períodos de atendimento dinâmicos
 */
class QuantidadesServidasListController {
  
  /**
   * Listar registros diários agrupados por data
   * Retorna dados com períodos dinâmicos
   */
  static listar = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const pagination = req.pagination;
    
    // Garantir que pagination existe
    if (!pagination) {
      return errorResponse(
        res,
        'Erro na paginação: middleware não aplicado',
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
    
    // Extrair limit e offset do objeto pagination e garantir que são números inteiros válidos
    let limit = pagination.limit;
    let offset = pagination.offset;
    
    // Converter para números se necessário
    if (typeof limit !== 'number') {
      limit = parseInt(limit, 10);
    }
    if (typeof offset !== 'number') {
      offset = parseInt(offset, 10);
    }
    
    // Garantir valores válidos
    limit = Math.max(1, Math.min(1000, isNaN(limit) ? 20 : Math.floor(limit)));
    offset = Math.max(0, isNaN(offset) ? 0 : Math.floor(offset));
    
    // Validação final - garantir que são números inteiros
    if (!Number.isInteger(limit) || !Number.isInteger(offset) || limit < 1 || offset < 0) {
      return errorResponse(
        res,
        `Erro na paginação: valores inválidos (limit: ${limit}, offset: ${offset})`,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
    
    const { 
      unidade_id,
      data_inicio,
      data_fim
    } = req.query;
    
    let whereClause = 'WHERE rd.ativo = 1';
    let params = [];
    
    // Filtro por unidade
    if (unidade_id) {
      const unidadeIdInt = parseInt(unidade_id, 10);
      if (!isNaN(unidadeIdInt) && unidadeIdInt > 0) {
        whereClause += ' AND rd.unidade_id = ?';
        params.push(unidadeIdInt);
      }
    }
    
    // Filtro por período
    if (data_inicio) {
      whereClause += ' AND rd.data >= ?';
      params.push(data_inicio);
    }
    
    if (data_fim) {
      whereClause += ' AND rd.data <= ?';
      params.push(data_fim);
    }
    
    // Garantir que limit e offset são números inteiros válidos
    const limitInt = Math.floor(Number(limit)) || 20;
    const offsetInt = Math.floor(Number(offset)) || 0;
    
    // Validação final antes de usar na query
    if (!Number.isFinite(limitInt) || !Number.isFinite(offsetInt) || limitInt < 1 || offsetInt < 0) {
      return errorResponse(
        res,
        `Erro na paginação: valores inválidos após conversão (limit: ${limitInt}, offset: ${offsetInt})`,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
    
    // Buscar períodos vinculados às unidades com status ativo
    // IMPORTANTE: Mostrar apenas períodos que estão vinculados à unidade E com status ativo
    // Buscar apenas períodos que têm vínculos ativos (não mostrar períodos desmarcados)
    let periodos = [];
    
    if (unidade_id) {
      // Se há filtro por unidade, buscar apenas períodos vinculados a essa unidade com status ativo
      const unidadeIdInt = parseInt(unidade_id, 10);
      if (!isNaN(unidadeIdInt) && unidadeIdInt > 0) {
        periodos = await executeQuery(
          `SELECT DISTINCT pa.id, pa.nome, pa.codigo 
           FROM periodos_atendimento pa
           INNER JOIN cozinha_industrial_periodos_atendimento cipa 
             ON pa.id = cipa.periodo_atendimento_id
           WHERE cipa.cozinha_industrial_id = ? 
             AND cipa.status = 'ativo'
             AND pa.status = 'ativo'
           ORDER BY pa.nome`,
          [unidadeIdInt]
        );
      }
    }
    
    // Se não há filtro por unidade, buscar períodos das unidades que aparecem nos registros
    // Primeiro, buscar IDs de unidades que têm registros (usando a mesma whereClause, mas sem o alias rd.)
    if (periodos.length === 0 && !unidade_id) {
      // Remover o prefixo rd. do whereClause para usar na query sem alias
      const whereClauseSemAlias = whereClause.replace(/rd\./g, 'quantidades_servidas.');
      const unidadesComRegistros = await executeQuery(
        `SELECT DISTINCT unidade_id FROM quantidades_servidas ${whereClauseSemAlias}`,
        params
      );
      
      if (unidadesComRegistros.length > 0) {
        const unidadesIds = unidadesComRegistros.map(u => u.unidade_id);
        const placeholders = unidadesIds.map(() => '?').join(',');
        
        periodos = await executeQuery(
          `SELECT DISTINCT pa.id, pa.nome, pa.codigo 
           FROM periodos_atendimento pa
           INNER JOIN cozinha_industrial_periodos_atendimento cipa 
             ON pa.id = cipa.periodo_atendimento_id
           WHERE cipa.cozinha_industrial_id IN (${placeholders})
             AND cipa.status = 'ativo'
             AND pa.status = 'ativo'
           ORDER BY pa.nome`,
          unidadesIds
        );
      }
    }
    
    // Se ainda não encontrou períodos, buscar períodos que têm pelo menos um vínculo ativo
    // Isso garante que períodos desmarcados (sem vínculos ativos) não apareçam
    if (periodos.length === 0) {
      periodos = await executeQuery(
        `SELECT DISTINCT pa.id, pa.nome, pa.codigo 
         FROM periodos_atendimento pa
         INNER JOIN cozinha_industrial_periodos_atendimento cipa 
           ON pa.id = cipa.periodo_atendimento_id
         WHERE cipa.status = 'ativo'
           AND pa.status = 'ativo'
         ORDER BY pa.nome`
      );
    }
    
    // Se ainda não encontrou períodos, usar todos os períodos ativos como fallback
    // (para compatibilidade com registros antigos que podem não ter vínculo)
    if (periodos.length === 0) {
      periodos = await executeQuery(
        'SELECT id, nome, codigo FROM periodos_atendimento WHERE status = ? ORDER BY nome',
        ['ativo']
      );
    }
    
    // Construir query com pivot dinâmico usando MAX(CASE WHEN...) para cada período
    // Isso garante que todos os períodos fiquem em uma única linha, como no sistema de implantação
    // IMPORTANTE: Mostrar apenas o registro mais recente de cada unidade (última data registrada)
    const pivotColumns = periodos.map(periodo => 
      `MAX(CASE WHEN rd.periodo_atendimento_id = ${periodo.id} THEN rd.valor ELSE 0 END) as periodo_${periodo.id}`
    ).join(',\n          ');
    
    // Criar whereClause para subquery (substituir rd. por alias correto)
    const subqueryWhere = whereClause.replace(/rd\./g, 'quantidades_servidas.');
    
    // Query principal: buscar apenas o registro mais recente de cada unidade
    // Usar INNER JOIN com subquery para pegar apenas a data máxima de cada unidade
    // Similar ao sistema de implantação
    const query = `
      SELECT 
        rd.unidade_id,
        MAX(rd.unidade_nome) as unidade_nome,
        rd.data,
        MAX(rd.nutricionista_id) as nutricionista_id,
        MIN(rd.criado_em) as data_cadastro,
        MAX(rd.atualizado_em) as data_atualizacao${pivotColumns ? ',\n        ' + pivotColumns : ''}
      FROM quantidades_servidas rd
      INNER JOIN (
        SELECT unidade_id, MAX(data) as max_data
        FROM quantidades_servidas
        ${subqueryWhere}
        GROUP BY unidade_id
      ) rd_recente ON rd.unidade_id = rd_recente.unidade_id AND rd.data = rd_recente.max_data
      ${whereClause}
      GROUP BY rd.unidade_id, rd.data
      ORDER BY rd.data DESC, rd.unidade_id ASC
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;
    
    const registrosAgrupados = await executeQuery(query, params.concat(params));
    
    // Transformar os resultados do pivot em objeto quantidades
    const registrosCompletos = registrosAgrupados.map(registro => {
      const quantidades = {};
      periodos.forEach(periodo => {
        const valor = registro[`periodo_${periodo.id}`] || 0;
        quantidades[periodo.id] = {
          periodo_atendimento_id: periodo.id,
          periodo_nome: periodo.nome,
          periodo_codigo: periodo.codigo,
          valor: valor
        };
      });
      
      // Remover as colunas de pivot do objeto registro
      const { unidade_id, unidade_nome, data, nutricionista_id, data_cadastro, data_atualizacao } = registro;
      
      return {
        unidade_id,
        unidade_nome,
        data,
        nutricionista_id,
        data_cadastro,
        data_atualizacao,
        quantidades: quantidades,
        periodos_disponiveis: periodos.map(p => ({
          id: p.id,
          nome: p.nome,
          codigo: p.codigo
        }))
      };
    });
    
    // Garantir que não há duplicatas no resultado final (por segurança)
    const registrosFinaisMap = new Map();
    registrosCompletos.forEach(registro => {
      const chave = `${registro.unidade_id}-${registro.data}`;
      if (!registrosFinaisMap.has(chave)) {
        registrosFinaisMap.set(chave, registro);
      }
    });
    const registrosFinais = Array.from(registrosFinaisMap.values());
    
    // Contar total (apenas unidades únicas, não registros)
    // Usar a mesma lógica da query principal: apenas o mais recente de cada unidade
    const countSubqueryWhere = whereClause.replace(/rd\./g, 'quantidades_servidas.');
    const countQuery = `
      SELECT COUNT(DISTINCT rd.unidade_id) as total
      FROM quantidades_servidas rd
      INNER JOIN (
        SELECT unidade_id, MAX(data) as max_data
        FROM quantidades_servidas
        ${countSubqueryWhere}
        GROUP BY unidade_id
      ) rd_recente ON rd.unidade_id = rd_recente.unidade_id AND rd.data = rd_recente.max_data
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, params.concat(params));
    const totalItems = countResult[0].total;
    
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    // Usar o método generateMeta do pagination (já tem os valores corretos)
    const meta = pagination.generateMeta(totalItems, '/api/quantidades-servidas', queryParams);
    
    return successResponse(
      res,
      {
        items: registrosFinais,
        periodos: periodos,
        pagination: meta.pagination
      },
      'Registros listados com sucesso',
      STATUS_CODES.OK
    );
  });
  
  /**
   * Listar médias por unidade e período
   */
  static listarMedias = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { unidade_id } = req.query;
    
    let whereClause = 'WHERE mup.calculada_automaticamente = 1';
    let params = [];
    
    // Filtro por unidade
    if (unidade_id) {
      whereClause += ' AND mup.unidade_id = ?';
      params.push(unidade_id);
    }
    
    const medias = await executeQuery(
      `SELECT 
        mup.*,
        pa.nome as periodo_nome,
        pa.codigo as periodo_codigo
      FROM medias_quantidades_servidas mup
      INNER JOIN periodos_atendimento pa ON mup.periodo_atendimento_id = pa.id
      ${whereClause} 
      ORDER BY mup.unidade_id ASC, pa.nome ASC`,
      params
    );
    
    // Agrupar por unidade
    const mediasPorUnidade = {};
    medias.forEach(media => {
      if (!mediasPorUnidade[media.unidade_id]) {
        mediasPorUnidade[media.unidade_id] = {
          unidade_id: media.unidade_id,
          unidade_nome: media.unidade_nome,
          periodos: []
        };
      }
      mediasPorUnidade[media.unidade_id].periodos.push({
        periodo_atendimento_id: media.periodo_atendimento_id,
        periodo_nome: media.periodo_nome || media.periodo_nome,
        periodo_codigo: media.periodo_codigo,
        media: parseFloat(media.media) || 0,
        quantidade_lancamentos: media.quantidade_lancamentos || 0,
        data_calculo: media.data_calculo
      });
    });
    
    return successResponse(
      res,
      Object.values(mediasPorUnidade),
      'Médias listadas com sucesso',
      STATUS_CODES.OK
    );
  });
  
  /**
   * Listar histórico completo de uma unidade (todos os registros)
   */
  static listarHistorico = asyncHandler(async (req, res) => {
    const { unidade_id } = req.query;
    
    if (!unidade_id) {
      return errorResponse(
        res,
        'unidade_id é obrigatório',
        STATUS_CODES.BAD_REQUEST
      );
    }
    
    const historico = await executeQuery(
      `SELECT 
        rd.unidade_id,
        MAX(rd.unidade_nome) as unidade_nome,
        rd.data,
        rd.nutricionista_id,
        MIN(rd.criado_em) as data_cadastro,
        MAX(rd.atualizado_em) as data_atualizacao
      FROM quantidades_servidas rd
      WHERE rd.unidade_id = ? AND rd.ativo = 1
      GROUP BY rd.unidade_id, rd.data, rd.nutricionista_id
      ORDER BY rd.data DESC`,
      [unidade_id]
    );
    
    // Para cada registro histórico, buscar valores por período
    const historicoCompleto = await Promise.all(
      historico.map(async (item) => {
        const registrosDetalhes = await executeQuery(
          `SELECT 
            rd.periodo_atendimento_id,
            rd.valor,
            pa.nome as periodo_nome,
            pa.codigo as periodo_codigo
          FROM quantidades_servidas rd
          INNER JOIN periodos_atendimento pa ON rd.periodo_atendimento_id = pa.id
          WHERE rd.unidade_id = ? AND rd.data = ? AND rd.ativo = 1`,
          [item.unidade_id, item.data]
        );
        
        const valores = {};
        registrosDetalhes.forEach(reg => {
          valores[reg.periodo_atendimento_id] = {
            valor: reg.valor,
            periodo_nome: reg.periodo_nome,
            periodo_codigo: reg.periodo_codigo
          };
        });
        
        return {
          ...item,
          valores: valores
        };
      })
    );
    
    return successResponse(
      res,
      historicoCompleto,
      'Histórico listado com sucesso',
      STATUS_CODES.OK
    );
  });
  
  /**
   * Calcular médias por período (últimos 20 registros diários)
   * Retorna médias organizadas por periodo_atendimento_id
   */
  static calcularMediasPorPeriodo = asyncHandler(async (req, res) => {
    const { unidade_id, data } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;

    if (!unidade_id || !data) {
      return errorResponse(
        res,
        'unidade_id e data são obrigatórios',
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Buscar médias da tabela medias_quantidades_servidas (já calculadas pelos últimos 20 registros)
    const medias = await executeQuery(
      `SELECT 
        mup.*,
        pa.nome as periodo_nome,
        pa.codigo as periodo_codigo
      FROM medias_quantidades_servidas mup
      INNER JOIN periodos_atendimento pa ON mup.periodo_atendimento_id = pa.id
      WHERE mup.unidade_id = ? AND mup.ativo = 1
      ORDER BY pa.nome`,
      [unidade_id]
    );
    
    // Organizar médias por período
    const mediasOrganizadas = {};
    
    medias.forEach(media => {
      mediasOrganizadas[media.periodo_atendimento_id] = {
        periodo_atendimento_id: media.periodo_atendimento_id,
        periodo_nome: media.periodo_nome || media.periodo_nome,
        periodo_codigo: media.periodo_codigo,
        media: parseFloat(media.media) || 0,
        quantidade_lancamentos: media.quantidade_lancamentos || 0,
        dias_com_registro: media.quantidade_lancamentos || 0,
        data_calculo: media.data_calculo
      };
    });

    return successResponse(
      res,
      mediasOrganizadas,
      'Médias calculadas com sucesso',
      STATUS_CODES.OK
    );
  });
}

module.exports = QuantidadesServidasListController;
