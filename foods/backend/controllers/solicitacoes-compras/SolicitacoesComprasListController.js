/**
 * Controller de Listagem de Solicitações de Compras
 * Responsável por listar e buscar solicitações de compras
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class SolicitacoesComprasListController {
  
  /**
   * Listar solicitações de compras com paginação, busca e HATEOAS
   */
  static listarSolicitacoes = asyncHandler(async (req, res) => {
    const { search = '', status, solicitante, unidade, data_inicio, data_fim, filial_id } = req.query;
    const pagination = req.pagination;

    let params = [];
    let whereClause = 'WHERE 1=1';

    // Aplicar filtros
    if (search) {
      whereClause += ' AND (sc.numero_solicitacao LIKE ? OR sc.descricao LIKE ? OR sc.usuario_nome LIKE ? OR sc.unidade LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ' AND sc.status = ?';
      params.push(status);
    }

    if (solicitante) {
      whereClause += ' AND sc.usuario_nome LIKE ?';
      params.push(`%${solicitante}%`);
    }

    if (unidade) {
      whereClause += ' AND sc.unidade LIKE ?';
      params.push(`%${unidade}%`);
    }

    if (filial_id) {
      whereClause += ' AND sc.filial_id = ?';
      params.push(filial_id);
    }

    if (data_inicio) {
      whereClause += ' AND sc.criado_em >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND sc.criado_em <= ?';
      params.push(data_fim);
    }

    // Query base
    let baseQuery = `
      SELECT 
        sc.id,
        sc.numero_solicitacao,
        sc.descricao,
        sc.usuario_id,
        sc.usuario_nome,
        sc.usuario_nome as solicitante,
        sc.unidade,
        sc.data_necessidade,
        sc.data_entrega_cd,
        sc.semana_abastecimento,
        sc.observacoes,
        sc.status,
        sc.valor_total,
        sc.data_documento,
        sc.motivo,
        sc.filial_id,
        sc.criado_em,
        sc.atualizado_em,
        f.filial as filial_nome,
        f.codigo_filial as filial_codigo
      FROM solicitacoes_compras sc
      LEFT JOIN filiais f ON sc.filial_id = f.id
      ${whereClause}
    `;

    // Aplicar paginação
    baseQuery += ' ORDER BY sc.criado_em DESC, sc.id DESC';
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

    // Executar queries principais em paralelo
    const countQuery = `SELECT COUNT(*) as total FROM solicitacoes_compras sc ${whereClause}`;
    
    const [solicitacoes, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params)
    ]);
    
    const totalItems = countResult[0].total;

    // Calcular estatísticas
    let statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sc.status = 'em_digitacao' THEN 1 ELSE 0 END) as abertos,
        SUM(CASE WHEN sc.status = 'em_andamento' THEN 1 ELSE 0 END) as parciais,
        SUM(CASE WHEN sc.status = 'finalizado' THEN 1 ELSE 0 END) as finalizados,
        SUM(CASE WHEN sc.status = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        COALESCE(SUM(sc.valor_total), 0) as valor_total_geral
      FROM solicitacoes_compras sc
      WHERE 1=1
    `;
    const statsParams = [];
    
    // Aplicar mesmos filtros da query principal
    if (search) {
      statsQuery += ' AND (sc.numero_solicitacao LIKE ? OR sc.descricao LIKE ? OR sc.usuario_nome LIKE ? OR sc.unidade LIKE ?)';
      statsParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      statsQuery += ' AND sc.status = ?';
      statsParams.push(status);
    }
    if (solicitante) {
      statsQuery += ' AND sc.usuario_nome LIKE ?';
      statsParams.push(`%${solicitante}%`);
    }
    if (unidade) {
      statsQuery += ' AND sc.unidade LIKE ?';
      statsParams.push(`%${unidade}%`);
    }
    if (filial_id) {
      statsQuery += ' AND sc.filial_id = ?';
      statsParams.push(filial_id);
    }
    if (data_inicio) {
      statsQuery += ' AND sc.criado_em >= ?';
      statsParams.push(data_inicio);
    }
    if (data_fim) {
      statsQuery += ' AND sc.criado_em <= ?';
      statsParams.push(data_fim);
    }

    // Executar query de estatísticas
    let statistics = { total: 0, abertos: 0, parciais: 0, finalizados: 0, canceladas: 0, valor_total_geral: 0 };
    try {
      const statsResult = await executeQuery(statsQuery, statsParams);
      if (statsResult && statsResult[0]) {
        statistics = statsResult[0];
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }

    res.json({
      success: true,
      data: solicitacoes,
      pagination: {
        total: totalItems,
        page: pagination.page,
        limit: limit,
        pages: Math.ceil(totalItems / limit)
      },
      statistics: statistics
    });
  });

  /**
   * Buscar solicitação por ID
   */
  static buscarSolicitacaoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar solicitação
    const [solicitacao] = await executeQuery(
      `SELECT 
        sc.*,
        f.filial as filial_nome,
        f.codigo_filial as filial_codigo,
        COALESCE(sc.usuario_nome, u.nome) as solicitante_nome
      FROM solicitacoes_compras sc
      LEFT JOIN filiais f ON sc.filial_id = f.id
      LEFT JOIN usuarios u ON sc.usuario_id = u.id OR sc.criado_por = u.id
      WHERE sc.id = ?`,
      [id]
    );

    if (!solicitacao) {
      return notFoundResponse(res, 'Solicitação de compras não encontrada');
    }

    // Buscar itens
    const itens = await executeQuery(
      `SELECT 
        sci.*,
        pg.nome as produto_nome,
        pg.codigo_produto,
        um.simbolo as unidade_simbolo,
        um.nome as unidade_nome
      FROM solicitacao_compras_itens sci
      LEFT JOIN produto_generico pg ON sci.produto_id = pg.id
      LEFT JOIN unidades_medida um ON sci.unidade_medida_id = um.id
      WHERE sci.solicitacao_id = ?
      ORDER BY sci.id`,
      [id]
    );

    // Buscar vínculos com pedidos (quantidades utilizadas)
    const itensComVinculos = await Promise.all(
      itens.map(async (item) => {
        const vinculos = await executeQuery(
          `SELECT 
            pci.quantidade_pedido,
            pc.numero_pedido,
            pc.id as pedido_id
          FROM pedido_compras_itens pci
          INNER JOIN pedido_compras pc ON pci.pedido_id = pc.id
          WHERE pci.solicitacao_item_id = ?`,
          [item.id]
        );

        const quantidade_utilizada = vinculos.reduce((sum, v) => sum + parseFloat(v.quantidade_pedido || 0), 0);
        const saldo_disponivel = parseFloat(item.quantidade || 0) - quantidade_utilizada;

        // Status do item
        let status_item = 'aberto';
        if (quantidade_utilizada > 0 && saldo_disponivel > 0) {
          status_item = 'parcial';
        } else if (saldo_disponivel <= 0 && quantidade_utilizada > 0) {
          status_item = 'finalizado';
        }

        return {
          ...item,
          quantidade_utilizada,
          saldo_disponivel,
          status_item,
          pedidos_vinculados: vinculos.map(v => ({
            pedido_id: v.pedido_id,
            numero_pedido: v.numero_pedido,
            quantidade: v.quantidade_pedido
          }))
        };
      })
    );

    const responseData = {
      ...solicitacao,
      itens: itensComVinculos
    };

    return successResponse(res, responseData, 'Solicitação de compras encontrada com sucesso');
  });
}

module.exports = SolicitacoesComprasListController;

