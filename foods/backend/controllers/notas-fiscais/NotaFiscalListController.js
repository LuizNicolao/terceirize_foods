/**
 * Controller de Listagem de Notas Fiscais
 * Responsável por listar e buscar notas fiscais
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse,
  errorResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class NotaFiscalListController {
  
  /**
   * Listar notas fiscais com paginação, busca e HATEOAS
   */
  static listarNotasFiscais = asyncHandler(async (req, res) => {
    const { search = '', status, tipo_nota, fornecedor_id, filial_id, data_inicio, data_fim } = req.query;
    const pagination = req.pagination;

    // Query base com JOINs
    let baseQuery = `
      SELECT 
        nf.id, 
        nf.tipo_nota,
        nf.numero_nota,
        nf.serie,
        nf.chave_acesso,
        nf.fornecedor_id,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_fantasia,
        nf.filial_id,
        fil.filial as filial_nome,
        fil.codigo_filial,
        nf.almoxarifado_id,
        a.codigo as almoxarifado_codigo,
        a.nome as almoxarifado_nome,
        nf.data_emissao,
        nf.data_saida,
        nf.valor_produtos,
        nf.valor_frete,
        nf.valor_seguro,
        nf.valor_desconto,
        nf.valor_outras_despesas,
        nf.valor_ipi,
        nf.valor_icms,
        nf.valor_icms_st,
        nf.valor_pis,
        nf.valor_cofins,
        nf.valor_total,
        nf.natureza_operacao,
        nf.cfop,
        nf.tipo_frete,
        nf.status,
        nf.xml_path as xml_path,
        nf.usuario_cadastro_id,
        uc.nome as usuario_cadastro_nome,
        nf.usuario_lancamento_id,
        ul.nome as usuario_lancamento_nome,
        nf.data_lancamento,
        nf.data_cadastro,
        nf.criado_em,
        nf.atualizado_em
      FROM notas_fiscais nf
      LEFT JOIN fornecedores f ON nf.fornecedor_id = f.id
      LEFT JOIN filiais fil ON nf.filial_id = fil.id
      LEFT JOIN almoxarifado a ON nf.almoxarifado_id = a.id
      LEFT JOIN usuarios uc ON nf.usuario_cadastro_id = uc.id
      LEFT JOIN usuarios ul ON nf.usuario_lancamento_id = ul.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (nf.numero_nota LIKE ? OR nf.serie LIKE ? OR nf.chave_acesso LIKE ? OR f.razao_social LIKE ? OR f.nome_fantasia LIKE ? OR fil.filial LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      baseQuery += ' AND nf.status = ?';
      params.push(status);
    }

    if (tipo_nota) {
      baseQuery += ' AND nf.tipo_nota = ?';
      params.push(tipo_nota);
    }

    if (fornecedor_id) {
      baseQuery += ' AND nf.fornecedor_id = ?';
      params.push(fornecedor_id);
    }

    if (filial_id) {
      baseQuery += ' AND nf.filial_id = ?';
      params.push(filial_id);
    }

    if (data_inicio) {
      baseQuery += ' AND nf.data_emissao >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      baseQuery += ' AND nf.data_emissao <= ?';
      params.push(data_fim);
    }

    baseQuery += ' ORDER BY nf.data_emissao DESC, nf.numero_nota DESC';

    // Aplicar paginação
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const notasFiscais = await executeQuery(query, params);

    // Contar total de registros
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM notas_fiscais nf
      LEFT JOIN fornecedores f ON nf.fornecedor_id = f.id
      LEFT JOIN filiais fil ON nf.filial_id = fil.id
      WHERE 1=1
    `;
    
    let countParams = [];
    
    if (search) {
      countQuery += ' AND (nf.numero_nota LIKE ? OR nf.serie LIKE ? OR nf.chave_acesso LIKE ? OR f.razao_social LIKE ? OR f.nome_fantasia LIKE ? OR fil.filial LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      countQuery += ' AND nf.status = ?';
      countParams.push(status);
    }
    
    if (tipo_nota) {
      countQuery += ' AND nf.tipo_nota = ?';
      countParams.push(tipo_nota);
    }
    
    if (fornecedor_id) {
      countQuery += ' AND nf.fornecedor_id = ?';
      countParams.push(fornecedor_id);
    }
    
    if (filial_id) {
      countQuery += ' AND nf.filial_id = ?';
      countParams.push(filial_id);
    }
    
    if (data_inicio) {
      countQuery += ' AND nf.data_emissao >= ?';
      countParams.push(data_inicio);
    }
    
    if (data_fim) {
      countQuery += ' AND nf.data_emissao <= ?';
      countParams.push(data_fim);
    }

    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/notas-fiscais', queryParams);

    // Adicionar links HATEOAS (retorna { items, _links, _meta })
    const data = res.addListLinks(notasFiscais, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    // data já contém { items, _links, _meta }
    return successResponse(res, data, 'Notas fiscais listadas com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Buscar nota fiscal por ID
   */
  static buscarNotaFiscalPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = `
      SELECT 
        nf.*,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_fantasia,
        f.cnpj as fornecedor_cnpj,
        f.email as fornecedor_email,
        f.logradouro as fornecedor_logradouro,
        f.numero as fornecedor_numero,
        f.cep as fornecedor_cep,
        f.bairro as fornecedor_bairro,
        f.municipio as fornecedor_municipio,
        f.uf as fornecedor_uf,
        fil.filial as filial_nome,
        fil.codigo_filial,
        fil.cnpj as filial_cnpj,
        fil.razao_social as filial_razao_social,
        fil.logradouro as filial_logradouro,
        fil.numero as filial_numero,
        fil.cep as filial_cep,
        fil.bairro as filial_bairro,
        fil.cidade as filial_cidade,
        fil.estado as filial_estado,
        a.codigo as almoxarifado_codigo,
        a.nome as almoxarifado_nome,
        uc.nome as usuario_cadastro_nome,
        ul.nome as usuario_lancamento_nome
      FROM notas_fiscais nf
      LEFT JOIN fornecedores f ON nf.fornecedor_id = f.id
      LEFT JOIN filiais fil ON nf.filial_id = fil.id
      LEFT JOIN almoxarifado a ON nf.almoxarifado_id = a.id
      LEFT JOIN usuarios uc ON nf.usuario_cadastro_id = uc.id
      LEFT JOIN usuarios ul ON nf.usuario_lancamento_id = ul.id
      WHERE nf.id = ?
    `;

    const notasFiscais = await executeQuery(query, [id]);

    if (notasFiscais.length === 0) {
      return notFoundResponse(res, 'Nota fiscal não encontrada');
    }

    // Buscar itens da nota fiscal
    const itensQuery = `
      SELECT 
        nfi.*,
        pg.nome as produto_nome,
        pg.codigo as produto_codigo
      FROM notas_fiscais_itens nfi
      LEFT JOIN produto_generico pg ON nfi.produto_generico_id = pg.id
      WHERE nfi.nota_fiscal_id = ?
      ORDER BY nfi.numero_item ASC
    `;

    const itens = await executeQuery(itensQuery, [id]);

    const notaFiscal = {
      ...notasFiscais[0],
      itens
    };

    return successResponse(res, notaFiscal);
  });

  /**
   * Buscar quantidades já lançadas em notas fiscais para um pedido de compra
   * Retorna um objeto com as quantidades já lançadas por produto
   */
  static buscarQuantidadesLancadas = asyncHandler(async (req, res) => {
    const { pedido_compra_id } = req.params;

    if (!pedido_compra_id) {
      return errorResponse(res, 'ID do pedido de compra é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Se estiver editando uma nota fiscal, excluir ela do cálculo
    const { nota_fiscal_id } = req.query;
    const notaFiscalIdParam = nota_fiscal_id ? parseInt(nota_fiscal_id) : null;

    // Buscar quantidades já lançadas agrupadas por produto
    let query = `
      SELECT 
        pci.id as pedido_item_id,
        pci.produto_generico_id,
        COALESCE(SUM(CASE WHEN nf.status = 'LANCADA' 
          THEN nfi.quantidade ELSE 0 END), 0) as quantidade_lancada
      FROM pedido_compras_itens pci
      LEFT JOIN notas_fiscais nf ON nf.pedido_compra_id = pci.pedido_id
      LEFT JOIN notas_fiscais_itens nfi ON nfi.nota_fiscal_id = nf.id 
        AND nfi.produto_generico_id = pci.produto_generico_id
      WHERE pci.pedido_id = ?
    `;
    
    const params = [pedido_compra_id];
    
    // Se estiver editando uma nota fiscal, excluir ela do cálculo
    if (notaFiscalIdParam) {
      query += ' AND (nf.id IS NULL OR nf.id != ?)';
      params.push(notaFiscalIdParam);
    }
    
    query += ' GROUP BY pci.id, pci.produto_generico_id';
    
    const quantidades = await executeQuery(query, params);

    // Transformar em um objeto mais fácil de usar no frontend
    const quantidadesMap = {};
    quantidades.forEach(item => {
      const key = item.produto_generico_id 
        ? `produto_${item.produto_generico_id}` 
        : `item_${item.pedido_item_id}`;
      quantidadesMap[key] = parseFloat(item.quantidade_lancada) || 0;
      // Também criar uma chave pelo pedido_item_id para facilitar
      quantidadesMap[`item_${item.pedido_item_id}`] = parseFloat(item.quantidade_lancada) || 0;
    });

    return successResponse(res, quantidadesMap, 'Quantidades lançadas recuperadas com sucesso');
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões se necessário
    return [];
  }
}

module.exports = NotaFiscalListController;

