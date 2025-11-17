import React, { useState, useEffect } from 'react';
import { FaPrint, FaFileExcel, FaFilePdf, FaTimes } from 'react-icons/fa';
import { Modal, Button, SearchableSelect } from '../../ui';
import necessidadesService from '../../../services/necessidadesService';
import toast from 'react-hot-toast';

const ModalImpressao = ({
  isOpen,
  onClose,
  activeTab,
  opcoesSemanasConsumo = [],
  onExportXLSX,
  onExportPDF
}) => {
  const [semanaConsumoSelecionada, setSemanaConsumoSelecionada] = useState('');
  const [exportando, setExportando] = useState(false);

  // Limpar seleção quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setSemanaConsumoSelecionada('');
    }
  }, [isOpen]);

  // Preparar opções de semana para o SearchableSelect
  const semanaOptions = opcoesSemanasConsumo
    .filter(opcao => opcao.value !== '') // Remover opção vazia padrão
    .map(opcao => ({
      value: opcao.value,
      label: opcao.label
    }));

  // Handler para exportar Excel
  const handleExportarExcel = async () => {
    if (!semanaConsumoSelecionada) {
      toast.error('Selecione uma semana de consumo');
      return;
    }

    setExportando(true);
    try {
      const filtros = {
        semana_consumo: semanaConsumoSelecionada,
        aba: activeTab
      };

      const response = await necessidadesService.exportarXLSX(filtros);
      
      if (response.success) {
        // Criar blob e fazer download
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename || `necessidades_${activeTab}_${semanaConsumoSelecionada.replace(/\s+/g, '_')}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Arquivo Excel exportado com sucesso!');
        onClose();
      } else {
        toast.error('Erro ao exportar arquivo Excel');
      }
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    } finally {
      setExportando(false);
    }
  };

  // Handler para exportar PDF
  const handleExportarPDF = async () => {
    if (!semanaConsumoSelecionada) {
      toast.error('Selecione uma semana de consumo');
      return;
    }

    setExportando(true);
    try {
      const filtros = {
        semana_consumo: semanaConsumoSelecionada,
        aba: activeTab
      };

      const response = await necessidadesService.exportarPDF(filtros);
      
      if (response.success) {
        // Criar blob e fazer download
        const blob = new Blob([response.data], {
          type: 'application/pdf'
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename || `necessidades_${activeTab}_${semanaConsumoSelecionada.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Arquivo PDF exportado com sucesso!');
        onClose();
      } else {
        toast.error('Erro ao exportar arquivo PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    } finally {
      setExportando(false);
    }
  };

  const getTituloAba = () => {
    switch (activeTab) {
      case 'nutricionista':
        return 'Nutricionista';
      case 'coordenacao':
        return 'Coordenação';
      case 'logistica':
        return 'Logística';
      default:
        return 'Ajuste';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Imprimir/Exportar - Ajuste ${getTituloAba()}`}
      size="md"
    >
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a Semana de Consumo
          </label>
          <SearchableSelect
            options={semanaOptions}
            value={semanaConsumoSelecionada}
            onChange={(value) => setSemanaConsumoSelecionada(value || '')}
            placeholder="Selecione uma semana de consumo..."
            isClearable
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={exportando}
            icon={<FaTimes />}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleExportarExcel}
            disabled={!semanaConsumoSelecionada || exportando}
            icon={<FaFileExcel />}
            loading={exportando}
          >
            Exportar Excel
          </Button>
          <Button
            variant="danger"
            onClick={handleExportarPDF}
            disabled={!semanaConsumoSelecionada || exportando}
            icon={<FaFilePdf />}
            loading={exportando}
          >
            Exportar PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalImpressao;

