/**
 * Controller de Consulta de CEP
 * Responsável por consultar dados de endereço via CEP
 */

const axios = require('axios');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class CepSearchController {
  
  /**
   * Consultar CEP na API externa (ViaCEP)
   */
  static buscarCEP = asyncHandler(async (req, res) => {
    const { cep } = req.params;
    
    // Limpar CEP (remover caracteres não numéricos)
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return errorResponse(res, 'CEP deve ter 8 dígitos', STATUS_CODES.BAD_REQUEST);
    }

    // Tentar buscar dados do CEP usando ViaCEP
    let dadosCEP = null;
    
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.data && !response.data.erro && response.data.cep) {
        dadosCEP = {
          cep: response.data.cep,
          logradouro: response.data.logradouro,
          complemento: response.data.complemento,
          bairro: response.data.bairro,
          localidade: response.data.localidade,
          uf: response.data.uf,
          ibge: response.data.ibge,
          gia: response.data.gia,
          ddd: response.data.ddd,
          siafi: response.data.siafi
        };
      }
    } catch (error) {
      console.log('Erro ao buscar CEP na API externa:', error.message);
      
      return errorResponse(res, 'Serviço de consulta CEP temporariamente indisponível. Tente novamente em alguns minutos.', STATUS_CODES.SERVICE_UNAVAILABLE);
    }

    if (dadosCEP) {
      return successResponse(res, dadosCEP, 'Dados do CEP encontrados', STATUS_CODES.OK);
    } else {
      return notFoundResponse(res, 'CEP não encontrado ou dados indisponíveis');
    }
  });
}

module.exports = CepSearchController;
