import { api } from './api';

class SavingService {
  // Buscar dados de saving
  async getSavingData(params) {
    try {
      const response = await api.get(`/saving?${params}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Dados carregados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar dados de saving:', error);
      return {
        success: false,
        data: { registros: [], total: 0, resumo: {} },
        message: error.response?.data?.message || 'Erro ao carregar dados de saving'
      };
    }
  }

  // Buscar compradores
  async getCompradores() {
    try {
      const response = await api.get('/saving/compradores/listar');
      
      return {
        success: true,
        data: response.data,
        message: 'Compradores carregados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar compradores:', error);
      return {
        success: false,
        data: { compradores: [] },
        message: error.response?.data?.message || 'Erro ao carregar compradores'
      };
    }
  }

  // Buscar detalhes de um saving
  async getSavingById(id) {
    try {
      const response = await api.get(`/saving/${id}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Detalhes carregados com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do saving:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao carregar detalhes'
      };
    }
  }

  // Exportar saving individual
  async exportarSavingIndividual(id, formato = 'xlsx') {
    try {
      const response = await api.get(`/saving/${id}/exportar?formato=${formato}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const filename = `saving_${id}_${new Date().toISOString().split('T')[0]}.${formato}`;
      
      return {
        success: true,
        data: { url, filename },
        message: 'Exportação realizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao exportar saving individual:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao exportar saving'
      };
    }
  }

  // Exportar dados de saving
  async exportarSaving(formato = 'xlsx') {
    try {
      const response = await api.get(`/saving/exportar?formato=${formato}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const filename = `saving_export_${new Date().toISOString().split('T')[0]}.${formato}`;
      
      return {
        success: true,
        data: { url, filename },
        message: 'Exportação realizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao exportar saving:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao exportar dados'
      };
    }
  }

  // Buscar comparação de saving
  async getComparacao(savingId) {
    try {
      const response = await api.get(`/saving/comparacao/${savingId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Comparação carregada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao buscar comparação:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Erro ao carregar comparação'
      };
    }
  }
}

export default new SavingService();
