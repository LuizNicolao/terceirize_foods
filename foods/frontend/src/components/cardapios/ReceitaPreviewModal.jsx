import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaTimesCircle, FaEdit, FaTable, FaList, FaCalendarAlt } from 'react-icons/fa';
import { Button, Modal } from '../ui';
import ReceitasService from '../../services/receitas';
import toast from 'react-hot-toast';

const ReceitaPreviewModal = ({ isOpen, onClose, receita, onAprovar, onRejeitar }) => {
  const [validacoes, setValidacoes] = useState([]);
  const [ingredientesNaoEncontrados, setIngredientesNaoEncontrados] = useState([]);
  const [produtosNAE, setProdutosNAE] = useState([]);
  const [efetivosCalculados, setEfetivosCalculados] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('resumo');

  useEffect(() => {
    if (receita && isOpen) {
      carregarDadosPreview();
    }
  }, [receita, isOpen]);

  const carregarDadosPreview = async () => {
    setLoading(true);
    try {
      const listaReceitas = Array.isArray(receita?.receitas) && receita.receitas.length > 0
        ? receita.receitas
        : Array.isArray(receita?.refeicoes)
          ? receita.refeicoes
          : [];

      const receitasAgrupadas = receita?.reports?.normalizedCardapio?.receitas_por_data || {};
      const possuiCardapioAgrupado = Object.keys(receitasAgrupadas).length > 0;

      if (listaReceitas.length > 0 || possuiCardapioAgrupado) {
        const totalRefeicoes = receita?.resumo?.total_refeicoes ?? listaReceitas.length ?? 0;
        const totalDias =
          receita?.resumo?.total_dias ??
          (possuiCardapioAgrupado ? Object.keys(receitasAgrupadas).length : receita?.dias?.length) ??
          0;
        setValidacoes([
          { status: 'success', mensagem: `PDF processado com sucesso usando ${receita.metadados?.metodo || 'pdfplumber'}` },
          { status: 'info', mensagem: `${totalRefeicoes} refeições extraídas` },
          { status: 'info', mensagem: `${totalDias} dias identificados` }
        ]);

        // Calcular estatísticas reais
        setEfetivosCalculados({
          total_padrao: 0, // TODO: Calcular baseado nos dados reais
          total_nae: 0,
          total_geral: 0
        });

        setIngredientesNaoEncontrados([]);
        setProdutosNAE([]);
      } else {
        // Se não há dados do PDF, mostrar mensagem
        setValidacoes([
          { status: 'warning', mensagem: 'Nenhum dado de PDF encontrado' }
        ]);
        setIngredientesNaoEncontrados([]);
        setProdutosNAE([]);
        setEfetivosCalculados({
          total_padrao: 0,
          total_nae: 0,
          total_geral: 0
        });
      }

    } catch (error) {
      console.error('Erro ao carregar dados de preview:', error);
      toast.error('Erro ao carregar dados de preview');
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async () => {
    if (typeof onAprovar !== 'function') {
      onClose();
      return;
    }
    try {
      await onAprovar(receita);
      toast.success('Cardápio aprovado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao aprovar cardápio:', error);
      toast.error('Erro ao aprovar cardápio');
    }
  };

  const handleRejeitar = async () => {
    if (typeof onRejeitar !== 'function') {
      onClose();
      return;
    }
    try {
      await onRejeitar(receita);
      toast.success('Cardápio rejeitado');
      onClose();
    } catch (error) {
      console.error('Erro ao rejeitar cardápio:', error);
      toast.error('Erro ao rejeitar cardápio');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const tabs = [
    { id: 'resumo', label: 'Resumo', icon: FaCheck },
    { id: 'receitas', label: 'Receitas', icon: FaList },
    { id: 'receita', label: 'Cardápio por Dia', icon: FaCalendarAlt },
    { id: 'tabela', label: 'Tabela Bruta', icon: FaTable }
  ];

  const renderTabContent = () => {
    const receitasPorDataAgrupado =
      receita?.reports?.normalizedCardapio?.receitas_por_data ||
      receita?.receita_por_data ||
      {};

    switch (activeTab) {
      case 'resumo':
        return (
          <div className="space-y-6">
            {receita.upload && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informações do Upload</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <strong>ID:</strong> {receita.upload.uploadId}
                  </div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span className={receita.upload.duplicate ? 'text-yellow-600 font-medium' : 'text-green-600 font-medium'}>
                      {receita.upload.duplicate ? 'Duplicado' : 'Novo processamento'}
                    </span>
                  </div>
                  <div>
                    <strong>Receitas registradas:</strong> {receita.upload.totalReceitasRegistradas ?? receita.resumo?.total_refeicoes ?? '-'}
                  </div>
                  {receita.reports?.processed_json && (
                    <div className="col-span-full text-xs text-gray-600">
                      <strong>Arquivos gerados:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• JSON bruto: {receita.reports.raw_json}</li>
                        <li>• TXT bruto: {receita.reports.raw_txt}</li>
                        <li>• JSON processado: {receita.reports.processed_json}</li>
                        <li>• TXT processado: {receita.reports.processed_txt}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Validações */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Validações</h4>
              <div className="space-y-2">
                {validacoes.map((validacao, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-lg">{getStatusIcon(validacao.status)}</span>
                    <span className={`text-sm ${
                      validacao.status === 'error' ? 'text-red-600' :
                      validacao.status === 'warning' ? 'text-yellow-600' :
                      validacao.status === 'info' ? 'text-green-600' :
                      'text-green-600'
                    }`}>
                      {validacao.mensagem}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredientes não encontrados */}
            {ingredientesNaoEncontrados.length > 0 && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                <h4 className="text-lg font-medium text-red-900 mb-4">Ingredientes Não Encontrados</h4>
                <div className="space-y-3">
                  {ingredientesNaoEncontrados.map((ingrediente, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-2">{ingrediente.nome}</div>
                      <div className="text-sm text-gray-600 mb-2">Sugestões:</div>
                      <div className="space-y-1">
                        {ingrediente.sugestoes.map((sugestao, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span>{sugestao.nome}</span>
                            <span className="text-green-600 font-medium">
                              {(sugestao.score * 100).toFixed(0)}% match
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Produtos NAE */}
            {produtosNAE.length > 0 && (
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                <h4 className="text-lg font-medium text-yellow-900 mb-4">Produtos para NAE</h4>
                <div className="space-y-2">
                  {produtosNAE.map((produto, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{produto.intolerancia}</div>
                          <div className="text-sm text-gray-600">
                            {produto.produto_original} → {produto.produto_alternativo}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-yellow-600">
                          {produto.quantidade} unidades
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'receitas': {
        const listaReceitas = Array.isArray(receita?.receitas) && receita.receitas.length > 0
          ? receita.receitas
          : Array.isArray(receita?.refeicoes)
            ? receita.refeicoes
            : [];
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Cardápios Extraídos</h4>
            {listaReceitas.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {listaReceitas.map((refeicao, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-lg">
                          {refeicao.descricao || 'Sem descrição'}
                        </div>
                        {refeicao.codigo && (
                          <div className="text-sm text-green-600 font-mono bg-green-50 px-2 py-1 rounded inline-block mt-1">
                            {refeicao.codigo}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Data:</strong> {refeicao.data || 'Não identificada'}</div>
                      <div><strong>Turno:</strong> {refeicao.turno || 'Não identificado'}</div>
                      {refeicao.texto_original && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                          <strong>Texto original:</strong> {refeicao.texto_original}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Nenhuma receita extraída</p>
              </div>
            )}
          </div>
        );
      }

      case 'receita':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Cardápio por Dia</h4>
            {Object.keys(receitasPorDataAgrupado).length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(receitasPorDataAgrupado).map(([data, refeicoes], index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-3 text-lg">
                      📅 {data}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {refeicoes.map((refeicao, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                🕐 {refeicao.turno}
                              </div>
                              <div className="text-sm text-gray-600">
                                {refeicao.codigo && (
                                  <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs mr-2">
                                    {refeicao.codigo}
                                  </span>
                                )}
                                {refeicao.descricao}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Nenhum cardápio por dia encontrado</p>
              </div>
            )}
          </div>
        );

      case 'tabela':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              📊 Tabela Bruta Extraída pelo pdfplumber
            </h4>
            {receita.tabela_bruta ? (
              <>
                <div className="text-sm text-gray-600 mb-4 p-3 bg-green-50 rounded-lg">
                  <strong>Dimensões:</strong> {receita.metadados?.dimensoes_tabela || 'N/A'}<br/>
                  <strong>Método:</strong> {receita.metadados?.metodo || 'pdfplumber'}<br/>
                  <strong>Arquivo:</strong> {receita.metadados?.arquivo_original || 'N/A'}
                </div>
                <div className="max-h-96 overflow-auto border border-gray-300 rounded-lg">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        {receita.tabela_bruta[0]?.map((_, colIndex) => (
                          <th key={colIndex} className="border border-gray-300 p-2 font-semibold text-center">
                            Col {colIndex + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {receita.tabela_bruta.map((linha, linhaIndex) => (
                        <tr key={linhaIndex} className={linhaIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          {linha.map((celula, celulaIndex) => (
                            <td key={celulaIndex} className="border border-gray-200 p-2 align-top min-w-32">
                              <div className="whitespace-pre-wrap break-words max-h-20 overflow-y-auto">
                                {celula ? (
                                  <span className="text-gray-800">{celula}</span>
                                ) : (
                                  <span className="text-gray-400 italic text-xs">vazio</span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
                  💡 Esta é a estrutura exata como o pdfplumber leu o PDF
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaTable className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Nenhuma tabela bruta disponível</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!receita) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📋 Preview do Cardápio - ${receita.unidade_escola_nome || receita.metadados?.arquivo_original || 'PDF Processado'}`}
      size="full"
    >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumo estatístico */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {receita.resumo?.total_dias ?? receita.total_dias ?? receita.dias?.length ?? 0}
              </div>
              <div className="text-sm text-green-800">Dias</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {receita.resumo?.total_refeicoes ?? receita.total_refeicoes ?? receita.receitas?.length ?? 0}
              </div>
              <div className="text-sm text-green-800">Refeições</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {efetivosCalculados.total_geral || 0}
              </div>
              <div className="text-sm text-purple-800">Efetivos</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {produtosNAE.length}
              </div>
              <div className="text-sm text-orange-800">Produtos NAE</div>
            </div>
          </div>

          {/* Sistema de Abas */}
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Navegação das Abas */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="danger"
              onClick={handleRejeitar}
              disabled={loading}
            >
              <FaTimesCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
            <Button
              variant="warning"
              onClick={() => {/* Implementar correções */}}
              disabled={loading}
            >
              <FaEdit className="h-4 w-4 mr-2" />
              Corrigir
            </Button>
            <Button
              variant="success"
              onClick={handleAprovar}
              disabled={loading}
            >
              <FaCheck className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReceitaPreviewModal;