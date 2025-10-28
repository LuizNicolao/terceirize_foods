import React, { useState } from 'react';
import { FaUpload, FaDownload, FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { Modal, Button } from '../ui';
import { necessidadesService } from '../../services/necessidadesService';

const ImportNecessidadesModal = ({ isOpen, onClose, onImportSuccess }) => {
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

  const handleImport = async () => {
    if (!arquivo) {
      setErro('Por favor, selecione um arquivo');
      return;
    }

    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append('planilha', arquivo);

      const response = await necessidadesService.importarExcel(formData);

      if (response.success) {
        setResultado(response.data);
        
        // Se teve sucesso parcial ou total, chamar callback
        if (response.data.sucesso.length > 0) {
          setTimeout(() => {
            onImportSuccess();
          }, 2000);
        }
      } else {
        setErro(response.message || 'Erro ao importar planilha');
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      setErro(error.response?.data?.message || 'Erro ao processar importação');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadModelo = async () => {
    try {
      await necessidadesService.baixarModelo();
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      setErro('Erro ao baixar modelo de planilha');
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
      title="Importar Necessidades"
      size="3xl"
    >
      <div className="space-y-6">
        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instruções:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Baixe o modelo de planilha clicando no botão abaixo</li>
            <li>Preencha os dados conforme o exemplo fornecido</li>
            <li>Os campos <strong>escola_id</strong>, <strong>produto_id</strong> e <strong>quantidade</strong> são obrigatórios</li>
            <li>Certifique-se de que as escolas e produtos existem no sistema</li>
            <li>As necessidades serão criadas automaticamente com status "NEC"</li>
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
            Selecionar Planilha
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <div className="text-center">
                <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                <p className="text-sm text-gray-600">
                  {arquivo ? arquivo.name : 'Clique para selecionar arquivo Excel'}
                </p>
              </div>
            </label>
            {arquivo && (
              <button
                onClick={() => {
                  setArquivo(null);
                  setResultado(null);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                disabled={loading}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Mensagem de erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Erro</p>
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          </div>
        )}

        {/* Resultado da importação */}
        {resultado && (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📊 Resumo da Importação:</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{resultado.total}</div>
                  <div className="text-sm text-gray-600">Total de Linhas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{resultado.sucesso.length}</div>
                  <div className="text-sm text-gray-600">Importadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{resultado.erros.length}</div>
                  <div className="text-sm text-gray-600">Erros</div>
                </div>
              </div>
            </div>

            {/* Necessidades importadas com sucesso */}
            {resultado.sucesso.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaCheckCircle className="text-green-600" />
                  <h4 className="font-semibold text-green-900">
                    Necessidades Importadas ({resultado.sucesso.length})
                  </h4>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {resultado.sucesso.map((item) => (
                    <div key={item.id} className="text-sm text-green-800 flex justify-between">
                      <span>Linha {item.linha}: {item.escola_nome} - {item.produto_nome}</span>
                      <span className="font-mono text-green-600">{item.quantidade}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Erros */}
            {resultado.erros.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaExclamationTriangle className="text-red-600" />
                  <h4 className="font-semibold text-red-900">
                    Erros Encontrados ({resultado.erros.length})
                  </h4>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {resultado.erros.map((item, index) => (
                    <div key={index} className="text-sm bg-white rounded p-2">
                      <div className="font-medium text-red-800">Linha {item.linha}:</div>
                      <div className="text-red-600">{item.erro}</div>
                      {item.dados && (
                        <div className="text-xs text-gray-600 mt-1">
                          Dados: {JSON.stringify(item.dados)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleClose}
            variant="outline"
          >
            {resultado ? 'Fechar' : 'Cancelar'}
          </Button>
          {!resultado && (
            <Button
              onClick={handleImport}
              disabled={!arquivo || loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importando...
                </>
              ) : (
                <>
                  <FaUpload />
                  Importar
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImportNecessidadesModal;
