import React, { useState, useEffect } from 'react';
import { FaSchool, FaChartLine } from 'react-icons/fa';
import { EmptyState } from '../ui';
import FoodsApiService from '../../services/FoodsApiService';

const MediasCalculadasTab = ({ medias, loading }) => {
  const [produtosMap, setProdutosMap] = useState({}); // { produto_id: nome }

  // Buscar nomes dos produtos comerciais
  useEffect(() => {
    const buscarProdutos = async () => {
      if (!medias || medias.length === 0) return;

      const produtosIds = new Set();
      medias.forEach(media => {
        if (media.tipos_cardapio && Array.isArray(media.tipos_cardapio)) {
          media.tipos_cardapio.forEach(tipo => {
            if (tipo.produto_comercial_id) {
              produtosIds.add(tipo.produto_comercial_id);
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
  }, [medias]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando médias...</span>
      </div>
    );
  }
  
  if (!medias || medias.length === 0) {
    return (
      <EmptyState
        title="Nenhuma média calculada"
        description="As médias são calculadas automaticamente quando você registra quantidades servidas"
        icon="chart"
      />
    );
  }
  
  // Extrair todos os períodos únicos de todas as unidades para construir o cabeçalho dinâmico
  const todosPeriodos = new Map();
  medias.forEach(media => {
    if (media.tipos_cardapio && Array.isArray(media.tipos_cardapio)) {
      media.tipos_cardapio.forEach(tipo => {
        if (tipo.periodos && Array.isArray(tipo.periodos)) {
          tipo.periodos.forEach(periodo => {
            if (!todosPeriodos.has(periodo.periodo_atendimento_id)) {
              todosPeriodos.set(periodo.periodo_atendimento_id, {
                id: periodo.periodo_atendimento_id,
                nome: periodo.periodo_nome || periodo.periodo_codigo || `Período ${periodo.periodo_atendimento_id}`,
                codigo: periodo.periodo_codigo
              });
            }
          });
        }
      });
    }
  });
  const periodosArray = Array.from(todosPeriodos.values());
  
  // Cores para os períodos
  const cores = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-rose-100 text-rose-800',
    'bg-yellow-100 text-yellow-800',
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800'
  ];

  // Preparar linhas para renderização (uma linha por tipo de cardápio + produto)
  // Usar um Map para evitar duplicatas e garantir chaves únicas
  const linhasMap = new Map();
  const linhasBaseMap = new Map(); // Para rastrear linhas base e mesclar períodos
  let linhaCounter = 0;
  
  medias.forEach(media => {
    if (media.tipos_cardapio && Array.isArray(media.tipos_cardapio)) {
      media.tipos_cardapio.forEach(tipo => {
        const produtoNome = tipo.produto_comercial_id 
          ? produtosMap[tipo.produto_comercial_id] || `Produto ${tipo.produto_comercial_id}`
          : null;
        
        const linhaLabel = tipo.tipo_cardapio_nome
          ? produtoNome
            ? `${tipo.tipo_cardapio_nome} - ${produtoNome}`
            : tipo.tipo_cardapio_nome
          : produtoNome || 'Sem tipo de cardápio';
        
        // Criar chave base para agrupamento
        const linhaKeyBase = `${media.unidade_id}-${tipo.tipo_cardapio_id || 'sem-tipo'}-${tipo.produto_comercial_id || 'sem-produto'}`;
        
        // Remover duplicatas de períodos antes de processar
        const periodosUnicos = new Map();
        (tipo.periodos || []).forEach(p => {
          if (p.periodo_atendimento_id) {
            periodosUnicos.set(p.periodo_atendimento_id, p);
          }
        });
        const periodosArray = Array.from(periodosUnicos.values());
        
        if (!linhasBaseMap.has(linhaKeyBase)) {
          // Criar chave única com contador para garantir unicidade absoluta
          const linhaKey = `${linhaKeyBase}-${linhaCounter++}`;
          const linhaObj = {
            unidade_id: media.unidade_id,
            unidade_nome: media.unidade_nome,
            tipo_cardapio_id: tipo.tipo_cardapio_id,
            tipo_cardapio_nome: tipo.tipo_cardapio_nome,
            produto_comercial_id: tipo.produto_comercial_id,
            produto_nome: produtoNome,
            linhaLabel,
            periodos: periodosArray,
            linhaKey // Chave única com contador
          };
          linhasBaseMap.set(linhaKeyBase, linhaKey);
          linhasMap.set(linhaKey, linhaObj);
        } else {
          // Se já existe, mesclar os períodos na linha existente
          const linhaKeyExistente = linhasBaseMap.get(linhaKeyBase);
          const linhaExistente = linhasMap.get(linhaKeyExistente);
          const periodosExistentes = new Map();
          linhaExistente.periodos.forEach(p => {
            if (p.periodo_atendimento_id) {
              periodosExistentes.set(p.periodo_atendimento_id, p);
            }
          });
          periodosArray.forEach(p => {
            if (p.periodo_atendimento_id && !periodosExistentes.has(p.periodo_atendimento_id)) {
              periodosExistentes.set(p.periodo_atendimento_id, p);
            }
          });
          linhaExistente.periodos = Array.from(periodosExistentes.values());
        }
      });
    }
  });
  
  const linhas = Array.from(linhasMap.values());
  
  return (
    <>
      {/* Desktop */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade / Tipo de Cardápio</th>
                {periodosArray.map(periodo => (
                  <th key={periodo.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {periodo.nome}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Dias</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Última Atualização</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {linhas.map((linha) => {
                // Criar um mapa de períodos para acesso rápido
                const periodosMap = new Map();
                linha.periodos.forEach(periodo => {
                  periodosMap.set(periodo.periodo_atendimento_id, periodo);
                });
                
                return (
                  <tr key={linha.linhaKey} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <FaSchool className="text-green-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {linha.unidade_nome || `Unidade ID ${linha.unidade_id}`}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 ml-6 mt-1">
                          {linha.linhaLabel}
                        </span>
                      </div>
                    </td>
                    {periodosArray.map((periodo, periodoIndex) => {
                      const periodoData = periodosMap.get(periodo.id);
                      const valor = periodoData ? parseFloat(periodoData.media || 0) : 0;
                      const corIndex = periodo.id % cores.length;
                      return (
                        <td key={`${linha.linhaKey}-periodo-${periodo.id}-${periodoIndex}`} className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 ${cores[corIndex]} rounded-full text-sm font-medium`}>
                            {valor.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        <FaChartLine className="mr-1" />
                        {linha.periodos.length > 0 
                          ? linha.periodos[0].quantidade_lancamentos || 0 
                          : 0} dias
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                      {linha.periodos.length > 0 && linha.periodos[0].data_calculo
                        ? new Date(linha.periodos[0].data_calculo).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile */}
      <div className="xl:hidden space-y-3">
        {linhas.map((linha) => (
          <div key={linha.linhaKey} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center mb-3">
              <FaSchool className="text-green-600 mr-2" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{linha.unidade_nome || `Unidade ID ${linha.unidade_id}`}</h3>
                <p className="text-xs text-gray-500 mt-1">{linha.linhaLabel}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              {linha.periodos.map((periodo, periodoIndex) => (
                <div key={`${linha.linhaKey}-periodo-${periodo.periodo_atendimento_id}-${periodoIndex}`} className="flex justify-between items-center">
                  <span className="text-gray-500">{periodo.periodo_nome || periodo.periodo_codigo || `Período ${periodo.periodo_atendimento_id}`}:</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {parseFloat(periodo.media || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
              <span>
                <FaChartLine className="inline mr-1" />
                {linha.periodos.length > 0 
                  ? linha.periodos[0].quantidade_lancamentos || 0 
                  : 0} dias registrados
              </span>
              <span>
                {linha.periodos.length > 0 && linha.periodos[0].data_calculo
                  ? new Date(linha.periodos[0].data_calculo).toLocaleDateString('pt-BR')
                  : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MediasCalculadasTab;
