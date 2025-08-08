import toast from 'react-hot-toast';

export const useExport = (service) => {
  // Exportar para XLSX
  const handleExportXLSX = async () => {
    try {
      const result = await service.exportarXLSX();
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${service.constructor.name.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Exportação XLSX realizada com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar XLSX');
    }
  };

  // Exportar para PDF
  const handleExportPDF = async () => {
    try {
      const result = await service.exportarPDF();
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${service.constructor.name.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Exportação PDF realizada com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  // Imprimir em PDF (para produtos)
  const handlePrintPDF = async (id, nome) => {
    try {
      const result = await service.imprimirPDF(id);
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Impressão realizada com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao imprimir PDF:', error);
      toast.error('Erro ao imprimir PDF');
    }
  };

  return {
    handleExportXLSX,
    handleExportPDF,
    handlePrintPDF
  };
};
