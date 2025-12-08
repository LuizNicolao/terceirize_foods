import { useMemo } from 'react';

/**
 * Hook para calcular estatísticas na aba de Coordenação
 */
const useCoordenacaoStats = (necessidades) => {
  const stats = useMemo(() => {
    if (!necessidades.length) {
      return {
        totalEscolas: 0,
        totalNecessidades: 0,
        totalProdutos: necessidades.length
      };
    }
    
    const escolasUnicas = new Set();
    let totalLinhas = 0;
    
    necessidades.forEach(necessidade => {
      if (necessidade.escolas && Array.isArray(necessidade.escolas)) {
        totalLinhas += necessidade.escolas.length;
        necessidade.escolas.forEach(escola => {
          if (escola.escola_id) {
            escolasUnicas.add(escola.escola_id);
          }
        });
      }
    });
    
    return {
      totalEscolas: escolasUnicas.size,
      totalNecessidades: totalLinhas,
      totalProdutos: necessidades.length
    };
  }, [necessidades]);

  return stats;
};

export default useCoordenacaoStats;

