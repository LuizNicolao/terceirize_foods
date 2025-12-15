import React from 'react';
import { Input } from '../../ui';
import { FaSchool } from 'react-icons/fa';

const TabelaQuantidades = ({
  formData,
  unidadesEscolares,
  periodosVinculados,
  tiposCardapio,
  produtosPorTipoCardapio,
  loadingPeriodos,
  loadingTiposCardapio,
  isViewMode,
  onQuantidadeChange
}) => {
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

  const getUnidadeNome = () => {
    if (!formData.unidade_id) return 'Selecione uma unidade';
    const unidade = unidadesEscolares.find(u => u.id === parseInt(formData.unidade_id));
    return unidade?.nome_escola || unidade?.nome || `Unidade ID ${formData.unidade_id}`;
  };

  const renderLinhaDesktop = (tipoCardapio, produto = null) => {
    const unidadeNome = getUnidadeNome();
    const linhaLabel = produto 
      ? `${unidadeNome} - ${produto.nome}`
      : `${unidadeNome} - ${tipoCardapio?.nome || `${tipoCardapio?.filial_nome || 'N/A'} - ${tipoCardapio?.contrato_nome || 'N/A'}`}`;
    
    const chaveBase = produto 
      ? `${tipoCardapio.id}-${produto.id}`
      : tipoCardapio 
        ? `${tipoCardapio.id}-sem-produto`
        : 'sem-tipo';

    return (
      <tr key={produto ? `${tipoCardapio.id}-${produto.id}` : tipoCardapio ? `${tipoCardapio.id}-sem-produto` : 'sem-tipo'} className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center">
            <FaSchool className="text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">
              {linhaLabel}
            </span>
          </div>
        </td>
        {periodosVinculados.map(periodo => {
          const chave = `${chaveBase}-${periodo.id}`;
          const valor = formData.quantidades[chave] || '';
          const corIndex = periodo.id % cores.length;
          
          return (
            <td key={periodo.id} className="px-6 py-4 text-center">
              {isViewMode ? (
                <span className={`inline-flex items-center px-3 py-1 ${cores[corIndex]} rounded-full text-sm font-medium`}>
                  {valor || '0'}
                </span>
              ) : (
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={valor}
                  onChange={(e) => {
                    const tipoCardapioId = tipoCardapio?.id || null;
                    const produtoId = produto?.id || null;
                    onQuantidadeChange(tipoCardapioId, produtoId, periodo.id, e.target.value);
                  }}
                  className="w-24 text-center mx-auto"
                  placeholder="0"
                />
              )}
            </td>
          );
        })}
      </tr>
    );
  };

  const renderCardMobile = (tipoCardapio, produto = null) => {
    const unidadeNome = getUnidadeNome();
    const linhaLabel = produto 
      ? `${unidadeNome} - ${produto.nome}`
      : `${unidadeNome} - ${tipoCardapio?.nome || `${tipoCardapio?.filial_nome || 'N/A'} - ${tipoCardapio?.contrato_nome || 'N/A'}`}`;
    
    const chaveBase = produto 
      ? `${tipoCardapio.id}-${produto.id}`
      : tipoCardapio 
        ? `${tipoCardapio.id}-sem-produto`
        : 'sem-tipo';

    return (
      <div key={produto ? `${tipoCardapio.id}-${produto.id}` : tipoCardapio ? `${tipoCardapio.id}-sem-produto` : 'sem-tipo'} className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="flex items-center mb-3">
          <FaSchool className="text-green-600 mr-2" />
          <h3 className="font-semibold text-gray-900 text-sm">
            {linhaLabel}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {periodosVinculados.map(periodo => {
            const chave = `${chaveBase}-${periodo.id}`;
            const valor = formData.quantidades[chave] || '';
            const corIndex = periodo.id % cores.length;
            
            return (
              <div key={periodo.id} className="flex justify-between items-center">
                <span className="text-gray-500">
                  {periodo.nome || periodo.codigo || `Período ${periodo.id}`}:
                </span>
                {isViewMode ? (
                  <span className={`px-2 py-0.5 ${cores[corIndex]} rounded-full font-medium`}>
                    {valor || '0'}
                  </span>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={valor}
                    onChange={(e) => {
                      const tipoCardapioId = tipoCardapio?.id || null;
                      const produtoId = produto?.id || null;
                      onQuantidadeChange(tipoCardapioId, produtoId, periodo.id, e.target.value);
                    }}
                    className="w-20 text-center text-xs"
                    placeholder="0"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loadingPeriodos || loadingTiposCardapio) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando dados...</span>
      </div>
    );
  }

  if (periodosVinculados.length === 0 && tiposCardapio.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        {formData.unidade_id 
          ? 'Nenhum período de atendimento ou tipo de cardápio vinculado a esta unidade. Vá em "Períodos de Atendimento" e "Tipos de Cardápio" para vincular.'
          : 'Selecione uma unidade para ver os períodos de atendimento e tipos de cardápio disponíveis.'}
      </div>
    );
  }

  // Preparar linhas para renderização
  const linhas = [];
  
  if (tiposCardapio.length > 0) {
    tiposCardapio.forEach(tipoCardapio => {
      const produtos = produtosPorTipoCardapio[tipoCardapio.id] || [];
      
      if (produtos.length === 0) {
        // Linha sem produto (apenas tipo de cardápio)
        linhas.push({ tipoCardapio, produto: null });
      } else {
        // Uma linha para cada produto
        produtos.forEach(produto => {
          linhas.push({ tipoCardapio, produto });
        });
      }
    });
  } else {
    // Linha sem tipo de cardápio (compatibilidade com registros antigos)
    linhas.push({ tipoCardapio: null, produto: null });
  }

  return (
    <>
      {/* Desktop - Tabela */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
              {periodosVinculados.map(periodo => (
                <th key={periodo.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  {periodo.nome || periodo.codigo || `Período ${periodo.id}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {linhas.map(({ tipoCardapio, produto }) => renderLinhaDesktop(tipoCardapio, produto))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile - Cards */}
      <div className="xl:hidden p-4 space-y-3">
        {linhas.map(({ tipoCardapio, produto }) => renderCardMobile(tipoCardapio, produto))}
      </div>
    </>
  );
};

export default TabelaQuantidades;

