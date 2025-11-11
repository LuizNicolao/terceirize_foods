import React, { useState } from 'react';
import { FaUpload, FaDownload, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Modal, Button } from '../ui';
import NecessidadesPadroesService from '../../services/necessidadesPadroes';
import toast from 'react-hot-toast';

const ImportPedidoMensalModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  const resetState = () => {
    setArquivo(null);
    setErro(null);
    setResultado(null);
  };

  const handleClose = () => {
    resetState();
    onClose?.();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      setErro('Selecione um arquivo Excel válido (.xlsx ou .xls)');
      setArquivo(null);
      return;
    }

    setArquivo(file);
    setErro(null);
    setResultado(null);
  };

  const handleDownloadModelo = async () => {
    setErro(null);
    try {
      const response = await NecessidadesPadroesService.baixarModelo();
      if (!response.success) {
        setErro(response.error || 'Erro ao baixar modelo');
      }
    } catch (error) {
      console.error('[ImportPedidoMensalModal] Erro ao baixar modelo', error);
      setErro('Erro ao baixar modelo de planilha');
    }
  };

  const handleImport = async () => {
    if (!arquivo) {
      setErro('Selecione um arquivo antes de importar');
      return;
    }

    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);

      const response = await NecessidadesPadroesService.importarExcel(formData);

      if (response.success) {
        setResultado(response.data || response);
        toast.success('Importação enviada para processamento');
        if (response.data?.sucesso?.length || response.sucesso?.length) {
          onImportSuccess?.();
        }
      } else {
        setErro(response.message || response.error || 'Erro ao importar planilha');
      }
    } catch (error) {
      console.error('[ImportPedidoMensalModal] Erro ao importar', error);
      setErro(error.response?.data?.message || 'Erro ao processar importação');
    } finally {
      setLoading(false);
    }
  };

  const totalLinhas = resultado?.total ?? 0;
  const totalSucesso = resultado?.sucesso?.length ?? 0;
  const totalErros = resultado?.erros?.length ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Pedido Mensal"
      size="3xl"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instruções</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Baixe o modelo de planilha antes de iniciar o preenchimento.</li>
            <li>Preencha os campos obrigatórios: <strong>escola_id</strong>, <strong>grupo_id</strong>, <strong>produto_id</strong> e <strong>quantidade</strong>.</li>
            <li>Mantenha os cabeçalhos originais da planilha para evitar erros.</li>
            <li>As quantidades devem ser números positivos (use ponto como separador decimal).</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleDownloadModelo}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <FaDownload />
            Baixar Modelo
          </Button>
        </div>

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
                type="button"
                onClick={resetState}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                disabled={loading}
                aria-label="Remover arquivo selecionado"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Erro</p>
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          </div>
        )}

        {resultado && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Resumo da Importação</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalLinhas}</div>
                  <div className="text-sm text-gray-600">Total de Linhas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{totalSucesso}</div>
                  <div className="text-sm text-gray-600">Processadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{totalErros}</div>
                  <div className="text-sm text-gray-600">Erros</div>
                </div>
              </div>
            </div>

            {totalSucesso > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaCheckCircle className="text-green-600" />
                  <h4 className="font-semibold text-green-900">
                    Registros processados ({totalSucesso})
                  </h4>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 text-sm text-green-800">
                  {(resultado.sucesso || []).slice(0, 50).map((item, index) => (
                    <div key={`${item.linha}-${index}`} className="flex justify-between">
                      <span>Linha {item.linha}: Escola {item.escola_id} - Produto {item.produto_id}</span>
                      <span className="font-mono">{item.quantidade}</span>
                    </div>
                  ))}
                  {totalSucesso > 50 && (
                    <p className="text-xs text-green-700 mt-2">
                      (+ {totalSucesso - 50} linhas adicionais)
                    </p>
                  )}
                </div>
              </div>
            )}

            {totalErros > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaExclamationTriangle className="text-red-600" />
                  <h4 className="font-semibold text-red-900">Ocorreram {totalErros} erros</h4>
                </div>
                <div className="max-h-40 overflow-y-auto text-sm text-red-700 space-y-1">
                  {(resultado.erros || []).slice(0, 50).map((item, index) => (
                    <div key={`${item.linha}-${index}`}>
                      Linha {item.linha}: {item.erro}
                    </div>
                  ))}
                  {totalErros > 50 && (
                    <p className="text-xs text-red-700 mt-2">
                      (+ {totalErros - 50} erros adicionais)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            color="green"
            disabled={loading || !arquivo}
            className="flex items-center gap-2"
          >
            <FaUpload />
            {loading ? 'Importando...' : 'Importar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportPedidoMensalModal;

