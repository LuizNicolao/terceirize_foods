/**
 * Controller de Listagem de Templates de PDF
 * Responsável por listar e buscar templates
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class PdfTemplatesListController {
  
  /**
   * Listar templates de PDF com paginação e busca
   */
  static listarTemplates = asyncHandler(async (req, res) => {
    const { search = '', tela_vinculada, ativo } = req.query;
    const pagination = req.pagination || {};

    let params = [];
    let whereClause = 'WHERE 1=1';

    // Aplicar filtros
    if (search) {
      whereClause += ' AND (pt.nome LIKE ? OR pt.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tela_vinculada) {
      whereClause += ' AND pt.tela_vinculada = ?';
      params.push(tela_vinculada);
    }

    if (ativo !== undefined && ativo !== '') {
      whereClause += ' AND pt.ativo = ?';
      params.push(ativo === 'true' || ativo === '1' ? 1 : 0);
    }

    // Query principal
    // req.pagination é uma instância de PaginationHelper
    const limit = pagination.limit ? parseInt(pagination.limit, 10) : 20;
    const offset = pagination.offset ? parseInt(pagination.offset, 10) : 0;
    
    // Garantir valores válidos
    const finalLimit = isNaN(limit) || limit < 1 ? 20 : limit;
    const finalOffset = isNaN(offset) || offset < 0 ? 0 : offset;
    
    const query = `
      SELECT 
        pt.*,
        u1.nome as criado_por_nome,
        u2.nome as atualizado_por_nome
      FROM pdf_templates pt
      LEFT JOIN usuarios u1 ON pt.criado_por = u1.id
      LEFT JOIN usuarios u2 ON pt.atualizado_por = u2.id
      ${whereClause}
      ORDER BY pt.tela_vinculada, pt.padrao DESC, pt.nome ASC
      LIMIT ? OFFSET ?
    `;

    const templates = await executeQuery(query, [...params, finalLimit, finalOffset]);

    // Parse JSON para cada template
    templates.forEach(template => {
      if (template.variaveis_disponiveis) {
        try {
          template.variaveis_disponiveis = JSON.parse(template.variaveis_disponiveis);
        } catch (e) {
          template.variaveis_disponiveis = null;
        }
      }
    });

    // Query de contagem
    const countQuery = `SELECT COUNT(*) as total FROM pdf_templates pt ${whereClause}`;
    const [countResult] = await executeQuery(countQuery, params);
    const totalItems = countResult.total;

    // Adicionar links HATEOAS
    const data = templates.map(template => res.addResourceLinks(template));

    res.json({
      success: true,
      data: data,
      pagination: {
        total: totalItems,
        page: pagination.page ? parseInt(pagination.page, 10) : 1,
        limit: finalLimit,
        pages: Math.ceil(totalItems / finalLimit)
      }
    });
  });

  /**
   * Buscar template por ID
   */
  static buscarTemplatePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [template] = await executeQuery(
      `SELECT 
        pt.*,
        u1.nome as criado_por_nome,
        u2.nome as atualizado_por_nome
      FROM pdf_templates pt
      LEFT JOIN usuarios u1 ON pt.criado_por = u1.id
      LEFT JOIN usuarios u2 ON pt.atualizado_por = u2.id
      WHERE pt.id = ?`,
      [id]
    );

    if (!template) {
      return notFoundResponse(res, 'Template de PDF não encontrado');
    }

    // Parse JSON se existir
    if (template.variaveis_disponiveis) {
      try {
        template.variaveis_disponiveis = JSON.parse(template.variaveis_disponiveis);
      } catch (e) {
        template.variaveis_disponiveis = null;
      }
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(template);

    return successResponse(res, data, 'Template de PDF encontrado', STATUS_CODES.OK);
  });

  /**
   * Buscar template padrão para uma tela
   */
  static buscarTemplatePadrao = asyncHandler(async (req, res) => {
    const { tela_vinculada } = req.params;

    const [template] = await executeQuery(
      `SELECT 
        pt.*,
        u1.nome as criado_por_nome,
        u2.nome as atualizado_por_nome
      FROM pdf_templates pt
      LEFT JOIN usuarios u1 ON pt.criado_por = u1.id
      LEFT JOIN usuarios u2 ON pt.atualizado_por = u2.id
      WHERE pt.tela_vinculada = ? AND pt.ativo = 1
      ORDER BY pt.padrao DESC, pt.criado_em DESC
      LIMIT 1`,
      [tela_vinculada]
    );

    if (!template) {
      return notFoundResponse(res, 'Nenhum template encontrado para esta tela');
    }

    // Parse JSON se existir
    if (template.variaveis_disponiveis) {
      try {
        template.variaveis_disponiveis = JSON.parse(template.variaveis_disponiveis);
      } catch (e) {
        template.variaveis_disponiveis = null;
      }
    }

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(template);

    return successResponse(res, data, 'Template padrão encontrado', STATUS_CODES.OK);
  });

  /**
   * Listar telas disponíveis para vinculação
   */
  static listarTelasDisponiveis = asyncHandler(async (req, res) => {
    const telas = [
      { value: 'solicitacoes-compras', label: 'Solicitações de Compras' },
      { value: 'pedidos-compras', label: 'Pedidos de Compras' },
      { value: 'relatorio-inspecao', label: 'Relatório de Inspeção' }
    ];

    return successResponse(res, telas, 'Telas disponíveis listadas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = PdfTemplatesListController;

