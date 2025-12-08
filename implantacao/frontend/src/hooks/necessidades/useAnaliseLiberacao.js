import { useState } from 'react';
import toast from 'react-hot-toast';

const useAnaliseLiberacao = ({
  necessidades,
  liberarAnalise,
  carregarNecessidades,
  limparFiltros,
  setProgressoModal
}) => {
  const [salvandoAjustes, setSalvandoAjustes] = useState(false);

  const handleLiberarAnalise = async () => {
    if (!necessidades.length) {
      toast.error('Nenhuma necessidade encontrada');
      return;
    }

    setSalvandoAjustes(true);

    try {
      // Agrupar necessidades por produto origem para liberar em lote
      const necessidadesPorProduto = {};
      
      necessidades.forEach(necessidade => {
        const chave = `${necessidade.codigo_origem}_${necessidade.semana_abastecimento}_${necessidade.semana_consumo}`;
        if (!necessidadesPorProduto[chave]) {
          necessidadesPorProduto[chave] = {
            produto_origem_id: necessidade.codigo_origem,
            semana_abastecimento: necessidade.semana_abastecimento,
            semana_consumo: necessidade.semana_consumo
          };
        }
      });

      // Liberar análise para cada produto origem sequencialmente com modal de progresso
      const dadosParaProcessar = Object.values(necessidadesPorProduto);
      const totalProcessos = dadosParaProcessar.length;
      
      setProgressoModal({
        isOpen: true,
        progresso: 0,
        total: totalProcessos,
        mensagem: 'Liberando análises...',
        title: 'Liberando Análises'
      });

      const resultados = [];
      const delayEntreRequisicoes = 200; // 200ms entre cada requisição
      
      for (let i = 0; i < dadosParaProcessar.length; i++) {
        const dados = dadosParaProcessar[i];
        
        try {
          const resultado = await liberarAnalise(dados, false);
          resultados.push({ status: 'fulfilled', value: resultado });
        } catch (error) {
          resultados.push({ 
            status: 'rejected', 
            reason: error,
            value: { success: false, error: error?.message || 'Erro desconhecido' }
          });
        }
        
        // Atualizar progresso
        setProgressoModal(prev => ({
          ...prev,
          progresso: i + 1
        }));
        
        // Delay entre requisições (exceto na última)
        if (i < dadosParaProcessar.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayEntreRequisicoes));
        }
      }

      // Contar sucessos e erros baseado nas respostas
      const sucessos = resultados.filter(r => 
        r.status === 'fulfilled' && r.value?.success
      ).length;
      const erros = resultados.filter(r => 
        r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.success)
      ).length;

      // Fechar modal de progresso
      setProgressoModal(prev => ({ ...prev, isOpen: false }));

      // Recarregar necessidades apenas uma vez no final
      if (necessidades.length > 0) {
        await carregarNecessidades();
      }

      // Limpar filtros após liberar análise com sucesso
      if (sucessos > 0) {
        limparFiltros();
      }

      // Exibir mensagem consolidada
      if (erros > 0) {
        toast.error(`${sucessos} análise(s) liberada(s) com sucesso, ${erros} falharam`);
        return { success: false, ajustesAtivados: true };
      } else if (sucessos > 0) {
        toast.success(`${sucessos} análise(s) liberada(s) para coordenação!`);
        return { success: true, ajustesAtivados: false };
      } else {
        toast.error('Nenhuma análise foi liberada');
        return { success: false, ajustesAtivados: true };
      }
    } catch (error) {
      setProgressoModal(prev => ({ ...prev, isOpen: false }));
      toast.error(`Erro ao liberar análise: ${error.message}`);
      return { success: false, ajustesAtivados: true };
    } finally {
      setSalvandoAjustes(false);
    }
  };

  return {
    salvandoAjustes,
    handleLiberarAnalise
  };
};

export default useAnaliseLiberacao;

