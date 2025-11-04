/**
 * Controller de Listagem de Pedidos de Compras
 * Responsável por listar e buscar pedidos de compras
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class PedidosComprasListController {
  
  /**
   * Listar pedidos de compras com paginação, busca e HATEOAS
   */
  static listarPedidosCompras = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        p.id,
        p.numero_pedido,
        p.solicitacao_compras_id,
        p.fornecedor_nome,
        p.fornecedor_cnpj,
        p.filial_nome,
        p.data_entrega_cd,
        p.valor_total,
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.criado_por,
        s.numero_solicitacao,
        u.nome as criado_por_nome,
        DATE_FORMAT(p.criado_em, '%d/%m/%Y %H:%i') as data_criacao,
        DATE_FORMAT(p.data_entrega_cd, '%d/%m/%Y') as data_entrega_formatada,
        (SELECT COUNT(*) FROM pedido_compras_itens WHERE pedido_id = p.id) as total_itens
      FROM pedidos_compras p
      LEFT JOIN solicitacoes_compras s ON p.solicitacao_compras_id = s.id
      LEFT JOIN usuarios u ON p.criado_por = u.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (p.numero_pedido LIKE ? OR p.fornecedor_nome LIKE ? OR p.filial_nome LIKE ? OR s.numero_solicitacao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== '') {
      baseQuery += ' AND p.status = ?';
      params.push(status);
    }

    baseQuery += ' ORDER BY p.criado_em DESC';

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const pedidos = await executeQuery(query, params);

    // Contar total de registros
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM pedidos_compras p
      LEFT JOIN solicitacoes_compras s ON p.solicitacao_compras_id = s.id
      WHERE 1=1
    `;
    
    if (search) {
      countQuery += ' AND (p.numero_pedido LIKE ? OR p.fornecedor_nome LIKE ? OR p.filial_nome LIKE ? OR s.numero_solicitacao LIKE ?)';
    }
    
    if (status && status !== '') {
      countQuery += ' AND p.status = ?';
    }
    
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/pedidos-compras', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(pedidos, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, pedidos, 'Pedidos de compras listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions,
      _links: res.addListLinks(pedidos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar pedido de compras por ID
   */
  static buscarPedidoComprasPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar pedido
    const pedidos = await executeQuery(
      `SELECT 
        p.*,
        s.numero_solicitacao,
        u.nome as criado_por_nome,
        DATE_FORMAT(p.criado_em, '%d/%m/%Y %H:%i') as data_criacao,
        DATE_FORMAT(p.atualizado_em, '%d/%m/%Y %H:%i') as data_atualizacao,
        DATE_FORMAT(p.data_entrega_cd, '%d/%m/%Y') as data_entrega_formatada
      FROM pedidos_compras p
      LEFT JOIN solicitacoes_compras s ON p.solicitacao_compras_id = s.id
      LEFT JOIN usuarios u ON p.criado_por = u.id
      WHERE p.id = ?`,
      [id]
    );

    if (pedidos.length === 0) {
      return notFoundResponse(res, 'Pedido de compras não encontrado');
    }

    const pedido = pedidos[0];

    // Buscar itens do pedido
    const itens = await executeQuery(
      `SELECT 
        pci.*,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo
      FROM pedido_compras_itens pci
      LEFT JOIN produto_generico pg ON pci.produto_generico_id = pg.id
      WHERE pci.pedido_id = ?
      ORDER BY pci.id`,
      [id]
    );

    pedido.itens = itens;

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(pedido);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, pedido.id);

    return successResponse(res, pedido, 'Pedido de compras encontrado', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Buscar solicitações disponíveis para criar pedido (para uso em selects)
   */
  static buscarSolicitacoesDisponiveis = asyncHandler(async (req, res) => {
    const solicitacoes = await executeQuery(
      `SELECT 
        s.id,
        s.numero_solicitacao,
        s.filial_id,
        s.data_entrega_cd,
        s.semana_abastecimento,
        s.status,
        f.filial as filial_nome,
        f.codigo_filial as filial_codigo
      FROM solicitacoes_compras s
      LEFT JOIN filiais f ON s.filial_id = f.id
      WHERE s.status IN ('aberto', 'parcial')
      ORDER BY s.criado_em DESC`
    );

    return successResponse(res, solicitacoes, 'Solicitações disponíveis listadas com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar itens da solicitação com saldo disponível
   * Endpoint: GET /api/pedidos-compras/itens-solicitacao/:id
   */
  static buscarItensSolicitacao = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar dados da solicitação
    const [solicitacao] = await executeQuery(
      `SELECT 
        s.*,
        f.filial as filial_nome,
        f.codigo_filial as filial_codigo
      FROM solicitacoes_compras s
      LEFT JOIN filiais f ON s.filial_id = f.id
      WHERE s.id = ?`,
      [id]
    );

    if (!solicitacao) {
      return notFoundResponse(res, 'Solicitação de compras não encontrada');
    }

    // Buscar itens da solicitação
    const itens = await executeQuery(
      `SELECT 
        sci.*,
        pg.nome as produto_nome,
        pg.codigo as codigo_produto,
        um.sigla as unidade_simbolo,
        um.nome as unidade_nome
      FROM solicitacao_compras_itens sci
      LEFT JOIN produto_generico pg ON sci.produto_id = pg.id
      LEFT JOIN unidades_medida um ON sci.unidade_medida_id = um.id
      WHERE sci.solicitacao_id = ?
      ORDER BY sci.id`,
      [id]
    );

    // Calcular saldo disponível para cada item
    const itensComSaldo = await Promise.all(
      itens.map(async (item) => {
        // Buscar quantidades já utilizadas em pedidos
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
        const quantidade_solicitada = parseFloat(item.quantidade || 0);
        const saldo_disponivel = quantidade_solicitada - quantidade_utilizada;

        return {
          ...item,
          quantidade_solicitada,
          quantidade_utilizada,
          saldo_disponivel: Math.max(0, saldo_disponivel) // Garantir que não seja negativo
        };
      })
    );

    return successResponse(res, {
      solicitacao: {
        id: solicitacao.id,
        numero_solicitacao: solicitacao.numero_solicitacao,
        filial_id: solicitacao.filial_id,
        filial_nome: solicitacao.filial_nome,
        filial_codigo: solicitacao.filial_codigo,
        data_entrega_cd: solicitacao.data_entrega_cd,
        semana_abastecimento: solicitacao.semana_abastecimento,
        motivo: solicitacao.motivo
      },
      itens: itensComSaldo
    }, 'Itens da solicitação encontrados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar dados completos da filial (para faturamento, cobrança, entrega)
   * Endpoint: GET /api/pedidos-compras/dados-filial/:id
   */
  static buscarDadosFilial = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [filial] = await executeQuery(
      `SELECT 
        id,
        filial,
        codigo_filial,
        cnpj,
        razao_social,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        supervisao,
        coordenacao,
        status
      FROM filiais
      WHERE id = ?`,
      [id]
    );

    if (!filial) {
      return notFoundResponse(res, 'Filial não encontrada');
    }

    // Montar endereço completo
    const endereco = [
      filial.logradouro || '',
      filial.numero || '',
      filial.bairro ? `- ${filial.bairro}` : '',
      filial.cidade ? `- ${filial.cidade}` : '',
      filial.estado ? `/${filial.estado}` : '',
      filial.cep ? `- CEP: ${filial.cep}` : ''
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

    return successResponse(res, {
      ...filial,
      endereco_completo: endereco
    }, 'Dados da filial encontrados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter permissões do usuário (helper)
   */
  static getUserPermissions(user) {
    // Implementação básica - ajustar conforme necessário
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = PedidosComprasListController;

