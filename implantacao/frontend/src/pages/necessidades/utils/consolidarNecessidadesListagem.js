/**
 * Função utilitária para consolidar necessidades na listagem
 * Agrupa por produto, grupo e status, somando quantidades
 */

export const consolidarNecessidadesListagem = (necessidades) => {
  const consolidado = new Map();
  
  necessidades.forEach(nec => {
    // Chave única: produto_id + grupo + status
    const produtoId = nec.produto_id || nec.id;
    const grupo = nec.grupo || '';
    const status = nec.status || 'NEC';
    const chave = `${produtoId}-${grupo}-${status}`;
    
    if (!consolidado.has(chave)) {
      consolidado.set(chave, {
        ...nec,
        quantidade_total: parseFloat(nec.ajuste || nec.quantidade || 0),
        escolas: new Set([nec.escola_id || nec.escola].filter(Boolean)),
        escolas_nomes: nec.escola ? [nec.escola] : [],
        total_necessidades: 1,
        produto_nome: nec.produto || nec.produto_nome || '-',
        produto_unidade: nec.produto_unidade || nec.unidade_medida_sigla || ''
      });
    } else {
      const item = consolidado.get(chave);
      item.quantidade_total += parseFloat(nec.ajuste || nec.quantidade || 0);
      
      if (nec.escola_id || nec.escola) {
        item.escolas.add(nec.escola_id || nec.escola);
      }
      
      if (nec.escola && !item.escolas_nomes.includes(nec.escola)) {
        item.escolas_nomes.push(nec.escola);
      }
      
      item.total_necessidades += 1;
    }
  });
  
  return Array.from(consolidado.values()).map(item => ({
    ...item,
    total_escolas: item.escolas.size,
    escolas_nomes: item.escolas_nomes.sort()
  }));
};

