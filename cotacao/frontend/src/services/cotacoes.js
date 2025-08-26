import api from './api';

export const cotacoesService = {
  // Buscar todas as cotações
  async getCotacoes() {
    const response = await api.get('/cotacoes');
    return response.data;
  },

  // Buscar cotação por ID
  async getCotacao(id) {
    const response = await api.get(`/cotacoes/${id}`);
    return response.data;
  },

  // Buscar cotação por ID (alias para getCotacao)
  async getCotacaoById(id) {
    const response = await api.get(`/cotacoes/${id}`);
    return response.data;
  },

  // Criar nova cotação
  async createCotacao(cotacaoData) {
    const response = await api.post('/cotacoes', cotacaoData);
    return response.data;
  },

  // Atualizar cotação
  async updateCotacao(id, cotacaoData) {
    const response = await api.put(`/cotacoes/${id}`, cotacaoData);
    return response.data;
  },

  // Excluir cotação
  async deleteCotacao(id) {
    const response = await api.delete(`/cotacoes/${id}`);
    return response.data;
  },

  // Enviar para análise do supervisor
  async sendToSupervisor(id) {
    const response = await api.post(`/cotacoes/${id}/enviar-supervisor`);
    return response.data;
  },

  // Analisar cotação
  async analisarCotacao(id, analiseData) {
    const response = await api.post(`/cotacoes/${id}/analisar`, analiseData);
    return response.data;
  },

  // Exportar cotações
  async exportXLSX(filters = {}) {
    const response = await api.get('/cotacoes/export/xlsx', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportPDF(filters = {}) {
    const response = await api.get('/cotacoes/export/pdf', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Upload de arquivo
  async uploadFile(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/cotacoes/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Importar produtos
  async importarProdutos(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/cotacoes/${id}/importar-produtos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Buscar compradores (apenas para administradores)
  async getCompradores() {
    const response = await api.get('/cotacoes/compradores');
    return response.data;
  },

  // Buscar fornecedores
  async getFornecedores() {
    const response = await api.get('/fornecedores');
    return response.data;
  },

  // Buscar produtos
  async getProdutos() {
    const response = await api.get('/produtos');
    return response.data;
  }
};

export default cotacoesService;
