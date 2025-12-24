import toast from 'react-hot-toast';

export const useExport = (service) => {
  // Exportar para XLSX
  const handleExportXLSX = async (params = {}) => {
    try {
      const result = await service.exportarXLSX(params);
      
      if (result.success) {
        // Verificar se result.data é um Blob ou ArrayBuffer
        let blob;
        if (result.data instanceof Blob) {
          blob = result.data;
        } else if (result.data instanceof ArrayBuffer) {
          blob = new Blob([result.data]);
        } else {
          // Se não for Blob nem ArrayBuffer, tentar criar um Blob
          blob = new Blob([result.data]);
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Usar nome do arquivo do resultado ou gerar um padrão
        const filename = result.filename || `${service.constructor.name.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.setAttribute('download', filename);
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Exportação XLSX realizada com sucesso!');
      } else {
        toast.error(result.error || result.message || 'Erro ao exportar XLSX');
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      
      // Tratamento específico de erros
      if (error.response) {
        if (error.response.status === 403) {
          toast.error('Você não tem permissão para exportar este relatório');
        } else if (error.response.status === 404) {
          toast.error('Serviço de exportação não encontrado');
        } else if (error.response.status === 500) {
          toast.error('Erro interno do servidor ao gerar relatório');
        } else {
          toast.error(`Erro ${error.response.status}: ${error.response.data?.message || 'Erro desconhecido'}`);
        }
      } else if (error.request) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        toast.error('Erro ao exportar XLSX');
      }
    }
  };

  // Exportar para PDF
  const handleExportPDF = async (params = {}) => {
    try {
      const result = await service.exportarPDF(params);
      
      if (result.success) {
        // Verificar se result.data é um Blob ou ArrayBuffer
        let blob;
        if (result.data instanceof Blob) {
          blob = result.data;
        } else if (result.data instanceof ArrayBuffer) {
          blob = new Blob([result.data]);
        } else {
          // Se não for Blob nem ArrayBuffer, tentar criar um Blob
          blob = new Blob([result.data]);
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Usar nome do arquivo do resultado ou gerar um padrão
        const filename = result.filename || `${service.constructor.name.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
        link.setAttribute('download', filename);
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Exportação PDF realizada com sucesso!');
      } else {
        toast.error(result.error || result.message || 'Erro ao exportar PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      
      // Tratamento específico de erros
      if (error.response) {
        if (error.response.status === 403) {
          toast.error('Você não tem permissão para exportar este relatório');
        } else if (error.response.status === 404) {
          toast.error('Serviço de exportação não encontrado');
        } else if (error.response.status === 500) {
          toast.error('Erro interno do servidor ao gerar relatório');
        } else {
          toast.error(`Erro ${error.response.status}: ${error.response.data?.message || 'Erro desconhecido'}`);
        }
      } else if (error.request) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        toast.error('Erro ao exportar PDF');
      }
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
        toast.error(result.error || result.message || 'Erro ao imprimir PDF');
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
