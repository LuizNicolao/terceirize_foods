import React, { useState, useRef } from 'react';
import { FaFileUpload, FaDownload, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import { Modal } from '../ui';

const ImportarUnidadesEscolares = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [errorDetails, setErrorDetails] = useState('');
  const [errorsByRow, setErrorsByRow] = useState(null);
  const [totalErrors, setTotalErrors] = useState(0);
  const [affectedRows, setAffectedRows] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
        return;
      }

      // Validar tamanho (máximo 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('O arquivo é muito grande. Tamanho máximo permitido: 10MB');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setErrors([]);
      setErrorDetails('');
      setErrorsByRow(null);
      setTotalErrors(0);
      setAffectedRows(0);
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo para importar');
      return;
    }

    setUploading(true);
    setErrors([]);
    setErrorDetails('');
    setErrorsByRow(null);
    setTotalErrors(0);
    setAffectedRows(0);

    try {
      const formData = new FormData();
      formData.append('planilha', file);

      const response = await UnidadesEscolaresService.importarPlanilha(formData);
      
      if (response.success) {
        toast.success(response.message);
        setPreview(response.data);
        
        if (onImportSuccess) {
          onImportSuccess(response.data);
        }
      } else {
        setErrors(response.validationErrors || []);
        setErrorDetails(response.details || '');
        setErrorsByRow(response.errorsByRow || null);
        setTotalErrors(response.totalErrors || 0);
        setAffectedRows(response.affectedRows || 0);
        toast.error(response.message || 'Erro na importação');
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast.error('Erro ao importar arquivo. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
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

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    setErrors([]);
    setErrorDetails('');
    setErrorsByRow(null);
    setTotalErrors(0);
    setAffectedRows(0);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📊 Importar Unidades Escolares"
      size="6xl"
    >
      <div className="space-y-6">
        {/* Seção: Download do Template */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            📋 Template da Planilha
          </h3>
          <p className="text-blue-700 mb-4">
            Baixe o template com as colunas corretas para preencher com suas unidades escolares.
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <FaDownload /> Baixar Template
          </button>
        </div>

        {/* Seção: Upload da Planilha */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            📤 Upload da Planilha
          </h3>
          
          {!file ? (
            <div className="text-center">
              <button
                type="button"
                onClick={handleButtonClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
              >
                <FaFileUpload /> Selecionar Planilha Excel
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-gray-600 mt-3 text-sm">
                Formatos aceitos: .xlsx, .xls (máximo 10MB)
              </p>
            </div>
          ) : (
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 text-xl" />
                  <div>
                    <p className="font-semibold text-green-800">{fileName}</p>
                    <p className="text-sm text-green-600">
                      Arquivo selecionado com sucesso
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <FaFileUpload /> Importar Unidades Escolares
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Seção: Erros de Validação */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
              <FaExclamationTriangle /> Erros de Validação
            </h3>
            
            {/* Resumo dos Erros */}
            <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
              <p className="text-red-800 font-medium">
                Encontrados {totalErrors} erro(s) em {affectedRows} linha(s) da planilha.
              </p>
              <p className="text-red-700 text-sm mt-1">
                Corrija os erros antes de tentar importar novamente.
              </p>
            </div>

            {/* Detalhes dos Erros */}
            {errorDetails && (
              <div className="bg-white border border-red-200 rounded p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">Detalhes dos Erros:</h4>
                <pre className="text-red-700 text-sm whitespace-pre-wrap font-mono">
                  {errorDetails}
                </pre>
              </div>
            )}

            {/* Erros por Linha */}
            {errorsByRow && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.keys(errorsByRow).map(row => (
                  <div key={row} className="bg-white border border-red-200 rounded p-3">
                    <h4 className="font-semibold text-red-800 mb-2">
                      Linha {row}:
                    </h4>
                    <div className="space-y-2">
                      {errorsByRow[row].map((error, index) => (
                        <div key={index} className="bg-red-50 border border-red-100 rounded p-2">
                          <p className="font-medium text-red-800">
                            {error.field}
                          </p>
                          <p className="text-red-700 text-sm">
                            Valor: "{error.value || 'vazio'}"
                          </p>
                          <p className="text-red-600 text-sm">
                            {error.error}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seção: Preview da Importação */}
        {preview && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
              <FaCheckCircle /> Importação Realizada com Sucesso!
            </h3>
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Total processado:</span> {preview.totalProcessed}
                </div>
                <div>
                  <span className="font-semibold">Total importado:</span> {preview.totalInserted}
                </div>
              </div>
              
              {preview.unidades && preview.unidades.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-green-800 mb-2">Primeiras unidades importadas:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {preview.unidades.map((unidade, index) => (
                      <div key={index} className="bg-gray-50 rounded p-2 text-xs">
                        <span className="font-semibold">{unidade.codigo_teknisa}</span> - {unidade.nome_escola}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            💡 Instruções
          </h3>
          <div className="text-yellow-700 space-y-2 text-sm">
            <p><strong>Colunas obrigatórias:</strong> Código Teknisa, Nome da Escola, Cidade, Estado</p>
            <p><strong>Colunas opcionais:</strong> País, Endereço, Número, Bairro, CEP, Centro de Distribuição, Rota ID, Regional, Lote, C.C. Senior, Código Senior, Abastecimento, Ordem de Entrega, Status, Observações</p>
            <p><strong>Formato de CEP:</strong> 00000-000 ou 00000000</p>
            <p><strong>Status:</strong> "ativo" ou "inativo" (padrão: ativo)</p>
            <p><strong>País:</strong> Padrão "Brasil" se não informado</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImportarUnidadesEscolares;
