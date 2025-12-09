import api from './api';

class ReceitasService {
  async listar(params = {}) {
    try {
      const response = await api.get('/receitas', { params });
      
      // Extrair dados da estrutura HATEOAS
      let receitas = [];
      let pagination = null;
      
      if (response.data.data) {
        // Se tem data.items (estrutura HATEOAS)
        if (response.data.data.items) {
          receitas = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          // Se data é diretamente um array
          receitas = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        // Se response.data é diretamente um array
        receitas = response.data;
      }
      
      return {
        success: true,
        data: receitas,
        pagination: pagination || response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar receitas'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/receitas/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let receita = null;
      
      if (response.data.data) {
        receita = response.data.data;
      } else {
        receita = response.data;
      }
      
      return {
        success: true,
        data: receita
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar receita'
      };
    }
  }

  async criar(data) {
    try {
      const response = await api.post('/receitas', data);
      
      // Extrair dados da estrutura HATEOAS
      let receita = null;
      
      if (response.data.data) {
        receita = response.data.data;
      } else {
        receita = response.data;
      }
      
      return {
        success: true,
        data: receita,
        message: 'Receita criada com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao criar receita'
      };
    }
  }

  async atualizar(id, data) {
    try {
      const response = await api.put(`/receitas/${id}`, data);
      
      // Extrair dados da estrutura HATEOAS
      let receita = null;
      
      if (response.data.data) {
        receita = response.data.data;
      } else {
        receita = response.data;
      }
      
      return {
        success: true,
        data: receita,
        message: 'Receita atualizada com sucesso!'
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
        message: error.response?.data?.message || 'Erro ao atualizar receita'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/receitas/${id}`);
      return {
        success: true,
        message: 'Receita excluída com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir receita'
      };
    }
  }

  async exportarJSON() {
    try {
      const response = await api.get('/receitas/exportar/json', {
        responseType: 'blob'
      });
      
      // Criar link de download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receitas_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Receitas exportadas com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao exportar receitas'
      };
    }
  }

  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/receitas/exportar/xlsx', {
        params,
        responseType: 'blob'
      });
      
      // Criar link de download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receitas_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Receitas exportadas para XLSX com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar receitas para XLSX'
      };
    }
  }

  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/receitas/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      
      // Criar link de download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receitas_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Receitas exportadas para PDF com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar receitas para PDF'
      };
    }
  }

  async verificarPorCentroCustoEProdutos(centroCustoId, produtos) {
    try {
      const response = await api.post('/receitas/verificar-por-centro-custo-produtos', {
        centro_custo_id: centroCustoId,
        produtos: produtos
      });
      
      // Extrair dados da estrutura HATEOAS
      let resultado = null;
      
      if (response.data.data) {
        resultado = response.data.data;
      } else {
        resultado = response.data;
      }
      
      return {
        success: true,
        data: resultado
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao verificar receita'
      };
    }
  }

  async baixarModelo() {
    try {
      const response = await api.get('/receitas/importar/modelo', {
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modelo_receitas.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao baixar modelo de planilha'
      };
    }
  }

  async importar(formData) {
    try {
      // Não definir Content-Type manualmente - o navegador/axios faz isso automaticamente para FormData
      const response = await api.post('/receitas/importar', formData);
      
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      console.error('Erro na importação:', error);
      
      // Extrair mensagem de erro de forma segura
      let errorMessage = 'Erro na importação';
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = typeof error.response.data.error === 'string' 
            ? error.response.data.error 
            : (error.response.data.error?.message || JSON.stringify(error.response.data.error));
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        data: error.response?.data?.data || null
      };
    }
  }
}

export default new ReceitasService();

