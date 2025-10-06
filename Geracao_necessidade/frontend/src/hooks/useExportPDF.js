import { useCallback } from 'react';
import jsPDF from 'jspdf';

/**
 * Hook customizado para exportação de PDF
 * Segue o padrão de excelência do Dashboard
 */
export const useExportPDF = () => {
  /**
   * Exportar produtos em PDF
   */
  const exportarProdutosPDF = useCallback((produtos, filtros = {}) => {
    try {
      // Configurar PDF em orientação paisagem (horizontal) para melhor visualização
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Cabeçalho
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Produtos Per Capita', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Data de geração
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dataAtual = new Date().toLocaleString('pt-BR');
      doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Filtros aplicados
      const filtrosAplicados = [];
      if (filtros.search) {
        filtrosAplicados.push(`Busca: "${filtros.search}"`);
      }
      if (filtros.ativo && filtros.ativo !== 'true') {
        filtrosAplicados.push(`Status: ${filtros.ativo === 'true' ? 'Ativo' : 'Inativo'}`);
      }
      if (filtros.per_capita) {
        filtrosAplicados.push(`Per Capita: ${filtros.per_capita.charAt(0).toUpperCase() + filtros.per_capita.slice(1)}`);
      }
      if (filtros.tipo_produto) {
        filtrosAplicados.push(`Tipo: ${filtros.tipo_produto}`);
      }

      if (filtrosAplicados.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Filtros Aplicados:', 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        filtrosAplicados.forEach(filtro => {
          doc.text(`• ${filtro}`, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Configurar colunas da tabela
      const xPosition = 20;
      const colWidths = [100, 120]; // Nome do produto, Per Capita
      
      // Cabeçalho da tabela
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(xPosition, yPosition - 5, pageWidth - 40, 15, 'F');
      
      doc.text('Produto', xPosition + 5, yPosition + 5);
      doc.text('Per Capita', xPosition + colWidths[0] + 5, yPosition + 5);
      yPosition += 20;

      // Configurar fonte para dados
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      produtos.forEach((produto, index) => {
        // Calcular linhas do produto primeiro
        const maxWidthProduto = colWidths[0] - 10;
        const nomeProduto = produto.nome_produto || produto.nome || 'Nome não encontrado';
        const produtoLines = doc.splitTextToSize(nomeProduto, maxWidthProduto);
        
        // Calcular per capita
        const perCapitas = [];
        if (produto.per_capita_lanche_manha > 0) {
          perCapitas.push(`Lanche Manhã: ${Number(produto.per_capita_lanche_manha).toFixed(3)}`);
        }
        if (produto.per_capita_almoco > 0) {
          perCapitas.push(`Almoço: ${Number(produto.per_capita_almoco).toFixed(3)}`);
        }
        if (produto.per_capita_lanche_tarde > 0) {
          perCapitas.push(`Lanche Tarde: ${Number(produto.per_capita_lanche_tarde).toFixed(3)}`);
        }
        if (produto.per_capita_parcial > 0) {
          perCapitas.push(`Parcial: ${Number(produto.per_capita_parcial).toFixed(3)}`);
        }
        if (produto.per_capita_eja > 0) {
          perCapitas.push(`EJA: ${Number(produto.per_capita_eja).toFixed(3)}`);
        }

        const perCapitaText = perCapitas.length > 0 ? perCapitas.join(', ') : 'N/A';
        const maxWidth = colWidths[1] - 10;
        const lines = doc.splitTextToSize(perCapitaText, maxWidth);
        
        // Calcular altura considerando tanto produto quanto per capita
        const maxLines = Math.max(produtoLines.length, lines.length);
        const lineHeight = Math.max(10, maxLines * 4 + 2);

        // Alternar cor de fundo
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(xPosition, yPosition - 5, pageWidth - 40, lineHeight, 'F');
        }

        // Nome do produto - permitir quebra de linha para nomes longos
        produtoLines.forEach((line, lineIndex) => {
          doc.text(line, xPosition + 5, yPosition + 2 + (lineIndex * 4));
        });

        // Per Capita - mostrar todas as que têm valor > 0 (como na interface)
        lines.forEach((line, lineIndex) => {
          doc.text(line, xPosition + colWidths[0] + 5, yPosition + 2 + (lineIndex * 4));
        });

        yPosition += lineHeight;

        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // Rodapé com informações
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
        doc.text(`Total de produtos: ${produtos.length}`, 20, pageHeight - 10);
      }

      // Salvar o PDF
      const fileName = `produtos-per-capita-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      return { success: true, fileName };
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Exportar dados em formato específico
   */
  const exportarDados = useCallback((dados, tipo = 'pdf', filtros = {}) => {
    switch (tipo) {
      case 'pdf':
        return exportarProdutosPDF(dados, filtros);
      default:
        return { success: false, error: 'Tipo de exportação não suportado' };
    }
  }, [exportarProdutosPDF]);

  return {
    exportarProdutosPDF,
    exportarDados
  };
};
