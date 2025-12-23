import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { formatarQuantidade } from '../../pages/consulta-status-necessidade/utils/formatarQuantidade';

/**
 * Hook para gerenciar exportação de necessidades (XLSX e PDF)
 */
export const useNecessidadesExport = () => {
  // Função para exportar necessidades para XLSX
  const exportarXLSX = useCallback((necessidades) => {
    if (!necessidades || necessidades.length === 0) {
      toast.error('Nenhuma necessidade encontrada para exportar');
      return;
    }

    try {
      // Preparar dados para exportação
      const dadosExportacao = necessidades.map(necessidade => ({
        'Código Escola': necessidade.codigo_teknisa || '',
        'Nome da Escola': necessidade.escola,
        'ID Necessidade': necessidade.id,
        'Semana Abastecimento': necessidade.semana_abastecimento || '',
        'Semana de Consumo': necessidade.semana_consumo || '',
        'Código Produto': necessidade.produto_id || '',
        'Produto': necessidade.produto,
        'UN': necessidade.produto_unidade || '',
        'Quantidade': formatarQuantidade(necessidade.ajuste || 0)
      }));

      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);

      // Ajustar largura das colunas
      const colWidths = [
        { wch: 15 }, // Código Escola
        { wch: 35 }, // Nome da Escola
        { wch: 15 }, // ID Necessidade
        { wch: 20 }, // Semana Abastecimento
        { wch: 15 }, // Semana de Consumo
        { wch: 15 }, // Código Produto
        { wch: 30 }, // Produto
        { wch: 8 },  // UN
        { wch: 12 }  // Quantidade
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Necessidades');

      // Gerar nome do arquivo com data atual
      const dataAtual = new Date().toISOString().split('T')[0];
      const nomeArquivo = `necessidades_${dataAtual}.xlsx`;

      // Salvar arquivo
      XLSX.writeFile(wb, nomeArquivo);
      toast.success('Arquivo XLSX exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar arquivo XLSX');
    }
  }, []);

  // Função para exportar necessidades para PDF
  const exportarPDF = useCallback((necessidades, filtros) => {
    if (!necessidades || necessidades.length === 0) {
      toast.error('Nenhuma necessidade encontrada para exportar');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const tableWidth = pageWidth - (margin * 2);
      
      // Cabeçalho
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Necessidades', pageWidth / 2, 15, { align: 'center' });
      
      // Data de geração
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, 22, { align: 'center' });
      
      // Filtros aplicados (se houver)
      if (filtros?.escola || filtros?.data || filtros?.grupo) {
        doc.setFontSize(8);
        doc.text('Filtros aplicados:', margin, 30);
        
        let yPos = 35;
        if (filtros.escola) {
          doc.text(`• Escola: ${filtros.escola.nome_escola || filtros.escola}`, margin + 5, yPos);
          yPos += 5;
        }
        if (filtros.data) {
          doc.text(`• Data: ${filtros.data}`, margin + 5, yPos);
          yPos += 5;
        }
        if (filtros.grupo) {
          doc.text(`• Grupo: ${filtros.grupo.nome || filtros.grupo}`, margin + 5, yPos);
          yPos += 5;
        }
      }

      // Cabeçalho da tabela - colunas equilibradas
      const colWidths = [55, 28, 32, 28, 28, 70, 15, 30];
      const headers = [
        'Código e nome da Escola',
        'ID Necessidade',
        'Semana Abastecimento',
        'Semana de Consumo',
        'Código Produto',
        'Produto',
        'UN',
        'Quantidade'
      ];

      let yPos = filtros?.escola || filtros?.data || filtros?.grupo ? 50 : 35;
      
      // Desenhar cabeçalho da tabela
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      let xPos = margin;
      
      headers.forEach((header, index) => {
        doc.rect(xPos, yPos - 5, colWidths[index], 8);
        doc.text(header, xPos + 2, yPos, { maxWidth: colWidths[index] - 4 });
        xPos += colWidths[index];
      });

      yPos += 8;

      // Dados da tabela
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      necessidades.forEach((necessidade, index) => {
        // Verificar se precisa de nova página
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
          
          // Redesenhar cabeçalho
          xPos = margin;
          headers.forEach((header, colIndex) => {
            doc.rect(xPos, yPos - 5, colWidths[colIndex], 8);
            doc.text(header, xPos + 2, yPos, { maxWidth: colWidths[colIndex] - 4 });
            xPos += colWidths[colIndex];
          });
          yPos += 8;
        }

        const rowData = [
          `${necessidade.codigo_teknisa || ''} - ${necessidade.escola}`,
          necessidade.id.toString(),
          necessidade.semana_abastecimento || '',
          necessidade.semana_consumo || '',
          necessidade.produto_id?.toString() || '',
          necessidade.produto,
          necessidade.produto_unidade || '',
          formatarQuantidade(necessidade.ajuste || 0)
        ];

        xPos = margin;
        rowData.forEach((data, colIndex) => {
          doc.rect(xPos, yPos - 5, colWidths[colIndex], 8);
          doc.text(data, xPos + 2, yPos, { maxWidth: colWidths[colIndex] - 4 });
          xPos += colWidths[colIndex];
        });

        yPos += 8;
      });

      // Rodapé
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(6);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }

      // Salvar arquivo
      const nomeArquivo = `necessidades_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nomeArquivo);
      toast.success('Arquivo PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    }
  }, []);

  return {
    exportarXLSX,
    exportarPDF
  };
};

