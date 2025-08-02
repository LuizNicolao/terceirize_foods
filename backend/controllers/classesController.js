/**
 * Controller de Classes
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

class ClassesController {
  
  /**
   * Listar classes com paginação, busca e HATEOAS
   */
  static listarClasses = asyncHandler(async (req, res) => {
    const { search = '', status, subgrupo_id } = req.query;
    const pagination = req.pagination;

    // Query base com informações do subgrupo e grupo
    let baseQuery = `
      SELECT 
        c.id, 
        c.nome, 
        c.subgrupo_id,
        c.status, 
        c.criado_em,
        c.atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM classes c
      LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
      LEFT JOIN grupos g ON s.grupo_id = g.id
      LEFT JOIN produtos p ON c.nome = p.classe
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND c.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND c.status = ?';
      params.push(status);
    }

    if (subgrupo_id) {
      baseQuery += ' AND c.subgrupo_id = ?';
      params.push(subgrupo_id);
    }

    baseQuery += ' GROUP BY c.id, c.nome, c.subgrupo_id, c.status, c.criado_em, c.atualizado_em, s.nome, g.nome ORDER BY c.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const classes = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(DISTINCT c.id) as total FROM classes c WHERE 1=1${search ? ' AND c.nome LIKE ?' : ''}${status !== undefined ? ' AND c.status = ?' : ''}${subgrupo_id ? ' AND c.subgrupo_id = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/classes', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(classes, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Classes listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar classe por ID
   */
  static buscarClassePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const classes = await executeQuery(
      `SELECT 
        c.id, 
        c.nome, 
        c.subgrupo_id,
        c.status, 
        c.criado_em,
        c.atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       LEFT JOIN grupos g ON s.grupo_id = g.id
       LEFT JOIN produtos p ON c.nome = p.classe
       WHERE c.id = ?
       GROUP BY c.id, c.nome, c.subgrupo_id, c.status, c.criado_em, c.atualizado_em, s.nome, g.nome`,
      [id]
    );

    if (classes.length === 0) {
      return notFoundResponse(res, 'Classe não encontrada');
    }

    const classe = classes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(classe);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, classe.id);

    return successResponse(res, data, 'Classe encontrada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Criar nova classe
   */
  static criarClasse = asyncHandler(async (req, res) => {
    const { nome, subgrupo_id, status } = req.body;

    // Verificar se subgrupo existe
    const subgrupo = await executeQuery(
      'SELECT id, nome FROM subgrupos WHERE id = ?',
      [subgrupo_id]
    );

    if (subgrupo.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    // Verificar se classe já existe no mesmo subgrupo
    const existingClasse = await executeQuery(
      'SELECT id FROM classes WHERE nome = ? AND subgrupo_id = ?',
      [nome, subgrupo_id]
    );

    if (existingClasse.length > 0) {
      return conflictResponse(res, 'Classe já cadastrada neste subgrupo');
    }

    // Inserir classe
    const result = await executeQuery(
      'INSERT INTO classes (nome, subgrupo_id, status, criado_em) VALUES (?, ?, ?, NOW())',
      [nome && nome.trim() ? nome.trim() : null, subgrupo_id || null, status || 1]
    );

    const novaClasseId = result.insertId;

    // Buscar classe criada
    const classes = await executeQuery(
      `SELECT 
        c.id, 
        c.nome, 
        c.subgrupo_id,
        c.status, 
        c.criado_em,
        c.atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       LEFT JOIN grupos g ON s.grupo_id = g.id
       LEFT JOIN produtos p ON c.nome = p.classe
       WHERE c.id = ?
       GROUP BY c.id, c.nome, c.subgrupo_id, c.status, c.criado_em, c.atualizado_em, s.nome, g.nome`,
      [novaClasseId]
    );

    const classe = classes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(classe);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, classe.id);

    return successResponse(res, data, 'Classe criada com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar classe
   */
  static atualizarClasse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se classe existe
    const existingClasse = await executeQuery(
      'SELECT id, nome, subgrupo_id FROM classes WHERE id = ?',
      [id]
    );

    if (existingClasse.length === 0) {
      return notFoundResponse(res, 'Classe não encontrada');
    }

    // Verificar se subgrupo existe (se estiver sendo alterado)
    if (updateData.subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id, nome FROM subgrupos WHERE id = ?',
        [updateData.subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return notFoundResponse(res, 'Subgrupo não encontrado');
      }
    }

    // Verificar se classe já existe no mesmo subgrupo (se estiver sendo alterada)
    if (updateData.nome || updateData.subgrupo_id) {
      const nome = updateData.nome || existingClasse[0].nome;
      const subgrupoId = updateData.subgrupo_id || existingClasse[0].subgrupo_id;
      
      const classeCheck = await executeQuery(
        'SELECT id FROM classes WHERE nome = ? AND subgrupo_id = ? AND id != ?',
        [nome, subgrupoId, id]
      );

      if (classeCheck.length > 0) {
        return conflictResponse(res, 'Classe já cadastrada neste subgrupo');
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
      `UPDATE classes SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar classe atualizada
    const classes = await executeQuery(
      `SELECT 
        c.id, 
        c.nome, 
        c.subgrupo_id,
        c.status, 
        c.criado_em,
        c.atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       LEFT JOIN grupos g ON s.grupo_id = g.id
       LEFT JOIN produtos p ON c.nome = p.classe
       WHERE c.id = ?
       GROUP BY c.id, c.nome, c.subgrupo_id, c.status, c.criado_em, c.atualizado_em, s.nome, g.nome`,
      [id]
    );

    const classe = classes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(classe);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, classe.id);

    return successResponse(res, data, 'Classe atualizada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir classe
   */
  static excluirClasse = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se classe existe
    const existingClasse = await executeQuery(
      'SELECT id, nome FROM classes WHERE id = ?',
      [id]
    );

    if (existingClasse.length === 0) {
      return notFoundResponse(res, 'Classe não encontrada');
    }

    // Verificar se classe está sendo usada em produtos ATIVOS
    const produtos = await executeQuery(
      'SELECT id, nome, status FROM produtos WHERE classe = ? AND status = 1',
      [existingClasse[0].nome]
    );

    if (produtos.length > 0) {
      let mensagem = `Classe não pode ser excluída pois possui ${produtos.length} produto(s) ativo(s) vinculado(s):`;
      mensagem += `\n- ${produtos.map(p => p.nome).join(', ')}`;
      mensagem += '\n\nPara excluir a classe, primeiro desative todos os produtos vinculados.';
      
      return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
    }

    // Excluir classe (soft delete - alterar status para 0)
    await executeQuery(
      'UPDATE classes SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Classe excluída com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Buscar classes ativas
   */
  static buscarAtivas = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        c.id, 
        c.nome, 
        c.subgrupo_id,
        c.status, 
        c.criado_em,
        c.atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM classes c
      LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
      LEFT JOIN grupos g ON s.grupo_id = g.id
      LEFT JOIN produtos p ON c.nome = p.classe
      WHERE c.status = 1
      GROUP BY c.id, c.nome, c.subgrupo_id, c.status, c.criado_em, c.atualizado_em, s.nome, g.nome
    `;
    
    let params = [];
    baseQuery += ' ORDER BY c.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const classes = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM classes WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/classes/ativas', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(classes, meta.pagination, queryParams);

    return successResponse(res, data, 'Classes ativas listadas com sucesso', STATUS_CODES.OK, meta);
  });

  /**
   * Buscar classes por subgrupo
   */
  static buscarPorSubgrupo = asyncHandler(async (req, res) => {
    const { subgrupo_id } = req.params;
    const pagination = req.pagination;

    // Verificar se subgrupo existe
    const subgrupo = await executeQuery(
      'SELECT id, nome FROM subgrupos WHERE id = ?',
      [subgrupo_id]
    );

    if (subgrupo.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    // Query base para classes do subgrupo
    let baseQuery = `
      SELECT 
        c.id, 
        c.nome, 
        c.subgrupo_id,
        c.status, 
        c.criado_em,
        c.atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM classes c
      LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
      LEFT JOIN grupos g ON s.grupo_id = g.id
      LEFT JOIN produtos p ON c.nome = p.classe
      WHERE c.subgrupo_id = ?
      GROUP BY c.id, c.nome, c.subgrupo_id, c.status, c.criado_em, c.atualizado_em, s.nome, g.nome
    `;
    
    let params = [subgrupo_id];
    baseQuery += ' ORDER BY c.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const classes = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM classes WHERE subgrupo_id = ?`;
    const totalResult = await executeQuery(countQuery, [subgrupo_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/classes/subgrupo/${subgrupo_id}`, queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(classes, meta.pagination, queryParams);

    return successResponse(res, data, `Classes do subgrupo ${subgrupo[0].nome} listadas com sucesso`, STATUS_CODES.OK, meta);
  });

  /**
   * Listar subgrupos para select
   */
  static listarSubgrupos = asyncHandler(async (req, res) => {
    const subgrupos = await executeQuery(
      `SELECT s.id, s.nome, g.nome as grupo_nome
       FROM subgrupos s
       LEFT JOIN grupos g ON s.grupo_id = g.id
       WHERE s.status = 1
       ORDER BY g.nome, s.nome`
    );

    // Adicionar links HATEOAS
    const data = res.addListLinks(subgrupos);

    return successResponse(res, data, 'Subgrupos listados com sucesso', STATUS_CODES.OK);
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

module.exports = ClassesController; 