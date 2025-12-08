/**
 * Controller de Listagem de Almoxarifado
 * Responsável por listar e buscar almoxarifados
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class AlmoxarifadoListController {
  
  /**
   * Listar almoxarifados com paginação, busca e HATEOAS
   */
  static listarAlmoxarifados = asyncHandler(async (req, res) => {
    const { search = '', status, filial_id, centro_custo_id, tipo_vinculo, sortField, sortDirection } = req.query;
    const pagination = req.pagination;

    // Query base com dados da filial e centro de custo
    let baseQuery = `
      SELECT 
        a.id, 
        a.codigo,
        a.nome, 
        a.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        a.tipo_vinculo,
        a.unidade_escolar_id,
        ue.nome_escola as unidade_escolar_nome,
        ue.codigo_teknisa as unidade_escolar_codigo,
        a.centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        a.observacoes,
        a.status, 
        a.criado_em,
        a.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM almoxarifado a
      LEFT JOIN filiais f ON a.filial_id = f.id
      LEFT JOIN unidades_escolares ue ON a.unidade_escolar_id = ue.id
      LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
      LEFT JOIN usuarios uc ON a.usuario_cadastro_id = uc.id
      LEFT JOIN usuarios ua ON a.usuario_atualizacao_id = ua.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (LOWER(a.nome) LIKE ? OR LOWER(a.codigo) LIKE ? OR LOWER(a.observacoes) LIKE ? OR LOWER(f.filial) LIKE ? OR LOWER(cc.nome) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND a.status = ?';
      const statusValue = status === 1 || status === '1' ? 1 : 0;
      params.push(statusValue);
    }

    if (filial_id) {
      baseQuery += ' AND a.filial_id = ?';
      params.push(filial_id);
    }

    if (tipo_vinculo) {
      if (tipo_vinculo === 'filial') {
        // Filtrar apenas almoxarifados do tipo "filial" (não incluir os de unidades escolares)
        baseQuery += ' AND a.tipo_vinculo = ? AND (a.unidade_escolar_id IS NULL OR a.unidade_escolar_id = 0)';
        params.push('filial');
      } else if (tipo_vinculo === 'unidade_escolar') {
        // Filtrar apenas almoxarifados do tipo "unidade_escolar"
        baseQuery += ' AND a.tipo_vinculo = ?';
        params.push('unidade_escolar');
      }
    }

    if (centro_custo_id) {
      baseQuery += ' AND a.centro_custo_id = ?';
      params.push(centro_custo_id);
    }

    // Aplicar ordenação
    let orderBy = 'a.nome ASC';
    if (sortField && sortDirection) {
      const validFields = ['codigo', 'nome', 'status', 'filial_nome', 'centro_custo_nome', 'criado_em', 'atualizado_em'];
      if (validFields.includes(sortField)) {
        const direction = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        // Mapear campos para colunas do banco
        const fieldMap = {
          'codigo': 'a.codigo',
          'nome': 'a.nome',
          'status': 'a.status',
          'filial_nome': 'f.filial',
          'centro_custo_nome': 'cc.nome',
          'criado_em': 'a.criado_em',
          'atualizado_em': 'a.atualizado_em'
        };
        
        orderBy = `${fieldMap[sortField]} ${direction}`;
      }
    }
    baseQuery += ` ORDER BY ${orderBy}`;

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const almoxarifados = await executeQuery(query, params);

    // Contar total de registros
    let countQuery = `SELECT COUNT(*) as total FROM almoxarifado a 
      LEFT JOIN filiais f ON a.filial_id = f.id
      LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
      WHERE 1=1`;
    let countParams = [];
    
    if (search) {
      countQuery += ' AND (LOWER(a.nome) LIKE ? OR LOWER(a.codigo) LIKE ? OR LOWER(a.observacoes) LIKE ? OR LOWER(f.filial) LIKE ? OR LOWER(cc.nome) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status !== undefined && status !== '') {
      countQuery += ' AND a.status = ?';
      countParams.push(status === 1 || status === '1' ? 1 : 0);
    }
    
    if (filial_id) {
      countQuery += ' AND a.filial_id = ?';
      countParams.push(filial_id);
    }

    if (tipo_vinculo) {
      if (tipo_vinculo === 'filial') {
        countQuery += ' AND a.tipo_vinculo = ? AND (a.unidade_escolar_id IS NULL OR a.unidade_escolar_id = 0)';
        countParams.push('filial');
      } else if (tipo_vinculo === 'unidade_escolar') {
        countQuery += ' AND a.tipo_vinculo = ?';
        countParams.push('unidade_escolar');
      }
    }
    
    if (centro_custo_id) {
      countQuery += ' AND a.centro_custo_id = ?';
      countParams.push(centro_custo_id);
    }
    
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    let statsQuery = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN a.status = 1 THEN 1 ELSE 0 END) as ativos,
      SUM(CASE WHEN a.status = 0 THEN 1 ELSE 0 END) as inativos
      FROM almoxarifado a WHERE 1=1`;
    let statsParams = [];
    
    if (search) {
      statsQuery += ' AND (LOWER(a.nome) LIKE ? OR LOWER(a.codigo) LIKE ? OR LOWER(a.observacoes) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      statsParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status !== undefined && status !== '') {
      statsQuery += ' AND a.status = ?';
      statsParams.push(status === 1 || status === '1' ? 1 : 0);
    }
    
    if (filial_id) {
      statsQuery += ' AND a.filial_id = ?';
      statsParams.push(filial_id);
    }

    if (tipo_vinculo) {
      if (tipo_vinculo === 'filial') {
        statsQuery += ' AND a.tipo_vinculo = ? AND (a.unidade_escolar_id IS NULL OR a.unidade_escolar_id = 0)';
        statsParams.push('filial');
      } else if (tipo_vinculo === 'unidade_escolar') {
        statsQuery += ' AND a.tipo_vinculo = ?';
        statsParams.push('unidade_escolar');
      }
    }
    
    if (centro_custo_id) {
      statsQuery += ' AND a.centro_custo_id = ?';
      statsParams.push(centro_custo_id);
    }
    
    const statsResult = await executeQuery(statsQuery, statsParams);
    const statistics = statsResult[0];

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/almoxarifado', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);
    
    // Verificar se almoxarifados é um array válido
    if (!Array.isArray(almoxarifados)) {
      almoxarifados = [];
    }

    // Adicionar links HATEOAS (igual ao NotaFiscalListController)
    const dataWithLinks = res.addListLinks(almoxarifados, meta.pagination, queryParams);
    
    // Retornar resposta no formato esperado pelo frontend
    // Passar os dados diretamente (não usar dataWithLinks.items, pois o frontend espera o array direto)
    return successResponse(res, almoxarifados, 'Almoxarifados listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      actions,
      _links: dataWithLinks._links
    });
  });

  /**
   * Buscar almoxarifado por ID
   */
  static buscarAlmoxarifadoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const almoxarifados = await executeQuery(
      `SELECT 
        a.id, 
        a.codigo,
        a.nome, 
        a.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        a.tipo_vinculo,
        a.unidade_escolar_id,
        ue.nome_escola as unidade_escolar_nome,
        ue.codigo_teknisa as unidade_escolar_codigo,
        a.centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        a.observacoes,
        a.status, 
        a.criado_em,
        a.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
       FROM almoxarifado a
       LEFT JOIN filiais f ON a.filial_id = f.id
       LEFT JOIN unidades_escolares ue ON a.unidade_escolar_id = ue.id
       LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
       LEFT JOIN usuarios uc ON a.usuario_cadastro_id = uc.id
       LEFT JOIN usuarios ua ON a.usuario_atualizacao_id = ua.id
       WHERE a.id = ?`,
      [id]
    );

    if (almoxarifados.length === 0) {
      return notFoundResponse(res, 'Almoxarifado não encontrado');
    }

    const almoxarifado = almoxarifados[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(almoxarifado);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, almoxarifado.id);

    return successResponse(res, data, 'Almoxarifado encontrado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Listar almoxarifados por filial
   */
  static listarAlmoxarifadosPorFilial = asyncHandler(async (req, res) => {
    const { filial_id } = req.params;

    // Verificar se filial existe
    const filial = await executeQuery(
      'SELECT id, filial, codigo_filial FROM filiais WHERE id = ?',
      [filial_id]
    );

    if (filial.length === 0) {
      return notFoundResponse(res, 'Filial não encontrada');
    }

    // Buscar almoxarifados vinculados à filial
    const almoxarifados = await executeQuery(
      `SELECT 
        a.id, 
        a.codigo,
        a.nome, 
        a.filial_id,
        f.filial as filial_nome,
        f.codigo_filial,
        a.tipo_vinculo,
        a.unidade_escolar_id,
        ue.nome_escola as unidade_escolar_nome,
        ue.codigo_teknisa as unidade_escolar_codigo,
        a.centro_custo_id,
        cc.codigo as centro_custo_codigo,
        cc.nome as centro_custo_nome,
        a.observacoes,
        a.status, 
        a.criado_em,
        a.atualizado_em
       FROM almoxarifado a
       LEFT JOIN filiais f ON a.filial_id = f.id
       LEFT JOIN unidades_escolares ue ON a.unidade_escolar_id = ue.id
       LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
       WHERE a.filial_id = ? AND a.status = 1
       ORDER BY a.tipo_vinculo ASC, a.nome ASC`,
      [filial_id]
    );

    return successResponse(res, almoxarifados, 'Almoxarifados listados com sucesso', STATUS_CODES.OK);
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

module.exports = AlmoxarifadoListController;

