/**
 * Controller de Listagem de Relatórios de Inspeção de Recebimento (RIR)
 * Responsável por listar e buscar relatórios de inspeção
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

console.log('[RIR] Controller RIRListController carregado');

class RIRListController {
  
  /**
   * Listar relatórios de inspeção com paginação, busca e HATEOAS
   */
  static listarRIRs = asyncHandler(async (req, res) => {
    console.log('=== [RIR] Iniciando listagem de RIRs ===');
    const startTime = Date.now();
    
    const { search = '', status_geral, fornecedor, data_inicio, data_fim } = req.query;
    const pagination = req.pagination;
    
    let params = [];
    let whereClause = 'WHERE 1=1';

    // Aplicar filtros (para WHERE clause)
    if (search) {
      whereClause += ' AND (ri.numero_nota_fiscal LIKE ? OR ri.fornecedor LIKE ? OR ri.numero_af LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status_geral) {
      whereClause += ' AND ri.status_geral = ?';
      params.push(status_geral);
    }

    if (fornecedor) {
      whereClause += ' AND ri.fornecedor LIKE ?';
      params.push(`%${fornecedor}%`);
    }

    if (data_inicio) {
      whereClause += ' AND ri.data_inspecao >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND ri.data_inspecao <= ?';
      params.push(data_fim);
    }

    // Query base (SEM JOIN desnecessário para melhor performance)
    let baseQuery = `
      SELECT 
        ri.id,
        ri.data_inspecao,
        ri.hora_inspecao,
        ri.numero_af,
        ri.numero_nota_fiscal,
        ri.fornecedor,
        ri.numero_pedido,
        ri.cnpj_fornecedor,
        ri.status_geral,
        ri.recebedor,
        ri.visto_responsavel,
        ri.criado_em,
        ri.atualizado_em,
        ri.usuario_cadastro_id
      FROM relatorio_inspecao ri
      ${whereClause}
    `;

    // Contar total de registros (query simples sem JOIN desnecessário)
    console.log('[RIR] Executando count query');
    const countQuery = `SELECT COUNT(*) as total FROM relatorio_inspecao ri ${whereClause}`;
    console.log('[RIR] Count query gerada:', countQuery.substring(0, 200));
    const countStart = Date.now();
    let totalItems;
    try {
      const countResult = await executeQuery(countQuery, params);
      const countTime = Date.now() - countStart;
      console.log(`[RIR] Count query executado em ${countTime}ms, total: ${countResult[0].total}`);
      totalItems = countResult[0].total;
    } catch (countError) {
      const countTime = Date.now() - countStart;
      console.error(`[RIR] ERRO na count query após ${countTime}ms:`, countError.message);
      throw countError;
    }

    // Aplicar paginação
    baseQuery += ' ORDER BY ri.data_inspecao DESC, ri.hora_inspecao DESC';
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

    console.log('[RIR] Executando query principal');
    const mainQueryStart = Date.now();
    let rirs;
    try {
      rirs = await executeQuery(query, params);
      const mainQueryTime = Date.now() - mainQueryStart;
      console.log(`[RIR] Query principal executada em ${mainQueryTime}ms, registros: ${rirs.length}`);
    } catch (mainError) {
      const mainQueryTime = Date.now() - mainQueryStart;
      console.error(`[RIR] ERRO na query principal após ${mainQueryTime}ms:`, mainError.message);
      throw mainError;
    }

    // Buscar total_produtos e usuario_nome apenas para os IDs retornados (query eficiente)
    console.log('[RIR] Buscando dados adicionais para registros retornados');
    const totalsStart = Date.now();
    let rirsWithTotals = rirs;
    if (rirs.length > 0) {
      const ids = rirs.map(r => r.id);
      const userIds = [...new Set(rirs.map(r => r.usuario_cadastro_id).filter(id => id))];
      const placeholders = ids.map(() => '?').join(',');
      
      // Buscar total_produtos e usuario_nome em uma única query
      let totalsQuery = `SELECT ri.id, JSON_LENGTH(ri.produtos_json) as total_produtos, u.nome as usuario_nome 
        FROM relatorio_inspecao ri 
        LEFT JOIN usuarios u ON ri.usuario_cadastro_id = u.id 
        WHERE ri.id IN (${placeholders})`;
      
      try {
        const totalsResult = await executeQuery(totalsQuery, ids);
        const totalsMap = {};
        totalsResult.forEach(row => {
          totalsMap[row.id] = {
            total_produtos: row.total_produtos || 0,
            usuario_nome: row.usuario_nome || '-'
          };
        });
        rirsWithTotals = rirs.map(rir => {
          const extra = totalsMap[rir.id] || { total_produtos: 0, usuario_nome: '-' };
          const { usuario_cadastro_id, ...rirWithoutId } = rir;
          return {
            ...rirWithoutId,
            total_produtos: extra.total_produtos,
            usuario_nome: extra.usuario_nome
          };
        });
      } catch (totalsError) {
        console.error('[RIR] Erro ao buscar dados adicionais:', totalsError.message);
        // Se falhar, usar valores padrão
        rirsWithTotals = rirs.map(rir => {
          const { usuario_cadastro_id, ...rirWithoutId } = rir;
          return { ...rirWithoutId, total_produtos: 0, usuario_nome: '-' };
        });
      }
    }
    const totalsTime = Date.now() - totalsStart;
    console.log(`[RIR] Dados adicionais processados em ${totalsTime}ms`);

    // Calcular estatísticas (usando mesma lógica de filtros da query principal)
    let statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ri.status_geral = 'APROVADO' THEN 1 ELSE 0 END) as aprovados,
        SUM(CASE WHEN ri.status_geral = 'REPROVADO' THEN 1 ELSE 0 END) as reprovados,
        SUM(CASE WHEN ri.status_geral = 'PARCIAL' THEN 1 ELSE 0 END) as parciais
      FROM relatorio_inspecao ri
      WHERE 1=1
    `;
    const statsParams = [];
    
    // Aplicar mesmos filtros da query principal
    if (search) {
      statsQuery += ' AND (ri.numero_nota_fiscal LIKE ? OR ri.fornecedor LIKE ? OR ri.numero_af LIKE ?)';
      statsParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status_geral) {
      statsQuery += ' AND ri.status_geral = ?';
      statsParams.push(status_geral);
    }
    if (fornecedor) {
      statsQuery += ' AND ri.fornecedor LIKE ?';
      statsParams.push(`%${fornecedor}%`);
    }
    if (data_inicio) {
      statsQuery += ' AND ri.data_inspecao >= ?';
      statsParams.push(data_inicio);
    }
    if (data_fim) {
      statsQuery += ' AND ri.data_inspecao <= ?';
      statsParams.push(data_fim);
    }
    
    console.log('[RIR] Executando query de estatísticas');
    const statsStart = Date.now();
    const statsResult = await executeQuery(statsQuery, statsParams);
    const statsTime = Date.now() - statsStart;
    console.log(`[RIR] Query de estatísticas executada em ${statsTime}ms`);
    const statistics = statsResult[0] || { total: 0, aprovados: 0, reprovados: 0, parciais: 0 };

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/relatorio-inspecao', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    const totalTime = Date.now() - startTime;
    console.log(`[RIR] Listagem concluída em ${totalTime}ms total`);
    return successResponse(res, rirsWithTotals, 'Relatórios de inspeção listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      actions,
      _links: res.addListLinks(rirsWithTotals, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar relatório por ID
   */
  static buscarRIRPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const rirs = await executeQuery(
      `SELECT 
        ri.*,
        u.nome as usuario_nome
       FROM relatorio_inspecao ri
       LEFT JOIN usuarios u ON ri.usuario_cadastro_id = u.id
       WHERE ri.id = ?`,
      [id]
    );

    if (rirs.length === 0) {
      return notFoundResponse(res, 'Relatório de inspeção não encontrado');
    }

    const rir = rirs[0];

    // Decodificar JSONs se necessário
    if (rir.checklist_json && typeof rir.checklist_json === 'string') {
      try {
        rir.checklist_json = JSON.parse(rir.checklist_json);
      } catch (e) {
        rir.checklist_json = [];
      }
    }

    if (rir.produtos_json && typeof rir.produtos_json === 'string') {
      try {
        rir.produtos_json = JSON.parse(rir.produtos_json);
      } catch (e) {
        rir.produtos_json = [];
      }
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(rir);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, rir.id);

    return successResponse(res, data, 'Relatório de inspeção encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
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

module.exports = RIRListController;

