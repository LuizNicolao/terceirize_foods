import { useCallback } from 'react';
import SubstituicoesNecessidadesService from '../../services/substituicoesNecessidades';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar exportações na aba de Coordenação
 */
const useCoordenacaoExport = (filtros) => {
  const prepararFiltrosExport = useCallback(() => {
    const filtrosExport = {};
    
    if (filtros.grupo) {
      filtrosExport.grupo = typeof filtros.grupo === 'object' ? filtros.grupo.nome || filtros.grupo.id : filtros.grupo;
    }
    
    if (filtros.semana_abastecimento) {
      filtrosExport.semana_abastecimento = filtros.semana_abastecimento;
    }
    
    if (filtros.semana_consumo) {
      filtrosExport.semana_consumo = filtros.semana_consumo;
    }
    
    if (filtros.tipo_rota_id) {
      filtrosExport.tipo_rota_id = typeof filtros.tipo_rota_id === 'object' ? filtros.tipo_rota_id.id : filtros.tipo_rota_id;
    }
    
    if (filtros.rota_id) {
      filtrosExport.rota_id = typeof filtros.rota_id === 'object' ? filtros.rota_id.id : filtros.rota_id;
    }
    
    return filtrosExport;
  }, [filtros]);

  const handleExportXLSX = useCallback(async () => {
    try {
      const filtrosExport = prepararFiltrosExport();
      const response = await SubstituicoesNecessidadesService.exportarXLSX(filtrosExport);
      
      if (response.success) {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename || `substituicoes_coordenacao_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Arquivo XLSX exportado com sucesso!');
      } else {
        toast.error('Erro ao exportar arquivo XLSX');
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar arquivo XLSX');
    }
  }, [prepararFiltrosExport]);

  const handleExportPDF = useCallback(async () => {
    try {
      const filtrosExport = prepararFiltrosExport();
      const response = await SubstituicoesNecessidadesService.exportarPDF(filtrosExport);
      
      if (response.success) {
        const blob = new Blob([response.data], {
          type: 'application/pdf'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename || `substituicoes_coordenacao_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Arquivo PDF exportado com sucesso!');
      } else {
        toast.error('Erro ao exportar arquivo PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    }
  }, [prepararFiltrosExport]);

  return {
    handleExportXLSX,
    handleExportPDF
  };
};

export default useCoordenacaoExport;

