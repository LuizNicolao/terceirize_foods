import api from './api';
import CepService from './cepService';

class FornecedoresService {
  async listar(params = {}) {
    try {
      const response = await api.get('/fornecedores', { params });
      
      // Extrair dados da estrutura HATEOAS
      let fornecedores = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          fornecedores = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          fornecedores = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        fornecedores = response.data;
      }
      
      return {
        success: true,
        data: fornecedores,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar fornecedores'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/fornecedores/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let fornecedor = null;
      
      if (response.data.data) {
        fornecedor = response.data.data;
      } else {
        fornecedor = response.data;
      }
      
      return {
        success: true,
        data: fornecedor
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar fornecedor'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/fornecedores', data);
      
      // Extrair dados da estrutura HATEOAS
      let fornecedor = null;
      
      if (response.data.data) {
        fornecedor = response.data.data;
      } else {
        fornecedor = response.data;
      }
      
      return {
        success: true,
        data: fornecedor,
        message: 'Fornecedor criado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar fornecedor'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/fornecedores/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let fornecedor = null;
      
      if (response.data.data) {
        fornecedor = response.data.data;
      } else {
        fornecedor = response.data;
      }
      
      return {
        success: true,
        data: fornecedor,
        message: 'Fornecedor atualizado com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar fornecedor'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/fornecedores/${id}`);
      return {
        success: true,
        message: 'Fornecedor excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir fornecedor'
      };
    }
  }

  async buscarCNPJ(cnpj) {
    try {
      // Limpar CNPJ (remover pontos, traços e barras)
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      
      const response = await api.get(`/fornecedores/buscar-cnpj/${cnpjLimpo}`);
      
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
        error: error.response?.data?.message || 'Erro ao buscar dados do CNPJ'
      };
    }
  }

  async consultarCEP(cep) {
    return await CepService.buscarCEP(cep);
  }

  async buscarEstatisticas() {
    try {
      const response = await api.get('/fornecedores/estatisticas');
      
      // Extrair dados da estrutura HATEOAS
      let estatisticas = null;
      
      if (response.data.data) {
        estatisticas = response.data.data;
      } else {
        estatisticas = response.data;
      }
      
      return {
        success: true,
        data: estatisticas
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar estatísticas'
      };
    }
  }

  async buscarAtivos() {
    try {
      const response = await api.get('/fornecedores', { params: { status: 1 } });
      
      // Extrair dados da estrutura HATEOAS
      let fornecedores = [];
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          fornecedores = response.data.data.items;
        } else {
          // Se data é diretamente um array
          fornecedores = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        fornecedores = response.data;
      }
      
      return {
        success: true,
        data: fornecedores
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar fornecedores ativos'
      };
    }
  }

  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/fornecedores/export/xlsx', {
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar XLSX'
      };
    }
  }

  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/fornecedores/export/pdf', {
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar PDF'
      };
    }
  }

  async buscarAuditoria(fornecedorId = null, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros
      if (filters.dataInicio) {
        params.append('data_inicio', filters.dataInicio);
      }
      if (filters.dataFim) {
        params.append('data_fim', filters.dataFim);
      }
      if (filters.acao) {
        params.append('acao', filters.acao);
      }
      if (filters.usuario_id) {
        params.append('usuario_id', filters.usuario_id);
      }
      
      // Filtro específico para fornecedores
      params.append('recurso', 'fornecedores');
      
      // Se fornecedorId específico, adicionar aos detalhes
      if (fornecedorId) {
        params.append('fornecedor_id', fornecedorId);
      }
      
      const response = await api.get(`/auditoria?${params.toString()}`);
      
      return {
        success: true,
        data: response.data.data || response.data.logs || []
      };
    } catch (error) {
      console.error('Erro ao buscar auditoria:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar auditoria'
      };
    }
  }
}

export default new FornecedoresService(); 