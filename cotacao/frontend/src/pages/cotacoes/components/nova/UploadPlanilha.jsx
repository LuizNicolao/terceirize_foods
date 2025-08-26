import React, { useRef } from 'react';
import { FaFileUpload, FaCheckCircle } from 'react-icons/fa';

const UploadPlanilha = ({ onFileUpload, planilhaCarregada, produtos, errors }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
      // Limpar o input para permitir re-upload do mesmo arquivo
      event.target.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-green-500 flex items-center gap-2">
        📄 Upload de Planilha
      </h2>
      
      <div className="space-y-4">
        <div className="text-center">
          <button
            type="button"
            onClick={handleButtonClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm"
          >
            <FaFileUpload /> Importar Planilha de Produtos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {errors.produtos && (
          <div className="text-red-500 text-sm text-center">{errors.produtos}</div>
        )}

        {planilhaCarregada && produtos.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <FaCheckCircle />
              <span className="font-semibold">Planilha carregada com sucesso!</span>
            </div>
            <p className="text-green-600 text-sm">
              {produtos.length} produto{produtos.length !== 1 ? 's' : ''} importado{produtos.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPlanilha;
