/**
 * Controller de Listagem de Ficha Homologação
 * Responsável por operações de busca e listagem
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class FichaHomologacaoListController {
  
  /**
   * Listar fichas de homologação com paginação e busca
   */
  static listarFichasHomologacao = asyncHandler(async (req, res) => {
    const { search, status, tipo, produto_generico_id, fornecedor_id, avaliador_id, sortField, sortDirection, page = 1, limit = 10 } = req.query;
    
    let baseQuery = `
      SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        m.marca as marca_nome,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_nome_fantasia,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome,
        u.email as avaliador_email
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (ng.nome LIKE ? OR ng.codigo LIKE ? OR f.razao_social LIKE ? OR f.nome_fantasia LIKE ? OR m.marca LIKE ? OR fh.fabricante LIKE ? OR fh.lote LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND fh.status = ?';
      params.push(status);
    }

    if (tipo) {
      baseQuery += ' AND fh.tipo = ?';
      params.push(tipo);
    }

    if (produto_generico_id) {
      baseQuery += ' AND fh.produto_generico_id = ?';
      params.push(parseInt(produto_generico_id));
    }

    if (fornecedor_id) {
      baseQuery += ' AND fh.fornecedor_id = ?';
      params.push(parseInt(fornecedor_id));
    }

    if (avaliador_id) {
      baseQuery += ' AND fh.avaliador_id = ?';
      params.push(parseInt(avaliador_id));
    }

    // Aplicar ordenação
    let orderBy = 'fh.data_analise DESC, fh.criado_em DESC';
    if (sortField && sortDirection) {
      const validFields = ['data_analise', 'tipo', 'status', 'nome_generico_nome', 'fornecedor_nome', 'marca_nome', 'avaliador_nome'];
      if (validFields.includes(sortField)) {
        const direction = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        // Mapear campos para colunas do banco
        const fieldMap = {
          'data_analise': 'fh.data_analise',
          'tipo': 'fh.tipo',
          'status': 'fh.status',
          'nome_generico_nome': 'ng.nome',
          'fornecedor_nome': 'f.razao_social',
          'marca_nome': 'm.marca',
          'avaliador_nome': 'u.nome'
        };
        
        orderBy = `${fieldMap[sortField]} ${direction}`;
      }
    }
    baseQuery += ` ORDER BY ${orderBy}`;

    // Aplicar paginação
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    const query = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
    
    // Executar query paginada
    const fichasHomologacao = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      WHERE 1=1${search ? ' AND (ng.nome LIKE ? OR ng.codigo LIKE ? OR f.nome LIKE ? OR m.marca LIKE ? OR fh.fabricante LIKE ? OR fh.lote LIKE ?)' : ''}${status !== undefined && status !== '' ? ' AND fh.status = ?' : ''}${tipo ? ' AND fh.tipo = ?' : ''}${produto_generico_id ? ' AND fh.produto_generico_id = ?' : ''}${fornecedor_id ? ' AND fh.fornecedor_id = ?' : ''}${avaliador_id ? ' AND fh.avaliador_id = ?' : ''}
    `;
    const countParams = params;
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as ativas,
        SUM(CASE WHEN status = 'inativo' THEN 1 ELSE 0 END) as inativas,
        SUM(CASE WHEN tipo = 'NOVO_PRODUTO' THEN 1 ELSE 0 END) as novos_produtos,
        SUM(CASE WHEN tipo = 'REAVALIACAO' THEN 1 ELSE 0 END) as reavaliacoes
      FROM ficha_homologacao
    `;
    
    const stats = await executeQuery(statsQuery);

    const response = {
      success: true,
      data: fichasHomologacao,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      },
      statistics: stats[0]
    };
    
    res.json(response);
  });

  /**
   * Buscar ficha de homologação por ID
   */
  static buscarFichaHomologacaoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const fichaHomologacao = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        m.marca as marca_nome,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_nome_fantasia,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome,
        u.email as avaliador_email
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE fh.id = ?`,
      [id]
    );

    if (fichaHomologacao.length === 0) {
      return notFoundResponse(res, 'Ficha de homologação não encontrada');
    }

    successResponse(res, fichaHomologacao[0], 'Ficha de homologação encontrada');
  });

  /**
   * Buscar fichas de homologação ativas
   */
  static buscarFichasHomologacaoAtivas = asyncHandler(async (req, res) => {
    const fichasHomologacao = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        m.marca as marca_nome,
        f.razao_social as fornecedor_nome,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE fh.status = 'ativo'
      ORDER BY fh.data_analise DESC`
    );

    successResponse(res, fichasHomologacao, 'Fichas de homologação ativas encontradas');
  });

  /**
   * Buscar fichas de homologação por tipo
   */
  static buscarFichasHomologacaoPorTipo = asyncHandler(async (req, res) => {
    const { tipo } = req.params;

    if (!['NOVO_PRODUTO', 'REAVALIACAO'].includes(tipo)) {
      return errorResponse(res, 'Tipo inválido. Deve ser NOVO_PRODUTO ou REAVALIACAO', STATUS_CODES.BAD_REQUEST);
    }

    const fichasHomologacao = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        m.marca as marca_nome,
        f.razao_social as fornecedor_nome,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE fh.tipo = ? AND fh.status = 'ativo'
      ORDER BY fh.data_analise DESC`,
      [tipo]
    );

    successResponse(res, fichasHomologacao, 'Fichas de homologação encontradas');
  });

  /**
   * Buscar fichas de homologação por nome genérico
   */
  static buscarFichasHomologacaoPorNomeGenerico = asyncHandler(async (req, res) => {
    const { produto_generico_id } = req.params;

    const fichasHomologacao = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        m.marca as marca_nome,
        f.razao_social as fornecedor_nome,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE fh.produto_generico_id = ?
      ORDER BY fh.data_analise DESC`,
      [produto_generico_id]
    );

    successResponse(res, fichasHomologacao, 'Fichas de homologação encontradas');
  });

  /**
   * Buscar fichas de homologação por fornecedor
   */
  static buscarFichasHomologacaoPorFornecedor = asyncHandler(async (req, res) => {
    const { fornecedor_id } = req.params;

    const fichasHomologacao = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        m.marca as marca_nome,
        f.razao_social as fornecedor_nome,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE fh.fornecedor_id = ?
      ORDER BY fh.data_analise DESC`,
      [fornecedor_id]
    );

    successResponse(res, fichasHomologacao, 'Fichas de homologação encontradas');
  });

  /**
   * Buscar fichas de homologação por avaliador
   */
  static buscarFichasHomologacaoPorAvaliador = asyncHandler(async (req, res) => {
    const { avaliador_id } = req.params;

    const fichasHomologacao = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        m.marca as marca_nome,
        f.razao_social as fornecedor_nome,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN marcas m ON fh.marca_id = m.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE fh.avaliador_id = ?
      ORDER BY fh.data_analise DESC`,
      [avaliador_id]
    );

    successResponse(res, fichasHomologacao, 'Fichas de homologação encontradas');
  });
}

module.exports = FichaHomologacaoListController;

