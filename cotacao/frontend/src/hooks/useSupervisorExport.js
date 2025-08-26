import { useState } from 'react';
import { supervisorExportService } from '../services/supervisorExport';
import toast from 'react-hot-toast';

export const useSupervisorExport = () => {
  const [exporting, setExporting] = useState(false);

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async (cotacaoId, viewMode, cotacao) => {
    try {
      setExporting(true);
      
      const getViewModeLabel = () => {
        const labels = {
          'padrao': 'Visualizacao_Padrao',
          'resumo': 'Resumo_Comparativo',
          'melhor-preco': 'Melhor_Preco',
          'melhor-entrega': 'Melhor_Prazo_Entrega',
          'melhor-pagamento': 'Melhor_Prazo_Pagamento',
          'comparativo': 'Comparativo_Produtos'
        };
        return labels[viewMode] || 'Analise';
      };

      const filename = `Cotacao_${cotacao?.numero || cotacaoId}_${getViewModeLabel()}.pdf`;
      
      const blob = await supervisorExportService.exportAnalisePDF(cotacaoId, viewMode);
      downloadFile(blob, filename);
      
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async (cotacaoId, viewMode, cotacao) => {
    try {
      setExporting(true);
      
      const getViewModeLabel = () => {
        const labels = {
          'padrao': 'Visualizacao_Padrao',
          'resumo': 'Resumo_Comparativo',
          'melhor-preco': 'Melhor_Preco',
          'melhor-entrega': 'Melhor_Prazo_Entrega',
          'melhor-pagamento': 'Melhor_Prazo_Pagamento',
          'comparativo': 'Comparativo_Produtos'
        };
        return labels[viewMode] || 'Analise';
      };

      const filename = `Cotacao_${cotacao?.numero || cotacaoId}_${getViewModeLabel()}.xlsx`;
      
      const blob = await supervisorExportService.exportAnaliseExcel(cotacaoId, viewMode);
      downloadFile(blob, filename);
      
      toast.success('Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar Excel');
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    handleExportPDF,
    handleExportExcel
  };
};
