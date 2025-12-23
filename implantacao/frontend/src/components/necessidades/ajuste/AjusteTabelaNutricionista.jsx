import React, { useState, useMemo, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { Input, Pagination } from '../../ui';

const AjusteTabelaNutricionista = ({
  necessidades,
  ajustesLocais,
  onAjusteChange,
  onExcluirNecessidade,
  canEdit
}) => {
  // Paginação
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calcular dados paginados
  const necessidadesPaginadas = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return necessidades.slice(start, end);
  }, [necessidades, page, itemsPerPage]);

  // Resetar para página 1 quando necessidades mudarem
  useEffect(() => {
    setPage(1);
  }, [necessidades.length]);
  // Função para formatar números
  // CORREÇÃO: Valores no banco estão armazenados como inteiros multiplicados por 1000
  // Exemplo: 7200 no banco representa 7,2 (deve dividir por 1000)
  const formatarQuantidade = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      return '0';
    }
    
    // Se o valor vier como string "7.200", pode ser que o banco retornou como decimal formatado
    // Precisamos verificar se é uma string que representa um número inteiro grande
    let num;
    if (typeof valor === 'string') {
      // Se a string contém ponto, pode ser formato decimal ou separador de milhar
      // Exemplo: "7.200" pode ser 7.2 ou 7200
      // Se não tem vírgula e tem ponto, tentar interpretar como número inteiro
      if (valor.includes('.') && !valor.includes(',')) {
        // Remover pontos e tentar parseFloat
        const semPontos = valor.replace(/\./g, '');
        const numSemPontos = parseFloat(semPontos);
        // Se ao remover os pontos o número fica >= 100, provavelmente é inteiro multiplicado por 1000
        if (!isNaN(numSemPontos) && numSemPontos >= 100 && numSemPontos % 1 === 0) {
          num = numSemPontos / 1000;
        } else {
          num = parseFloat(valor);
        }
      } else {
        num = parseFloat(valor.replace(',', '.'));
      }
    } else {
      num = valor;
    }
    
    if (isNaN(num)) {
      return '0';
    }
    
    // Verificar se o valor precisa ser convertido (valores inteiros >= 100 sem parte decimal)
    // Isso indica que está armazenado como inteiro multiplicado por 1000
    const parteInteiraOriginal = Math.floor(Math.abs(num));
    const parteDecimalOriginal = Math.abs(num) - parteInteiraOriginal;
    
    // Se for um inteiro grande (>= 100) sem parte decimal, dividir por 1000
    if (parteDecimalOriginal === 0 && parteInteiraOriginal >= 100) {
      num = num / 1000;
    }
    
    // Formatar o número completo usando toLocaleString para garantir formatação correta
    const sinal = num < 0 ? '-' : '';
    const numAbsoluto = Math.abs(num);
    
    // Usar toLocaleString para formatar corretamente
    const formatado = numAbsoluto.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    });
    
    return sinal + formatado;
  };

  // Função para calcular quantidade anterior
  // Usa a coluna ajuste_anterior do banco de dados
  const getQuantidadeAnterior = (necessidade) => {
    // Se existe ajuste_anterior, usar ele
    if (necessidade.ajuste_anterior !== null && necessidade.ajuste_anterior !== undefined) {
      return necessidade.ajuste_anterior ?? 0;
    }
    // Fallback para lógica antiga se ajuste_anterior não existir
    if (necessidade.status === 'CONF NUTRI') {
      return necessidade.ajuste_coordenacao ?? necessidade.ajuste ?? 0;
    }
    if (necessidade.status === 'NEC NUTRI') {
      // Se já tem ajuste_nutricionista, o anterior era o ajuste original
      return necessidade.ajuste ?? 0;
    }
    // Se status é 'NEC', o valor anterior é o próprio ajuste (quantidade gerada)
    if (necessidade.status === 'NEC') {
      return necessidade.ajuste ?? 0;
    }
    return 0;
  };

  // Função para calcular quantidade atual baseado no status
  const getQuantidadeAtual = (necessidade) => {
    if (necessidade.status === 'CONF NUTRI') {
      return necessidade.ajuste_conf_nutri ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0;
    }
    if (necessidade.status === 'NEC NUTRI') {
      return necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0;
    }
    // Se status é 'NEC', verificar se existe ajuste_nutricionista (mesma lógica da coluna "Quantidade (gerada)")
    return necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0;
  };

  // Função para calcular a diferença
  const getDiferenca = (necessidade) => {
    // Verificar se há um ajuste local digitado
    const chave = `${necessidade.escola_id}_${necessidade.produto_id}`;
    const ajusteLocal = ajustesLocais[chave];
    
    let atual;
    
    // Se há um ajuste local digitado, usar ele
    if (ajusteLocal !== undefined && ajusteLocal !== '') {
      // Normalizar vírgula para ponto e converter para número
      const ajusteNormalizado = String(ajusteLocal).replace(',', '.');
      atual = parseFloat(ajusteNormalizado) || 0;
    } else {
      // Se não há ajuste local, usar o valor do banco
      atual = getQuantidadeAtual(necessidade);
    }
    
    const anterior = getQuantidadeAnterior(necessidade);
    return atual - anterior;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidade
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade (gerada)
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade anterior
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ajuste
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Diferença
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {necessidadesPaginadas.map((necessidade) => (
            <tr key={necessidade.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                {necessidade.produto_codigo || necessidade.produto_id || 'N/A'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                {necessidade.produto}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                {necessidade.produto_unidade}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {formatarQuantidade(
                  necessidade.status === 'CONF NUTRI'
                  ? (necessidade.ajuste_conf_nutri ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0)
                  : (necessidade.status === 'NEC NUTRI'
                      ? (necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0)
                        : (necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0))
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {formatarQuantidade(getQuantidadeAnterior(necessidade))}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  value={ajustesLocais[`${necessidade.escola_id}_${necessidade.produto_id}`] || ''}
                  onChange={(e) => {
                    const valor = e.target.value;
                    // Permitir apenas números, vírgula e ponto
                    // Permite: vazio, números, "0,", "0.", "0,5", "0.5", etc.
                    if (valor === '' || /^[0-9]*[.,]?[0-9]*$/.test(valor)) {
                      onAjusteChange({
                        escola_id: necessidade.escola_id,
                        produto_id: necessidade.produto_id,
                        valor: valor
                      });
                    }
                  }}
                  className="w-20 text-center text-xs py-1"
                  disabled={!canEdit}
                  placeholder="0.000"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                {getDiferenca(necessidade) !== 0 && (
                  <span className={getDiferenca(necessidade) > 0 ? 'text-green-600' : 'text-red-600'}>
                    {getDiferenca(necessidade) > 0 ? '+' : ''}{formatarQuantidade(getDiferenca(necessidade))}
                  </span>
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                <button
                  onClick={() => onExcluirNecessidade(necessidade)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Excluir produto"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Paginação */}
      {necessidades.length > itemsPerPage && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(necessidades.length / itemsPerPage)}
            totalItems={necessidades.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AjusteTabelaNutricionista;
