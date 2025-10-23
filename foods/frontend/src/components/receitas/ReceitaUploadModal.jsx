import React, { useState } from 'react';
import { FaUpload, FaTimes, FaFilePdf, FaSpinner } from 'react-icons/fa';
import { Button, Modal } from '../ui';
import toast from 'react-hot-toast';

const ReceitaUploadModal = ({ isOpen, onClose, onProcessar }) => {
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);

  console.log('🔍 ReceitaUploadModal renderizado - isOpen:', isOpen);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setArquivo(file);
    } else {
      toast.error('Por favor, selecione um arquivo PDF válido');
    }
  };

  const handleProcessar = async () => {
    if (!arquivo) {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    setProcessando(true);
    try {
      // Aqui você pode implementar a lógica de processamento do PDF
      // Por enquanto, vamos simular o processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular dados extraídos do PDF
      const dadosProcessados = {
        textoExtraido: 'Texto extraído do PDF...',
        ingredientes: [
          { nome: 'Ingrediente 1', quantidade: '100g' },
          { nome: 'Ingrediente 2', quantidade: '200ml' }
        ],
        instrucoes: 'Instruções de preparo extraídas do PDF...'
      };
      
      toast.success('PDF processado com sucesso!');
      onProcessar(dadosProcessados);
      handleClose();
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      toast.error('Erro ao processar PDF');
    } finally {
      setProcessando(false);
    }
  };

  const handleClose = () => {
    setArquivo(null);
    setProcessando(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="📄 Upload de PDF para Receita"
      size="md"
    >
      <div className="space-y-6">
        {/* Upload do arquivo */}
        <div className="form-group">
          <label className="form-label">
            <FaFilePdf className="mr-2" />
            Arquivo PDF *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <FaFilePdf className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="pdf-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                >
                  <span>Selecionar arquivo</span>
                  <input
                    id="pdf-upload"
                    name="pdf-upload"
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={handleFileSelect}
                    disabled={processando}
                  />
                </label>
                <p className="pl-1">ou arraste e solte aqui</p>
              </div>
              <p className="text-xs text-gray-500">PDF até 10MB</p>
              {arquivo && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ {arquivo.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Informações sobre o processamento */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            📋 O que será extraído do PDF:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Texto completo da receita</li>
            <li>• Lista de ingredientes com quantidades</li>
            <li>• Instruções de preparo</li>
            <li>• Informações nutricionais (se disponível)</li>
          </ul>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={processando}
          >
            <FaTimes className="mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleProcessar}
            disabled={!arquivo || processando}
            className="bg-green-600 hover:bg-green-700"
          >
            {processando ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <FaUpload className="mr-2" />
                Processar PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceitaUploadModal;
