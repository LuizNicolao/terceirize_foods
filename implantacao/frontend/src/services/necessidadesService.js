import api from './api';
import FoodsApiService from './FoodsApiService';

const necessidadesService = {
  // Listar necessidades com filtros
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
        let value = filtros[key];
        
        // Tratar objetos complexos
        if (key === 'escola' && typeof value === 'object' && value && value.nome_escola) {
          value = value.nome_escola;
        } else if (key === 'grupo' && typeof value === 'object' && value && value.id) {
          value = value.id;
        } else if (key === 'data' && typeof value === 'string') {
          // Manter o formato da semana de consumo (DD/MM a DD/MM/YY)
          value = value;
        }
        
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/necessidades?${params.toString()}`);
    return response.data;
  },

  // Buscar necessidade por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/necessidades/${id}`);
    return response.data;
  },

  // Criar nova necessidade
  criar: async (dados) => {
    const response = await api.post('/necessidades', dados);
    return response.data;
  },

  // Atualizar necessidade
  atualizar: async (id, dados) => {
    const response = await api.put(`/necessidades/${id}`, dados);
    return response.data;
  },

  // Deletar necessidade
  deletar: async (id) => {
    const response = await api.delete(`/necessidades/${id}`);
    return response.data;
  },

  // Deletar produto de necessidade em ajuste
  deletarProdutoAjuste: async (id) => {
    const response = await api.delete(`/necessidades/ajuste/${id}`);
    return response.data;
  },

  // Gerar necessidade (nova funcionalidade)
  gerarNecessidade: async (dados) => {
    const response = await api.post('/necessidades/gerar', dados);
    return response.data;
  },

  // Buscar produtos por grupo (do sistema implantacao)
  buscarProdutosPorGrupo: async (grupoId) => {
    const response = await api.get(`/produtos-per-capita?grupo=${grupoId}&ativo=true`);
    return response.data;
  },

  // Buscar percapita de produtos
  buscarPercapitaProdutos: async (produtoIds) => {
    const response = await api.post('/produtos-per-capita/buscar-por-produtos', { produto_ids: produtoIds });
    return response.data;
  },

  // Calcular médias por período
  calcularMediasPorPeriodo: async (escolaId, data) => {
    const response = await api.get(`/registros-diarios/medias-periodo?escola_id=${escolaId}&data=${data}`);
    return response.data;
  },

  // Buscar grupos de produtos (via Foods API)
  buscarGrupos: async () => {
    const response = await FoodsApiService.getGruposAtivos();
    return response;
  },

  // Buscar grupos que têm produtos cadastrados em Produtos Per Capita
  buscarGruposComPercapita: async () => {
    const response = await api.get('/produtos-per-capita/grupos-com-percapita');
    return response.data;
  },

  // ===== ENDPOINTS PARA AJUSTE DE NECESSIDADES =====

  // Buscar semanas de consumo disponíveis na tabela necessidades
  buscarSemanasConsumoDisponiveis: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.escola_id) params.append('escola_id', filtros.escola_id);
    
    const response = await api.get(`/necessidades/semanas-consumo-disponiveis?${params.toString()}`);
    return response.data;
  },

  // Listar necessidades para ajuste (status = 'NEC')
  listarParaAjuste: async (filtros) => {
    const params = new URLSearchParams();
    if (filtros.escola_id) params.append('escola_id', filtros.escola_id);
    if (filtros.grupo) params.append('grupo', filtros.grupo);
    if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);
    if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
    
    const response = await api.get(`/necessidades/ajuste?${params.toString()}`);
    return response.data;
  },

  // Salvar ajustes da nutricionista
  salvarAjustes: async (dados) => {
    const response = await api.put('/necessidades/ajustes', dados);
    return response.data;
  },

  // Incluir produto extra
  incluirProdutoExtra: async (dados) => {
    const response = await api.post('/necessidades/produto-extra', dados);
    return response.data;
  },

  // Liberar para coordenação
  liberarCoordenacao: async (dados) => {
    const response = await api.post('/necessidades/liberar-coordenacao', dados);
    return response.data;
  },

  // Buscar produtos para modal (excluindo já incluídos)
  buscarProdutosParaModal: async (filtros) => {
    const params = new URLSearchParams();
    if (filtros.grupo) params.append('grupo', filtros.grupo);
    if (filtros.escola_id) params.append('escola_id', filtros.escola_id);
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);
    if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
    
    const response = await api.get(`/necessidades/produtos-modal?${params.toString()}`);
    return response.data;
  },

  // Exportar para XLSX
  exportarXLSX: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
        params.append(key, filtros[key]);
      }
    });
    params.append('aba', 'nutricionista');
    
    const response = await api.get(`/necessidades/exportar/xlsx?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return {
      success: true,
      data: response.data,
      filename: `necessidades_nutricionista_${new Date().toISOString().split('T')[0]}.xlsx`
    };
  },

  // Exportar para PDF
  exportarPDF: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
        params.append(key, filtros[key]);
      }
    });
    params.append('aba', 'nutricionista');
    
    const response = await api.get(`/necessidades/exportar/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return {
      success: true,
      data: response.data,
      filename: `necessidades_nutricionista_${new Date().toISOString().split('T')[0]}.pdf`
    };
  },

  // Importar necessidades via Excel
  importarExcel: async (formData) => {
    try {
      const response = await api.post('/necessidades/importar', formData, {
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
  },

  // Baixar modelo de planilha
  baixarModelo: async () => {
    try {
      const response = await api.get('/necessidades/modelo', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modelo_necessidades.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Erro ao baixar modelo de planilha');
    }
  }
};

export default necessidadesService;
