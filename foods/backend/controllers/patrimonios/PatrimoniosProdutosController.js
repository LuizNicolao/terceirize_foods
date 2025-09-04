/**
 * Controller de Produtos de Patrimônios
 * Responsável por listar produtos que podem virar patrimônios
 */

const { executeQuery } = require('../../config/database');

/**
 * Listar produtos que podem virar patrimônios (grupo EQUIPAMENTO)
 */
const listarProdutosEquipamentos = async (req, res) => {
  try {
    const { search, limit = 100, page = 1 } = req.query;

    let baseQuery = `
      SELECT 
        p.id,
        p.codigo_produto,
        p.nome,
        um.nome as unidade_medida,
        g.nome as grupo,
        sg.nome as subgrupo,
        c.nome as classe,
        m.marca as marca,
        p.fabricante as fabricante
      FROM produtos p
      INNER JOIN unidades_medida um ON p.unidade_id = um.id
      INNER JOIN grupos g ON p.grupo_id = g.id
      INNER JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE g.nome = 'EQUIPAMENTO'
    `;
    
    let params = [];

    if (search) {
      baseQuery += ' AND (p.nome LIKE ? OR p.codigo_produto LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    const produtos = await executeQuery(query, params);

    // Contar total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM produtos p
      INNER JOIN grupos g ON p.grupo_id = g.id
      WHERE g.nome = 'EQUIPAMENTO'${search ? ' AND (p.nome LIKE ? OR p.codigo_produto LIKE ?)' : ''}
    `;
    
    const countParams = search ? [`%${search}%`, `%${search}%`] : [];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult && totalResult[0] ? totalResult[0].total : 0;

    res.json({
      success: true,
      data: produtos,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      }
    });

  } catch (error) {
    console.error('Erro ao listar produtos equipamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarProdutosEquipamentos
};
