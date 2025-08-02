/**
 * Controller de Grupos
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

class GruposController {
  
  /**
   * Listar grupos com paginação, busca e HATEOAS
   */
  static listarGrupos = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;
    const pagination = req.pagination;

    // Query base com contagem de subgrupos
    let baseQuery = `
      SELECT 
        g.id, 
        g.nome, 
        g.status, 
        g.criado_em,
        g.atualizado_em,
        COUNT(sg.id) as total_subgrupos
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND g.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND g.status = ?';
      params.push(status);
    }

    baseQuery += ' GROUP BY g.id, g.nome, g.status, g.criado_em, g.atualizado_em ORDER BY g.nome ASC LIMIT ? OFFSET ?';

    // Adicionar parâmetros de paginação
    params.push(pagination.limit, pagination.offset);
    
    // Executar query paginada
    const grupos = await executeQuery(baseQuery, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(DISTINCT g.id) as total FROM grupos g WHERE 1=1${search ? ' AND g.nome LIKE ?' : ''}${status !== undefined ? ' AND g.status = ?' : ''}`;
    const countParams = [];
    
    // Adicionar parâmetros de filtro para contagem (sem paginação)
    if (search) {
      countParams.push(`%${search}%`);
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
    
    const meta = pagination.generateMeta(totalItems, '/api/grupos', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(grupos, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Grupos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar grupo por ID
   */
  static buscarGrupoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const grupos = await executeQuery(
      `SELECT 
        g.id, 
        g.nome, 
        g.status, 
        g.criado_em,
        g.atualizado_em,
        COUNT(sg.id) as total_subgrupos
       FROM grupos g
       LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
       WHERE g.id = ?
       GROUP BY g.id, g.nome, g.status, g.criado_em, g.atualizado_em`,
      [id]
    );

    if (grupos.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    const grupo = grupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(grupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, grupo.id);

    return successResponse(res, data, 'Grupo encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Criar novo grupo
   */
  static criarGrupo = asyncHandler(async (req, res) => {
    const { nome, status } = req.body;

    // Verificar se nome já existe
    const existingGrupo = await executeQuery(
      'SELECT id FROM grupos WHERE nome = ?',
      [nome]
    );

    if (existingGrupo.length > 0) {
      return conflictResponse(res, 'Nome do grupo já existe');
    }

    // Inserir grupo
    const result = await executeQuery(
      'INSERT INTO grupos (nome, status, criado_em) VALUES (?, ?, NOW())',
      [nome && nome.trim() ? nome.trim() : null, status || 1]
    );

    const novoGrupoId = result.insertId;

    // Buscar grupo criado
    const grupos = await executeQuery(
      `SELECT 
        g.id, 
        g.nome, 
        g.status, 
        g.criado_em,
        g.atualizado_em,
        COUNT(sg.id) as total_subgrupos
       FROM grupos g
       LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
       WHERE g.id = ?
       GROUP BY g.id, g.nome, g.status, g.criado_em, g.atualizado_em`,
      [novoGrupoId]
    );

    const grupo = grupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(grupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, grupo.id);

    return successResponse(res, data, 'Grupo criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar grupo
   */
  static atualizarGrupo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se grupo existe
    const existingGrupo = await executeQuery(
      'SELECT id, nome FROM grupos WHERE id = ?',
      [id]
    );

    if (existingGrupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Verificar se nome já existe (se estiver sendo alterado)
    if (updateData.nome) {
      const nomeCheck = await executeQuery(
        'SELECT id FROM grupos WHERE nome = ? AND id != ?',
        [updateData.nome, id]
      );

      if (nomeCheck.length > 0) {
        return conflictResponse(res, 'Nome do grupo já existe');
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
      `UPDATE grupos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar grupo atualizado
    const grupos = await executeQuery(
      `SELECT 
        g.id, 
        g.nome, 
        g.status, 
        g.criado_em,
        g.atualizado_em,
        COUNT(sg.id) as total_subgrupos
       FROM grupos g
       LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
       WHERE g.id = ?
       GROUP BY g.id, g.nome, g.status, g.criado_em, g.atualizado_em`,
      [id]
    );

    const grupo = grupos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(grupo);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, grupo.id);

    return successResponse(res, data, 'Grupo atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir grupo
   */
  static excluirGrupo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se grupo existe
    const existingGrupo = await executeQuery(
      'SELECT id FROM grupos WHERE id = ?',
      [id]
    );

    if (existingGrupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Verificar se grupo está sendo usado em produtos
    const hasProducts = await executeQuery(
      'SELECT COUNT(*) as count FROM produtos WHERE grupo_id = ?',
      [id]
    );

    if (hasProducts[0].count > 0) {
      return errorResponse(res, 'Grupo não pode ser excluído pois possui produtos cadastrados', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se grupo possui subgrupos
    const hasSubgrupos = await executeQuery(
      'SELECT COUNT(*) as count FROM subgrupos WHERE grupo_id = ?',
      [id]
    );

    if (hasSubgrupos[0].count > 0) {
      return errorResponse(res, 'Grupo não pode ser excluído pois possui subgrupos cadastrados', STATUS_CODES.BAD_REQUEST);
    }

    // Excluir grupo (soft delete - alterar status para 0)
    await executeQuery(
      'UPDATE grupos SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Grupo excluído com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Buscar grupos ativos
   */
  static buscarAtivos = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        g.id, 
        g.nome, 
        g.status, 
        g.criado_em,
        g.atualizado_em,
        COUNT(sg.id) as total_subgrupos
      FROM grupos g
      LEFT JOIN subgrupos sg ON g.id = sg.grupo_id
      WHERE g.status = 1
      GROUP BY g.id, g.nome, g.status, g.criado_em, g.atualizado_em
    `;
    
    let params = [];
    baseQuery += ' ORDER BY g.nome ASC LIMIT ? OFFSET ?';

    // Adicionar parâmetros de paginação
    params.push(pagination.limit, pagination.offset);
    
    // Executar query paginada
    const grupos = await executeQuery(baseQuery, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM grupos WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/grupos/ativos', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(grupos, meta.pagination, queryParams);

    return successResponse(res, data, 'Grupos ativos listados com sucesso', STATUS_CODES.OK, meta);
  });

  /**
   * Buscar subgrupos de um grupo
   */
  static buscarSubgrupos = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pagination = req.pagination;

    // Verificar se grupo existe
    const grupo = await executeQuery(
      'SELECT id, nome FROM grupos WHERE id = ?',
      [id]
    );

    if (grupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Query base para subgrupos
    let baseQuery = `
      SELECT 
        sg.id, 
        sg.nome, 
        sg.status, 
        sg.criado_em,
        sg.atualizado_em
      FROM subgrupos sg
      WHERE sg.grupo_id = ?
    `;
    
    let params = [id];
    baseQuery += ' ORDER BY sg.nome ASC LIMIT ? OFFSET ?';

    // Adicionar parâmetros de paginação
    params.push(pagination.limit, pagination.offset);
    
    // Executar query paginada
    const subgrupos = await executeQuery(baseQuery, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM subgrupos WHERE grupo_id = ?`;
    const totalResult = await executeQuery(countQuery, [id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/grupos/${id}/subgrupos`, queryParams);

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

module.exports = GruposController; 