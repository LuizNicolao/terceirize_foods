import React, { useState } from 'react';
import { Modal, Button } from '../ui';
import { FaFileExcel, FaDownload, FaUpload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import RegistrosDiariosService from '../../services/registrosDiarios';
import toast from 'react-hot-toast';

const ImportRegistrosModal = ({ isOpen, onClose, onImport }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const response = await RegistrosDiariosService.baixarModelo();
      
      if (response.success) {
        // Criar link para download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'modelo_registros_diarios.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Modelo baixado com sucesso!');
      } else {
        toast.error(response.error || 'Erro ao baixar modelo');
      }
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      toast.error('Erro ao baixar modelo');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setPreview({
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        });
      } else {
        toast.error('Por favor, selecione um arquivo Excel (.xlsx)');
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo para importar');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await RegistrosDiariosService.importar(formData);
      
      if (response.success) {
        toast.success(`Importação realizada com sucesso! ${response.data?.importados || 0} registros importados.`);
        onImport(response.data);
        handleClose();
      } else {
        toast.error(response.error || 'Erro na importação');
        if (response.data?.erros && response.data.erros.length > 0) {
          console.error('Erros de importação:', response.data.erros);
        }
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro na importação');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Registros Diários"
      size="lg"
    >
      <div className="space-y-6">
        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
            <FaFileExcel className="mr-2" />
            Instruções de Importação
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>📋 <strong>Passo 1:</strong> Baixe o modelo de planilha clicando no botão abaixo</p>
            <p>📝 <strong>Passo 2:</strong> Preencha os dados conforme o exemplo fornecido</p>
            <p>📊 <strong>Passo 3:</strong> As quantidades devem ser números inteiros (ex: 150, 200)</p>
            <p>📅 <strong>Passo 4:</strong> A data deve estar no formato YYYY-MM-DD (ex: 2025-01-15)</p>
            <p>🏫 <strong>Passo 5:</strong> Use o nome exato da escola conforme cadastrado no sistema</p>
            <p>⚠️ <strong>Importante:</strong> Registros duplicados (mesma escola/data) serão atualizados</p>
          </div>
        </div>

        {/* Download do Template */}
        <div className="flex justify-center">
          <Button
            onClick={handleDownloadTemplate}
            disabled={loading}
            variant="outline"
            className="flex items-center"
          >
            <FaDownload className="mr-2" />
            {loading ? 'Gerando...' : 'Baixar Modelo de Planilha'}
          </Button>
        </div>

        {/* Upload do Arquivo */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <FaUpload className="mx-auto text-4xl text-gray-400" />
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-gray-700">
                  {file ? 'Arquivo Selecionado' : 'Selecionar Arquivo Excel'}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Apenas arquivos .xlsx são aceitos
              </p>
            </div>
            
            {preview && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-center text-green-700">
                  <FaCheckCircle className="mr-2" />
                  <span className="font-medium">{preview.name}</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Tamanho: {(preview.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={importing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex items-center"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importando...
              </>
            ) : (
              <>
                <FaUpload className="mr-2" />
                Importar Registros
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportRegistrosModal;
