/**
 * Controller de Listagem de Filiais
 * Responsável por listar e buscar filiais
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class FiliaisListController {
  
  /**
   * Listar filiais com paginação, busca e HATEOAS
   */
  static listarFiliais = asyncHandler(async (req, res) => {
    const { search = '', status, estado, supervisao, coordenacao } = req.query;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        codigo_filial, 
        cnpj, 
        filial, 
        razao_social, 
        logradouro, 
        numero, 
        bairro, 
        cep, 
        cidade, 
        estado,
        supervisao, 
        coordenacao, 
        status, 
        criado_em, 
        atualizado_em 
      FROM filiais 
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (filial LIKE ? OR razao_social LIKE ? OR cidade LIKE ? OR estado LIKE ? OR supervisao LIKE ? OR coordenacao LIKE ? OR codigo_filial LIKE ? OR cnpj LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (status !== undefined && status !== '') {
      baseQuery += ' AND status = ?';
      params.push(status);
    }

    if (estado) {
      baseQuery += ' AND estado = ?';
      params.push(estado);
    }

    if (supervisao) {
      baseQuery += ' AND supervisao LIKE ?';
      params.push(`%${supervisao}%`);
    }

    if (coordenacao) {
      baseQuery += ' AND coordenacao LIKE ?';
      params.push(`%${coordenacao}%`);
    }

    baseQuery += ' ORDER BY filial ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const filiais = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM filiais WHERE 1=1${search ? ' AND (filial LIKE ? OR razao_social LIKE ? OR cidade LIKE ? OR estado LIKE ? OR supervisao LIKE ? OR coordenacao LIKE ? OR codigo_filial LIKE ? OR cnpj LIKE ?)' : ''}${status !== undefined && status !== '' ? ' AND status = ?' : ''}${estado ? ' AND estado = ?' : ''}${supervisao ? ' AND supervisao LIKE ?' : ''}${coordenacao ? ' AND coordenacao LIKE ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/filiais', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, filiais, 'Filiais listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions,
      _links: res.addListLinks(filiais, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar filial por ID
   */
  static buscarFilialPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const filiais = await executeQuery(
      'SELECT * FROM filiais WHERE id = ?',
      [id]
    );

    if (filiais.length === 0) {
      return notFoundResponse(res, 'Filial não encontrada');
    }

    const filial = filiais[0];

    // Buscar almoxarifados da filial
    const almoxarifadosQuery = `
      SELECT 
        a.id, a.nome, a.status, a.unidade_escolar_id,
        a.criado_em, a.atualizado_em,
        ue.nome as unidade_escolar_nome
      FROM almoxarifados a
      LEFT JOIN unidades_escolares ue ON a.unidade_escolar_id = ue.id
      WHERE a.filial_id = ?
      ORDER BY a.nome ASC
    `;
    const almoxarifados = await executeQuery(almoxarifadosQuery, [id]);

    filial.almoxarifados = almoxarifados;
    filial.total_almoxarifados = almoxarifados.length;

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(filial);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, filial.id);

    return successResponse(res, data, 'Filial encontrada com sucesso', STATUS_CODES.OK, {
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

  /**
   * Listar almoxarifados de uma filial
   */
  static listarAlmoxarifados = asyncHandler(async (req, res) => {
    const { filialId } = req.params;

    const query = `
      SELECT 
        a.id, a.filial_id, a.unidade_escolar_id, a.nome, a.status, 
        a.criado_em, a.atualizado_em,
        ue.nome as unidade_escolar_nome
      FROM almoxarifados a
      LEFT JOIN unidades_escolares ue ON a.unidade_escolar_id = ue.id
      WHERE a.filial_id = ?
      ORDER BY a.nome ASC
    `;

    const almoxarifados = await executeQuery(query, [filialId]);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, almoxarifados, 'Almoxarifados listados com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(almoxarifados)._links
    });
  });

  /**
   * Listar itens de um almoxarifado
   */
  static listarItensAlmoxarifado = asyncHandler(async (req, res) => {
    const { almoxarifadoId } = req.params;

    const query = `
      SELECT 
        ai.id, ai.almoxarifado_id, ai.produto_id, ai.quantidade,
        ai.criado_em, ai.atualizado_em,
        p.nome as produto_nome, p.codigo_produto as produto_codigo,
        u.nome as unidade_nome
      FROM almoxarifado_itens ai
      INNER JOIN produtos p ON ai.produto_id = p.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      WHERE ai.almoxarifado_id = ?
      ORDER BY p.nome ASC
    `;

    const itens = await executeQuery(query, [almoxarifadoId]);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, itens, 'Itens do almoxarifado listados com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(itens)._links
    });
  });
}

module.exports = FiliaisListController;
