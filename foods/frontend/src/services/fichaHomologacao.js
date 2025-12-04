/**
 * Service para Ficha Homologação
 * Responsável pela comunicação com a API de fichas de homologação
 */

import api from './api';

class FichaHomologacaoService {
  async listar(params = {}) {
    try {
      const response = await api.get('/ficha-homologacao', { params });
      
      // Extrair dados da estrutura HATEOAS
      let fichasHomologacao = [];
      let pagination = null;
      let statistics = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          fichasHomologacao = response.data.data.items;
        } else {
          // Se data é diretamente um array
          fichasHomologacao = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        fichasHomologacao = response.data;
      }
      
      // Extrair paginação
      if (response.data.pagination) {
        pagination = response.data.pagination;
      }
      
      // Extrair estatísticas
      if (response.data.statistics) {
        statistics = response.data.statistics;
      }
      
      return {
        success: true,
        data: fichasHomologacao,
        pagination: pagination || response.data.pagination,
        statistics: statistics || response.data.statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar fichas de homologação'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/ficha-homologacao/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let fichaHomologacao = null;
      
      if (response.data.data) {
        fichaHomologacao = response.data.data;
      } else {
        fichaHomologacao = response.data;
      }
      
      return {
        success: true,
        data: fichaHomologacao
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar ficha de homologação'
      };
    }
  }

  async criar(data) {
    try {
      // Se for FormData, NÃO definir Content-Type manualmente
      // O navegador precisa definir automaticamente com o boundary correto
      const isFormData = data instanceof FormData;
      const config = isFormData ? {} : {};

      const response = await api.post('/ficha-homologacao', data, config);
      
      // Extrair dados da estrutura HATEOAS
      let fichaHomologacao = null;
      
      if (response.data.data) {
        fichaHomologacao = response.data.data;
      } else {
        fichaHomologacao = response.data;
      }
      
      return {
        success: true,
        data: fichaHomologacao,
        message: 'Ficha de homologação criada com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar ficha de homologação'
      };
    }
  }

  async atualizar(id, data) {
    try {
      // Se for FormData, NÃO definir Content-Type manualmente
      // O navegador precisa definir automaticamente com o boundary correto
      const isFormData = data instanceof FormData;
      const config = isFormData ? {} : {};

      const response = await api.put(`/ficha-homologacao/${id}`, data, config);
      
      // Extrair dados da estrutura HATEOAS
      let fichaHomologacao = null;
      
      if (response.data.data) {
        fichaHomologacao = response.data.data;
      } else {
        fichaHomologacao = response.data;
      }
      
      return {
        success: true,
        data: fichaHomologacao,
        message: 'Ficha de homologação atualizada com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors,
          errorCategories: error.response.data.errorCategories
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar ficha de homologação'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/ficha-homologacao/${id}`);
      return {
        success: true,
        message: 'Ficha de homologação excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir ficha de homologação'
      };
    }
  }

  async buscarAtivas() {
    try {
      const response = await api.get('/ficha-homologacao/ativos');
      
      // Extrair dados da estrutura HATEOAS
      let fichasHomologacao = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          fichasHomologacao = response.data.data.items;
        } else {
          // Se data é diretamente um array
          fichasHomologacao = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        fichasHomologacao = response.data;
      }
      
      return {
        success: true,
        data: fichasHomologacao
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar fichas de homologação ativas'
      };
    }
  }

  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/ficha-homologacao/exportar/xlsx', {
        params,
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `fichas-homologacao-${new Date().toISOString().split('T')[0]}.xlsx`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar fichas de homologação'
      };
    }
  }

  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/ficha-homologacao/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `fichas-homologacao-${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar fichas de homologação'
      };
    }
  }

  async gerarPDF(id, templateId = null) {
    try {
      const params = templateId ? { template_id: templateId } : {};
      const response = await api.get(`/ficha-homologacao/${id}/pdf`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Métodos auxiliares para carregar dados relacionados
  async getNomeGenericos() {
    try {
      const response = await api.get('/produto-generico');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar nomes genéricos'
      };
    }
  }

  async getMarcas() {
    try {
      const response = await api.get('/marcas');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar marcas'
      };
    }
  }

  async getFornecedores() {
    try {
      const response = await api.get('/fornecedores');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar fornecedores'
      };
    }
  }

  async getUnidadesMedida() {
    try {
      const response = await api.get('/unidades');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar unidades de medida'
      };
    }
  }

  async getUsuarios() {
    try {
      const response = await api.get('/usuarios');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar usuários'
      };
    }
  }

  /**
   * Obter URL para download/exibição de arquivo
   * @param {number} id - ID da ficha de homologação
   * @param {string} tipo - Tipo de arquivo: foto_embalagem, foto_produto_cru, foto_produto_cozido, pdf_avaliacao_antiga
   * @returns {string} URL do arquivo
   */
  getArquivoUrl(id, tipo) {
    const baseURL = api.defaults.baseURL;
    return `${baseURL}/ficha-homologacao/${id}/download/${tipo}`;
  }
}

export default new FichaHomologacaoService();

