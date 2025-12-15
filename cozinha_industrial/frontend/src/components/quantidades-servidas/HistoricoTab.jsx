import React, { useMemo, useState, useEffect } from 'react';
import { FaCalendarAlt, FaSchool, FaUser, FaClock, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { EmptyState, Button } from '../ui';
import { formatarDataParaExibicao } from '../../utils/recebimentos/recebimentosUtils';
import FoodsApiService from '../../services/FoodsApiService';

const HistoricoTab = ({ historico, loading, onEdit }) => {
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [produtosMap, setProdutosMap] = useState({}); // { produto_id: nome }

  // Buscar nomes dos produtos comerciais
  useEffect(() => {
    const buscarProdutos = async () => {
      if (!historico || historico.length === 0) return;

      const produtosIds = new Set();
      historico.forEach(item => {
        if (item.produto_comercial_id) {
          produtosIds.add(item.produto_comercial_id);
        }
        // Também verificar nos valores
        if (item.valores) {
          Object.values(item.valores).forEach(valorObj => {
            const valor = typeof valorObj === 'object' && valorObj !== null ? valorObj : {};
            if (valor.produto_comercial_id) {
              produtosIds.add(valor.produto_comercial_id);
            }
          });
        }
      });

      if (produtosIds.size === 0) {
        setProdutosMap({});
        return;
      }

      const produtosMapTemp = {};
      for (const produtoId of produtosIds) {
        try {
          const response = await FoodsApiService.getProdutoComercialById(produtoId);
          if (response.success && response.data) {
            produtosMapTemp[produtoId] = response.data.nome_comercial || response.data.nome || `Produto ${produtoId}`;
          }
        } catch (error) {
          console.error(`Erro ao buscar produto ${produtoId}:`, error);
          produtosMapTemp[produtoId] = `Produto ${produtoId}`;
        }
      }
      setProdutosMap(produtosMapTemp);
    };

    buscarProdutos();
  }, [historico]);

  const formatarDataHora = (valor) => {
    if (!valor) return '';

    const date = new Date(valor);
    if (Number.isNaN(date.getTime())) return '';

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano}, ${hora}:${min}`;
  };

  const normalizarDataLimite = (valor, ehFinal = false) => {
    if (!valor) return null;
    const sufixo = ehFinal ? 'T23:59:59' : 'T00:00:00';
    const data = new Date(`${valor}${sufixo}`);
    return Number.isNaN(data.getTime()) ? null : data;
  };

  const normalizarDataItem = (valor) => {
    if (!valor) return null;
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
  };

  const historicoFiltrado = useMemo(() => {
    if (!historico || historico.length === 0) {
      return [];
    }

    const inicio = normalizarDataLimite(dataInicial, false);
    const fim = normalizarDataLimite(dataFinal, true);

    if (!inicio && !fim) {
      return historico;
    }

    return historico.filter((item) => {
      const dataRegistro = normalizarDataItem(item.data);
      const dataCadastro = normalizarDataItem(item.data_cadastro);
      const dataAtualizacao = normalizarDataItem(item.data_atualizacao);
      const datas = [dataRegistro, dataCadastro, dataAtualizacao].filter(Boolean);

      if (datas.length === 0) {
        return false;
      }

      return datas.some((data) => {
        if (inicio && data < inicio) {
          return false;
        }
        if (fim && data > fim) {
          return false;
        }
        return true;
      });
    });
  }, [historico, dataInicial, dataFinal]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando histórico...</span>
      </div>
    );
  }

  if (!historico || historico.length === 0) {
    return (
      <EmptyState
        title="Nenhum histórico encontrado"
        description="O histórico de alterações aparecerá aqui quando houver registros"
        icon="history"
      />
    );
  }

  const renderFiltros = () => (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data inicial</label>
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            max={dataFinal || undefined}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data final</label>
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            min={dataInicial || undefined}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDataInicial('');
              setDataFinal('');
            }}
            disabled={!dataInicial && !dataFinal}
            className="w-full md:w-auto"
          >
            Limpar filtro
          </Button>
        </div>
      </div>
    </div>
  );

  if (historicoFiltrado.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {renderFiltros()}
        <EmptyState
          title="Nenhum resultado encontrado"
          description="Ajuste o intervalo de datas para visualizar registros do histórico"
          icon="history"
        />
      </div>
    );
  }

  // Determinar ação baseado nas datas (se tem data_cadastro e data_atualizacao)
  const getAcaoInfo = (item) => {
    const temCadastro = item.data_cadastro;
    const temAtualizacao = item.data_atualizacao;
    
    // Se tem atualização e é diferente do cadastro, foi editado
    if (temAtualizacao && temCadastro && temAtualizacao !== temCadastro) {
      return {
        icon: <FaEdit className="text-blue-600" />,
        text: 'Registro atualizado',
        color: 'bg-blue-100 border-blue-200',
        dataAcao: item.data_atualizacao
      };
    }
    
    // Caso contrário, foi criado
    return {
      icon: <FaPlus className="text-green-600" />,
      text: 'Registro criado',
      color: 'bg-green-100 border-green-200',
      dataAcao: item.data_cadastro || item.data
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-h-[600px] overflow-y-auto">
      {renderFiltros()}

      <div className="relative">
        {/* Linha vertical da timeline */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Itens do histórico */}
        <div className="space-y-6">
          {historicoFiltrado.map((item, index) => {
            const acaoInfo = getAcaoInfo(item);
            return (
              <div key={`${item.unidade_id}-${item.data}-${index}`} className="relative flex gap-4">
                {/* Ícone da ação */}
                <div className={`
                  relative z-10 flex items-center justify-center w-16 h-16
                  rounded-full border-4 border-white shadow-sm
                  ${acaoInfo.color}
                `}>
                  {acaoInfo.icon}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 pb-6">
                  <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 gap-3">
                      <h4 className="font-semibold text-gray-900">
                        {acaoInfo.text}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          <FaClock className="mr-1" />
                          {formatarDataHora(acaoInfo.dataAcao)}
                        </span>
                        {typeof onEdit === 'function' && (
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() => onEdit(item)}
                          >
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>

                  {/* Detalhes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FaSchool className="mr-2 text-green-600" />
                      <span className="font-medium">Unidade:</span>
                      <span className="ml-2">{item.unidade_nome || `ID ${item.unidade_id || 'N/A'}`}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-blue-600" />
                      <span className="font-medium">Data Registro:</span>
                      <span className="ml-2">
                        {formatarDataParaExibicao(item.data)}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-2 text-purple-600" />
                      <span className="font-medium">Responsável:</span>
                      <span className="ml-2">{item.usuario_nome || `ID ${item.nutricionista_id || 'N/A'}`}</span>
                    </div>

                    {/* Tipo de Cardápio / Produto Comercial (quando disponível) */}
                    {(item.tipo_cardapio_nome || item.produto_comercial_id) && (
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">Tipo de Cardápio:</span>
                        <span className="ml-2">
                          {item.produto_comercial_id && produtosMap[item.produto_comercial_id]
                            ? produtosMap[item.produto_comercial_id]
                            : item.tipo_cardapio_nome || `Produto ID ${item.produto_comercial_id}`}
                        </span>
                      </div>
                    )}

                    {/* Valores das Quantidades Servidas */}
                    {item.valores && Object.keys(item.valores).length > 0 ? (
                      <div className="md:col-span-2">
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(item.valores).map(([periodoId, periodoData]) => {
                            // Suportar tanto objeto { valor, periodo_nome, produto_comercial_nome } quanto valor direto (compatibilidade)
                            const valorObj = typeof periodoData === 'object' && periodoData !== null ? periodoData : { valor: periodoData };
                            const numero = Number(valorObj.valor);
                            
                            // Exibir valores mesmo se forem zero (mas não se for NaN)
                            if (Number.isNaN(numero)) {
                              return null;
                            }

                            const periodoNome = valorObj.periodo_nome || valorObj.periodo_codigo || `Período ${periodoId}`;
                            const produtoNome = valorObj.produto_comercial_nome;
                            const label = produtoNome ? `${produtoNome} - ${periodoNome}` : periodoNome;

                            // Cores alternadas para períodos
                            const cores = [
                              'bg-blue-50 text-blue-700',
                              'bg-green-50 text-green-700',
                              'bg-purple-50 text-purple-700',
                              'bg-orange-50 text-orange-700',
                              'bg-rose-50 text-rose-700',
                              'bg-yellow-50 text-yellow-700',
                              'bg-indigo-50 text-indigo-700',
                              'bg-pink-50 text-pink-700'
                            ];
                            const corIndex = parseInt(periodoId) % cores.length;

                            return (
                              <span key={periodoId} className={`px-2 py-1 rounded text-xs ${cores[corIndex]}`}>
                                {label}: {numero}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="md:col-span-2 text-sm text-gray-500 italic">
                        Nenhuma quantidade registrada
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoricoTab;

