/**
 * Controller de Busca de Produtos
 * Responsável por operações de busca avançada
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutosSearchController {
  
  /**
   * Busca avançada de produtos
   */
  static buscaAvancada = asyncHandler(async (req, res) => {
    const { 
      search, grupo_id, subgrupo_id, classe_id, marca_id, nome_generico_id,
      status, unidade_id, fabricante, tipo_registro
    } = req.query;
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
        p.tipo_registro,
        p.embalagem_secundaria_id,
        p.fator_conversao_embalagem,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome,
        ng.nome as nome_generico_nome,
        ue.nome as embalagem_secundaria_nome
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
      LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (p.nome LIKE ? OR p.codigo_produto LIKE ? OR p.codigo_barras LIKE ? OR p.referencia_mercado LIKE ? OR p.fabricante LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND p.status = ?';
      params.push(parseInt(status));
    }

    if (grupo_id) {
      baseQuery += ' AND p.grupo_id = ?';
      params.push(parseInt(grupo_id));
    }

    if (subgrupo_id) {
      baseQuery += ' AND p.subgrupo_id = ?';
      params.push(parseInt(subgrupo_id));
    }

    if (classe_id) {
      baseQuery += ' AND p.classe_id = ?';
      params.push(parseInt(classe_id));
    }

    if (marca_id) {
      baseQuery += ' AND p.marca_id = ?';
      params.push(parseInt(marca_id));
    }

    if (nome_generico_id) {
      baseQuery += ' AND p.nome_generico_id = ?';
      params.push(parseInt(nome_generico_id));
    }

    if (unidade_id) {
      baseQuery += ' AND p.unidade_id = ?';
      params.push(parseInt(unidade_id));
    }

    if (fabricante) {
      baseQuery += ' AND p.fabricante LIKE ?';
      params.push(`%${fabricante}%`);
    }

    if (tipo_registro) {
      baseQuery += ' AND p.tipo_registro = ?';
      params.push(tipo_registro);
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
      WHERE 1=1${search ? ' AND (p.nome LIKE ? OR p.codigo_produto LIKE ? OR p.codigo_barras LIKE ? OR p.referencia_mercado LIKE ? OR p.fabricante LIKE ?)' : ''}${status !== undefined && status !== '' ? ' AND p.status = ?' : ''}${grupo_id ? ' AND p.grupo_id = ?' : ''}${subgrupo_id ? ' AND p.subgrupo_id = ?' : ''}${classe_id ? ' AND p.classe_id = ?' : ''}${marca_id ? ' AND p.marca_id = ?' : ''}${nome_generico_id ? ' AND p.nome_generico_id = ?' : ''}${unidade_id ? ' AND p.unidade_id = ?' : ''}${fabricante ? ' AND p.fabricante LIKE ?' : ''}${tipo_registro ? ' AND p.tipo_registro = ?' : ''}
    `;
    const countParams = [...params.slice(0, search ? 5 : 0), ...params.slice(search ? 5 : 0)];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

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
          }
        }
      }
    };

    return successResponse(res, response, STATUS_CODES.OK);
  });

  /**
   * Buscar produtos ativos
   */
  static buscarProdutosAtivos = asyncHandler(async (req, res) => {
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
        p.tipo_registro,
        p.embalagem_secundaria_id,
        p.fator_conversao_embalagem,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome,
        ng.nome as nome_generico_nome,
        ue.nome as embalagem_secundaria_nome
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
      LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
      WHERE p.status = 1
    `;
    
    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação
    const limitNum = parseInt(pagination.limit);
    const offset = (parseInt(pagination.page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    // Executar query paginada
    const produtos = await executeQuery(query);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM produtos WHERE status = 1`;
    const totalResult = await executeQuery(countQuery);
    const totalItems = totalResult[0].total;

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
          }
        }
      }
    };

    return successResponse(res, response, STATUS_CODES.OK);
  });
}

module.exports = ProdutosSearchController;
