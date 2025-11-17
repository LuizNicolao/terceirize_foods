import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar ajustes locais e necessidade atual
 */
export const useAjustesLocais = (necessidades, activeTab) => {
  const [ajustesLocais, setAjustesLocais] = useState({});
  const [necessidadeAtual, setNecessidadeAtual] = useState(null);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [necessidadesFiltradas, setNecessidadesFiltradas] = useState([]);

  // Inicializar ajustes locais quando necessidades carregarem
  useEffect(() => {
    if (necessidades.length > 0) {
      // Limpar ajustes locais completamente ao consultar
      const novosAjustes = {};
      necessidades.forEach(nec => {
        // Usar chave composta (escola_id + produto_id)
        const chave = `${nec.escola_id}_${nec.produto_id}`;
        // Campo ajuste sempre fica vazio ao consultar
        novosAjustes[chave] = '';
      });
      setAjustesLocais(novosAjustes);
      setNecessidadeAtual(necessidades[0]);
      setNecessidadesFiltradas(necessidades);
    }
  }, [necessidades, activeTab]);

  // Filtrar necessidades baseado na busca
  useEffect(() => {
    if (necessidades.length > 0) {
      if (buscaProduto.trim() === '') {
        setNecessidadesFiltradas(necessidades);
      } else {
        const filtradas = necessidades.filter(nec => 
          nec.produto.toLowerCase().includes(buscaProduto.toLowerCase()) ||
          (nec.codigo_teknisa && nec.codigo_teknisa.toLowerCase().includes(buscaProduto.toLowerCase()))
        );
        setNecessidadesFiltradas(filtradas);
      }
    }
  }, [necessidades, buscaProduto]);

  const handleAjusteChange = useCallback((necessidade) => {
    setAjustesLocais(prev => {
      const novosAjustes = { ...prev };
      
      // Usar chave composta (escola_id + produto_id) ao invés de apenas necessidade.id
      const chave = `${necessidade.escola_id}_${necessidade.produto_id}`;
      // Manter como string durante a digitação para permitir valores como "0," ou "0."
      const valor = necessidade.valor === '' ? '' : necessidade.valor;
      
      novosAjustes[chave] = valor;
      
      return novosAjustes;
    });
  }, []);

  const limparAjustesLocais = useCallback(() => {
    setAjustesLocais({});
  }, []);

  return {
    ajustesLocais,
    necessidadeAtual,
    setNecessidadeAtual,
    buscaProduto,
    setBuscaProduto,
    necessidadesFiltradas,
    handleAjusteChange,
    limparAjustesLocais
  };
};

