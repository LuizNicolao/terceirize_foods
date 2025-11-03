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

class RIRListController {
  
  /**
   * Listar relatórios de inspeção com paginação, busca e HATEOAS
   */
  static listarRIRs = asyncHandler(async (req, res) => {
    const { search = '', status_geral, fornecedor, data_inicio, data_fim } = req.query;
    const pagination = req.pagination;

    // Query base
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
        u.nome as usuario_nome,
        JSON_LENGTH(ri.produtos_json) as total_produtos
      FROM relatorio_inspecao ri
      LEFT JOIN usuarios u ON ri.usuario_cadastro_id = u.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (ri.numero_nota_fiscal LIKE ? OR ri.fornecedor LIKE ? OR ri.numero_af LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status_geral) {
      baseQuery += ' AND ri.status_geral = ?';
      params.push(status_geral);
    }

    if (fornecedor) {
      baseQuery += ' AND ri.fornecedor LIKE ?';
      params.push(`%${fornecedor}%`);
    }

    if (data_inicio) {
      baseQuery += ' AND ri.data_inspecao >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      baseQuery += ' AND ri.data_inspecao <= ?';
      params.push(data_fim);
    }

    baseQuery += ' ORDER BY ri.data_inspecao DESC, ri.hora_inspecao DESC';

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`;
    const countResult = await executeQuery(countQuery, params);
    const totalItems = countResult[0].total;

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

    const rirs = await executeQuery(query, params);

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
    
    const statsResult = await executeQuery(statsQuery, statsParams);
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
    return successResponse(res, rirs, 'Relatórios de inspeção listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      actions,
      _links: res.addListLinks(rirs, meta.pagination, queryParams)._links
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

