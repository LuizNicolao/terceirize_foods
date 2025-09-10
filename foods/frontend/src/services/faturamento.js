import api from './api';

class FaturamentoService {
  // Listar faturamentos com paginação, busca e filtros
  static async listar(params = {}) {
    try {
      // Filtrar parâmetros vazios
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => 
          value !== '' && value !== null && value !== undefined
        )
      );
      
      
      const response = await api.get('/faturamento', { params: cleanParams });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar faturamentos'
      };
    }
  }

  // Buscar faturamento por ID
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/faturamento/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar faturamento'
      };
    }
  }

  // Criar faturamento
  static async criar(data) {
    try {
      const response = await api.post('/faturamento', data);
      return {
        success: true,
        data: response.data.data,
        message: 'Faturamento criado com sucesso!'
      };
    } catch (error) {
      // Capturar erros de validação do backend
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao criar faturamento'
      };
    }
  }

  // Atualizar faturamento
  static async atualizar(id, data) {
    try {
      const response = await api.put(`/faturamento/${id}`, data);
      return {
        success: true,
        data: response.data.data,
        message: 'Faturamento atualizado com sucesso!'
      };
    } catch (error) {
      // Capturar erros de validação do backend
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar faturamento'
      };
    }
  }

  // Excluir faturamento
  static async excluir(id) {
    try {
      await api.delete(`/faturamento/${id}`);
      return {
        success: true,
        message: 'Faturamento excluído com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir faturamento'
      };
    }
  }

  // Exportar para XLSX
  static async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/faturamento/exportar/xlsx', {
        params,
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `faturamento_${new Date().toISOString().split('T')[0]}.xlsx`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar XLSX'
      };
    }
  }

  // Exportar para PDF
  static async exportarPDF(params = {}) {
    try {
      const response = await api.get('/faturamento/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `faturamento_${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar PDF'
      };
    }
  }


  // Buscar faturamento por unidade escolar
  static async buscarPorUnidade(unidadeEscolarId, params = {}) {
    try {
      const response = await api.get(`/faturamento/unidade-escolar/${unidadeEscolarId}`, { params });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar faturamentos da unidade'
      };
    }
  }

  // Criar faturamento para unidade escolar
  static async criarPorUnidade(unidadeEscolarId, data) {
    try {
      const response = await api.post(`/faturamento/unidade-escolar/${unidadeEscolarId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: 'Faturamento criado com sucesso!'
      };
    } catch (error) {
      // Capturar erros de validação do backend
      if (error.response?.status === 422) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dados inválidos',
          validationErrors: error.response?.data?.errors,
          errorCategories: error.response?.data?.errorCategories
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Erro ao criar faturamento'
      };
    }
  }

  // Buscar períodos de refeição disponíveis
  static async buscarPeriodosDisponiveis() {
    try {
      const response = await api.get('/faturamento/periodos-refeicao/disponiveis');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar períodos disponíveis'
      };
    }
  }

  // Gerar dados padrão para um mês
  static gerarDadosPadrao(mes, ano) {
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const dados = [];

    for (let dia = 1; dia <= diasNoMes; dia++) {
      dados.push({
        dia,
        desjejum: 0,
        lanche_matutino: 0,
        almoco: 0,
        lanche_vespertino: 0,
        noturno: 0
      });
    }

    return dados;
  }

  // Calcular totais do faturamento
  static calcularTotais(dadosFaturamento) {
    const totais = {
      desjejum: 0,
      lanche_matutino: 0,
      almoco: 0,
      lanche_vespertino: 0,
      noturno: 0,
      total_geral: 0
    };

    dadosFaturamento.forEach(dia => {
      totais.desjejum += parseInt(dia.desjejum) || 0;
      totais.lanche_matutino += parseInt(dia.lanche_matutino) || 0;
      totais.almoco += parseInt(dia.almoco) || 0;
      totais.lanche_vespertino += parseInt(dia.lanche_vespertino) || 0;
      totais.noturno += parseInt(dia.noturno) || 0;
    });

    totais.total_geral = totais.desjejum + totais.lanche_matutino + totais.almoco + 
                        totais.lanche_vespertino + totais.noturno;

    return totais;
  }
}

export default FaturamentoService;
