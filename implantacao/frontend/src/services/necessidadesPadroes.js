import api from './api';

class NecessidadesPadroesService {
  /**
   * Listar padrões com paginação e filtros
   */
  static async listar(params = {}) {
    try {
      const response = await api.get('/necessidades-padroes', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar padrões:', error);
      throw error;
    }
  }

  /**
   * Buscar padrão por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/necessidades-padroes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar padrão:', error);
      throw error;
    }
  }

  /**
   * Buscar padrões por escola e grupo
   */
  static async buscarPorEscolaGrupo(escola_id, grupo_id) {
    try {
      const response = await api.get(`/necessidades-padroes/escola/${escola_id}/grupo/${grupo_id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar padrões por escola e grupo:', error);
      throw error;
    }
  }

  /**
   * Criar novo padrão
   */
  static async criar(dados) {
    try {
      const response = await api.post('/necessidades-padroes', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar padrão:', error);
      throw error;
    }
  }

  /**
   * Atualizar padrão
   */
  static async atualizar(id, dados) {
    try {
      const response = await api.put(`/necessidades-padroes/${id}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar padrão:', error);
      throw error;
    }
  }

  /**
   * Excluir padrão
   */
  static async excluir(id) {
    try {
      const response = await api.delete(`/necessidades-padroes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir padrão:', error);
      throw error;
    }
  }

  /**
   * Salvar padrão completo (múltiplos produtos)
   */
  static async salvarPadrao(dados) {
    try {
      const response = await api.post('/necessidades-padroes/salvar-padrao', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar padrão:', error);
      throw error;
    }
  }

  /**
   * Gerar necessidades padrão a partir de necessidades_substituicoes
   */
  static async gerarNecessidadesPadrao(dados) {
    try {
      const response = await api.post('/necessidades-padroes/gerar-necessidades', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar necessidades padrão:', error);
      throw error;
    }
  }

  /**
   * Buscar semana de abastecimento por semana de consumo
   */
  static async buscarSemanaAbastecimentoPorConsumo(semana_consumo) {
    try {
      const response = await api.get('/necessidades-padroes/buscar-semana-abastecimento', {
        params: { semana_consumo }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar semana de abastecimento:', error);
      // Retornar objeto estruturado em caso de erro
      if (error.response?.status === 404) {
        return {
          success: false,
          message: error.response?.data?.message || 'Semana de abastecimento não encontrada',
          data: null
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erro ao buscar semana de abastecimento',
        data: null
      };
    }
  }

  /**
   * Exportar padrões para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/necessidades-padroes/export/xlsx', {
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']
          ? response.headers['content-disposition'].split('filename=')[1]?.replace(/"/g, '')
          : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar XLSX'
      };
    }
  }

  /**
   * Exportar padrões para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/necessidades-padroes/export/pdf', {
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']
          ? response.headers['content-disposition'].split('filename=')[1]?.replace(/"/g, '')
          : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar PDF'
      };
    }
  }

  /**
   * Baixar modelo para importação
   */
  static async baixarModelo() {
    try {
      const response = await api.get('/necessidades-padroes/import/modelo', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modelo_pedido_mensal.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao baixar modelo'
      };
    }
  }

  /**
   * Importar padrões via Excel
   */
  static async importarExcel(formData) {
    try {
      const response = await api.post('/necessidades-padroes/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao importar planilha'
      };
    }
  }
}

export default NecessidadesPadroesService;
