/**
 * Service para Templates de PDF
 * Gerencia todas as operações de API relacionadas a templates de PDF
 */

import api from './api';

class PdfTemplatesService {
  async listar(params = {}) {
    try {
      const response = await api.get('/pdf-templates', { params });
      
      let templates = [];
      let pagination = null;
      
      if (response.data.data) {
        templates = response.data.data;
      } else if (Array.isArray(response.data)) {
        templates = response.data;
      }
      
      if (response.data.pagination) {
        pagination = response.data.pagination;
      }
      
      return {
        success: true,
        data: templates,
        pagination: pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar templates de PDF'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/pdf-templates/${id}`);
      
      let template = null;
      
      if (response.data.data) {
        template = response.data.data;
      } else {
        template = response.data;
      }
      
      return {
        success: true,
        data: template
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar template de PDF'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/pdf-templates', data);
      
      let template = null;
      
      if (response.data.data) {
        template = response.data.data;
      } else {
        template = response.data;
      }
      
      return {
        success: true,
        data: template,
        message: 'Template de PDF criado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar template de PDF'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/pdf-templates/${id}`, data);
      
      let template = null;
      
      if (response.data.data) {
        template = response.data.data;
      } else {
        template = response.data;
      }
      
      return {
        success: true,
        data: template,
        message: 'Template de PDF atualizado com sucesso!'
      };
    } catch (error) {
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Dados inválidos',
          validationErrors: error.response.data.errors
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar template de PDF'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/pdf-templates/${id}`);
      return {
        success: true,
        message: 'Template de PDF excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir template de PDF'
      };
    }
  }

  async buscarTemplatePadrao(telaVinculada) {
    try {
      const response = await api.get(`/pdf-templates/tela/${telaVinculada}/padrao`);
      
      let template = null;
      
      if (response.data.data) {
        template = response.data.data;
      } else {
        template = response.data;
      }
      
      return {
        success: true,
        data: template
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar template padrão'
      };
    }
  }

  async listarTelasDisponiveis() {
    try {
      const response = await api.get('/pdf-templates/telas-disponiveis');
      
      let telas = [];
      
      if (response.data.data) {
        telas = response.data.data;
      } else if (Array.isArray(response.data)) {
        telas = response.data;
      }
      
      return {
        success: true,
        data: telas
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao listar telas disponíveis'
      };
    }
  }

  async gerarPDF(telaVinculada, dados, templateId = null) {
    try {
      const response = await api.post('/pdf-templates/gerar-pdf', {
        tela_vinculada: telaVinculada,
        template_id: templateId,
        dados: dados
      }, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }
}

export default new PdfTemplatesService();

