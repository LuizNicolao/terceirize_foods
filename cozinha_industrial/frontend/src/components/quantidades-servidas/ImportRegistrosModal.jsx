import React, { useState } from 'react';
import { FaUpload, FaDownload, FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { Modal, Button } from '../ui';
import quantidadesServidasService from '../../services/quantidadesServidas';

const ImportRegistrosModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
        setErro('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
        setArquivo(null);
        return;
      }

      setArquivo(file);
      setErro(null);
      setResultado(null);
    }
  };

  const handleDownloadModelo = async () => {
    try {
      setLoading(true);
      const response = await quantidadesServidasService.baixarModelo();
      
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
      } else {
        setErro(response.error || 'Erro ao baixar modelo');
      }
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      setErro('Erro ao baixar modelo');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!arquivo) {
      setErro('Selecione um arquivo para importar');
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      
      const formData = new FormData();
      formData.append('file', arquivo);

      const response = await quantidadesServidasService.importar(formData);
      
      if (response.success) {
        setResultado({
          importados: response.data?.importados || 0,
          atualizados: response.data?.atualizados || 0,
          erros: response.data?.erros || []
        });
        onImportSuccess(response.data);
      } else {
        setErro(response.error || 'Erro na importação');
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      setErro('Erro na importação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setArquivo(null);
    setResultado(null);
    setErro(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Registros Diários"
      size="3xl"
    >
      <div className="space-y-6">
        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instruções:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Baixe o modelo de planilha clicando no botão abaixo</li>
            <li>Preencha os dados conforme o exemplo fornecido</li>
            <li>Use o <strong>nome exato da cozinha industrial</strong> conforme cadastrado no sistema</li>
            <li>A <strong>data</strong> deve estar no formato YYYY-MM-DD (ex: 2025-01-15)</li>
            <li><strong>Tipo de Cardápio</strong> é opcional (deixe em branco se não aplicável)</li>
            <li>Use o <strong>nome exato do tipo de cardápio</strong> conforme cadastrado no sistema</li>
            <li>As <strong>quantidades</strong> devem ser números inteiros (ex: 150, 200)</li>
            <li>Deixe <strong>0</strong> para refeições não servidas</li>
            <li>Registros duplicados (mesma cozinha industrial/data/período/produto) serão atualizados</li>
          </ul>
        </div>

        {/* Botão para baixar modelo */}
        <div className="flex justify-center">
          <Button
            onClick={handleDownloadModelo}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <FaDownload />
            {loading ? 'Gerando...' : 'Baixar Modelo de Planilha'}
          </Button>
        </div>

        {/* Upload de arquivo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selecionar Arquivo Excel
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Selecionar arquivo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">ou arraste e solte aqui</p>
              </div>
              <p className="text-xs text-gray-500">XLSX, XLS até 10MB</p>
            </div>
          </div>
        </div>

        {/* Arquivo selecionado */}
        {arquivo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800">{arquivo.name}</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Tamanho: {(arquivo.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-2" />
              <span className="text-sm font-medium text-red-800">{erro}</span>
            </div>
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">✅ Importação Concluída!</h4>
            <div className="text-sm text-green-800 space-y-1">
              <p>• {resultado.importados} registros importados</p>
              <p>• {resultado.atualizados} registros atualizados</p>
              {resultado.erros && resultado.erros.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Erros encontrados:</p>
                  <ul className="list-disc list-inside ml-4">
                    {resultado.erros.map((erro, index) => (
                      <li key={index} className="text-red-600">{erro}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end space-x-3">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={loading}
          >
            <FaTimes className="mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!arquivo || loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Importando...</span>
              </>
            ) : (
              <>
                <FaUpload />
                <span>Importar Registros</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportRegistrosModal;