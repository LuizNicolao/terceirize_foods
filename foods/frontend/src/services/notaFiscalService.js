import api from './api';

class NotaFiscalService {
  /**
   * Listar notas fiscais com paginação e filtros
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/notas-fiscais', { params });
      
      // Extrair dados da estrutura HATEOAS
      let notasFiscais = [];
      let pagination = null;
      
      if (response.data) {
        // Se tem data.data.items (estrutura HATEOAS)
        if (response.data.data?.items && Array.isArray(response.data.data.items)) {
          notasFiscais = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } 
        // Se tem data.data como array
        else if (response.data.data && Array.isArray(response.data.data)) {
          notasFiscais = response.data.data;
          pagination = response.data.data._meta?.pagination;
        }
        // Se data é diretamente um array
        else if (Array.isArray(response.data)) {
          notasFiscais = response.data;
        }
        // Se data é um objeto com items
        else if (response.data.items && Array.isArray(response.data.items)) {
          notasFiscais = response.data.items;
          pagination = response.data._meta?.pagination;
        }
      }
      
      // Garantir que sempre retornamos um array
      if (!Array.isArray(notasFiscais)) {
        notasFiscais = [];
      }
      
      return {
        success: true,
        data: notasFiscais,
        pagination: pagination || response.data?.pagination || response.data?.meta?.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar notas fiscais'
      };
    }
  }

  /**
   * Buscar nota fiscal por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/notas-fiscais/${id}`);
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar nota fiscal'
      };
    }
  }

  /**
   * Criar nova nota fiscal
   */
  async criar(notaFiscal) {
    try {
      // Se for FormData, usar headers multipart/form-data
      const isFormData = notaFiscal instanceof FormData;
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } : {};

      const response = await api.post('/notas-fiscais', notaFiscal, config);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Nota fiscal criada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar nota fiscal',
        validationErrors: error.response?.data?.errors || error.response?.data
      };
    }
  }

  /**
   * Atualizar nota fiscal
   */
  async atualizar(id, notaFiscal) {
    try {
      const response = await api.put(`/notas-fiscais/${id}`, notaFiscal);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Nota fiscal atualizada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar nota fiscal'
      };
    }
  }

  /**
   * Excluir nota fiscal
   */
  async excluir(id) {
    try {
      await api.delete(`/notas-fiscais/${id}`);
      
      return {
        success: true,
        message: 'Nota fiscal excluída com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir nota fiscal'
      };
    }
  }

  /**
   * Buscar quantidades já lançadas para um pedido de compra
   */
  async buscarQuantidadesLancadas(pedidoCompraId, notaFiscalId = null) {
    try {
      const params = notaFiscalId ? { nota_fiscal_id: notaFiscalId } : {};
      const response = await api.get(`/notas-fiscais/quantidades-lancadas/${pedidoCompraId}`, { params });
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar quantidades lançadas'
      };
    }
  }

  /**
   * Exportar notas fiscais para XLSX
   */
  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/notas-fiscais/export/xlsx', {
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

  /**
   * Exportar notas fiscais para PDF
   */
  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/notas-fiscais/export/pdf', {
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

  /**
   * Baixar modelo de planilha para importação
   */
  async baixarModelo() {
    try {
      const response = await api.get('/notas-fiscais/modelo', {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao baixar modelo'
      };
    }
  }

  /**
   * Importar notas fiscais via Excel
   */
  async importar(formData) {
    try {
      const response = await api.post('/notas-fiscais/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data.data || null,
        message: response.data.message || 'Importação realizada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro na importação',
        data: error.response?.data?.data || null
      };
    }
  }

  /**
   * Download do arquivo da nota fiscal
   * @param {number} id - ID da nota fiscal
   * @param {string} xmlPath - Caminho do arquivo (opcional, se não fornecido, busca da API)
   */
  async downloadArquivo(id, xmlPath = null) {
    try {
      // Se não temos o xmlPath, buscar primeiro a nota fiscal para obter o caminho
      let filename = `nota_fiscal_${id}.pdf`;
      if (xmlPath) {
        // Extrair nome do arquivo do caminho
        const pathParts = xmlPath.split('/');
        filename = pathParts[pathParts.length - 1] || filename;
      } else {
        // Buscar nota fiscal para obter o xml_path
        const notaResponse = await api.get(`/notas-fiscais/${id}`);
        if (notaResponse.data?.data?.xml_path) {
          const pathParts = notaResponse.data.data.xml_path.split('/');
          filename = pathParts[pathParts.length - 1] || filename;
        }
      }
      
      const response = await api.get(`/notas-fiscais/${id}/download`, {
        responseType: 'blob'
      });
      
      // Tentar extrair do header também (fallback)
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      if (contentDisposition) {
        // Tentar diferentes padrões de extração
        let match = contentDisposition.match(/filename="([^"]+)"/);
        if (!match) {
          match = contentDisposition.match(/filename=([^;]+)/);
        }
        if (!match) {
          match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
          if (match) {
            filename = decodeURIComponent(match[1]);
          }
        } else {
          const extractedName = match[1].trim().replace(/^["']|["']$/g, '');
          if (extractedName && extractedName !== `nota_fiscal_${id}.pdf`) {
            filename = extractedName;
          }
        }
      }
      
      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Arquivo baixado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao baixar arquivo'
      };
    }
  }
}

export default new NotaFiscalService();

