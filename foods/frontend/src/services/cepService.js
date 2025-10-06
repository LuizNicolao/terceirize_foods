import api from './api';

class CepService {
  /**
   * Buscar dados do CEP via API externa
   */
  async buscarCEP(cep) {
    try {
      // Limpar CEP (remover pontos, traços e espaços)
      const cepLimpo = cep.replace(/\D/g, '');
      
      if (cepLimpo.length !== 8) {
        return {
          success: false,
          error: 'CEP deve ter 8 dígitos'
        };
      }
      
      const response = await api.get(`/shared/buscar-cep/${cepLimpo}`);
      
      // Extrair dados da estrutura HATEOAS
      let dados = null;
      
      if (response.data.data) {
        dados = response.data.data;
      } else {
        dados = response.data;
      }
      
      return {
        success: true,
        data: dados
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar dados do CEP'
      };
    }
  }
}

export default new CepService();
