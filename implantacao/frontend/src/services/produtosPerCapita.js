import api from './api';
import FoodsApiService from './FoodsApiService';

/**
 * Service para Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
class ProdutosPerCapitaService {
  /**
   * Listar produtos per capita com filtros e paginação
   */
  static async listar(filtros = {}) {
    try {
      const response = await api.get('/produtos-per-capita', { params: filtros });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination || null,
        message: response.data.message || 'Produtos per capita carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos per capita',
        data: [],
        pagination: null
      };
    }
  }

  /**
   * Buscar produto per capita por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/produtos-per-capita/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto per capita encontrado'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produto per capita',
        data: null
      };
    }
  }

  /**
   * Criar novo produto per capita
   */
  static async criar(dados) {
    try {
      const response = await api.post('/produtos-per-capita', dados);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto per capita criado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar produto per capita',
        data: null
      };
    }
  }

  /**
   * Atualizar produto per capita
   */
  static async atualizar(id, dados) {
    try {
      const response = await api.put(`/produtos-per-capita/${id}`, dados);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produto per capita atualizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar produto per capita',
        data: null
      };
    }
  }

  /**
   * Excluir produto per capita
   */
  static async excluir(id) {
    try {
      const response = await api.delete(`/produtos-per-capita/${id}`);
      return {
        success: true,
        message: response.data.message || 'Produto per capita excluído com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir produto per capita'
      };
    }
  }

  /**
   * Buscar produtos disponíveis para per capita
   * Busca produtos do Foods que NÃO têm percapita cadastrado
   * Se produtoIdForEdit for fornecido, inclui esse produto na lista (para edição)
   */
  static async buscarProdutosDisponiveis(filtros = {}) {
    try {
      const { produtoIdForEdit } = filtros;
      
      // Primeiro, buscar IDs de produtos que já têm percapita cadastrado
      const response = await api.get('/produtos-per-capita/produtos-disponiveis');
      
      if (!response.data.success) {
        return {
          success: false,
          error: response.data.error || 'Erro ao buscar produtos disponíveis',
          data: []
        };
      }
      
      let idsComPercapita = response.data.data.produtos_com_percapita || [];
      
      // Se está editando, remover o produto atual da lista de excluídos
      if (produtoIdForEdit) {
        idsComPercapita = idsComPercapita.filter(id => id !== produtoIdForEdit);
      }
      
      // Buscar todos os produtos do Foods
      const result = await FoodsApiService.getProdutosOrigem({ 
        status: 1, // Apenas ativos
        limit: 1000 // Buscar todos os produtos ativos
      });
      
      if (result.success) {
        // Filtrar produtos que NÃO têm percapita cadastrado (exceto o produto sendo editado)
        const produtosDisponiveis = (result.data || []).filter(produto => 
          !idsComPercapita.includes(produto.id)
        );
        
        return {
          success: true,
          data: produtosDisponiveis,
          message: `${produtosDisponiveis.length} produtos disponíveis para per capita`
        };
      } else {
        return {
          success: false,
          error: result.error || 'Erro ao carregar produtos origem',
          data: []
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar produtos disponíveis',
        data: []
      };
    }
  }

  /**
   * Buscar produtos per capita por produtos específicos
   */
  static async buscarPorProdutos(produtoIds) {
    try {
      const response = await api.post('/produtos-per-capita/buscar-por-produtos', { produto_ids: produtoIds });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Produtos per capita encontrados'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar produtos per capita',
        data: []
      };
    }
  }

  /**
   * Buscar grupos que têm produtos cadastrados em Produtos Per Capita
   */
  static async buscarGruposComPercapita() {
    try {
      const response = await api.get('/produtos-per-capita/grupos-com-percapita');
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Grupos carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar grupos',
        data: []
      };
    }
  }

  /**
   * Obter estatísticas
   */
  static async obterEstatisticas() {
    try {
      const response = await api.get('/produtos-per-capita/estatisticas');
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Estatísticas carregadas com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar estatísticas',
        data: {}
      };
    }
  }

  /**
   * Obter resumo por período
   */
  static async obterResumoPorPeriodo() {
    try {
      const response = await api.get('/produtos-per-capita/resumo-por-periodo');
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Resumo por período carregado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar resumo por período',
        data: []
      };
    }
  }

  /**
   * Obter dados para exportação
   */
  static async obterDadosExportacao(format = 'xlsx') {
    try {
      const response = await api.get('/produtos-per-capita/estatisticas-exportacao', { params: { format } });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Dados para exportação carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar dados para exportação',
        data: null
      };
    }
  }

  /**
   * Exportar para XLSX
   */
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/produtos-per-capita/exportar/xlsx', {
        params,
        responseType: 'blob'
      });
      
      const filename = response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1]
        : `produtos_per_capita_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      return {
        success: true,
        data: response.data,
        filename: filename.replace(/"/g, ''),
        message: 'Exportação XLSX realizada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar para XLSX',
        data: null
      };
    }
  }

  /**
   * Exportar para PDF
   */
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/produtos-per-capita/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      
      const filename = response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1]
        : `produtos_per_capita_${new Date().toISOString().split('T')[0]}.pdf`;
      
      return {
        success: true,
        data: response.data,
        filename: filename.replace(/"/g, ''),
        message: 'Exportação PDF realizada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar para PDF',
        data: null
      };
    }
  }

  /**
   * Baixar modelo de planilha para importação
   */
  static async baixarModelo() {
    try {
      const response = await api.get('/produtos-per-capita/modelo', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modelo_produtos_per_capita.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Modelo baixado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao baixar modelo de planilha',
        message: 'Erro ao baixar modelo de planilha'
      };
    }
  }

  /**
   * Importar produtos per capita via Excel
   */
  static async importar(formData) {
    try {
      const response = await api.post('/produtos-per-capita/importar', formData, {
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
        error: error.response?.data?.message || 'Erro ao processar importação',
        message: error.response?.data?.message || 'Erro ao processar importação'
      };
    }
  }
}

export default ProdutosPerCapitaService;
