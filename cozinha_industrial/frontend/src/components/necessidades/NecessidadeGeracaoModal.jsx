import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { Modal, Button, SearchableSelect, Pagination } from '../ui';
import FoodsApiService from '../../services/FoodsApiService';
import contratosService from '../../services/contratos';
import cardapiosService from '../../services/cardapios';
import toast from 'react-hot-toast';

/**
 * Modal para geração de necessidade
 */
const NecessidadeGeracaoModal = ({
  isOpen,
  onClose,
  onGerar,
  onPrevisualizar
}) => {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mediasFaltantes, setMediasFaltantes] = useState([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewItemsPerPage] = useState(20);

  // Estados dos campos em cascata
  const [filialId, setFilialId] = useState(null);
  const [centroCustoId, setCentroCustoId] = useState(null);
  const [contratoId, setContratoId] = useState(null);
  const [cardapioId, setCardapioId] = useState(null);

  // Opções dos selects
  const [filiais, setFiliais] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [cardapios, setCardapios] = useState([]);

  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingCentrosCusto, setLoadingCentrosCusto] = useState(false);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const [loadingCardapios, setLoadingCardapios] = useState(false);

  // Carregar filiais ao abrir
  useEffect(() => {
    if (isOpen) {
      carregarFiliais();
      resetForm();
    }
  }, [isOpen]);

  // Carregar centros de custo quando filial mudar
  useEffect(() => {
    if (filialId) {
      carregarCentrosCusto(filialId);
    } else {
      setCentrosCusto([]);
      setCentroCustoId(null);
    }
  }, [filialId]);

  // Carregar contratos quando centro de custo mudar
  useEffect(() => {
    if (centroCustoId) {
      carregarContratos(centroCustoId);
    } else {
      setContratos([]);
      setContratoId(null);
    }
  }, [centroCustoId]);

  // Carregar cardápios quando contrato mudar
  useEffect(() => {
    if (contratoId) {
      carregarCardapios(contratoId);
    } else {
      setCardapios([]);
      setCardapioId(null);
    }
  }, [contratoId]);

  const resetForm = () => {
    setFilialId(null);
    setCentroCustoId(null);
    setContratoId(null);
    setCardapioId(null);
    setPreviewData(null);
    setShowPreview(false);
    setPreviewPage(1);
    setMediasFaltantes([]);
  };

  const carregarFiliais = async () => {
    setLoadingFiliais(true);
    try {
      let allFiliaisData = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getFiliais({ page, limit });
        
        if (result.success && result.data) {
          let items = [];
          if (result.data.items) {
            items = result.data.items;
          } else if (Array.isArray(result.data)) {
            items = result.data;
          } else if (result.data.data) {
            items = result.data.data;
          }
          
          allFiliaisData = [...allFiliaisData, ...items];
          hasMore = items.length === limit;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setFiliais(allFiliaisData);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  };

  const carregarCentrosCusto = async (filialId) => {
    setLoadingCentrosCusto(true);
    try {
      const result = await FoodsApiService.getCentrosCusto({ filial_id: filialId, limit: 1000 });
      
      if (result.success && result.data) {
        let items = [];
        if (result.data.items) {
          items = result.data.items;
        } else if (Array.isArray(result.data)) {
          items = result.data;
        } else if (result.data.data) {
          items = result.data.data;
        }
        setCentrosCusto(items);
      }
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
      toast.error('Erro ao carregar centros de custo');
    } finally {
      setLoadingCentrosCusto(false);
    }
  };

  const carregarContratos = async (centroCustoId) => {
    setLoadingContratos(true);
    try {
      const result = await contratosService.listar({ centro_custo_id: centroCustoId, limit: 1000 });
      
      if (result.success && result.data) {
        setContratos(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoadingContratos(false);
    }
  };

  const carregarCardapios = async (contratoId) => {
    setLoadingCardapios(true);
    try {
      // Buscar cardápios vinculados ao contrato
      const result = await cardapiosService.listar({ contrato_id: contratoId, limit: 1000 });
      
      if (result.success && result.data) {
        setCardapios(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar cardápios:', error);
      toast.error('Erro ao carregar cardápios');
    } finally {
      setLoadingCardapios(false);
    }
  };

  const handlePrevisualizar = async () => {
    if (!filialId || !centroCustoId || !contratoId || !cardapioId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setPreviewLoading(true);
    setShowPreview(true);
    setPreviewData(null);
    setPreviewPage(1);
    setMediasFaltantes([]);

    try {
      const response = await onPrevisualizar({
        filial_id: filialId,
        centro_custo_id: centroCustoId,
        contrato_id: contratoId,
        cardapio_id: cardapioId
      });

      if (response.success) {
        setPreviewData(response.data);
      } else {
        if (response.mediasFaltantes) {
          setMediasFaltantes(response.mediasFaltantes);
        }
        toast.error(response.error || 'Erro ao pré-visualizar');
      }
    } catch (error) {
      console.error('Erro ao pré-visualizar:', error);
      toast.error('Erro ao pré-visualizar necessidade');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGerar = async () => {
    if (!filialId || !centroCustoId || !contratoId || !cardapioId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await onGerar({
        filial_id: filialId,
        centro_custo_id: centroCustoId,
        contrato_id: contratoId,
        cardapio_id: cardapioId,
        sobrescrever: false
      });

      if (response.success) {
        resetForm();
        onClose();
      } else if (response.conflict) {
        // Necessidade já existe - perguntar se deseja sobrescrever
        const confirmar = window.confirm(
          'Já existe uma necessidade gerada para esses parâmetros. Deseja recalcular e sobrescrever a necessidade anterior?'
        );
        
        if (confirmar) {
          const responseSobrescrever = await onGerar({
            filial_id: filialId,
            centro_custo_id: centroCustoId,
            contrato_id: contratoId,
            cardapio_id: cardapioId,
            sobrescrever: true
          });

          if (responseSobrescrever.success) {
            resetForm();
            onClose();
          }
        }
      }
    } catch (error) {
      console.error('Erro ao gerar necessidade:', error);
      toast.error('Erro ao gerar necessidade');
    } finally {
      setLoading(false);
    }
  };

  const filiaisOptions = filiais.map(f => ({
    value: f.id,
    label: f.filial || f.nome || f.razao_social || ''
  }));

  const centrosCustoOptions = centrosCusto.map(cc => ({
    value: cc.id,
    label: cc.nome || ''
  }));

  const contratosOptions = contratos.map(c => ({
    value: c.id,
    label: c.nome || ''
  }));

  const cardapiosOptions = cardapios.map(c => ({
    value: c.id,
    label: c.nome || ''
  }));

  const canGenerate = filialId && centroCustoId && contratoId && cardapioId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" hideCloseButton={true}>
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerar Necessidade</h2>
            <p className="text-sm text-gray-600">Selecione os parâmetros para gerar a necessidade</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Campos em cascata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SearchableSelect
                label="Filial"
                value={filialId}
                onChange={(value) => setFilialId(value)}
                options={filiaisOptions}
                placeholder="Selecione a filial"
                loading={loadingFiliais}
                required
                disabled={loading}
              />
            </div>

            <div>
              <SearchableSelect
                label="Centro de Custo"
                value={centroCustoId}
                onChange={(value) => setCentroCustoId(value)}
                options={centrosCustoOptions}
                placeholder="Selecione o centro de custo"
                loading={loadingCentrosCusto}
                required
                disabled={!filialId || loading}
              />
            </div>

            <div>
              <SearchableSelect
                label="Contrato"
                value={contratoId}
                onChange={(value) => setContratoId(value)}
                options={contratosOptions}
                placeholder="Selecione o contrato"
                loading={loadingContratos}
                required
                disabled={!centroCustoId || loading}
              />
            </div>

            <div>
              <SearchableSelect
                label="Cardápio"
                value={cardapioId}
                onChange={(value) => setCardapioId(value)}
                options={cardapiosOptions}
                placeholder="Selecione o cardápio"
                loading={loadingCardapios}
                required
                disabled={!contratoId || loading}
              />
            </div>
          </div>

          {/* Aviso de médias faltantes */}
          {mediasFaltantes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-yellow-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">
                    Médias de Efetivos Faltantes
                  </h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    As seguintes combinações de cozinha/período não possuem média cadastrada:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    {mediasFaltantes.map((item, index) => (
                      <li key={index}>
                        {item.cozinha_industrial_nome} - {item.periodo_nome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Pré-visualização */}
          {showPreview && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pré-visualização
              </h3>
              {previewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-green-600 w-6 h-6 mr-2" />
                  <span className="text-gray-600">Calculando necessidade...</span>
                </div>
              ) : previewData && previewData.itens ? (
                <div className="space-y-4">
                  {/* Resumo */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-700">Total de Itens:</span>
                      <span className="ml-2 text-gray-900">{previewData.total_itens || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total de Cozinhas:</span>
                      <span className="ml-2 text-gray-900">{previewData.cozinhas || 0}</span>
                    </div>
                  </div>

                  {/* Tabela de pré-visualização */}
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Nome do Cardápio
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Mês Ref
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Ano
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Filial
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Centro de Custo
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Contrato
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Tipo de Cardápio
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Cozinha Industrial
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Período
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Data Consumo
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Prato
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Produto
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Percapta
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Média/Efetivos
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Quantidade
                          </th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Ordem
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          const mesesAbreviados = [
                            '', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
                          ];
                          
                          const startIndex = (previewPage - 1) * previewItemsPerPage;
                          const endIndex = startIndex + previewItemsPerPage;
                          const paginatedItems = previewData.itens.slice(startIndex, endIndex);
                          
                          return paginatedItems.map((item, index) => (
                            <tr key={startIndex + index} className="hover:bg-gray-50">
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.nome_docardapio}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {mesesAbreviados[item.mes_ref] || item.mes_ref}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.ano}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.filial_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.centro_custo_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.contrato_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.tipo_de_cardapio}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.cozinha_industrial_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.periodo_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.data_consumo ? new Date(item.data_consumo).toLocaleDateString('pt-BR') : '-'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.prato_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.produto_nome}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.percapta ? parseFloat(item.percapta).toFixed(6) : '0.000000'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.media_efetivos || 0}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.quantidade ? parseFloat(item.quantidade).toFixed(3) : '0.000'}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                                {item.ordem || 0}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação */}
                  {previewData.itens.length > previewItemsPerPage && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={previewPage}
                        totalPages={Math.ceil(previewData.itens.length / previewItemsPerPage)}
                        onPageChange={setPreviewPage}
                        itemsPerPage={previewItemsPerPage}
                        totalItems={previewData.itens.length}
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handlePrevisualizar}
              disabled={!canGenerate || loading || previewLoading}
            >
              <FaEye className="w-4 h-4 mr-2" />
              Pré-visualizar
            </Button>
            <Button
              onClick={handleGerar}
              disabled={!canGenerate || loading || mediasFaltantes.length > 0}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                  Gerando...
                </>
              ) : (
                'Gerar Necessidade'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NecessidadeGeracaoModal;
