import api from './api';

export const cotacoesService = {
  // Buscar todas as cotações
  async getCotacoes() {
    const response = await api.get('/cotacoes');
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar cotação por ID
  async getCotacao(id) {
    const response = await api.get(`/cotacoes/${id}`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar cotação por ID (alias para getCotacao)
  async getCotacaoById(id) {
    const response = await api.get(`/cotacoes/${id}`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Criar nova cotação
  async createCotacao(cotacaoData) {
    const response = await api.post('/cotacoes', cotacaoData);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Atualizar cotação
  async updateCotacao(id, cotacaoData) {
    const response = await api.put(`/cotacoes/${id}`, cotacaoData);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Excluir cotação
  async deleteCotacao(id) {
    const response = await api.delete(`/cotacoes/${id}`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Enviar para análise do supervisor
  async sendToSupervisor(id) {
    const response = await api.post(`/cotacoes/${id}/enviar-supervisor`);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Analisar cotação
  async analisarCotacao(id, analiseData) {
    const response = await api.post(`/cotacoes/${id}/analisar`, analiseData);
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Exportar cotações
  async exportXLSX(filters = {}) {
    const response = await api.get('/cotacoes/export/xlsx', {
      params: filters,
      responseType: 'blob'
    });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  async exportPDF(filters = {}) {
    const response = await api.get('/cotacoes/export/pdf', {
      params: filters,
      responseType: 'blob'
    });
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
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
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
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
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar compradores (apenas para administradores)
  async getCompradores() {
    const response = await api.get('/cotacoes/compradores');
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar fornecedores
  async getFornecedores() {
    const response = await api.get('/fornecedores');
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  },

  // Buscar produtos
  async getProdutos() {
    const response = await api.get('/produtos');
    return response.data.data || response.data; // Extrair dados da estrutura padronizada
  }
};

export default cotacoesService;
