/**
 * Controller de Busca de Fornecedores
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

class FornecedoresSearchController {
  
  /**
   * Buscar dados do CNPJ via API externa
   */
  static buscarCNPJ = asyncHandler(async (req, res) => {
    const { cnpj } = req.params;
    
    // Limpar CNPJ (remover pontos, traços e barras)
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      return errorResponse(res, 'CNPJ deve ter 14 dígitos', STATUS_CODES.BAD_REQUEST);
    }

    // Tentar buscar dados do CNPJ usando API mais estável
    let dadosCNPJ = null;
    
    try {
      // Usar Brasil API que é mais confiável
      const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
        timeout: 5000, // Reduzir timeout para 5 segundos
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
            // Tentar diferentes formatos de telefone da API
            let telefone = null;
            
            if (response.data.ddd_telefone_1 && response.data.telefone_1) {
              telefone = `${response.data.ddd_telefone_1}${response.data.telefone_1}`;
            } else if (response.data.telefone) {
              telefone = response.data.telefone;
            } else if (response.data.ddd_telefone_1) {
              telefone = response.data.ddd_telefone_1;
            }
            
            // Limpar telefone se encontrado
            if (telefone) {
              // Remover "undefined" se estiver concatenado
              telefone = telefone.toString().replace(/undefined/g, '');
              // Remover caracteres não numéricos
              telefone = telefone.replace(/\D/g, '');
              // Retornar apenas se tiver pelo menos 10 dígitos
              return telefone.length >= 10 ? telefone : null;
            }
            
            return null;
          })(),
          email: response.data.email
        };
      }
    } catch (error) {
      console.log('Erro ao buscar CNPJ na API externa:', error.message);
      
      // Se a API externa falhar, retornar erro específico
      return errorResponse(res, 'Serviço de consulta CNPJ temporariamente indisponível. Tente novamente em alguns minutos.', STATUS_CODES.SERVICE_UNAVAILABLE);
    }

    if (dadosCNPJ) {
      return successResponse(res, dadosCNPJ, 'Dados do CNPJ encontrados', STATUS_CODES.OK);
    } else {
      return notFoundResponse(res, 'CNPJ não encontrado ou dados indisponíveis');
    }
  });

  /**
   * Buscar fornecedores por UF
   */
  static buscarPorUF = asyncHandler(async (req, res) => {
    const { uf } = req.params;
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        cnpj, 
        razao_social, 
        nome_fantasia, 
        logradouro, 
        numero, 
        cep, 
        bairro, 
        municipio, 
        uf, 
        email, 
        telefone, 
        status, 
        criado_em, 
        atualizado_em 
      FROM fornecedores 
      WHERE uf = ? AND status = 1
    `;
    
    let params = [uf.toUpperCase()];
    baseQuery += ' ORDER BY razao_social ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const fornecedores = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM fornecedores WHERE uf = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [uf.toUpperCase()]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/fornecedores/uf/${uf}`, queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(fornecedores, meta.pagination, queryParams);

    return successResponse(res, data, `Fornecedores da UF ${uf.toUpperCase()} listados com sucesso`, STATUS_CODES.OK, meta);
  });

  /**
   * Buscar fornecedores ativos
   */
  static buscarAtivos = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        id, 
        cnpj, 
        razao_social, 
        nome_fantasia, 
        logradouro, 
        numero, 
        cep, 
        bairro, 
        municipio, 
        uf, 
        email, 
        telefone, 
        status, 
        criado_em, 
        atualizado_em 
      FROM fornecedores 
      WHERE status = 1
    `;
    
    let params = [];
    baseQuery += ' ORDER BY razao_social ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const fornecedores = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM fornecedores WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/fornecedores/ativos', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(fornecedores, meta.pagination, queryParams);

    return successResponse(res, data, 'Fornecedores ativos listados com sucesso', STATUS_CODES.OK, meta);
  });
}

module.exports = FornecedoresSearchController;
