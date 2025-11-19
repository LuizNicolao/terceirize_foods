/**
 * Função utilitária para consolidar necessidades (agrupar por produto e somar quantidades)
 */
export const consolidarNecessidades = (necessidades, isProcessadas = false) => {
  const consolidado = new Map();
  
  necessidades.forEach(nec => {
    // Chave única: produto_id + grupo + status_substituicao (para processadas) ou status (para não processadas)
    // Para processadas: agrupar também por produto_generico_id para diferenciar substituições diferentes
    // Para não processadas: agrupar por produto_id + grupo + status
    const chave = isProcessadas
      ? `${nec.produto_id || ''}-${nec.grupo || ''}-${nec.status_substituicao || ''}-${nec.produto_generico_id || ''}`
      : `${nec.produto_id || ''}-${nec.grupo || ''}-${nec.status || ''}`;
    
    if (!consolidado.has(chave)) {
      consolidado.set(chave, {
        ...nec,
        quantidade_total: parseFloat(nec.quantidade || nec.quantidade_generico || 0),
        escolas: new Set([nec.escola_id]),
        escolas_nomes: nec.escola_nome ? [nec.escola_nome] : [],
        nutricionistas: new Set([nec.nutricionista_nome || nec.usuario_email].filter(Boolean)),
        total_necessidades: 1
      });
    } else {
      const item = consolidado.get(chave);
      item.quantidade_total += parseFloat(nec.quantidade || nec.quantidade_generico || 0);
      if (nec.escola_id) {
        item.escolas.add(nec.escola_id);
      }
      if (nec.escola_nome && !item.escolas_nomes.includes(nec.escola_nome)) {
        item.escolas_nomes.push(nec.escola_nome);
      }
      if (nec.nutricionista_nome || nec.usuario_email) {
        item.nutricionistas.add(nec.nutricionista_nome || nec.usuario_email);
      }
      item.total_necessidades += 1;
    }
  });
  
  return Array.from(consolidado.values()).map(item => ({
    ...item,
    total_escolas: item.escolas.size,
    escolas_nomes: item.escolas_nomes.sort(),
    nutricionista_nome: Array.from(item.nutricionistas).sort().join(', ')
  }));
};

