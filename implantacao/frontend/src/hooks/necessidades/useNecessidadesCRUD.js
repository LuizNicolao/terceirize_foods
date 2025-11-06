import { useCallback } from 'react';
import necessidadesService from '../../services/necessidadesService';
import { calcularSemanaAbastecimento } from '../../utils/semanasAbastecimentoUtils';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar operações CRUD e geração de necessidades
 */
export const useNecessidadesCRUD = (carregarNecessidades, setLoading = null) => {
  // Gerar necessidade
  const gerarNecessidade = useCallback(async (filtros, produtosTabela, dadosExternos = null) => {
    // Se dados externos foram fornecidos, usar eles; senão usar filtros internos
    const semanaCalculada = calcularSemanaAbastecimento(filtros.data);
    
    // Converter string da semana para data válida
    let dataConsumoFormatada = filtros.data;
    
    if (typeof filtros.data === 'string' && filtros.data.includes(' a ')) {
      const primeiraData = filtros.data.split(' a ')[0];
      const [dia, mes] = primeiraData.split('/');
      const ano = new Date().getFullYear();
      dataConsumoFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    const dadosParaEnviar = dadosExternos ? {
      ...dadosExternos
      // Usar dados externos diretamente, sem modificar semana_consumo
    } : {
      escola_id: filtros.escola?.id,
      escola_nome: filtros.escola?.nome_escola || filtros.escola?.nome,
      escola_rota: filtros.escola?.rota || '',
      escola_codigo_teknisa: filtros.escola?.codigo_teknisa || '',
      semana_consumo: filtros.data, // Usar string da semana original
      semana_abastecimento: semanaCalculada,
      produtos: produtosTabela.map(produto => ({
        produto_id: produto.id,
        produto_nome: produto.nome,
        produto_unidade: produto.unidade_medida,
        ajuste: produto.ajuste
      }))
    };

    // Validação baseada nos dados que serão enviados
    if (!dadosParaEnviar.escola_id || !dadosParaEnviar.semana_consumo) {
      toast.error('Selecione escola e data antes de gerar a necessidade');
      return { success: false };
    }

    if (!dadosParaEnviar.produtos || dadosParaEnviar.produtos.length === 0) {
      toast.error('Nenhum produto com frequência preenchida encontrado');
      return { success: false };
    }

    if (setLoading) setLoading(true);
    try {
      const response = await necessidadesService.gerarNecessidade(dadosParaEnviar);
      
      if (response.success) {
        toast.success('Necessidade gerada com sucesso!');
        await carregarNecessidades();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Erro ao gerar necessidade');
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('Erro ao gerar necessidade:', err);
      
      // Tratar erro específico de necessidade já existente
      if (err.response?.status === 409) {
        const errorMessage = err.response?.data?.message || 'Necessidade já existe para esta escola nesta semana';
        toast.error(errorMessage, {
          duration: 5000, // Mostrar por mais tempo
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
        return { success: false, error: errorMessage, conflict: true };
      }
      
      const errorMessage = err.response?.data?.message || 'Erro ao gerar necessidade';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      if (setLoading) setLoading(false);
    }
  }, [carregarNecessidades, setLoading]);

  // Criar necessidade individual
  const criarNecessidade = useCallback(async (dados, showToast = true) => {
    try {
      const response = await necessidadesService.criar(dados);
      if (response.success) {
        if (showToast) toast.success('Necessidade criada com sucesso!');
        await carregarNecessidades();
        return { success: true, data: response.data };
      } else {
        if (showToast) toast.error(response.message || 'Erro ao criar necessidade');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar necessidade';
      if (showToast) toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [carregarNecessidades]);

  // Atualizar necessidade
  const atualizarNecessidade = useCallback(async (id, dados, showToast = true) => {
    try {
      const response = await necessidadesService.atualizar(id, dados);
      if (response.success) {
        if (showToast) toast.success('Necessidade atualizada com sucesso!');
        await carregarNecessidades();
        return { success: true, data: response.data };
      } else {
        if (showToast) toast.error(response.message || 'Erro ao atualizar necessidade');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar necessidade';
      if (showToast) toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [carregarNecessidades]);

  // Deletar necessidade
  const deletarNecessidade = useCallback(async (id, showToast = true) => {
    try {
      const response = await necessidadesService.deletar(id);
      if (response.success) {
        if (showToast) toast.success('Necessidade deletada com sucesso!');
        await carregarNecessidades();
        return { success: true };
      } else {
        if (showToast) toast.error(response.message || 'Erro ao deletar necessidade');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao deletar necessidade';
      if (showToast) toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [carregarNecessidades]);

  return {
    gerarNecessidade,
    criarNecessidade,
    atualizarNecessidade,
    deletarNecessidade
  };
};

