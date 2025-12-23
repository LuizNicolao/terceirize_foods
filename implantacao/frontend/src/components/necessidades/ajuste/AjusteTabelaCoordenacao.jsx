import React, { useState, useMemo, useEffect } from 'react';
import { FaTrash, FaChevronDown, FaChevronUp, FaList, FaLayerGroup } from 'react-icons/fa';
import { Input, Pagination } from '../../ui';

const AjusteTabelaCoordenacao = ({
  necessidades,
  ajustesLocais,
  onAjusteChange,
  onExcluirNecessidade,
  canEdit
}) => {
  // Estado para controlar modo de visualização
  const [modoVisualizacao, setModoVisualizacao] = useState('individual'); // 'individual' ou 'consolidado'
  const [expandedRows, setExpandedRows] = useState({});
  
  // Funções auxiliares - devem ser definidas antes do useMemo que as utiliza
  // Função para formatar números
  // CORREÇÃO: Valores no banco estão armazenados como inteiros multiplicados por 1000
  // Exemplo: 7200 no banco representa 7,2 (deve dividir por 1000)
  // IMPORTANTE: Se vier como string "160.000", é um DECIMAL, não um inteiro 160000
  const formatarQuantidade = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      return '0';
    }
    
    // Guardar valor original ANTES de qualquer processamento
    const valorOriginalString = String(valor);
    
    // Detectar se o valor original tinha 3 casas decimais
    let tinhaTresCasasDecimais = false;
    if (typeof valor === 'string') {
      // Verificar se tem 3 dígitos após o ponto
      const match = valorOriginalString.match(/\.(\d+)$/);
      if (match && match[1] && match[1].length === 3) {
        tinhaTresCasasDecimais = true;
      }
      // Também verificar formato "0.250" sem zeros à esquerda
      if (valorOriginalString.match(/^0\.\d{3}$/)) {
        tinhaTresCasasDecimais = true;
      }
    } else if (typeof valor === 'number') {
      // Para números, verificar se tem exatamente 3 casas decimais
      // Usar toFixed para preservar zeros à direita
      const valorComZeros = valor.toFixed(3);
      const parteDecimal = parseFloat(valorComZeros) - Math.floor(Math.abs(parseFloat(valorComZeros)));
      const casasDecimais = parteDecimal.toString().split('.')[1];
      if (casasDecimais && casasDecimais.length === 3) {
        // Verificar se o último dígito não é zero (ou se é, mas o valor original tinha 3 casas)
        const ultimoDigito = casasDecimais[2];
        if (ultimoDigito !== '0' || valorComZeros.endsWith('0')) {
          tinhaTresCasasDecimais = true;
        }
      }
      // Caso especial: valores pequenos (< 1) que podem ter 3 casas decimais
      if (Math.abs(valor) < 1 && valor !== 0) {
        const valorStr = valor.toString();
        const match = valorStr.match(/\.(\d+)$/);
        if (match && match[1] && match[1].length >= 3) {
          tinhaTresCasasDecimais = true;
        }
      }
    }
    
    // CORREÇÃO CRÍTICA: Se o valor original veio como STRING com ponto decimal (ex: "160.000"),
    // isso significa que é um DECIMAL do banco, NÃO um inteiro multiplicado por 1000
    // Portanto, NÃO devemos dividir por 1000 neste caso
    let num;
    let veioComoDecimalString = false;
    
    if (typeof valor === 'string') {
      // Se a string contém ponto seguido de dígitos, é um decimal formatado
      // Exemplo: "160.000" é um decimal, não um inteiro 160000
      if (valor.includes('.') && !valor.includes(',')) {
        // Verificar se tem formato decimal (ex: "160.000", "7.200", "0.250")
        const temFormatoDecimal = /^\d+\.\d+$/.test(valor);
        
        if (temFormatoDecimal) {
          // É um decimal formatado do banco (ex: "160.000" = 160.0)
          veioComoDecimalString = true;
          num = parseFloat(valor);
        } else {
          // Pode ser separador de milhar (ex: "7.200" como 7200)
          const semPontos = valor.replace(/\./g, '');
          const numSemPontos = parseFloat(semPontos);
          // Se ao remover os pontos o número fica >= 100, provavelmente é inteiro multiplicado por 1000
          if (!isNaN(numSemPontos) && numSemPontos >= 100 && numSemPontos % 1 === 0) {
            num = numSemPontos / 1000;
          } else {
            num = parseFloat(valor);
          }
        }
      } else {
        num = parseFloat(valor.replace(',', '.'));
      }
    } else {
      // Valor veio como NUMBER
      num = valor;
    }
    
    if (isNaN(num)) {
      return '0';
    }
    
    // Verificar se o valor precisa ser convertido (valores inteiros >= 100 sem parte decimal)
    // IMPORTANTE: Só dividir por 1000 se:
    // 1. NÃO veio como string decimal (ex: "160.000")
    // 2. É um número inteiro >= 100
    // 3. Não tem parte decimal
    const parteInteiraOriginal = Math.floor(Math.abs(num));
    const parteDecimalOriginal = Math.abs(num) - parteInteiraOriginal;
    const ehInteiro = parteDecimalOriginal === 0;
    const ehGrande = parteInteiraOriginal >= 100;
    
    // Se for um inteiro grande (>= 100) sem parte decimal E NÃO veio como string decimal, dividir por 1000
    if (!veioComoDecimalString && ehInteiro && ehGrande) {
      num = num / 1000;
    }
    
    // Formatar o número completo usando toLocaleString para garantir formatação correta
    const sinal = num < 0 ? '-' : '';
    const numAbsoluto = Math.abs(num);
    
    // Verificar se tem parte decimal significativa (não são apenas zeros)
    const parteDecimal = numAbsoluto - Math.floor(numAbsoluto);
    const temParteDecimalSignificativa = parteDecimal > 0.0001; // Tolerância para erros de ponto flutuante
    
    // Verificar se as casas decimais são apenas zeros
    // Usar toFixed(3) para garantir 3 casas e verificar se são zeros
    const valorCom3Casas = numAbsoluto.toFixed(3);
    const casasDecimais = valorCom3Casas.split('.')[1];
    const saoApenasZeros = casasDecimais && casasDecimais === '000';
    
    // Se tinha 3 casas decimais originalmente E não são apenas zeros, mostrar 3 casas
    // Se são apenas zeros (ex: 74.000), mostrar sem decimais (74)
    // Se tem parte decimal significativa, mostrar 3 casas
    const deveMostrar3Casas = (tinhaTresCasasDecimais && !saoApenasZeros) || 
                               (temParteDecimalSignificativa && !saoApenasZeros);
    
    const opcoesFormatacao = deveMostrar3Casas
      ? { minimumFractionDigits: 3, maximumFractionDigits: 3 }
      : { minimumFractionDigits: 0, maximumFractionDigits: 0 };
    
    // Usar toLocaleString para formatar corretamente
    let formatado = numAbsoluto.toLocaleString('pt-BR', opcoesFormatacao);
    
    // Remover zeros à esquerda desnecessários (ex: "00,25" -> "0,25" ou "00,250" -> "0,250")
    // O toLocaleString pode adicionar zeros à esquerda em alguns casos
    // Remover múltiplos zeros no início, mas manter pelo menos um zero antes da vírgula se necessário
    if (formatado.startsWith('00')) {
      // Se começa com "00", remover um zero: "00,250" -> "0,250"
      formatado = formatado.replace(/^00+/, '0');
    } else if (formatado.startsWith('0') && formatado[1] !== ',' && formatado[1] !== '.') {
      // Se começa com "0" mas não é "0," ou "0.", pode ter zeros extras
      // Ex: "01,25" -> "1,25" (mas isso não deveria acontecer com toLocaleString)
      formatado = formatado.replace(/^0+/, '');
      if (formatado.startsWith(',')) {
        formatado = '0' + formatado;
      }
    }
    
    return sinal + formatado;
  };

  // Função auxiliar para formatar quantidade com unidade
  const formatarQuantidadeComUnidade = (valor, unidade = '') => {
    const quantidadeFormatada = formatarQuantidade(valor);
    return unidade ? `${quantidadeFormatada} ${unidade}` : quantidadeFormatada;
  };

  // Função para calcular quantidade anterior
  const getQuantidadeAnterior = (necessidade) => {
    // Se existe ajuste_anterior, usar ele
    if (necessidade.ajuste_anterior !== null && necessidade.ajuste_anterior !== undefined) {
      return necessidade.ajuste_anterior ?? 0;
    }
    // Fallback para lógica antiga se ajuste_anterior não existir
    if (necessidade.status === 'CONF COORD') {
      return necessidade.ajuste_conf_nutri ?? 0;
    }
    if (necessidade.status === 'NEC COORD') {
      return necessidade.ajuste_nutricionista ?? 0;
    }
    return 0;
  };

  // Função para calcular quantidade atual baseado no status
  const getQuantidadeAtual = (necessidade) => {
    if (necessidade.status === 'CONF COORD') {
      return necessidade.ajuste_conf_coord ?? necessidade.ajuste_conf_nutri ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste ?? 0;
    }
    if (necessidade.status === 'NEC COORD') {
      return necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0;
    }
    return necessidade.ajuste_nutricionista ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste ?? 0;
  };

  // Função para calcular a diferença
  const getDiferenca = (necessidade) => {
    const atual = getQuantidadeAtual(necessidade);
    const anterior = getQuantidadeAnterior(necessidade);
    return atual - anterior;
  };

  // Função para consolidar necessidades por produto_id + grupo_id
  const necessidadesConsolidadas = useMemo(() => {
    const consolidado = new Map();
    
    necessidades.forEach(nec => {
      // Chave única: produto_id + grupo_id (para diferenciar mesmo produto em grupos diferentes)
      const chave = `${nec.produto_id || ''}_${nec.grupo_id || nec.grupo || ''}`;
      
      if (!consolidado.has(chave)) {
        consolidado.set(chave, {
          produto_id: nec.produto_id,
          produto_codigo: nec.produto_codigo,
          produto: nec.produto,
          produto_unidade: nec.produto_unidade,
          grupo: nec.grupo,
          grupo_id: nec.grupo_id,
          quantidade_total: parseFloat(getQuantidadeAtual(nec) || 0),
          quantidade_anterior_total: parseFloat(getQuantidadeAnterior(nec) || 0),
          ajuste_total: 0,
          diferenca_total: 0,
          total_escolas: 1,
          escolas: [nec]
        });
      } else {
        const item = consolidado.get(chave);
        item.quantidade_total += parseFloat(getQuantidadeAtual(nec) || 0);
        item.quantidade_anterior_total += parseFloat(getQuantidadeAnterior(nec) || 0);
        item.total_escolas += 1;
        item.escolas.push(nec);
      }
    });

    // Calcular ajuste e diferença totais
    return Array.from(consolidado.values()).map(item => {
      // Calcular ajuste total baseado nos ajustesLocais
      const ajusteTotal = item.escolas.reduce((acc, escola) => {
        const chave = `${escola.escola_id}_${escola.produto_id}`;
        const ajusteLocal = ajustesLocais[chave];
        if (ajusteLocal !== undefined && ajusteLocal !== '') {
          const ajusteNormalizado = String(ajusteLocal).replace(',', '.');
          return acc + (parseFloat(ajusteNormalizado) || 0);
        } else {
          // Se não tem ajuste local, usar o valor atual
          return acc + parseFloat(getQuantidadeAtual(escola) || 0);
        }
      }, 0);

      item.ajuste_total = ajusteTotal;
      item.diferenca_total = ajusteTotal - item.quantidade_anterior_total;

      return item;
    });
  }, [necessidades, ajustesLocais]);

  const handleToggleExpand = (chave) => {
    setExpandedRows(prev => ({
      ...prev,
      [chave]: !prev[chave]
    }));
  };

  // Paginação
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calcular dados paginados baseado no modo
  const dadosPaginados = useMemo(() => {
    const dados = modoVisualizacao === 'consolidado' ? necessidadesConsolidadas : necessidades;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return dados.slice(start, end);
  }, [modoVisualizacao === 'consolidado' ? necessidadesConsolidadas : necessidades, page, itemsPerPage, modoVisualizacao]);

  const totalItems = modoVisualizacao === 'consolidado' ? necessidadesConsolidadas.length : necessidades.length;

  // Resetar para página 1 quando necessidades ou modo mudarem
  useEffect(() => {
    setPage(1);
  }, [necessidades.length, modoVisualizacao]);

  // Renderização Individual (modo atual)
  const renderTabelaIndividual = () => (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cod Unidade
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidade Escolar
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Codigo Produto
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unidade de Medida
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade
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
        {dadosPaginados.map((necessidade) => (
            <tr key={necessidade.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {necessidade.escola_id || 'N/A'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-center">
                {necessidade.escola}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {necessidade.produto_codigo || necessidade.produto_id || 'N/A'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-center">
                {necessidade.produto}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {necessidade.produto_unidade}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
              {formatarQuantidadeComUnidade(getQuantidadeAtual(necessidade), necessidade.produto_unidade || '')}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {formatarQuantidadeComUnidade(getQuantidadeAnterior(necessidade), necessidade.produto_unidade || '')}
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
                    if (valor === '' || /^[0-9]*[.,]?[0-9]*$/.test(valor)) {
                      onAjusteChange({
                        escola_id: necessidade.escola_id,
                        produto_id: necessidade.produto_id,
                        valor: valor
                      });
                    }
                  }}
                  className="w-20 text-center text-xs py-1"
                  disabled={necessidade.status === 'CONF' || !canEdit}
                  placeholder="0.000"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                {getDiferenca(necessidade) !== 0 && (
                  <span className={getDiferenca(necessidade) > 0 ? 'text-green-600' : 'text-red-600'}>
                    {getDiferenca(necessidade) > 0 ? '+' : ''}{formatarQuantidadeComUnidade(getDiferenca(necessidade), necessidade.produto_unidade || '')}
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
  );

  // Renderização Consolidada
  const renderTabelaConsolidada = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th style={{ width: '50px' }} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Codigo Produto
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Produto
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Unidade de Medida
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Quantidade Total
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Quantidade Anterior Total
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ajuste Total
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Diferença Total
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Escolas
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {dadosPaginados.map((consolidado) => {
          const chave = `${consolidado.produto_id}_${consolidado.grupo_id || consolidado.grupo}`;
          
          return (
            <React.Fragment key={chave}>
              {/* Linha Consolidada */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleToggleExpand(chave)}
                    className="text-green-600 hover:text-green-700 focus:outline-none transition-colors"
                  >
                    {expandedRows[chave] ? (
                      <FaChevronUp className="w-4 h-4" />
                    ) : (
                      <FaChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                  <span className="font-semibold text-cyan-600">
                    {consolidado.produto_codigo || consolidado.produto_id || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                  {consolidado.produto}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                  {consolidado.produto_unidade}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                  {formatarQuantidadeComUnidade(consolidado.quantidade_total, consolidado.produto_unidade || '')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                  {formatarQuantidadeComUnidade(consolidado.quantidade_anterior_total, consolidado.produto_unidade || '')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                  {formatarQuantidadeComUnidade(consolidado.ajuste_total, consolidado.produto_unidade || '')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                  {consolidado.diferenca_total !== 0 && (
                    <span className={consolidado.diferenca_total > 0 ? 'text-green-600' : 'text-red-600'}>
                      {consolidado.diferenca_total > 0 ? '+' : ''}{formatarQuantidadeComUnidade(consolidado.diferenca_total, consolidado.produto_unidade || '')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                    {consolidado.total_escolas}
                  </span>
                </td>
              </tr>

              {/* Linha Expandida (Detalhes das Escolas) */}
              {expandedRows[chave] && (
                <tr className="bg-gray-50">
                  <td colSpan="9" className="px-6 py-4">
                    <div className="bg-gray-50 border-l-4 border-green-600 p-4">
                      <h4 className="text-md font-semibold text-green-700 mb-4 flex items-center gap-2">
                        <span className="text-xl">🏢</span>
                        Unidades Escolares - {consolidado.produto}
                      </h4>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Cod Unidade</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Unidade Escolar</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produto</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Unidade</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Quantidade Anterior</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ajuste</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Diferença</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {consolidado.escolas.map((necessidade) => (
                            <tr key={necessidade.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                {necessidade.escola_id}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                {necessidade.escola}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                {necessidade.produto}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                                {necessidade.produto_unidade}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                {formatarQuantidadeComUnidade(getQuantidadeAtual(necessidade), necessidade.produto_unidade || '')}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                                {formatarQuantidadeComUnidade(getQuantidadeAnterior(necessidade), necessidade.produto_unidade || '')}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  pattern="[0-9]*[.,]?[0-9]*"
                                  value={ajustesLocais[`${necessidade.escola_id}_${necessidade.produto_id}`] || ''}
                                  onChange={(e) => {
                                    const valor = e.target.value;
                                    if (valor === '' || /^[0-9]*[.,]?[0-9]*$/.test(valor)) {
                                      onAjusteChange({
                                        escola_id: necessidade.escola_id,
                                        produto_id: necessidade.produto_id,
                                        valor: valor
                                      });
                                    }
                                  }}
                                  className="w-20 text-center text-xs py-1"
                                  disabled={necessidade.status === 'CONF' || !canEdit}
                                  placeholder="0.000"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                                {getDiferenca(necessidade) !== 0 && (
                                  <span className={getDiferenca(necessidade) > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {getDiferenca(necessidade) > 0 ? '+' : ''}{formatarQuantidadeComUnidade(getDiferenca(necessidade), necessidade.produto_unidade || '')}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                                <button
                                  onClick={() => onExcluirNecessidade(necessidade)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Excluir produto"
                                  disabled={!canEdit}
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="overflow-x-auto">
      {/* Botão de alternância de modo */}
      <div className="mb-4 flex justify-end">
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setModoVisualizacao('individual')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              modoVisualizacao === 'individual'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Visualização Individual"
          >
            <FaList className="w-4 h-4" />
            Individual
          </button>
          <button
            onClick={() => setModoVisualizacao('consolidado')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              modoVisualizacao === 'consolidado'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Visualização Consolidada"
          >
            <FaLayerGroup className="w-4 h-4" />
            Consolidado
          </button>
        </div>
      </div>

      {/* Tabela baseada no modo */}
      {modoVisualizacao === 'consolidado' ? renderTabelaConsolidada() : renderTabelaIndividual()}
      
      {/* Paginação */}
      {totalItems > itemsPerPage && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            totalItems={totalItems}
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

export default AjusteTabelaCoordenacao;
