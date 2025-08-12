const { executeQuery } = require('../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  conflictResponse,
  errorResponse,
  STATUS_CODES 
} = require('../middleware/responseHandler');
const { asyncHandler } = require('../middleware/responseHandler');

class UnidadesController {
  // Listar unidades com paginação, busca e HATEOAS
  static listarUnidades = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, nome, sigla, status, 
        criado_em, atualizado_em 
      FROM unidades_medida 
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtro de busca
    if (search) {
      baseQuery += ' AND (nome LIKE ? OR sigla LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Aplicar filtro por status
    if (status !== undefined && status !== '') {
      baseQuery += ' AND status = ?';
      params.push(status);
    }

    baseQuery += ' ORDER BY nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const unidades = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM unidades_medida WHERE 1=1${search ? ' AND (nome LIKE ? OR sigla LIKE ?)' : ''}${status !== undefined && status !== '' ? ' AND status = ?' : ''}`;
    const countParams = [];
    if (search) countParams.push(`%${search}%`, `%${search}%`);
    if (status !== undefined && status !== '') countParams.push(status);
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/unidades', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(unidades, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Unidades listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  // Buscar unidade por ID
  static buscarUnidadePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const unidades = await executeQuery(
      'SELECT id, nome, sigla, status, criado_em, atualizado_em FROM unidades_medida WHERE id = ?',
      [id]
    );

    if (unidades.length === 0) {
      return notFoundResponse(res, 'Unidade não encontrada');
    }

    // Buscar produtos que usam esta unidade
    const produtosQuery = `
      SELECT id, nome, codigo_barras, status
      FROM produtos 
      WHERE unidade_id = ?
      ORDER BY nome ASC
    `;
    const produtos = await executeQuery(produtosQuery, [id]);

    const unidade = unidades[0];
    unidade.produtos = produtos;
    unidade.total_produtos = produtos.length;

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(unidade);

    return successResponse(res, data, 'Unidade encontrada com sucesso');
  });

  // Criar unidade
  static criarUnidade = asyncHandler(async (req, res) => {
    const { nome, sigla, status = 1 } = req.body;

    // Verificar se já existe uma unidade com a mesma sigla
    const existingUnidade = await executeQuery(
      'SELECT id FROM unidades_medida WHERE sigla = ?',
      [sigla.toUpperCase()]
    );

    if (existingUnidade.length > 0) {
      return conflictResponse(res, 'Já existe uma unidade com esta sigla');
    }

    // Inserir unidade
    const insertQuery = `
      INSERT INTO unidades_medida (nome, sigla, status) 
      VALUES (?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      nome.trim(),
      sigla.toUpperCase().trim(),
      status
    ]);

    // Buscar unidade criada
    const newUnidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [result.insertId]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(newUnidade[0]);

    return successResponse(res, data, 'Unidade criada com sucesso', STATUS_CODES.CREATED);
  });

  // Atualizar unidade
  static atualizarUnidade = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, sigla, status } = req.body;

    // Verificar se a unidade existe
    const existingUnidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [id]
    );

    if (existingUnidade.length === 0) {
      return notFoundResponse(res, 'Unidade não encontrada');
    }

    // Verificar se já existe outra unidade com a mesma sigla
    if (sigla) {
      const existingUnidadeWithSigla = await executeQuery(
        'SELECT id FROM unidades_medida WHERE sigla = ? AND id != ?',
        [sigla.toUpperCase().trim(), id]
      );

      if (existingUnidadeWithSigla.length > 0) {
        return conflictResponse(res, 'Já existe outra unidade com esta sigla');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    if (nome !== undefined) {
      updateFields.push('nome = ?');
      updateParams.push(nome.trim());
    }
    if (sigla !== undefined) {
      updateFields.push('sigla = ?');
      updateParams.push(sigla.toUpperCase().trim());
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    // Sempre atualizar o timestamp
    updateFields.push('atualizado_em = CURRENT_TIMESTAMP');

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo foi fornecido para atualização', STATUS_CODES.BAD_REQUEST);
    }

    updateParams.push(id);
    await executeQuery(
      `UPDATE unidades_medida SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar unidade atualizada
    const updatedUnidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [id]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(updatedUnidade[0]);

    return successResponse(res, data, 'Unidade atualizada com sucesso');
  });

  // Excluir unidade
  static excluirUnidade = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se a unidade existe
    const unidade = await executeQuery(
      'SELECT * FROM unidades_medida WHERE id = ?',
      [id]
    );

    if (unidade.length === 0) {
      return notFoundResponse(res, 'Unidade não encontrada');
    }

    // Verificar se há produtos vinculados
    const produtos = await executeQuery(
      'SELECT id FROM produtos WHERE unidade_id = ?',
      [id]
    );

    if (produtos.length > 0) {
      return conflictResponse(res, `Não é possível excluir a unidade. Existem ${produtos.length} produto(s) vinculado(s) a ela.`);
    }

    // Excluir unidade
    await executeQuery('DELETE FROM unidades_medida WHERE id = ?', [id]);

    return successResponse(res, null, 'Unidade excluída com sucesso', STATUS_CODES.NO_CONTENT);
  });

  // Buscar unidades ativas
  static buscarUnidadesAtivas = asyncHandler(async (req, res) => {
    const unidades = await executeQuery(`
      SELECT 
        id, nome, sigla, status, 
        criado_em, atualizado_em
      FROM unidades_medida 
      WHERE status = 1
      ORDER BY nome ASC
    `);

    // Adicionar links HATEOAS
    const data = res.addListLinks(unidades);

    return successResponse(res, data, 'Unidades ativas listadas com sucesso');
  });

  // Buscar unidades por tipo (peso, volume, etc.)
  static buscarUnidadesPorTipo = asyncHandler(async (req, res) => {
    const { tipo } = req.params;

    // Mapeamento de tipos para siglas comuns
    const tiposUnidades = {
      'peso': ['KG', 'G', 'TON', 'LB', 'OZ'],
      'volume': ['L', 'ML', 'M3', 'CM3', 'GAL'],
      'comprimento': ['M', 'CM', 'MM', 'KM', 'IN', 'FT'],
      'area': ['M2', 'CM2', 'KM2', 'HA', 'AC'],
      'tempo': ['H', 'MIN', 'S', 'DIA', 'SEM', 'MES', 'ANO'],
      'quantidade': ['UN', 'PCT', 'CX', 'KG', 'L']
    };

    const siglas = tiposUnidades[tipo.toLowerCase()] || [];

    if (siglas.length === 0) {
      return errorResponse(res, 'Tipo de unidade não reconhecido', STATUS_CODES.BAD_REQUEST);
    }

    const placeholders = siglas.map(() => '?').join(',');
    const query = `
      SELECT 
        id, nome, sigla, status, 
        criado_em, atualizado_em
      FROM unidades_medida 
      WHERE sigla IN (${placeholders}) AND status = 1
      ORDER BY nome ASC
    `;

    const unidades = await executeQuery(query, siglas);

    // Adicionar links HATEOAS
    const data = res.addListLinks(unidades);

    return successResponse(res, data, 'Unidades por tipo listadas com sucesso');
  });

  // Listar tipos de unidades disponíveis
  static listarTiposUnidades = asyncHandler(async (req, res) => {
    const tipos = [
      { id: 'peso', nome: 'Peso', descricao: 'Unidades de peso (kg, g, ton, etc.)' },
      { id: 'volume', nome: 'Volume', descricao: 'Unidades de volume (l, ml, m³, etc.)' },
      { id: 'comprimento', nome: 'Comprimento', descricao: 'Unidades de comprimento (m, cm, mm, etc.)' },
      { id: 'area', nome: 'Área', descricao: 'Unidades de área (m², cm², ha, etc.)' },
      { id: 'tempo', nome: 'Tempo', descricao: 'Unidades de tempo (h, min, s, etc.)' },
      { id: 'quantidade', nome: 'Quantidade', descricao: 'Unidades de quantidade (un, pct, cx, etc.)' }
    ];

    return successResponse(res, tipos, 'Tipos de unidades listados com sucesso');
  });

  // Buscar unidades mais utilizadas
  static buscarUnidadesMaisUtilizadas = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const query = `
      SELECT 
        u.id, u.nome, u.sigla, u.status,
        COUNT(p.id) as total_produtos
      FROM unidades_medida u
      LEFT JOIN produtos p ON u.id = p.unidade_id
      WHERE u.status = 1
      GROUP BY u.id, u.nome, u.sigla, u.status
      ORDER BY total_produtos DESC, u.nome ASC
      LIMIT ?
    `;

    const unidades = await executeQuery(query, [parseInt(limit)]);

    // Adicionar links HATEOAS
    const data = res.addListLinks(unidades);

    return successResponse(res, data, 'Unidades mais utilizadas listadas com sucesso');
  });

  /**
   * Obter permissões do usuário atual
   */
  static getUserPermissions(user) {
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    if (user.tipo_de_acesso === 'administrador') {
      return ['visualizar', 'criar', 'editar', 'excluir'];
    }

    return accessLevels[user.nivel_de_acesso] || [];
  }
}

module.exports = UnidadesController; 