/**
 * Hook para gerenciar exportação de necessidades da listagem
 * Respeita o modo de visualização (Padrão, Individual, Consolidado)
 */

import { useCallback } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const useExportListagemNecessidades = () => {
  /**
   * Exportar para Excel
   */
  const exportarExcel = useCallback((dados, modoVisualizacao) => {
    if (!dados || dados.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    try {
      let dadosExportacao = [];
      let colunas = [];

      if (modoVisualizacao === 'consolidado') {
        // Exportação consolidada
        colunas = ['Produto', 'Grupo', 'Total Escolas', 'Total Necessidades', 'Quantidade Total', 'Unidade', 'Status'];
        dadosExportacao = dados.map(item => ({
          'Produto': item.produto_nome || item.produto || '-',
          'Grupo': item.grupo || '-',
          'Total Escolas': item.total_escolas || 0,
          'Total Necessidades': item.total_necessidades || 0,
          'Quantidade Total': item.quantidade_total || 0,
          'Unidade': item.produto_unidade || item.unidade_medida_sigla || '',
          'Status': item.status || 'NEC'
        }));
      } else if (modoVisualizacao === 'individual') {
        // Exportação individual
        colunas = ['ID', 'Escola', 'Rota', 'Produto', 'Grupo', 'Quantidade', 'Unidade', 'Semana Consumo', 'Semana Abastecimento', 'Status'];
        dadosExportacao = dados.map(item => ({
          'ID': item.necessidade_id || item.id || '-',
          'Escola': item.escola || item.escola_nome || '-',
          'Rota': item.escola_rota || item.rota || '-',
          'Produto': item.produto || item.produto_nome || '-',
          'Grupo': item.grupo || '-',
          'Quantidade': item.ajuste || item.quantidade || 0,
          'Unidade': item.produto_unidade || item.unidade_medida_sigla || '',
          'Semana Consumo': item.semana_consumo || '-',
          'Semana Abastecimento': item.semana_abastecimento || '-',
          'Status': item.status || 'NEC'
        }));
      } else {
        // Exportação padrão (agrupada por necessidade_id)
        colunas = ['ID', 'Escola', 'Rota', 'Grupo', 'Total Produtos', 'Semana Consumo', 'Semana Abastecimento', 'Status'];
        dadosExportacao = dados.map(item => ({
          'ID': item.necessidade_id || '-',
          'Escola': item.escola || '-',
          'Rota': item.rota || '-',
          'Grupo': item.grupo || '-',
          'Total Produtos': item.produtos?.length || 0,
          'Semana Consumo': item.data_consumo || '-',
          'Semana Abastecimento': item.data_abastecimento || '-',
          'Status': item.status || 'NEC'
        }));
      }

      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);

      // Ajustar largura das colunas
      const colWidths = colunas.map(col => ({ wch: Math.max(col.length, 15) }));
      ws['!cols'] = colWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Necessidades');

      // Gerar arquivo e fazer download
      const nomeArquivo = `necessidades_listagem_${modoVisualizacao}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);

      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    }
  }, []);

  /**
   * Exportar para PDF
   */
  const exportarPDF = useCallback((dados, modoVisualizacao) => {
    if (!dados || dados.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    try {
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;
      const margin = 15;
      const lineHeight = 7;

      // Cabeçalho
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      
      let titulo = 'Relatório de Necessidades - Listagem';
      if (modoVisualizacao === 'consolidado') {
        titulo += ' (Consolidado)';
      } else if (modoVisualizacao === 'individual') {
        titulo += ' (Individual)';
      } else {
        titulo += ' (Padrão)';
      }
      
      doc.text(titulo, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Data de geração
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dataAtual = new Date().toLocaleString('pt-BR');
      doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Total de registros
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${dados.length} registro(s)`, margin, yPosition);
      yPosition += 10;

      // Definir cabeçalhos e renderizar dados conforme o modo
      if (modoVisualizacao === 'consolidado') {
        // Cabeçalho consolidado
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Produto', margin, yPosition);
        doc.text('Grupo', margin + 50, yPosition);
        doc.text('Total Escolas', margin + 90, yPosition);
        doc.text('Total Necessidades', margin + 130, yPosition);
        doc.text('Quantidade Total', margin + 180, yPosition);
        doc.text('Status', margin + 230, yPosition);
        yPosition += 8;

        // Linha separadora
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Dados
        doc.setFont('helvetica', 'normal');
        dados.forEach((item, index) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }

          const produto = (item.produto_nome || item.produto || '-').substring(0, 30);
          const grupo = (item.grupo || '-').substring(0, 20);
          const quantidadeTotal = item.quantidade_total ? item.quantidade_total.toFixed(2) : '0';
          const unidade = item.produto_unidade || item.unidade_medida_sigla || '';

          doc.text(produto, margin, yPosition);
          doc.text(grupo, margin + 50, yPosition);
          doc.text(String(item.total_escolas || 0), margin + 90, yPosition);
          doc.text(String(item.total_necessidades || 0), margin + 130, yPosition);
          doc.text(`${quantidadeTotal} ${unidade}`, margin + 180, yPosition);
          doc.text(item.status || 'NEC', margin + 230, yPosition);
          yPosition += lineHeight;

          if (index < dados.length - 1) {
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            doc.setDrawColor(0, 0, 0);
            yPosition += 3;
          }
        });
      } else if (modoVisualizacao === 'individual') {
        // Cabeçalho individual
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('ID', margin, yPosition);
        doc.text('Escola', margin + 30, yPosition);
        doc.text('Produto', margin + 80, yPosition);
        doc.text('Grupo', margin + 140, yPosition);
        doc.text('Quantidade', margin + 180, yPosition);
        doc.text('Status', margin + 230, yPosition);
        yPosition += 8;

        // Linha separadora
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Dados
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        dados.forEach((item, index) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }

          const id = (item.necessidade_id || item.id || '-').toString().substring(0, 10);
          const escola = (item.escola || item.escola_nome || '-').substring(0, 25);
          const produto = (item.produto || item.produto_nome || '-').substring(0, 30);
          const grupo = (item.grupo || '-').substring(0, 20);
          const quantidade = item.ajuste || item.quantidade || 0;
          const unidade = item.produto_unidade || item.unidade_medida_sigla || '';

          doc.text(id, margin, yPosition);
          doc.text(escola, margin + 30, yPosition);
          doc.text(produto, margin + 80, yPosition);
          doc.text(grupo, margin + 140, yPosition);
          doc.text(`${quantidade} ${unidade}`, margin + 180, yPosition);
          doc.text(item.status || 'NEC', margin + 230, yPosition);
          yPosition += lineHeight;

          if (index < dados.length - 1) {
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            doc.setDrawColor(0, 0, 0);
            yPosition += 3;
          }
        });
      } else {
        // Cabeçalho padrão
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('ID', margin, yPosition);
        doc.text('Escola', margin + 30, yPosition);
        doc.text('Grupo', margin + 100, yPosition);
        doc.text('Total Produtos', margin + 150, yPosition);
        doc.text('Semana Consumo', margin + 200, yPosition);
        doc.text('Status', margin + 260, yPosition);
        yPosition += 8;

        // Linha separadora
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Dados
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        dados.forEach((item, index) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }

          const id = (item.necessidade_id || '-').toString().substring(0, 10);
          const escola = (item.escola || '-').substring(0, 30);
          const grupo = (item.grupo || '-').substring(0, 25);

          doc.text(id, margin, yPosition);
          doc.text(escola, margin + 30, yPosition);
          doc.text(grupo, margin + 100, yPosition);
          doc.text(String(item.produtos?.length || 0), margin + 150, yPosition);
          doc.text(item.data_consumo || '-', margin + 200, yPosition);
          doc.text(item.status || 'NEC', margin + 260, yPosition);
          yPosition += lineHeight;

          if (index < dados.length - 1) {
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            doc.setDrawColor(0, 0, 0);
            yPosition += 3;
          }
        });
      }

      // Salvar PDF
      const nomeArquivo = `necessidades_listagem_${modoVisualizacao}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nomeArquivo);

      toast.success('Arquivo PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    }
  }, []);

  return {
    exportarExcel,
    exportarPDF
  };
};

