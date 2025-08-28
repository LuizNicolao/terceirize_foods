import api from './api';

class IntoleranciasService {
  /**
   * Lista todas as intolerâncias com paginação e filtros
   */
  static async listarIntolerancias(params = {}) {
    const response = await api.get('/intolerancias', { params });
    return response.data;
  }

  /**
   * Busca uma intolerância específica por ID
   */
  static async buscarIntoleranciaPorId(id) {
    const response = await api.get(`/intolerancias/${id}`);
    return response.data;
  }

  /**
   * Cria uma nova intolerância
   */
  static async criarIntolerancia(data) {
    const response = await api.post('/intolerancias', data);
    return response.data;
  }

  /**
   * Atualiza uma intolerância existente
   */
  static async atualizarIntolerancia(id, data) {
    const response = await api.put(`/intolerancias/${id}`, data);
    return response.data;
  }

  /**
   * Exclui uma intolerância
   */
  static async excluirIntolerancia(id) {
    const response = await api.delete(`/intolerancias/${id}`);
    return response.data;
  }

  /**
   * Lista todas as intolerâncias ativas
   */
  static async listarIntoleranciasAtivas() {
    const response = await api.get('/intolerancias/ativas/listar');
    return response.data;
  }

  /**
   * Exporta dados para XLSX
   */
  static async exportarXLSX(params = {}) {
    const response = await api.get('/intolerancias/export/xlsx', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Exporta dados para PDF
   */
  static async exportarPDF(params = {}) {
    const response = await api.get('/intolerancias/export/pdf', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

export default IntoleranciasService;
