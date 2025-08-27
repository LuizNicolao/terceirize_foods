/**
 * Controller de Busca de Filiais
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const axios = require('axios');

class FiliaisSearchController {
  
  /**
   * Buscar filiais ativas
   */
  static buscarFiliaisAtivas = asyncHandler(async (req, res) => {
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
      WHERE status = 1
    `;
    
    let params = [];
    baseQuery += ' ORDER BY filial ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const filiais = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM filiais WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/filiais/ativas', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, filiais, 'Filiais ativas listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(filiais, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar filiais por estado
   */
  static buscarFiliaisPorEstado = asyncHandler(async (req, res) => {
    const { estado } = req.params;
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
      WHERE estado = ? AND status = 1
    `;
    
    let params = [estado];
    baseQuery += ' ORDER BY filial ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const filiais = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM filiais WHERE estado = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [estado]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/filiais/estado/${estado}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, filiais, `Filiais do estado ${estado} listadas com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(filiais, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar filiais por supervisão
   */
  static buscarFiliaisPorSupervisao = asyncHandler(async (req, res) => {
    const { supervisao } = req.params;
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
      WHERE supervisao LIKE ? AND status = 1
    `;
    
    let params = [`%${supervisao}%`];
    baseQuery += ' ORDER BY filial ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const filiais = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM filiais WHERE supervisao LIKE ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [`%${supervisao}%`]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/filiais/supervisao/${supervisao}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, filiais, `Filiais da supervisão ${supervisao} listadas com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(filiais, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar filiais por coordenação
   */
  static buscarFiliaisPorCoordenacao = asyncHandler(async (req, res) => {
    const { coordenacao } = req.params;
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
      WHERE coordenacao LIKE ? AND status = 1
    `;
    
    let params = [`%${coordenacao}%`];
    baseQuery += ' ORDER BY filial ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const filiais = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM filiais WHERE coordenacao LIKE ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [`%${coordenacao}%`]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/filiais/coordenacao/${coordenacao}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, filiais, `Filiais da coordenação ${coordenacao} listadas com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(filiais, meta.pagination, queryParams)._links
    });
  });

  /**
   * Listar estados disponíveis
   */
  static listarEstados = asyncHandler(async (req, res) => {
    const query = `
      SELECT DISTINCT estado 
      FROM filiais 
      WHERE estado IS NOT NULL AND estado != ''
      ORDER BY estado ASC
    `;

    const estados = await executeQuery(query);
    const data = estados.map(item => item.estado);

    return successResponse(res, data, 'Estados listados com sucesso', STATUS_CODES.OK);
  });

  /**
   * Listar supervisões disponíveis
   */
  static listarSupervisoes = asyncHandler(async (req, res) => {
    const query = `
      SELECT DISTINCT supervisao 
      FROM filiais 
      WHERE supervisao IS NOT NULL AND supervisao != ''
      ORDER BY supervisao ASC
    `;

    const supervisoes = await executeQuery(query);
    const data = supervisoes.map(item => item.supervisao);

    return successResponse(res, data, 'Supervisões listadas com sucesso', STATUS_CODES.OK);
  });

  /**
   * Listar coordenações disponíveis
   */
  static listarCoordenacoes = asyncHandler(async (req, res) => {
    const query = `
      SELECT DISTINCT coordenacao 
      FROM filiais 
      WHERE coordenacao IS NOT NULL AND coordenacao != ''
      ORDER BY coordenacao ASC
    `;

    const coordenacoes = await executeQuery(query);
    const data = coordenacoes.map(item => item.coordenacao);

    return successResponse(res, data, 'Coordenações listadas com sucesso', STATUS_CODES.OK);
  });

  /**
   * Consultar CNPJ na API externa
   */
  static consultarCNPJ = asyncHandler(async (req, res) => {
    const { cnpj } = req.params;
    
    // Limpar CNPJ (remover caracteres não numéricos)
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      return errorResponse(res, 'CNPJ deve ter 14 dígitos', STATUS_CODES.BAD_REQUEST);
    }

    // Tentar buscar dados do CNPJ usando Brasil API
    let dadosCNPJ = null;
    
    try {
      const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
        timeout: 8000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.data && response.data.razao_social) {
        dadosCNPJ = {
          razao_social: response.data.razao_social,
          nome_fantasia: response.data.nome_fantasia,
          logradouro: response.data.logradouro,
          numero: response.data.numero,
          bairro: response.data.bairro,
          municipio: response.data.municipio,
          uf: response.data.uf,
          cep: response.data.cep,
          telefone: (() => {
            let telefone = null;
            
            if (response.data.ddd_telefone_1 && response.data.telefone_1) {
              telefone = `${response.data.ddd_telefone_1}${response.data.telefone_1}`;
            } else if (response.data.telefone) {
              telefone = response.data.telefone;
            } else if (response.data.ddd_telefone_1) {
              telefone = response.data.ddd_telefone_1;
            }
            
            if (telefone) {
              telefone = telefone.toString().replace(/undefined/g, '');
              telefone = telefone.replace(/\D/g, '');
              return telefone.length >= 10 ? telefone : null;
            }
            
            return null;
          })(),
          email: response.data.email
        };
      }
    } catch (error) {
      console.log('Erro ao buscar CNPJ na API externa:', error.message);
      
      return errorResponse(res, 'Serviço de consulta CNPJ temporariamente indisponível. Tente novamente em alguns minutos.', STATUS_CODES.SERVICE_UNAVAILABLE);
    }

    if (dadosCNPJ) {
      return successResponse(res, dadosCNPJ, 'Dados do CNPJ encontrados', STATUS_CODES.OK);
    } else {
      return notFoundResponse(res, 'CNPJ não encontrado ou dados indisponíveis');
    }
  });
}

module.exports = FiliaisSearchController;
