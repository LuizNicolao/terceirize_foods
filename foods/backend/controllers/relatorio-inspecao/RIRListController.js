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
const RIRProdutosController = require('./RIRProdutosController');

class RIRListController {
  
  /**
   * Listar relatórios de inspeção com paginação e busca
   */
  static listarRIRs = asyncHandler(async (req, res) => {
    const { search = '', resultado_geral, fornecedor, data_inicio, data_fim, numero_pedido, pedido_compra_id, apenas_disponiveis = false, page = 1, limit = 20 } = req.query;

    let params = [];
    let whereClause = 'WHERE 1=1';

    // Aplicar filtros (para WHERE clause)
    // Busca case-insensitive para Nº NF e Fornecedor
    if (search) {
      whereClause += ' AND (LOWER(ri.numero_nota_fiscal) LIKE LOWER(?) OR LOWER(ri.fornecedor) LIKE LOWER(?))';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (resultado_geral) {
      whereClause += ' AND ri.resultado_geral = ?';
      params.push(resultado_geral);
    }

    if (fornecedor) {
      whereClause += ' AND LOWER(ri.fornecedor) LIKE LOWER(?)';
      params.push(`%${fornecedor}%`);
    }

    // Suportar tanto numero_pedido quanto pedido_compra_id
    let numeroPedidoFiltro = null;
    if (numero_pedido) {
      numeroPedidoFiltro = numero_pedido;
      whereClause += ' AND ri.numero_pedido = ?';
      params.push(numero_pedido);
    } else if (pedido_compra_id) {
      // Buscar numero_pedido a partir do pedido_compra_id
      const pedidoQuery = await executeQuery(
        `SELECT numero_pedido FROM pedidos_compras WHERE id = ?`,
        [pedido_compra_id]
      );
      if (pedidoQuery.length > 0) {
        numeroPedidoFiltro = pedidoQuery[0].numero_pedido;
        whereClause += ' AND ri.numero_pedido = ?';
        params.push(numeroPedidoFiltro);
      } else {
        // Se não encontrar o pedido, retornar vazio
        whereClause += ' AND 1=0';
      }
    }

    // Excluir RIRs já utilizadas em notas fiscais (quando apenas_disponiveis = true ou quando filtrando por pedido)
    if (apenas_disponiveis === 'true' || apenas_disponiveis === true || numero_pedido || pedido_compra_id) {
      whereClause += ' AND NOT EXISTS (SELECT 1 FROM notas_fiscais nf WHERE nf.rir_id = ri.id)';
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
        ri.numero_nota_fiscal,
        ri.fornecedor,
        ri.numero_pedido,
        ri.cnpj_fornecedor,
        ri.resultado_geral,
        ri.recebedor,
        ri.visto_responsavel,
        ri.criado_em,
        ri.atualizado_em,
        ri.usuario_cadastro_id
      FROM relatorio_inspecao ri
      ${whereClause}
    `;

    // Aplicar paginação
    baseQuery += ' ORDER BY ri.data_inspecao DESC, ri.hora_inspecao DESC';
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;

    // Executar queries principais em paralelo para melhor performance
    const countQuery = `SELECT COUNT(*) as total FROM relatorio_inspecao ri ${whereClause}`;
    
    const [rirs, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params)
    ]);
    
    const totalItems = countResult[0].total;

    // Calcular estatísticas (usando mesma lógica de filtros da query principal)
    // Executar em paralelo com a busca de totals para melhor performance
    let statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ri.resultado_geral = 'APROVADO' THEN 1 ELSE 0 END) as aprovados,
        SUM(CASE WHEN ri.resultado_geral = 'REPROVADO' THEN 1 ELSE 0 END) as reprovados,
        SUM(CASE WHEN ri.resultado_geral = 'PARCIAL' THEN 1 ELSE 0 END) as parciais
      FROM relatorio_inspecao ri
      WHERE 1=1
    `;
    const statsParams = [];
    
    // Aplicar mesmos filtros da query principal
    // Busca case-insensitive para Nº NF e Fornecedor
    if (search) {
      statsQuery += ' AND (LOWER(ri.numero_nota_fiscal) LIKE LOWER(?) OR LOWER(ri.fornecedor) LIKE LOWER(?))';
      statsParams.push(`%${search}%`, `%${search}%`);
    }
    if (resultado_geral) {
      statsQuery += ' AND ri.resultado_geral = ?';
      statsParams.push(resultado_geral);
    }
    if (fornecedor) {
      statsQuery += ' AND LOWER(ri.fornecedor) LIKE LOWER(?)';
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
    
    // Buscar total_produtos e usuario_nome apenas para os IDs retornados
    let totalsQueryPromise = null;
    if (rirs.length > 0) {
      const ids = rirs.map(r => r.id);
      const placeholders = ids.map(() => '?').join(',');
      totalsQueryPromise = executeQuery(
        `SELECT 
          ri.id, 
          COUNT(rip.id) as total_produtos, 
          u.nome as usuario_nome 
        FROM relatorio_inspecao ri 
        LEFT JOIN usuarios u ON ri.usuario_cadastro_id = u.id 
        LEFT JOIN relatorio_inspecao_produtos rip ON rip.relatorio_inspecao_id = ri.id
        WHERE ri.id IN (${placeholders})
        GROUP BY ri.id, u.nome`,
        ids
      );
    }
    
    // Executar queries de estatísticas e totals em paralelo
    let statistics = { total: 0, aprovados: 0, reprovados: 0, parciais: 0 };
    let totalsResult = [];
    
    try {
      const [statsResult, totalsData] = await Promise.all([
        executeQuery(statsQuery, statsParams).catch(() => null),
        totalsQueryPromise ? totalsQueryPromise.catch(() => []) : Promise.resolve([])
      ]);
      
      if (statsResult && statsResult[0]) {
        statistics = statsResult[0];
      }
      totalsResult = totalsData || [];
    } catch (error) {
      // Continuar mesmo se falhar nas estatísticas ou totals
      console.error('Erro ao buscar estatísticas ou totals:', error);
    }

    // Mapear totals para os RIRs
    let rirsWithTotals = rirs;
    if (totalsResult.length > 0) {
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
    } else {
      // Se não houver totals, usar valores padrão
      rirsWithTotals = rirs.map(rir => {
        const { usuario_cadastro_id, ...rirWithoutId } = rir;
        return { ...rirWithoutId, total_produtos: 0, usuario_nome: '-' };
      });
    }

    // Retornar resposta no formato simples como produto-origem
    res.json({
      success: true,
      data: rirsWithTotals,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      },
      statistics: statistics
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

    // Buscar produtos da tabela relacionada
    const produtos = await RIRProdutosController.buscarProdutos(id);
    rir.produtos = produtos;

    successResponse(res, rir, 'Relatório de inspeção encontrado com sucesso');
  });
}

module.exports = RIRListController;

