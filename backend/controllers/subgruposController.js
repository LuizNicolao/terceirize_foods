/**
 * Controller de Subgrupos
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

class SubgruposController {
  
  /**
   * Listar subgrupos com paginação, busca e HATEOAS
   */
  static listarSubgrupos = asyncHandler(async (req, res) => {
    const { search = '', grupo_id, status } = req.query;
    const pagination = req.pagination;

    // Query base com informações do grupo
    let baseQuery = `
      SELECT 
        sg.id, 
        sg.nome, 
        sg.grupo_id,
        sg.status, 
        sg.criado_em,
        sg.atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produtos p ON sg.id = p.subgrupo_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND sg.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (grupo_id) {
      baseQuery += ' AND sg.grupo_id = ?';
      params.push(grupo_id);
    }

    if (status !== undefined) {
      baseQuery += ' AND sg.status = ?';
      params.push(status);
    }

    baseQuery += ' GROUP BY sg.id, sg.nome, sg.grupo_id, sg.status, sg.criado_em, sg.atualizado_em, g.nome ORDER BY sg.nome ASC LIMIT ? OFFSET ?';

    // Adicionar parâmetros de paginação
    params.push(pagination.limit, pagination.offset);
    
    // Executar query paginada
    const subgrupos = await executeQuery(baseQuery, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(DISTINCT sg.id) as total FROM subgrupos sg WHERE 1=1${search ? ' AND sg.nome LIKE ?' : ''}${grupo_id ? ' AND sg.grupo_id = ?' : ''}${status !== undefined ? ' AND sg.status = ?' : ''}`;
    const countParams = [];
    
    // Adicionar parâmetros de filtro para contagem (sem paginação)
    if (search) {
      countParams.push(`%${search}%`);
    }
    if (grupo_id) {
      countParams.push(grupo_id);
    }
    if (status !== undefined) {
      countParams.push(status);
    }
    
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/subgrupos', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(subgrupos, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Subgrupos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar subgrupo por ID
   */
  static buscarSubgrupoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subgrupos = await executeQuery(
      `SELECT 
        sg.id, 
        sg.nome, 
        sg.grupo_id,
        sg.status, 
        sg.criado_em,
        sg.atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM subgrupos sg
       LEFT JOIN grupos g ON sg.grupo_id = g.id
       LEFT JOIN produtos p ON sg.id = p.subgrupo_id
       WHERE sg.id = ?
       GROUP BY sg.id, sg.nome, sg.grupo_id, sg.status, sg.criado_em, sg.atualizado_em, g.nome`,
      [id]
    );

    if (subgrupos.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    const subgrupo = subgrupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(subgrupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, subgrupo.id);

    return successResponse(res, data, 'Subgrupo encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Criar novo subgrupo
   */
  static criarSubgrupo = asyncHandler(async (req, res) => {
    const { nome, grupo_id, status } = req.body;

    // Verificar se grupo existe
    const grupo = await executeQuery(
      'SELECT id, nome FROM grupos WHERE id = ?',
      [grupo_id]
    );

    if (grupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Verificar se nome já existe no grupo
    const existingSubgrupo = await executeQuery(
      'SELECT id FROM subgrupos WHERE nome = ? AND grupo_id = ?',
      [nome, grupo_id]
    );

    if (existingSubgrupo.length > 0) {
      return conflictResponse(res, 'Nome do subgrupo já existe neste grupo');
    }

    // Inserir subgrupo
    const result = await executeQuery(
      'INSERT INTO subgrupos (nome, grupo_id, status, criado_em) VALUES (?, ?, ?, NOW())',
      [nome && nome.trim() ? nome.trim() : null, grupo_id, status || 1]
    );

    const novoSubgrupoId = result.insertId;

    // Buscar subgrupo criado
    const subgrupos = await executeQuery(
      `SELECT 
        sg.id, 
        sg.nome, 
        sg.grupo_id,
        sg.status, 
        sg.criado_em,
        sg.atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM subgrupos sg
       LEFT JOIN grupos g ON sg.grupo_id = g.id
       LEFT JOIN produtos p ON sg.id = p.subgrupo_id
       WHERE sg.id = ?
       GROUP BY sg.id, sg.nome, sg.grupo_id, sg.status, sg.criado_em, sg.atualizado_em, g.nome`,
      [novoSubgrupoId]
    );

    const subgrupo = subgrupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(subgrupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, subgrupo.id);

    return successResponse(res, data, 'Subgrupo criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar subgrupo
   */
  static atualizarSubgrupo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se subgrupo existe
    const existingSubgrupo = await executeQuery(
      'SELECT id, nome, grupo_id FROM subgrupos WHERE id = ?',
      [id]
    );

    if (existingSubgrupo.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    // Verificar se grupo existe (se estiver sendo alterado)
    if (updateData.grupo_id) {
      const grupo = await executeQuery(
        'SELECT id, nome FROM grupos WHERE id = ?',
        [updateData.grupo_id]
      );

      if (grupo.length === 0) {
        return notFoundResponse(res, 'Grupo não encontrado');
      }
    }

    // Verificar se nome já existe no grupo (se estiver sendo alterado)
    if (updateData.nome) {
      const grupoId = updateData.grupo_id || existingSubgrupo[0].grupo_id;
      const nomeCheck = await executeQuery(
        'SELECT id FROM subgrupos WHERE nome = ? AND grupo_id = ? AND id != ?',
        [updateData.nome, grupoId, id]
      );

      if (nomeCheck.length > 0) {
        return conflictResponse(res, 'Nome do subgrupo já existe neste grupo');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        let value = updateData[key];
        
        // Tratar valores vazios ou undefined
        if (value === '' || value === null || value === undefined) {
          value = null;
        } else if (typeof value === 'string') {
          value = value.trim();
          if (value === '') {
            value = null;
          }
        }
        
        updateFields.push(`${key} = ?`);
        updateParams.push(value);
      }
    });

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('atualizado_em = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE subgrupos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar subgrupo atualizado
    const subgrupos = await executeQuery(
      `SELECT 
        sg.id, 
        sg.nome, 
        sg.grupo_id,
        sg.status, 
        sg.criado_em,
        sg.atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM subgrupos sg
       LEFT JOIN grupos g ON sg.grupo_id = g.id
       LEFT JOIN produtos p ON sg.id = p.subgrupo_id
       WHERE sg.id = ?
       GROUP BY sg.id, sg.nome, sg.grupo_id, sg.status, sg.criado_em, sg.atualizado_em, g.nome`,
      [id]
    );

    const subgrupo = subgrupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(subgrupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, subgrupo.id);

    return successResponse(res, data, 'Subgrupo atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir subgrupo
   */
  static excluirSubgrupo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se subgrupo existe
    const existingSubgrupo = await executeQuery(
      'SELECT id FROM subgrupos WHERE id = ?',
      [id]
    );

    if (existingSubgrupo.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    // Verificar se subgrupo está sendo usado em produtos
    const hasProducts = await executeQuery(
      'SELECT COUNT(*) as count FROM produtos WHERE subgrupo_id = ?',
      [id]
    );

    if (hasProducts[0].count > 0) {
      return errorResponse(res, 'Subgrupo não pode ser excluído pois possui produtos cadastrados', STATUS_CODES.BAD_REQUEST);
    }

    // Excluir subgrupo (soft delete - alterar status para 0)
    await executeQuery(
      'UPDATE subgrupos SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Subgrupo excluído com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Buscar subgrupos ativos
   */
  static buscarAtivos = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        sg.id, 
        sg.nome, 
        sg.grupo_id,
        sg.status, 
        sg.criado_em,
        sg.atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produtos p ON sg.id = p.subgrupo_id
      WHERE sg.status = 1
      GROUP BY sg.id, sg.nome, sg.grupo_id, sg.status, sg.criado_em, sg.atualizado_em, g.nome
    `;
    
    let params = [];
    baseQuery += ' ORDER BY sg.nome ASC LIMIT ? OFFSET ?';

    // Adicionar parâmetros de paginação
    params.push(pagination.limit, pagination.offset);
    
    // Executar query paginada
    const subgrupos = await executeQuery(baseQuery, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM subgrupos WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/subgrupos/ativos', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(subgrupos, meta.pagination, queryParams);

    return successResponse(res, data, 'Subgrupos ativos listados com sucesso', STATUS_CODES.OK, meta);
  });

  /**
   * Buscar subgrupos por grupo
   */
  static buscarPorGrupo = asyncHandler(async (req, res) => {
    const { grupo_id } = req.params;
    const pagination = req.pagination;

    // Verificar se grupo existe
    const grupo = await executeQuery(
      'SELECT id, nome FROM grupos WHERE id = ?',
      [grupo_id]
    );

    if (grupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Query base para subgrupos do grupo
    let baseQuery = `
      SELECT 
        sg.id, 
        sg.nome, 
        sg.grupo_id,
        sg.status, 
        sg.criado_em,
        sg.atualizado_em,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM subgrupos sg
      LEFT JOIN grupos g ON sg.grupo_id = g.id
      LEFT JOIN produtos p ON sg.id = p.subgrupo_id
      WHERE sg.grupo_id = ?
      GROUP BY sg.id, sg.nome, sg.grupo_id, sg.status, sg.criado_em, sg.atualizado_em, g.nome
    `;
    
    let params = [grupo_id];
    baseQuery += ' ORDER BY sg.nome ASC LIMIT ? OFFSET ?';

    // Adicionar parâmetros de paginação
    params.push(pagination.limit, pagination.offset);
    
    // Executar query paginada
    const subgrupos = await executeQuery(baseQuery, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM subgrupos WHERE grupo_id = ?`;
    const totalResult = await executeQuery(countQuery, [grupo_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/subgrupos/grupo/${grupo_id}`, queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(subgrupos, meta.pagination, queryParams);

    return successResponse(res, data, `Subgrupos do grupo ${grupo[0].nome} listados com sucesso`, STATUS_CODES.OK, meta);
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

module.exports = SubgruposController; 