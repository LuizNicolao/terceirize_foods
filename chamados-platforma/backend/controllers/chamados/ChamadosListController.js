/**
 * Controller de Listagem de Chamados
 * Responsável por listar e buscar chamados
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ChamadosListController {
  
  /**
   * Listar chamados com paginação, busca e filtros
   */
  static listarChamados = asyncHandler(async (req, res) => {
    const { 
      search = '', 
      sistema = '', 
      tipo = '', 
      status = '', 
      prioridade = '',
      responsavel_id = '',
      criador_id = '',
      data_inicio = '',
      data_fim = '',
      view_mode = '' // 'todos', 'meus', 'atribuidos', 'proprios'
    } = req.query;
    const pagination = req.pagination;
    const user = req.user;

    // Query base com JOINs para obter dados dos usuários
    let baseQuery = `
      SELECT 
        c.id,
        c.titulo,
        c.descricao,
        c.descricao_correcao,
        c.sistema,
        c.tela,
        c.tipo,
        c.status,
        c.prioridade,
        c.usuario_abertura_id,
        c.usuario_responsavel_id,
        c.data_abertura,
        c.data_conclusao,
        c.data_atualizacao,
        c.prazo_resolucao_horas,
        c.data_limite_resolucao,
        c.tempo_resposta_minutos,
        c.data_primeira_resposta,
        ua.nome as usuario_abertura_nome,
        ua.email as usuario_abertura_email,
        ur.nome as usuario_responsavel_nome,
        ur.email as usuario_responsavel_email
      FROM chamados c
      LEFT JOIN usuarios ua ON c.usuario_abertura_id = ua.id
      LEFT JOIN usuarios ur ON c.usuario_responsavel_id = ur.id
      WHERE c.ativo = 1
    `;
    
    let params = [];

    // Aplicar filtros automáticos baseados no tipo de usuário
    // A menos que seja admin ou view_mode='todos' seja explicitamente solicitado
    // OU se houver filtro específico de responsável (view 'sem_responsavel')
    const hasResponsavelFilter = responsavel_id && responsavel_id !== '';
    const isViewAtribuidos = view_mode === 'atribuidos';
    
    if (user.tipo_de_acesso !== 'administrador' && view_mode !== 'todos' && !hasResponsavelFilter) {
      if (isViewAtribuidos) {
        // View "Atribuídos": apenas chamados onde o usuário é responsável
        baseQuery += ' AND c.usuario_responsavel_id = ?';
        params.push(user.id);
      } else if (user.tipo_de_acesso === 'usuario') {
        // Usuário comum: apenas seus próprios chamados
        baseQuery += ' AND c.usuario_abertura_id = ?';
        params.push(user.id);
      } else if (user.tipo_de_acesso === 'tecnico') {
        // Técnico (view padrão "meus"): chamados atribuídos a ele + sem responsável (para assumir)
        baseQuery += ' AND (c.usuario_responsavel_id = ? OR c.usuario_responsavel_id IS NULL)';
        params.push(user.id);
      } else if (user.tipo_de_acesso === 'supervisor') {
        // Supervisor (view padrão "meus"): chamados atribuídos a ele + abertos (sem responsável)
        // Pode ser expandido para filtrar por sistema se houver campo sistema_usuario
        baseQuery += ' AND (c.usuario_responsavel_id = ? OR (c.usuario_responsavel_id IS NULL AND c.status = "aberto"))';
        params.push(user.id);
      }
    }

    // Aplicar filtros de busca
    if (search) {
      baseQuery += ' AND (c.titulo LIKE ? OR c.descricao LIKE ? OR c.sistema LIKE ? OR c.tela LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (sistema) {
      baseQuery += ' AND c.sistema = ?';
      params.push(sistema);
    }

    if (tipo) {
      baseQuery += ' AND c.tipo = ?';
      params.push(tipo);
    }

    if (status) {
      baseQuery += ' AND c.status = ?';
      params.push(status);
    }

    if (prioridade) {
      baseQuery += ' AND c.prioridade = ?';
      params.push(prioridade);
    }

    if (responsavel_id) {
      if (responsavel_id === 'null') {
        // Caso especial: sem responsável
        baseQuery += ' AND c.usuario_responsavel_id IS NULL';
      } else {
        baseQuery += ' AND c.usuario_responsavel_id = ?';
        params.push(responsavel_id);
      }
    }

    if (criador_id) {
      baseQuery += ' AND c.usuario_abertura_id = ?';
      params.push(criador_id);
    }

    if (data_inicio) {
      baseQuery += ' AND DATE(c.data_abertura) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      baseQuery += ' AND DATE(c.data_abertura) <= ?';
      params.push(data_fim);
    }

    baseQuery += ' ORDER BY c.data_abertura DESC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const chamados = await executeQuery(query, params);

    // Contar total de registros (aplicar mesmos filtros automáticos)
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM chamados c 
      WHERE c.ativo = 1
    `;
    let countParams = [];

    // Aplicar mesmos filtros automáticos no count
    const hasResponsavelFilterCount = responsavel_id && responsavel_id !== '';
    const isViewAtribuidosCount = view_mode === 'atribuidos';
    
    if (user.tipo_de_acesso !== 'administrador' && view_mode !== 'todos' && !hasResponsavelFilterCount) {
      if (isViewAtribuidosCount) {
        // View "Atribuídos": apenas chamados onde o usuário é responsável
        countQuery += ' AND c.usuario_responsavel_id = ?';
        countParams.push(user.id);
      } else if (user.tipo_de_acesso === 'usuario') {
        countQuery += ' AND c.usuario_abertura_id = ?';
        countParams.push(user.id);
      } else if (user.tipo_de_acesso === 'tecnico') {
        countQuery += ' AND (c.usuario_responsavel_id = ? OR c.usuario_responsavel_id IS NULL)';
        countParams.push(user.id);
      } else if (user.tipo_de_acesso === 'supervisor') {
        countQuery += ' AND (c.usuario_responsavel_id = ? OR (c.usuario_responsavel_id IS NULL AND c.status = "aberto"))';
        countParams.push(user.id);
      }
    }

    if (search) {
      countQuery += ' AND (c.titulo LIKE ? OR c.descricao LIKE ? OR c.sistema LIKE ? OR c.tela LIKE ?)';
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (sistema) {
      countQuery += ' AND c.sistema = ?';
      countParams.push(sistema);
    }

    if (tipo) {
      countQuery += ' AND c.tipo = ?';
      countParams.push(tipo);
    }

    if (status) {
      countQuery += ' AND c.status = ?';
      countParams.push(status);
    }

    if (prioridade) {
      countQuery += ' AND c.prioridade = ?';
      countParams.push(prioridade);
    }

    if (responsavel_id) {
      if (responsavel_id === 'null') {
        countQuery += ' AND c.usuario_responsavel_id IS NULL';
      } else {
        countQuery += ' AND c.usuario_responsavel_id = ?';
        countParams.push(responsavel_id);
      }
    }

    if (criador_id) {
      countQuery += ' AND c.usuario_abertura_id = ?';
      countParams.push(criador_id);
    }

    if (data_inicio) {
      countQuery += ' AND DATE(c.data_abertura) >= ?';
      countParams.push(data_inicio);
    }

    if (data_fim) {
      countQuery += ' AND DATE(c.data_abertura) <= ?';
      countParams.push(data_fim);
    }

    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/chamados/api/chamados', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(chamados, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Chamados listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
  });

  /**
   * Buscar chamado por ID
   */
  static buscarChamadoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const chamados = await executeQuery(
      `SELECT 
        c.id,
        c.titulo,
        c.descricao,
        c.descricao_correcao,
        c.sistema,
        c.tela,
        c.tipo,
        c.status,
        c.prioridade,
        c.usuario_abertura_id,
        c.usuario_responsavel_id,
        c.data_abertura,
        c.data_conclusao,
        c.data_atualizacao,
        c.prazo_resolucao_horas,
        c.data_limite_resolucao,
        c.tempo_resposta_minutos,
        c.data_primeira_resposta,
        ua.nome as usuario_abertura_nome,
        ua.email as usuario_abertura_email,
        ur.nome as usuario_responsavel_nome,
        ur.email as usuario_responsavel_email
      FROM chamados c
      LEFT JOIN usuarios ua ON c.usuario_abertura_id = ua.id
      LEFT JOIN usuarios ur ON c.usuario_responsavel_id = ur.id
      WHERE c.id = ? AND c.ativo = 1`,
      [id]
    );

    if (chamados.length === 0) {
      return notFoundResponse(res, 'Chamado não encontrado');
    }

    const chamado = chamados[0];

    // Buscar comentários do chamado
    const comentarios = await executeQuery(
      `SELECT 
        cc.id,
        cc.comentario,
        cc.tipo,
        cc.data_criacao,
        u.id as usuario_id,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM chamados_comentarios cc
      LEFT JOIN usuarios u ON cc.usuario_id = u.id
      WHERE cc.chamado_id = ? AND cc.ativo = 1
      ORDER BY cc.data_criacao ASC`,
      [id]
    );

    chamado.comentarios = comentarios;

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(chamado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, chamado.id);

    return successResponse(res, data, 'Chamado encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Buscar chamados por sistema
   */
  static buscarChamadosPorSistema = asyncHandler(async (req, res) => {
    const { sistema } = req.params;
    const pagination = req.pagination;

    const baseQuery = `
      SELECT 
        c.id,
        c.titulo,
        c.descricao,
        c.sistema,
        c.tela,
        c.tipo,
        c.status,
        c.prioridade,
        c.usuario_abertura_id,
        c.usuario_responsavel_id,
        c.data_abertura,
        c.data_conclusao,
        c.data_atualizacao,
        ua.nome as usuario_abertura_nome,
        ur.nome as usuario_responsavel_nome
      FROM chamados c
      LEFT JOIN usuarios ua ON c.usuario_abertura_id = ua.id
      LEFT JOIN usuarios ur ON c.usuario_responsavel_id = ur.id
      WHERE c.sistema = ? AND c.ativo = 1
      ORDER BY c.data_abertura DESC
    `;

    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    const chamados = await executeQuery(query, [sistema]);

    const totalResult = await executeQuery(
      'SELECT COUNT(*) as total FROM chamados WHERE sistema = ? AND ativo = 1',
      [sistema]
    );
    const totalItems = totalResult[0].total;

    const queryParams = { sistema, ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/chamados/api/chamados/sistema/' + sistema, queryParams);

    const data = res.addListLinks(chamados, meta.pagination, queryParams);
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Chamados listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
    });
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

module.exports = ChamadosListController;
