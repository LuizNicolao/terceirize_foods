import React, { useState, useRef } from 'react';
import { FaUpload, FaDownload, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import { Modal, Button } from '../ui';

const ImportarUnidadesEscolares = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setErro('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
        setFile(null);
        return;
      }

      // Validar tamanho (máximo 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErro('O arquivo é muito grande. Tamanho máximo permitido: 10MB');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setErro(null);
      setResultado(null);
    }
  };

  const handleDownloadModelo = async () => {
    try {
      const response = await UnidadesEscolaresService.downloadTemplate();
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_unidades_escolares.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Template baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar template:', error);
      toast.error('Erro ao baixar template');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setErro('Selecione um arquivo para importar');
      return;
    }

    try {
      setUploading(true);
      setErro(null);
      
      const formData = new FormData();
      formData.append('planilha', file);

      const response = await UnidadesEscolaresService.importarPlanilha(formData);
      
      if (response.success) {
        setResultado({
          totalProcessed: response.data?.totalProcessed || 0,
          totalInserted: response.data?.totalInserted || 0,
          unidades: response.data?.unidades || [],
          erros: response.data?.erros || []
        });
        onImportSuccess(response.data);
      } else {
        setErro(response.message || 'Erro na importação');
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      setErro('Erro na importação');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResultado(null);
    setErro(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Unidades Escolares"
      size="3xl"
    >
      <div className="space-y-6">
        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instruções:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Baixe o modelo de planilha clicando no botão abaixo</li>
            <li>Preencha os dados conforme o exemplo fornecido</li>
            <li>Os campos <strong>Código Teknisa</strong>, <strong>Nome da Escola</strong>, <strong>Cidade</strong> e <strong>Estado</strong> são obrigatórios</li>
            <li>Formato de CEP: 00000-000 ou 00000000</li>
            <li>Status: "ativo" ou "inativo" (padrão: ativo)</li>
            <li>País: Padrão "Brasil" se não informado</li>
          </ul>
        </div>

        {/* Botão para baixar modelo */}
        <div className="flex justify-center">
          <Button
            onClick={handleDownloadModelo}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaDownload />
            Baixar Modelo de Planilha
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
                    ref={fileInputRef}
                    disabled={uploading}
                  />
                </label>
                <p className="pl-1">ou arraste e solte aqui</p>
              </div>
              <p className="text-xs text-gray-500">XLSX, XLS até 10MB</p>
            </div>
          </div>
        </div>

        {/* Arquivo selecionado */}
        {file && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800">{file.name}</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Tamanho: {(file.size / 1024).toFixed(1)} KB
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
              <p>• {resultado.totalProcessed} linhas processadas</p>
              <p>• {resultado.totalInserted} unidades importadas</p>
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
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={uploading}
          >
            <FaTimes className="mr-2" />
            {resultado ? 'Fechar' : 'Cancelar'}
          </Button>
          {!resultado && (
            <Button
              onClick={handleImport}
              disabled={!file || uploading}
              className="flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <FaUpload />
                  <span>Importar Unidades Escolares</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImportarUnidadesEscolares;
