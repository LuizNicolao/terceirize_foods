import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

/**
 * Exporta variações de estoque para XLSX
 * @param {Array} variacoes - Array de variações de estoque
 * @param {Object} estoqueInfo - Informações do estoque (produto, código, etc)
 */
export const exportarVariacoesXLSX = (variacoes, estoqueInfo = {}) => {
  if (!variacoes || variacoes.length === 0) {
    toast.error('Nenhuma variação encontrada para exportar');
    return;
  }

  try {
    // Preparar dados para exportação
    const dadosExportacao = variacoes.map(variacao => ({
      'Código Produto': variacao.produto_generico_codigo || '',
      'Nome Produto': variacao.produto_generico_nome || '',
      'Unidade de Medida': variacao.unidade_medida_sigla || variacao.unidade_medida_nome || '',
      'Lote': variacao.lote || '',
      'Validade': variacao.data_validade 
        ? new Date(variacao.data_validade).toLocaleDateString('pt-BR')
        : '',
      'Quantidade em Estoque': parseFloat(variacao.quantidade_atual) || 0,
      'Valor Unitário': parseFloat(variacao.valor_unitario_medio) || 0,
      'Valor Total': parseFloat(variacao.valor_total) || 0
    }));

    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dadosExportacao);

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 15 }, // Código Produto
      { wch: 40 }, // Nome Produto
      { wch: 15 }, // Unidade de Medida
      { wch: 15 }, // Lote
      { wch: 12 }, // Validade
      { wch: 20 }, // Quantidade em Estoque
      { wch: 15 }, // Valor Unitário
      { wch: 15 }  // Valor Total
    ];
    ws['!cols'] = colWidths;

    // Adicionar informações do produto no topo (se disponível)
    if (estoqueInfo.produto_generico_nome) {
      const infoRows = [
        ['Informações do Produto'],
        ['Código Produto', estoqueInfo.produto_generico_codigo || ''],
        ['Nome Produto', estoqueInfo.produto_generico_nome || ''],
        ['Unidade de Medida', estoqueInfo.unidade_medida_sigla || estoqueInfo.unidade_medida_nome || ''],
        [''],
        ['Variações de Estoque']
      ];

      // Adicionar linha de cabeçalho
      const headerRow = [Object.keys(dadosExportacao[0])];
      
      // Criar nova worksheet com informações + dados
      const newWs = XLSX.utils.aoa_to_sheet([
        ...infoRows,
        headerRow[0],
        ...dadosExportacao.map(row => Object.values(row))
      ]);

      // Aplicar larguras
      newWs['!cols'] = colWidths;
      
      // Mesclar células do título
      if (!newWs['!merges']) newWs['!merges'] = [];
      newWs['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });
      newWs['!merges'].push({ s: { r: 5, c: 0 }, e: { r: 5, c: 7 } });

      XLSX.utils.book_append_sheet(wb, newWs, 'Estoque');
    } else {
      XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
    }

    // Gerar nome do arquivo
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeProduto = estoqueInfo.produto_generico_nome 
      ? estoqueInfo.produto_generico_nome.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
      : 'estoque';
    const nomeArquivo = `estoque_${nomeProduto}_${dataAtual}.xlsx`;

    // Salvar arquivo
    XLSX.writeFile(wb, nomeArquivo);
    toast.success('Arquivo XLSX exportado com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar XLSX:', error);
    toast.error('Erro ao exportar arquivo XLSX');
  }
};

/**
 * Exporta variações de estoque para PDF via backend
 * @param {Array} variacoes - Array de variações de estoque (não usado, mas mantido para compatibilidade)
 * @param {Object} estoqueInfo - Informações do estoque (produto_generico_id é obrigatório)
 */
export const exportarVariacoesPDF = async (variacoes, estoqueInfo = {}) => {
  if (!estoqueInfo.produto_generico_id) {
    toast.error('ID do produto não encontrado para exportar');
    return;
  }

  try {
    const api = (await import('../services/api')).default;
    
    const response = await api.get(
      `/almoxarifado-estoque/produto/${estoqueInfo.produto_generico_id}/export/pdf`,
      {
        responseType: 'blob'
      }
    );

    // Criar URL do blob e fazer download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeProduto = estoqueInfo.produto_generico_codigo || estoqueInfo.produto_generico_id;
    link.setAttribute('download', `estoque_${nomeProduto}_${dataAtual}.pdf`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Arquivo PDF exportado com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    toast.error(error.response?.data?.message || 'Erro ao exportar arquivo PDF');
  }
};

