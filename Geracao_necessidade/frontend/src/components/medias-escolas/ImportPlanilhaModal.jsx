import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FaUpload, FaFileExcel, FaFileCsv } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const ImportPlanilhaModal = ({ isOpen, onClose, onImport }) => {
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file) {
      setArquivo(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const processarArquivo = (arquivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Pegar a primeira planilha
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Converter para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Processar os dados
          const mediasProcessadas = processarDados(jsonData);
          
          resolve(mediasProcessadas);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(arquivo);
    });
  };

  const processarDados = (dados) => {
    const medias = [];
    let escolaAtual = '';
    
    for (let i = 0; i < dados.length; i++) {
      const linha = dados[i];
      if (!linha || linha.length === 0) continue;
      
      const primeiraColuna = linha[0]?.toString().trim();
      const segundaColuna = linha[1]?.toString().trim();
      const terceiraColuna = linha[2]?.toString().trim();
      
      // Se a primeira coluna não está vazia, é uma nova escola
      if (primeiraColuna && primeiraColuna !== '') {
        escolaAtual = primeiraColuna;
      }
      
      // Se tem dados nas três colunas, é uma média
      if (escolaAtual && segundaColuna && terceiraColuna) {
        const media = parseFloat(terceiraColuna);
        if (!isNaN(media)) {
          medias.push({
            escola: escolaAtual,
            turno: segundaColuna,
            media: media
          });
        }
      }
    }
    
    return medias;
  };

  const handleImport = async () => {
    if (!arquivo) {
      alert('Por favor, selecione um arquivo');
      return;
    }

    setLoading(true);
    try {
      const mediasProcessadas = await processarArquivo(arquivo);
      await onImport(mediasProcessadas);
      onClose();
    } catch (error) {
      console.error('Erro ao importar:', error);
      alert('Erro ao processar arquivo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Planilha de Médias"
      size="lg"
    >
      <div className="space-y-6">
        {/* Área de Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <FaUpload className="h-12 w-12 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                Arraste e solte seu arquivo aqui
              </p>
              <p className="text-sm text-gray-500">
                ou clique para selecionar
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <FaFileExcel className="h-8 w-8 text-green-600" />
              <FaFileCsv className="h-8 w-8 text-blue-600" />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Selecionar Arquivo
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Arquivo Selecionado */}
        {arquivo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaFileExcel className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {arquivo.name}
                </p>
                <p className="text-xs text-green-600">
                  {(arquivo.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => setArquivo(null)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Formatos Suportados:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Excel (.xlsx, .xls)</li>
            <li>• CSV (.csv)</li>
          </ul>
          
          <h4 className="text-sm font-medium text-blue-800 mb-2 mt-3">
            Estrutura Esperada:
          </h4>
          <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded font-mono">
            <div>UNIDADE ENSINO - LOTE 2    TURNO ATENDIDO    MEDIA</div>
            <div>AFONSO CLAUDIO  VESPERTINO  66</div>
            <div>  INTEGRAL 7H MATUTINO- LANCHE  290</div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            variant="primary"
            loading={loading}
            disabled={loading || !arquivo}
          >
            {loading ? 'Importando...' : 'Importar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportPlanilhaModal;
