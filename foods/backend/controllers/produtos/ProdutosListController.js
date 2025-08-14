/**
 * Controller de Listagem de Produtos
 * Responsável por listar e buscar produtos
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutosListController {
  
  /**
   * Listar produtos com paginação, busca e HATEOAS
   */
  static listarProdutos = asyncHandler(async (req, res) => {
    const { search = '', grupo_id, status } = req.query;
    const pagination = req.pagination;

    // Query base com joins
    let baseQuery = `
      SELECT 
        p.id,
        p.codigo_produto,
        p.nome,
        p.codigo_barras,
        p.fator_conversao,
        p.referencia_interna,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.nome_generico_id,
        p.marca_id,
        p.peso_liquido,
        p.peso_bruto,
        p.fabricante,
        p.informacoes_adicionais,
        p.foto_produto,
        p.prazo_validade,
        p.unidade_validade,
        p.regra_palet_un,
        p.ficha_homologacao,
        p.registro_especifico,
        p.comprimento,
        p.largura,
        p.altura,
        p.volume,
        p.integracao_senior,
        p.ncm,
        p.cest,
        p.cfop,
        p.ean,
        p.cst_icms,
        p.csosn,
        p.aliquota_icms,
        p.aliquota_ipi,
        p.aliquota_pis,
        p.aliquota_cofins,
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.tipo_registro,
        p.embalagem_secundaria_id,
        p.fator_conversao_embalagem,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome,
        ng.nome as nome_generico_nome,
        ue.nome as embalagem_secundaria_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
      LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
      LEFT JOIN usuarios uc ON p.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON p.usuario_atualizador_id = ua.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (p.nome LIKE ? OR p.codigo_produto LIKE ? OR p.codigo_barras LIKE ? OR p.referencia_mercado LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND p.status = ?';
      params.push(parseInt(status));
    }

    if (grupo_id) {
      baseQuery += ' AND p.grupo_id = ?';
      params.push(parseInt(grupo_id));
    }

    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação
    const limitNum = parseInt(pagination.limit);
    const offset = (parseInt(pagination.page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    // Executar query paginada
    const produtos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM produtos p
      WHERE 1=1${search ? ' AND (p.nome LIKE ? OR p.codigo_produto LIKE ? OR p.codigo_barras LIKE ? OR p.referencia_mercado LIKE ?)' : ''}${status !== undefined && status !== '' ? ' AND p.status = ?' : ''}${grupo_id ? ' AND p.grupo_id = ?' : ''}
    `;
    const countParams = [...params.slice(0, search ? 4 : 0), ...params.slice(search ? 4 : 0)];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inativos,
        SUM(CASE WHEN nome_generico_id IS NOT NULL THEN 1 ELSE 0 END) as com_nome_generico,
        SUM(CASE WHEN marca_id IS NOT NULL THEN 1 ELSE 0 END) as com_marca,
        SUM(CASE WHEN foto_produto IS NOT NULL THEN 1 ELSE 0 END) as com_foto
      FROM produtos
    `;
    const stats = await executeQuery(statsQuery);

    // Preparar resposta com HATEOAS
    const response = {
      data: {
        items: produtos,
        _meta: {
          pagination: {
            page: parseInt(pagination.page),
            limit: limitNum,
            totalItems,
            totalPages: Math.ceil(totalItems / limitNum)
          },
          statistics: stats[0]
        }
      }
    };

    return successResponse(res, response, STATUS_CODES.OK);
  });

  /**
   * Buscar produto por ID
   */
  static buscarProdutoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const produtos = await executeQuery(
      `SELECT 
        p.id,
        p.codigo_produto,
        p.nome,
        p.codigo_barras,
        p.fator_conversao,
        p.referencia_interna,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.nome_generico_id,
        p.marca_id,
        p.peso_liquido,
        p.peso_bruto,
        p.fabricante,
        p.informacoes_adicionais,
        p.foto_produto,
        p.prazo_validade,
        p.unidade_validade,
        p.regra_palet_un,
        p.ficha_homologacao,
        p.registro_especifico,
        p.comprimento,
        p.largura,
        p.altura,
        p.volume,
        p.integracao_senior,
        p.ncm,
        p.cest,
        p.cfop,
        p.ean,
        p.cst_icms,
        p.csosn,
        p.aliquota_icms,
        p.aliquota_ipi,
        p.aliquota_pis,
        p.aliquota_cofins,
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.tipo_registro,
        p.embalagem_secundaria_id,
        p.fator_conversao_embalagem,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome,
        ng.nome as nome_generico_nome,
        ue.nome as embalagem_secundaria_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
      LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
      LEFT JOIN usuarios uc ON p.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON p.usuario_atualizador_id = ua.id
      WHERE p.id = ?`,
      [id]
    );

    if (produtos.length === 0) {
      return notFoundResponse(res, 'Produto não encontrado');
    }

    const produto = produtos[0];

    return successResponse(res, produto, 'Produto encontrado com sucesso');
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

module.exports = ProdutosListController;
