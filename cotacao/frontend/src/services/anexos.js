import api from './api';

export const anexosService = {
  // Buscar anexos de uma cotação
  async getAnexos(cotacaoId) {
    const response = await api.get(`/cotacoes/${cotacaoId}/anexos`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Upload de anexo
  async uploadAnexo(cotacaoId, fornecedorId, file, observacoes = '') {
    const formData = new FormData();
    formData.append('anexo', file);
    formData.append('fornecedor_id', fornecedorId);
    formData.append('observacoes', observacoes);

    const response = await api.post(`/cotacoes/${cotacaoId}/anexos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Excluir anexo
  async deleteAnexo(cotacaoId, anexoId) {
    const response = await api.delete(`/cotacoes/${cotacaoId}/anexos/${anexoId}`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar validações de anexos
  async getValidacaoAnexos(cotacaoId) {
    const response = await api.get(`/cotacoes/${cotacaoId}/validacao-anexos`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Validar anexos obrigatórios
  async validarAnexos(cotacaoId, data) {
    const response = await api.post(`/cotacoes/${cotacaoId}/validar-anexos`, data);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  }
};
