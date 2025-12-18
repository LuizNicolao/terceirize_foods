/**
 * Hook para gerenciar a funcionalidade de replicar frequências entre turnos
 */

import { useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook para replicar frequências de um turno para outros
 * @param {Array} produtosTabela - Array de produtos
 * @param {Function} setProdutosTabela - Função para atualizar produtos
 * @param {Array} tiposDisponiveis - Lista de tipos disponíveis
 * @param {Function} recalcularProduto - Função para recalcular produto após mudança
 */
export const useReplicarFrequencias = (produtosTabela, setProdutosTabela, tiposDisponiveis, recalcularProduto) => {
  
  const replicarFrequencias = useCallback((turnoOrigem, turnosDestino) => {
    if (!turnoOrigem || !turnosDestino || turnosDestino.length === 0) {
      toast.error('Selecione o turno de origem e pelo menos um turno de destino');
      return;
    }

    // Verificar se o turno de origem existe
    const turnoOrigemExiste = tiposDisponiveis.some(t => t.key === turnoOrigem);
    if (!turnoOrigemExiste) {
      toast.error('Turno de origem inválido');
      return;
    }

    let produtosAtualizados = 0;

    setProdutosTabela(prev => prev.map(produto => {
      const frequenciaOrigem = produto[`frequencia_${turnoOrigem}`];
      
      // Se não há frequência no turno de origem, não fazer nada
      if (!frequenciaOrigem || frequenciaOrigem === '' || frequenciaOrigem === 0) {
        return produto;
      }

      const updated = { ...produto };
      let atualizado = false;

      // Replicar para cada turno de destino
      turnosDestino.forEach(turnoDestino => {
        // Verificar se o turno de destino existe
        const turnoDestinoExiste = tiposDisponiveis.some(t => t.key === turnoDestino);
        if (!turnoDestinoExiste || turnoDestino === turnoOrigem) {
          return; // Pular se não existe ou se for o mesmo turno
        }

        // Replicar frequência
        updated[`frequencia_${turnoDestino}`] = frequenciaOrigem;
        atualizado = true;
      });

      if (atualizado) {
        produtosAtualizados++;
        // Recalcular quantidades e total para o produto
        return recalcularProduto(updated);
      }

      return produto;
    }));

    if (produtosAtualizados > 0) {
      toast.success(`Frequências replicadas para ${produtosAtualizados} produto(s)`);
    } else {
      toast('Nenhum produto foi atualizado. Verifique se há frequências no turno de origem.');
    }
  }, [produtosTabela, tiposDisponiveis, recalcularProduto]);

  return {
    replicarFrequencias
  };
};
