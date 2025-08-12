import api from './api';

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
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar fornecedor'
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
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar fornecedor'
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
      const response = await api.get(`/fornecedores/buscar-cnpj/${cnpj}`);
      
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

  async exportarXLSX() {
    try {
      const response = await api.get('/fornecedores/export/xlsx', {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao exportar XLSX'
      };
    }
  }

  async exportarPDF() {
    try {
      const response = await api.get('/fornecedores/export/pdf', {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao exportar PDF'
      };
    }
  }
}

export default new FornecedoresService(); 