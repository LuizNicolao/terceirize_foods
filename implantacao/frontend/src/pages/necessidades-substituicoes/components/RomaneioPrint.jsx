import React from 'react';

const RomaneioPrint = ({ dados, grupo = null, escola = null }) => {
  // Formatar semana de abastecimento (assumindo formato YYYY-MM-DD ou similar)
  const formatarSemana = (semana) => {
    if (!semana) return '';
    // Se for formato de data, converter
    if (semana.includes('-')) {
      const partes = semana.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
    }
    return semana;
  };

  // Obter o grupo do produto filtrado (quando for impressão por escola)
  const getGrupoProduto = () => {
    // Se o grupo foi passado como prop, usar ele
    if (grupo && escola) {
      return grupo;
    }
    // Caso contrário, pegar do primeiro produto
    if (!dados.produtos || dados.produtos.length === 0) {
      return null;
    }
    const primeiroProduto = dados.produtos[0];
    return primeiroProduto.grupo || null;
  };

  // Determinar o título baseado em grupo ou escola
  const getTitulo = () => {
    if (escola) {
      const grupoProduto = getGrupoProduto();
      if (grupoProduto) {
        return `ROMANEIO DE ENTREGA - ${grupoProduto.toUpperCase()}`;
      }
      return 'ROMANEIO DE ENTREGA';
    }
    if (grupo) {
      return `RESUMO GRUPO ${grupo.toUpperCase()}`;
    }
    return 'RESUMO';
  };

  // Obter informações da escola (quando for impressão por escola)
  const getEscolaInfo = () => {
    if (!escola || !dados.produtos || dados.produtos.length === 0) {
      return null;
    }
    
    // Pegar informações da primeira escola (todas são da mesma escola quando agrupado por escola)
    const primeiroProduto = dados.produtos[0];
    
    return {
      nome: primeiroProduto.escola_nome || escola || '',
      endereco: primeiroProduto.escola_endereco || '',
      cidade: primeiroProduto.escola_cidade || '',
      abastecimento: dados.semana_abastecimento ? formatarSemana(dados.semana_abastecimento) : '',
      atendimento: primeiroProduto.escola_atendimento || '',
      horario: primeiroProduto.escola_horario || '',
      ordem_entrega: primeiroProduto.escola_ordem_entrega !== null && primeiroProduto.escola_ordem_entrega !== undefined 
        ? primeiroProduto.escola_ordem_entrega 
        : null,
      numero_romaneio: primeiroProduto.numero_romaneio || null
    };
  };

  const escolaInfo = getEscolaInfo();

  // Consolidar produtos por código (somar quantidades quando não há agrupamento por escola)
  const produtosConsolidados = React.useMemo(() => {
    if (!dados.produtos || !Array.isArray(dados.produtos)) {
      return [];
    }

    // Se for agrupamento por escola, não consolidar (manter produtos separados por escola)
    if (escola) {
      return dados.produtos;
    }

    // Consolidar produtos por código (mesmo produto, mesma unidade)
    const consolidado = new Map();

    dados.produtos.forEach(produto => {
      const chave = `${produto.codigo || ''}_${produto.unidade || ''}`;
      
      if (!consolidado.has(chave)) {
        consolidado.set(chave, {
          codigo: produto.codigo || '',
          descricao: produto.descricao || '',
          unidade: produto.unidade || '',
          quantidade: parseFloat(produto.quantidade) || 0,
          grupo: produto.grupo || ''
        });
      } else {
        const item = consolidado.get(chave);
        item.quantidade += parseFloat(produto.quantidade) || 0;
      }
    });

    // Converter Map para Array e ordenar por código
    return Array.from(consolidado.values()).sort((a, b) => {
      const codigoA = String(a.codigo || '').padStart(10, '0');
      const codigoB = String(b.codigo || '').padStart(10, '0');
      return codigoA.localeCompare(codigoB);
    });
  }, [dados.produtos, escola]);

  return (
    <div className="bg-white print:bg-white">
      {/* Container principal - A4 retrato ocupando máximo da folha */}
      <div className="w-full mx-auto p-4 print:p-2" style={{ width: '100%' }}>
        {/* Header - Altura ~70-80px */}
        <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-6 print:pb-2 print:mb-4" style={{ minHeight: '70px' }}>
          {/* Logo à esquerda */}
          <div className="text-sm font-bold text-gray-800 print:text-[8pt]">
            TERCEIRIZE Foods
          </div>
          
          {/* Título centralizado */}
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold uppercase tracking-wide print:text-[8pt]">
              {getTitulo()}
            </h1>
          </div>
          
          {/* Espaço vazio à direita para balancear */}
          <div className="w-32"></div>
        </div>

        {/* Bloco de informações - Fundo cinza */}
        <div className="bg-gray-300 p-3 mb-4 print:mb-2 print:bg-gray-300 print:text-[8pt]" style={{ backgroundColor: '#d0d0d0' }}>
          {escola && escolaInfo ? (
            /* Cabeçalho para impressão por escola - Otimizado */
            <>
              {/* Linha 1: Nome da Escola (linha única) */}
              <div className="mb-2 print:mb-1">
                <span className="font-semibold">Nome da Escola: </span>
                <span>{escolaInfo.nome}</span>
              </div>
              
              {/* Linha 2: Endereço e Cidade (dividido em duas colunas) */}
              <div className="grid grid-cols-2 gap-4 mb-2 print:mb-1">
                <div>
                  <span className="font-semibold">Endereço: </span>
                  <span>{escolaInfo.endereco || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">Cidade: </span>
                  <span>{escolaInfo.cidade || '-'}</span>
                </div>
              </div>
              
              {/* Linha 3: Abastecimento, Atendimento e Horário (proporções ajustadas) */}
              <div className="grid grid-cols-[1.5fr_2fr_0.8fr] gap-4 mb-2 print:mb-1">
                <div className="whitespace-nowrap">
                  <span className="font-semibold">Abastecimento: </span>
                  <span>{escolaInfo.abastecimento || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">Atendimento: </span>
                  <span>{escolaInfo.atendimento || '-'}</span>
                </div>
                <div className="whitespace-nowrap">
                  <span className="font-semibold">Horário: </span>
                  <span>{escolaInfo.horario || '-'}</span>
                </div>
              </div>
              
              {/* Linha 4: Rota, Ordem da Entrega e Número do Romaneio (três colunas) */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="font-semibold">Rota: </span>
                  <span>{dados.rota || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">Ordem da Entrega: </span>
                  <span>{escolaInfo.ordem_entrega !== null && escolaInfo.ordem_entrega !== undefined ? escolaInfo.ordem_entrega : '-'}</span>
                </div>
                {escolaInfo.numero_romaneio && (
                  <div>
                    <span className="font-semibold">Número do Romaneio: </span>
                    <span>{escolaInfo.numero_romaneio}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Cabeçalho para impressão por grupo */
            <>
              {/* Linha 1: 2 colunas */}
              <div className="grid grid-cols-2 gap-4 mb-3 print:mb-2">
                <div>
                  <span className="font-semibold">Semana de Abastecimento: </span>
                  <span>{formatarSemana(dados.semana_abastecimento)}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">Filial: </span>
                  <span>{dados.filial || 'CD Vila Velha'}</span>
                </div>
              </div>
              
              {/* Linha 2: ocupando linha inteira */}
              <div>
                <span className="font-semibold">Rota Entrega: </span>
                <span>{dados.rota || ''}</span>
              </div>
            </>
          )}
        </div>

        {/* Tabela de produtos */}
        <div className="mb-6 print:mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-400 border-b-2 border-gray-600">
                <th className="border border-gray-600 px-2 py-1 text-left text-[8pt] font-bold uppercase" style={{ width: '10%' }}>
                  Cod.
                </th>
                <th className="border border-gray-600 px-2 py-1 text-left text-[8pt] font-bold uppercase" style={{ width: '45%' }}>
                  Descrição
                </th>
                <th className="border border-gray-600 px-2 py-1 text-center text-[8pt] font-bold uppercase" style={{ width: '8%' }}>
                  Un.
                </th>
                <th className="border border-gray-600 px-2 py-1 text-center text-[8pt] font-bold uppercase" style={{ width: '10%' }}>
                  Qtde.
                </th>
                <th className="border border-gray-600 px-2 py-1 text-left text-[8pt] font-bold uppercase" style={{ width: '27%' }}>
                  Faltas / Observação
                </th>
              </tr>
            </thead>
            <tbody>
              {produtosConsolidados && produtosConsolidados.length > 0 ? (
                produtosConsolidados.map((produto, index) => (
                  <tr key={index} className="border-b border-gray-300 border-dashed print:border-dashed">
                    <td className="border border-gray-300 px-2 py-1 text-[8pt]">
                      {produto.codigo || ''}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-[8pt] font-semibold">
                      {produto.descricao || ''}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-[8pt] text-center">
                      {produto.unidade || ''}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-[8pt] text-center font-semibold">
                      {produto.quantidade ? parseFloat(produto.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }) : '0'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-[8pt]">
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border border-gray-300 px-2 py-2 text-center text-gray-500 text-[8pt]">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bloco de rodapé - Simplificado para escola, completo para grupo */}
        {escola ? (
          /* Rodapé simplificado para impressão por escola */
          <div className="mt-8 print:mt-6 print:text-[8pt]">
            <div className="grid grid-cols-2 gap-4 print:gap-3">
              <div>
                <span className="text-[8pt] font-semibold">Data: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[200px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Assinatura: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[200px]"></span>
              </div>
            </div>
          </div>
        ) : (
          /* Rodapé completo para impressão por grupo */
          <div className="mt-4 print:mt-3 space-y-2 print:space-y-1 print:text-[8pt]">
            {/* Linha 1 */}
            <div className="grid grid-cols-4 gap-2 print:gap-1">
              <div>
                <span className="text-[8pt] font-semibold">Separado por: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[150px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Data Separação: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[100px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Hora Inicial: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Hora Filial: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
            </div>

            {/* Linha 2 */}
            <div className="grid grid-cols-4 gap-2 print:gap-1">
              <div>
                <span className="text-[8pt] font-semibold">Conferido por: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[120px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Data Conferencia: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[100px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Hora Inicial: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Hora Filial: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
            </div>

            {/* Linha 3 */}
            <div className="grid grid-cols-4 gap-2 print:gap-1">
              <div>
                <span className="text-[8pt] font-semibold">Caixas Vazadas </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Paletes </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Hora Inicial </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Hora Filial </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
            </div>

            {/* Linha 4 */}
            <div className="grid grid-cols-4 gap-2 print:gap-1">
              <div>
                <span className="text-[8pt] font-semibold">Data carregamento: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[100px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Placa: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Hora Inicial: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
              <div>
                <span className="text-[8pt] font-semibold">Hora Filial: </span>
                <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px]"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estilos CSS para impressão */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
            margin-header: 0;
            margin-footer: 0;
          }
          
          @page {
            @top-center {
              content: "";
            }
            @bottom-center {
              content: "";
            }
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 8pt;
          }
          
          * {
            font-size: 8pt !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
};

export default RomaneioPrint;

