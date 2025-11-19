import { useCallback } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { getStatusNecessidadeLabel, getStatusSubstituicaoLabel } from '../utils/getStatusLabels';

/**
 * Hook para gerenciar exportação de necessidades (PDF e Excel)
 */
export const useExportStatusNecessidades = () => {
  // Função para gerar PDF das necessidades processadas
  const gerarPDFNecessidadesProcessadas = useCallback((necessidades, modoVisualizacao) => {
    if (necessidades.length === 0) {
      toast.error('Não há necessidades processadas para exportar');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titulo = modoVisualizacao === 'consolidado' 
      ? 'Relatório de Necessidades Processadas (Consolidado)'
      : 'Relatório de Necessidades Processadas';
    doc.text(titulo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Data e hora de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Resumo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${necessidades.length} registro(s)`, 20, yPosition);
    yPosition += 15;

    // Tabela de necessidades
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    if (modoVisualizacao === 'consolidado') {
      // Cabeçalho consolidado
      doc.text('Produto', 15, yPosition);
      doc.text('Grupo', 60, yPosition);
      doc.text('Status', 100, yPosition);
      doc.text('Produto Genérico', 130, yPosition);
      doc.text('Nutricionista', 180, yPosition);
      doc.text('Total Escolas', 230, yPosition);
      doc.text('Total Necessidades', 250, yPosition);
      doc.text('Quantidade Total', 275, yPosition);
      yPosition += 8;

      // Linha separadora
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;

      // Dados consolidados
      doc.setFont('helvetica', 'normal');
      necessidades.forEach((necessidade, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(necessidade.produto || 'N/A', 15, yPosition);
        doc.text(necessidade.grupo || 'N/A', 60, yPosition);
        doc.text(getStatusSubstituicaoLabel(necessidade.status_substituicao) || 'N/A', 100, yPosition);
        doc.text(necessidade.produto_generico_nome || 'N/A', 130, yPosition);
        doc.text((necessidade.nutricionista_nome || necessidade.usuario_email || 'N/A'), 180, yPosition);
        doc.text(String(necessidade.total_escolas || 0), 230, yPosition);
        doc.text(String(necessidade.total_necessidades || 0), 250, yPosition);
        doc.text(String(necessidade.quantidade_total?.toFixed(2) || '0'), 275, yPosition);
        yPosition += 7;

        if (index < necessidades.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(15, yPosition, pageWidth - 15, yPosition);
          doc.setDrawColor(0, 0, 0);
          yPosition += 3;
        }
      });
    } else {
      // Cabeçalho individual
      doc.text('Escola', 15, yPosition);
      doc.text('Produto', 50, yPosition);
      doc.text('Grupo', 90, yPosition);
      doc.text('Status Subst.', 120, yPosition);
      doc.text('Produto Genérico', 150, yPosition);
      doc.text('Nutricionista', 200, yPosition);
      doc.text('Quantidade', 250, yPosition);
      yPosition += 8;

      // Linha separadora
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;

      // Dados individuais
      doc.setFont('helvetica', 'normal');
      necessidades.forEach((necessidade, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(necessidade.escola_nome || 'N/A', 15, yPosition);
        doc.text(necessidade.produto || 'N/A', 50, yPosition);
        doc.text(necessidade.grupo || 'N/A', 90, yPosition);
        doc.text(getStatusSubstituicaoLabel(necessidade.status_substituicao) || 'N/A', 120, yPosition);
        doc.text(necessidade.produto_generico_nome || 'N/A', 150, yPosition);
        doc.text((necessidade.nutricionista_nome || necessidade.usuario_email || 'N/A'), 200, yPosition);
        doc.text(String(necessidade.quantidade_generico || 'N/A'), 250, yPosition);
        yPosition += 7;

        if (index < necessidades.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(15, yPosition, pageWidth - 15, yPosition);
          doc.setDrawColor(0, 0, 0);
          yPosition += 3;
        }
      });
    }

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Salvar o PDF
    const modo = modoVisualizacao === 'consolidado' ? 'consolidado' : 'individual';
    const nomeArquivo = `necessidades_processadas_${modo}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
    
    toast.success('PDF gerado com sucesso!');
  }, []);

  // Função para exportar Excel das necessidades processadas
  const exportarExcelNecessidadesProcessadas = useCallback((necessidades, modoVisualizacao) => {
    if (necessidades.length === 0) {
      toast.error('Não há necessidades processadas para exportar');
      return;
    }

    try {
      let dadosExportacao;

      if (modoVisualizacao === 'consolidado') {
        dadosExportacao = necessidades.map(nec => ({
          'Produto': nec.produto || '',
          'Grupo': nec.grupo || '',
          'Status Substituição': getStatusSubstituicaoLabel(nec.status_substituicao) || '',
          'Produto Genérico': nec.produto_generico_nome || '',
          'Nutricionista': nec.nutricionista_nome || nec.usuario_email || '',
          'Total Escolas': nec.total_escolas || 0,
          'Total Necessidades': nec.total_necessidades || 0,
          'Quantidade Total': nec.quantidade_total || 0,
          'Unidade': nec.produto_generico_unidade || nec.produto_unidade || ''
        }));
      } else {
        dadosExportacao = necessidades.map(nec => ({
          'Escola': nec.escola_nome || '',
          'Produto': nec.produto || '',
          'Grupo': nec.grupo || '',
          'Status Substituição': getStatusSubstituicaoLabel(nec.status_substituicao) || '',
          'Produto Genérico': nec.produto_generico_nome || '',
          'Nutricionista': nec.nutricionista_nome || nec.usuario_email || '',
          'Quantidade': nec.quantidade_generico || '',
          'Unidade': nec.produto_generico_unidade || ''
        }));
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);
      
      // Ajustar largura das colunas
      const colWidths = modoVisualizacao === 'consolidado'
        ? [
            { wch: 30 }, // Produto
            { wch: 20 }, // Grupo
            { wch: 20 }, // Status Substituição
            { wch: 30 }, // Produto Genérico
            { wch: 25 }, // Nutricionista
            { wch: 15 }, // Total Escolas
            { wch: 18 }, // Total Necessidades
            { wch: 15 }, // Quantidade Total
            { wch: 10 }  // Unidade
          ]
        : [
            { wch: 30 }, // Escola
            { wch: 30 }, // Produto
            { wch: 20 }, // Grupo
            { wch: 20 }, // Status Substituição
            { wch: 30 }, // Produto Genérico
            { wch: 25 }, // Nutricionista
            { wch: 12 }, // Quantidade
            { wch: 10 }  // Unidade
          ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Necessidades Processadas');

      const modo = modoVisualizacao === 'consolidado' ? 'consolidado' : 'individual';
      const nomeArquivo = `necessidades_processadas_${modo}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);
      
      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    }
  }, []);

  // Função para gerar PDF das necessidades não processadas
  const gerarPDFNecessidadesNaoProcessadas = useCallback((necessidades, modoVisualizacao) => {
    if (necessidades.length === 0) {
      toast.error('Não há necessidades não processadas para exportar');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titulo = modoVisualizacao === 'consolidado'
      ? 'Relatório de Necessidades Não Processadas (Consolidado)'
      : 'Relatório de Necessidades Não Processadas';
    doc.text(titulo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Data e hora de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Resumo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${necessidades.length} registro(s)`, 20, yPosition);
    yPosition += 15;

    // Tabela de necessidades
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    if (modoVisualizacao === 'consolidado') {
      // Cabeçalho consolidado
      doc.text('Produto', 15, yPosition);
      doc.text('Grupo', 60, yPosition);
      doc.text('Status', 100, yPosition);
      doc.text('Nutricionista', 140, yPosition);
      doc.text('Total Escolas', 200, yPosition);
      doc.text('Total Necessidades', 230, yPosition);
      doc.text('Quantidade Total', 260, yPosition);
      yPosition += 8;

      // Linha separadora
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;

      // Dados consolidados
      doc.setFont('helvetica', 'normal');
      necessidades.forEach((necessidade, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(necessidade.produto || 'N/A', 15, yPosition);
        doc.text(necessidade.grupo || 'N/A', 60, yPosition);
        doc.text(getStatusNecessidadeLabel(necessidade.status) || 'N/A', 100, yPosition);
        doc.text((necessidade.nutricionista_nome || necessidade.usuario_email || 'N/A'), 140, yPosition);
        doc.text(String(necessidade.total_escolas || 0), 200, yPosition);
        doc.text(String(necessidade.total_necessidades || 0), 230, yPosition);
        doc.text(String(necessidade.quantidade_total?.toFixed(2) || '0'), 260, yPosition);
        yPosition += 7;

        if (index < necessidades.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(15, yPosition, pageWidth - 15, yPosition);
          doc.setDrawColor(0, 0, 0);
          yPosition += 3;
        }
      });
    } else {
      // Cabeçalho individual
      doc.text('Escola', 15, yPosition);
      doc.text('Produto', 50, yPosition);
      doc.text('Grupo', 85, yPosition);
      doc.text('Status', 115, yPosition);
      doc.text('Semana Abastecimento', 145, yPosition);
      doc.text('Semana Consumo', 190, yPosition);
      doc.text('Nutricionista', 225, yPosition);
      doc.text('Quantidade', 265, yPosition);
      yPosition += 8;

      // Linha separadora
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;

      // Dados individuais
      doc.setFont('helvetica', 'normal');
      necessidades.forEach((necessidade, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(necessidade.escola_nome || 'N/A', 15, yPosition);
        doc.text(necessidade.produto || 'N/A', 50, yPosition);
        doc.text(necessidade.grupo || 'N/A', 85, yPosition);
        doc.text(getStatusNecessidadeLabel(necessidade.status) || 'N/A', 115, yPosition);
        doc.text(necessidade.semana_abastecimento || 'N/A', 145, yPosition);
        doc.text(necessidade.semana_consumo || 'N/A', 190, yPosition);
        doc.text((necessidade.nutricionista_nome || necessidade.usuario_email || 'N/A'), 225, yPosition);
        doc.text(String(necessidade.quantidade || 'N/A'), 265, yPosition);
        yPosition += 7;

        if (index < necessidades.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(15, yPosition, pageWidth - 15, yPosition);
          doc.setDrawColor(0, 0, 0);
          yPosition += 3;
        }
      });
    }

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Salvar o PDF
    const modo = modoVisualizacao === 'consolidado' ? 'consolidado' : 'individual';
    const nomeArquivo = `necessidades_nao_processadas_${modo}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
    
    toast.success('PDF gerado com sucesso!');
  }, []);

  // Função para exportar Excel das necessidades não processadas
  const exportarExcelNecessidadesNaoProcessadas = useCallback((necessidades, modoVisualizacao) => {
    if (necessidades.length === 0) {
      toast.error('Não há necessidades não processadas para exportar');
      return;
    }

    try {
      let dadosExportacao;

      if (modoVisualizacao === 'consolidado') {
        dadosExportacao = necessidades.map(nec => ({
          'Produto': nec.produto || '',
          'Grupo': nec.grupo || '',
          'Status': getStatusNecessidadeLabel(nec.status) || '',
          'Nutricionista': nec.nutricionista_nome || nec.usuario_email || '',
          'Total Escolas': nec.total_escolas || 0,
          'Total Necessidades': nec.total_necessidades || 0,
          'Quantidade Total': nec.quantidade_total || 0,
          'Unidade': nec.produto_unidade || ''
        }));
      } else {
        dadosExportacao = necessidades.map(nec => ({
          'Escola': nec.escola_nome || '',
          'Produto': nec.produto || '',
          'Grupo': nec.grupo || '',
          'Status': getStatusNecessidadeLabel(nec.status) || '',
          'Semana Abastecimento': nec.semana_abastecimento || '',
          'Semana Consumo': nec.semana_consumo || '',
          'Nutricionista': nec.nutricionista_nome || nec.usuario_email || '',
          'Quantidade': nec.quantidade || '',
          'Unidade': nec.produto_unidade || ''
        }));
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);
      
      // Ajustar largura das colunas
      const colWidths = modoVisualizacao === 'consolidado'
        ? [
            { wch: 30 }, // Produto
            { wch: 20 }, // Grupo
            { wch: 25 }, // Status
            { wch: 25 }, // Nutricionista
            { wch: 15 }, // Total Escolas
            { wch: 18 }, // Total Necessidades
            { wch: 15 }, // Quantidade Total
            { wch: 10 }  // Unidade
          ]
        : [
            { wch: 30 }, // Escola
            { wch: 30 }, // Produto
            { wch: 20 }, // Grupo
            { wch: 25 }, // Status
            { wch: 20 }, // Semana Abastecimento
            { wch: 15 }, // Semana Consumo
            { wch: 25 }, // Nutricionista
            { wch: 12 }, // Quantidade
            { wch: 10 }  // Unidade
          ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Necessidades Não Processadas');

      const modo = modoVisualizacao === 'consolidado' ? 'consolidado' : 'individual';
      const nomeArquivo = `necessidades_nao_processadas_${modo}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);
      
      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    }
  }, []);

  return {
    gerarPDFNecessidadesProcessadas,
    exportarExcelNecessidadesProcessadas,
    gerarPDFNecessidadesNaoProcessadas,
    exportarExcelNecessidadesNaoProcessadas
  };
};

