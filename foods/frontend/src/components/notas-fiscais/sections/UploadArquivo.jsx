import React, { useRef } from 'react';
import { FaUpload, FaFilePdf, FaFileAlt } from 'react-icons/fa';
import FormSection from './FormSection';

const UploadArquivo = ({ 
  formData, 
  onChange, 
  isViewMode = false,
  arquivoSelecionado,
  onArquivoChange
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo (PDF ou XML)
      const allowedTypes = ['application/pdf', 'text/xml', 'application/xml'];
      const allowedExtensions = ['.pdf', '.xml'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        alert('Tipo de arquivo não suportado. Apenas arquivos PDF e XML são permitidos.');
        e.target.value = '';
        return;
      }

      // Validar tamanho (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert('O arquivo excede o tamanho máximo permitido de 10MB.');
        e.target.value = '';
        return;
      }

      onArquivoChange(file);
    }
  };

  const handleClickUpload = () => {
    if (!isViewMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onArquivoChange(null);
  };

  return (
    <FormSection
      icon={FaUpload}
      title="Upload da Nota Fiscal *"
      description="Faça o upload do arquivo PDF ou XML da nota fiscal. Campo obrigatório."
    >
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xml"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isViewMode}
        />
        
        {!arquivoSelecionado && !formData.arquivo_nota_fiscal && (
          <div
            onClick={handleClickUpload}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isViewMode 
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
            }`}
          >
            <FaUpload className="mx-auto text-4xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Clique para fazer upload do arquivo
            </p>
            <p className="text-xs text-gray-500">
              Formatos aceitos: PDF, XML (máx. 10MB)
            </p>
          </div>
        )}

        {arquivoSelecionado && (
          <div className="border border-green-500 rounded-lg p-4 bg-green-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {arquivoSelecionado.name.toLowerCase().endsWith('.pdf') ? (
                <FaFilePdf className="text-3xl text-red-600" />
              ) : (
                <FaFileAlt className="text-3xl text-blue-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {arquivoSelecionado.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isViewMode && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remover
              </button>
            )}
          </div>
        )}

        {formData.arquivo_nota_fiscal && !arquivoSelecionado && (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center gap-3">
            <FaFilePdf className="text-3xl text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Arquivo já anexado
              </p>
              <p className="text-xs text-gray-500">
                {formData.arquivo_nota_fiscal}
              </p>
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default UploadArquivo;

