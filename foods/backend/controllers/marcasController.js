/**
 * Controller de Marcas
 * Implementa todas as operações CRUD com padrões RESTful, HATEOAS e paginação
 */

const { executeQuery } = require('../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  conflictResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../middleware/responseHandler');
const { asyncHandler } = require('../middleware/responseHandler');

class MarcasController {
  
  /**
   * Listar marcas com paginação, busca e HATEOAS
   */
  static listarMarcas = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;
    const pagination = req.pagination;

    // Query base com contagem de produtos
    let baseQuery = `
      SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
      FROM marcas m
      LEFT JOIN produtos p ON m.marca = p.marca
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (m.marca LIKE ? OR m.fabricante LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND m.status = ?';
      params.push(status);
    }

    baseQuery += ' GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em ORDER BY m.marca ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const marcas = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(DISTINCT m.id) as total FROM marcas m WHERE 1=1${search ? ' AND (m.marca LIKE ? OR m.fabricante LIKE ?)' : ''}${status !== undefined ? ' AND m.status = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/marcas', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(marcas, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Marcas listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar marca por ID
   */
  static buscarMarcaPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const marcas = await executeQuery(
      `SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
       FROM marcas m
       LEFT JOIN produtos p ON m.marca = p.marca
       WHERE m.id = ?
       GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em`,
      [id]
    );

    if (marcas.length === 0) {
      return notFoundResponse(res, 'Marca não encontrada');
    }

    const marca = marcas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(marca);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, marca.id);

    return successResponse(res, data, 'Marca encontrada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Criar nova marca
   */
  static criarMarca = asyncHandler(async (req, res) => {
    const { marca, fabricante, status } = req.body;

    // Verificar se marca já existe
    const existingMarca = await executeQuery(
      'SELECT id FROM marcas WHERE marca = ?',
      [marca]
    );

    if (existingMarca.length > 0) {
      return conflictResponse(res, 'Marca já cadastrada');
    }

    // Inserir marca
    const result = await executeQuery(
      'INSERT INTO marcas (marca, fabricante, status, criado_em) VALUES (?, ?, ?, NOW())',
      [marca, fabricante, status || 1]
    );

    const novaMarcaId = result.insertId;

    // Buscar marca criada
    const marcas = await executeQuery(
      `SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
       FROM marcas m
       LEFT JOIN produtos p ON m.marca = p.marca
       WHERE m.id = ?
       GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em`,
      [novaMarcaId]
    );

    const marcaCriada = marcas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(marcaCriada);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, marcaCriada.id);

    return successResponse(res, data, 'Marca criada com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar marca
   */
  static atualizarMarca = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se marca existe
    const existingMarca = await executeQuery(
      'SELECT id, marca FROM marcas WHERE id = ?',
      [id]
    );

    if (existingMarca.length === 0) {
      return notFoundResponse(res, 'Marca não encontrada');
    }

    // Verificar se marca já existe (se estiver sendo alterada)
    if (updateData.marca) {
      const marcaCheck = await executeQuery(
        'SELECT id FROM marcas WHERE marca = ? AND id != ?',
        [updateData.marca, id]
      );

      if (marcaCheck.length > 0) {
        return conflictResponse(res, 'Marca já cadastrada');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateParams.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('atualizado_em = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE marcas SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar marca atualizada
    const marcas = await executeQuery(
      `SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
       FROM marcas m
       LEFT JOIN produtos p ON m.marca = p.marca
       WHERE m.id = ?
       GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em`,
      [id]
    );

    const marca = marcas[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(marca);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, marca.id);

    return successResponse(res, data, 'Marca atualizada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Desativar marca (soft delete)
   */
  static excluirMarca = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se marca existe
    const existingMarca = await executeQuery(
      'SELECT id, marca FROM marcas WHERE id = ?',
      [id]
    );

    if (existingMarca.length === 0) {
      return notFoundResponse(res, 'Marca não encontrada');
    }

    // Verificar se marca está sendo usada em produtos ATIVOS
    const produtos = await executeQuery(
      'SELECT id, nome, status FROM produtos WHERE marca = ? AND status = 1',
      [existingMarca[0].marca]
    );

    if (produtos.length > 0) {
      let mensagem = `Marca não pode ser desativada pois possui ${produtos.length} produto(s) ativo(s) vinculado(s):`;
      mensagem += `\n- ${produtos.map(p => p.nome).join(', ')}`;
      mensagem += '\n\nPara desativar a marca, primeiro desative todos os produtos vinculados.';
      
      return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
    }

    // Excluir marca (soft delete - alterar status para 0)
    await executeQuery(
      'UPDATE marcas SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Marca desativada com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Buscar marcas ativas
   */
  static buscarAtivas = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
      FROM marcas m
      LEFT JOIN produtos p ON m.marca = p.marca
      WHERE m.status = 1
      GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em
    `;
    
    let params = [];
    baseQuery += ' ORDER BY m.marca ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const marcas = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM marcas WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/marcas/ativas', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(marcas, meta.pagination, queryParams);

    return successResponse(res, data, 'Marcas ativas listadas com sucesso', STATUS_CODES.OK, meta);
  });

  /**
   * Buscar marcas por fabricante
   */
  static buscarPorFabricante = asyncHandler(async (req, res) => {
    const { fabricante } = req.params;
    const pagination = req.pagination;

    // Query base para marcas do fabricante
    let baseQuery = `
      SELECT 
        m.id, 
        m.marca, 
        m.fabricante,
        m.status, 
        m.criado_em,
        m.atualizado_em,
        COUNT(p.id) as total_produtos
      FROM marcas m
      LEFT JOIN produtos p ON m.marca = p.marca
      WHERE m.fabricante LIKE ?
      GROUP BY m.id, m.marca, m.fabricante, m.status, m.criado_em, m.atualizado_em
    `;
    
    let params = [`%${fabricante}%`];
    baseQuery += ' ORDER BY m.marca ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const marcas = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM marcas WHERE fabricante LIKE ?`;
    const totalResult = await executeQuery(countQuery, [`%${fabricante}%`]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/marcas/fabricante/${fabricante}`, queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(marcas, meta.pagination, queryParams);

    return successResponse(res, data, `Marcas do fabricante ${fabricante} listadas com sucesso`, STATUS_CODES.OK, meta);
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

module.exports = MarcasController; 