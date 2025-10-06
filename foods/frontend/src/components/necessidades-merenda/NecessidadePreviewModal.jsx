import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaTimesCircle, FaTable, FaList, FaCalendarAlt, FaShoppingCart } from 'react-icons/fa';
import { Button, Modal } from '../ui';
import NecessidadesMerendaService from '../../services/necessidadesMerenda';
import toast from 'react-hot-toast';

const NecessidadePreviewModal = ({ isOpen, onClose, necessidade, onAprovar, onRejeitar }) => {
  const [activeTab, setActiveTab] = useState('resumo');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'resumo', label: 'Resumo', icon: FaCheck },
    { id: 'necessidades', label: 'Necessidades', icon: FaList },
    { id: 'calendario', label: 'Calendário', icon: FaCalendarAlt },
    { id: 'tabela_bruta', label: 'Tabela Bruta', icon: FaTable }
  ];

  const carregarDadosPreview = async () => {
    if (!necessidade || !necessidade.id) return;

    setLoading(true);
    try {
      const result = await NecessidadesMerendaService.buscarPorId(necessidade.id);
      if (result.success) {
        // Os dados já estão no objeto necessidade
        // Dados carregados para preview
      }
    } catch (error) {
      console.error('Erro ao carregar dados do preview:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && necessidade) {
      carregarDadosPreview();
    }
  }, [isOpen, necessidade]);

  const renderTabContent = () => {
    if (!necessidade) return null;

    switch (activeTab) {
      case 'resumo':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Resumo Geral</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unidade Escolar:</span>
                    <span className="font-medium">{necessidade.unidade_escola_nome || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Período:</span>
                    <span className="font-medium">
                      {necessidade.mes && necessidade.ano 
                        ? `${necessidade.mes}/${necessidade.ano}` 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de Necessidades:</span>
                    <span className="font-medium">{necessidade.total_necessidades || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="font-medium text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(necessidade.valor_total || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Estatísticas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produtos Únicos:</span>
                    <span className="font-medium">{necessidade.produtos_unicos || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receitas Processadas:</span>
                    <span className="font-medium">{necessidade.receitas_processadas || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dias Úteis:</span>
                    <span className="font-medium">{necessidade.dias_uteis || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efetivo Total:</span>
                    <span className="font-medium">{necessidade.efetivo_total || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {necessidade.validacoes && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Validações</h3>
                <div className="space-y-2">
                  {necessidade.validacoes.map((validacao, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="mr-2">
                        {validacao.status === 'success' ? '✅' : 
                         validacao.status === 'warning' ? '⚠️' : '❌'}
                      </span>
                      <span className={validacao.status === 'success' ? 'text-green-700' :
                                      validacao.status === 'warning' ? 'text-yellow-700' : 'text-red-700'}>
                        {validacao.mensagem}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'necessidades':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🛒 Necessidades Geradas</h3>
            {necessidade.necessidades && necessidade.necessidades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {necessidade.necessidades.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.produto_nome || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantidade_total || 0} {item.unidade_medida || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.valor_total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Nenhuma necessidade encontrada</p>
              </div>
            )}
          </div>
        );

      case 'calendario':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">📅 Calendário de Necessidades</h3>
            {necessidade.calendario && Object.keys(necessidade.calendario).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(necessidade.calendario).map(([data, itens]) => (
                  <div key={data} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {new Date(data).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </h4>
                    <div className="space-y-1">
                      {itens.map((item, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {item.produto_nome}: {item.quantidade_total} {item.unidade_medida}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Nenhum calendário disponível</p>
              </div>
            )}
          </div>
        );

      case 'tabela_bruta':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">📊 Dados Brutos Extraídos</h3>
            {necessidade.dados_processados ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(necessidade.dados_processados, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaTable className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Nenhum dado bruto disponível</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📋 Preview - ${necessidade?.unidade_escola_nome || 'Necessidades'}`}
      size="full"
    >
      <div className="h-full flex flex-col">
        {/* Navegação das abas */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo da aba ativa */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Carregando dados...</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            <FaTimes className="mr-2" />
            Fechar
          </Button>
          
          {necessidade && !necessidade.id && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onRejeitar && onRejeitar(necessidade, 'Rejeitado pelo usuário')}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <FaTimesCircle className="mr-2" />
                Rejeitar
              </Button>
              
              <Button
                onClick={() => onAprovar && onAprovar(necessidade)}
              >
                <FaCheck className="mr-2" />
                Aprovar e Salvar
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NecessidadePreviewModal;
