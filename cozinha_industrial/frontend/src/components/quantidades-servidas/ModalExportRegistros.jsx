import React, { useState } from 'react';
import { FaFileExcel, FaFilePdf, FaTimes, FaChartLine, FaCalendarDay } from 'react-icons/fa';
import { Modal, Button } from '../ui';
import quantidadesServidasService from '../../services/quantidadesServidas';
import toast from 'react-hot-toast';

const ModalExportRegistros = ({
  isOpen,
  onClose,
  filtros = {},
  tipoFormato = null // 'xlsx' ou 'pdf' - se null, mostra ambos
}) => {
  const [tipoExportacao, setTipoExportacao] = useState('registros'); // 'registros' ou 'medias'
  const [exportando, setExportando] = useState(false);

  // Limpar seleção quando modal fecha
  React.useEffect(() => {
    if (!isOpen) {
      setTipoExportacao('registros');
    }
  }, [isOpen]);

  // Handler para exportar Excel
  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      const params = {
        ...filtros,
        tipo: tipoExportacao // 'registros' ou 'medias'
      };

      const response = await quantidadesServidasService.exportarXLSX(params);
      
      if (response.success) {
        // Criar blob e fazer download
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const tipoNome = tipoExportacao === 'medias' ? 'medias' : 'registros_diarios';
        link.download = `${tipoNome}_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    setExportando(true);
    try {
      const params = {
        ...filtros,
        tipo: tipoExportacao // 'registros' ou 'medias'
      };

      const response = await quantidadesServidasService.exportarPDF(params);
      
      if (response.success) {
        // Criar blob e fazer download
        const blob = new Blob([response.data], {
          type: 'application/pdf'
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const tipoNome = tipoExportacao === 'medias' ? 'medias' : 'registros_diarios';
        link.download = `${tipoNome}_${new Date().toISOString().split('T')[0]}.pdf`;
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exportar Quantidade Servida"
      size="md"
    >
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecione o tipo de exportação
          </label>
          
          <div className="space-y-3">
            {/* Opção: Registros Diários */}
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: tipoExportacao === 'registros' ? '#10b981' : '#e5e7eb' }}>
              <input
                type="radio"
                name="tipoExportacao"
                value="registros"
                checked={tipoExportacao === 'registros'}
                onChange={(e) => setTipoExportacao(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <FaCalendarDay className="mr-2 text-gray-600" />
                  <span className="font-medium text-gray-900">Registros Diários</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Exporta todos os registros diários com datas e valores individuais
                </p>
              </div>
            </label>

            {/* Opção: Médias */}
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: tipoExportacao === 'medias' ? '#10b981' : '#e5e7eb' }}>
              <input
                type="radio"
                name="tipoExportacao"
                value="medias"
                checked={tipoExportacao === 'medias'}
                onChange={(e) => setTipoExportacao(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <FaChartLine className="mr-2 text-gray-600" />
                  <span className="font-medium text-gray-900">Médias</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Exporta as médias calculadas por cozinha industrial (valores médios das refeições)
                </p>
              </div>
            </label>
          </div>
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
          {/* Mostrar botão Excel apenas se tipoFormato for 'xlsx' ou null */}
          {(tipoFormato === 'xlsx' || tipoFormato === null) && (
            <Button
              variant="success"
              onClick={handleExportarExcel}
              disabled={exportando}
              icon={<FaFileExcel />}
              loading={exportando && tipoFormato === 'xlsx'}
            >
              Exportar Excel
            </Button>
          )}
          {/* Mostrar botão PDF apenas se tipoFormato for 'pdf' ou null */}
          {(tipoFormato === 'pdf' || tipoFormato === null) && (
            <Button
              variant="danger"
              onClick={handleExportarPDF}
              disabled={exportando}
              icon={<FaFilePdf />}
              loading={exportando && tipoFormato === 'pdf'}
            >
              Exportar PDF
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalExportRegistros;

