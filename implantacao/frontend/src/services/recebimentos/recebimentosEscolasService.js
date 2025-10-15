import api from '../api';

const recebimentosEscolasService = {
  // Listar recebimentos com filtros
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    // Mapear filtros do frontend para parâmetros do backend
    const mapeamentoFiltros = {
      escola: 'escola_id',
      tipo_recebimento: 'tipo_recebimento',
      tipo_entrega: 'tipo_entrega',
      semana_abastecimento: 'semana_abastecimento',
      search: 'search',
      data_inicio: 'data_inicio',
      data_fim: 'data_fim'
    };
    
    Object.keys(filtros).forEach(key => {
      const valor = filtros[key];
      const parametroBackend = mapeamentoFiltros[key];
      
      if (parametroBackend && valor !== undefined && valor !== '' && valor !== null) {
        // Se for escola, pegar o ID
        if (key === 'escola' && typeof valor === 'object' && valor.id) {
          params.append(parametroBackend, valor.id);
        } else if (key !== 'escola') {
          params.append(parametroBackend, valor);
        }
      }
    });

    const response = await api.get(`/recebimentos-escolas?${params.toString()}`);
    return response.data;
  },

  // Listar todos os recebimentos (sem paginação)
  listarTodas: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    // Mapear filtros do frontend para parâmetros do backend
    const mapeamentoFiltros = {
      escola: 'escola_id',
      tipo_recebimento: 'tipo_recebimento',
      tipo_entrega: 'tipo_entrega',
      semana_abastecimento: 'semana_abastecimento',
      search: 'search',
      data_inicio: 'data_inicio',
      data_fim: 'data_fim'
    };
    
    Object.keys(filtros).forEach(key => {
      const valor = filtros[key];
      const parametroBackend = mapeamentoFiltros[key];
      
      if (parametroBackend && valor !== undefined && valor !== '' && valor !== null) {
        // Se for escola, pegar o ID
        if (key === 'escola' && typeof valor === 'object' && valor.id) {
          params.append(parametroBackend, valor.id);
        } else if (key !== 'escola') {
          params.append(parametroBackend, valor);
        }
      }
    });

    const response = await api.get(`/recebimentos-escolas/todas?${params.toString()}`);
    return response.data;
  },

  // Buscar recebimento por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/recebimentos-escolas/${id}`);
    return response.data;
  },

  // Criar novo recebimento
  criar: async (dados) => {
    const response = await api.post('/recebimentos-escolas', dados);
    return response.data;
  },

  // Atualizar recebimento
  atualizar: async (id, dados) => {
    const response = await api.put(`/recebimentos-escolas/${id}`, dados);
    return response.data;
  },

  // Deletar recebimento
  deletar: async (id) => {
    const response = await api.delete(`/recebimentos-escolas/${id}`);
    return response.data;
  },

  // Alias para excluir (mantém compatibilidade)
  excluir: async (id) => {
    const response = await api.delete(`/recebimentos-escolas/${id}`);
    return response.data;
  },

  // Listar escolas disponíveis
  listarEscolas: async (tipoUsuario = null, usuarioId = null) => {
    try {
      // Sempre usar o endpoint de escolas-nutricionista (que agora funciona para todos os tipos)
      if (usuarioId) {
        const response = await api.get(`/recebimentos-escolas/escolas-nutricionista/${usuarioId}`);
        if (response.data && response.data.success) {
          return {
            success: true,
            data: response.data.data || []
          };
        }
      }
      
      // Fallback: buscar todas as escolas dos recebimentos
      const response = await api.get('/recebimentos-escolas/todas');
      if (response.data && response.data.success && response.data.data) {
        // Extrair escolas únicas dos recebimentos
        const recebimentos = response.data.data;
        const escolasMap = new Map();
        
        recebimentos.forEach(recebimento => {
          if (recebimento.escola_id && recebimento.escola_nome) {
            if (!escolasMap.has(recebimento.escola_id)) {
              escolasMap.set(recebimento.escola_id, {
                id: recebimento.escola_id,
                nome_escola: recebimento.escola_nome,
                rota: recebimento.escola_rota || '',
                cidade: recebimento.escola_cidade || ''
              });
            }
          }
        });
        
        return {
          success: true,
          data: Array.from(escolasMap.values())
        };
      }
      
      return { success: true, data: [] };
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      return { success: false, error: 'Erro ao carregar escolas' };
    }
  },

  // Obter estatísticas
  obterEstatisticas: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    // Mapear filtros do frontend para parâmetros do backend
    const mapeamentoFiltros = {
      escola: 'escola_id',
      tipo_recebimento: 'tipo_recebimento',
      tipo_entrega: 'tipo_entrega',
      semana_abastecimento: 'semana_abastecimento',
      data_inicio: 'data_inicio',
      data_fim: 'data_fim'
    };
    
    Object.keys(filtros).forEach(key => {
      const valor = filtros[key];
      const parametroBackend = mapeamentoFiltros[key];
      
      if (parametroBackend && valor !== undefined && valor !== '' && valor !== null) {
        // Se for escola, pegar o ID
        if (key === 'escola' && typeof valor === 'object' && valor.id) {
          params.append(parametroBackend, valor.id);
        } else if (key !== 'escola') {
          params.append(parametroBackend, valor);
        }
      }
    });

    const response = await api.get(`/recebimentos-escolas/estatisticas?${params.toString()}`);
    return response.data;
  },

  // Exportar XLSX
  exportarXLSX: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/recebimentos-escolas/exportar/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `recebimentos_escolas_${new Date().toISOString().split('T')[0]}.xlsx`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar XLSX'
      };
    }
  },

  // Exportar PDF
  exportarPDF: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '') {
          params.append(key, filtros[key]);
        }
      });

      const response = await api.get(`/recebimentos-escolas/exportar/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `recebimentos_escolas_${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao exportar PDF'
      };
    }
  }
};

export default recebimentosEscolasService;
