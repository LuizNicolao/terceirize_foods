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

  // Determinar o título baseado em grupo ou escola
  const getTitulo = () => {
    if (escola) {
      return `RESUMO ESCOLA ${escola.toUpperCase()}`;
    }
    if (grupo) {
      return `RESUMO GRUPO ${grupo.toUpperCase()}`;
    }
    return 'RESUMO';
  };

  return (
    <div className="bg-white print:bg-white">
      {/* Container principal - A4 horizontal ou ~900-1000px */}
      <div className="max-w-4xl mx-auto p-8 print:p-4" style={{ width: '100%', maxWidth: '1000px' }}>
        {/* Header - Altura ~70-80px */}
        <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-6 print:pb-2 print:mb-4" style={{ minHeight: '70px' }}>
          {/* Logo à esquerda */}
          <div className="text-xl font-bold text-gray-800">
            TERCEIRIZE Foods
          </div>
          
          {/* Título centralizado */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {getTitulo()}
            </h1>
          </div>
          
          {/* Espaço vazio à direita para balancear */}
          <div className="w-32"></div>
        </div>

        {/* Bloco de informações da rota - Fundo cinza */}
        <div className="bg-gray-300 p-4 mb-6 print:mb-4 print:bg-gray-300" style={{ backgroundColor: '#d0d0d0' }}>
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
        </div>

        {/* Tabela de produtos */}
        <div className="mb-6 print:mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-400 border-b-2 border-gray-600">
                <th className="border border-gray-600 px-3 py-2 text-left text-xs font-bold uppercase" style={{ width: '10%' }}>
                  Cod.
                </th>
                <th className="border border-gray-600 px-3 py-2 text-left text-xs font-bold uppercase" style={{ width: '45%' }}>
                  Descrição
                </th>
                <th className="border border-gray-600 px-3 py-2 text-center text-xs font-bold uppercase" style={{ width: '8%' }}>
                  Un.
                </th>
                <th className="border border-gray-600 px-3 py-2 text-center text-xs font-bold uppercase" style={{ width: '10%' }}>
                  Qtde.
                </th>
                <th className="border border-gray-600 px-3 py-2 text-left text-xs font-bold uppercase" style={{ width: '27%' }}>
                  Faltas / Observação
                </th>
              </tr>
            </thead>
            <tbody>
              {dados.produtos && dados.produtos.length > 0 ? (
                dados.produtos.map((produto, index) => (
                  <tr key={index} className="border-b border-gray-300 border-dashed print:border-dashed">
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {produto.codigo || ''}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm font-semibold">
                      {produto.descricao || ''}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                      {produto.unidade || ''}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center font-semibold">
                      {produto.quantidade ? parseFloat(produto.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }) : '0'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      <span className="text-gray-400">.......................................</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bloco de conferência / carregamento - Rodapé */}
        <div className="mt-8 print:mt-6 space-y-4 print:space-y-3">
          {/* Linha 1 */}
          <div className="grid grid-cols-4 gap-4 print:gap-3">
            <div>
              <span className="text-sm font-semibold">Separado por: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[150px]">...............................</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Data Separação: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[100px]">.................</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Hora Inicial: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">.................</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Hora Filial: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">.................</span>
            </div>
          </div>

          {/* Linha 2 */}
          <div className="grid grid-cols-4 gap-4 print:gap-3">
            <div>
              <span className="text-sm font-semibold">Conferido por: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[120px]">....................</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Data Conferencia: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[100px]">............</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Hora Inicial: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">............</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Hora Filial: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">............</span>
            </div>
          </div>

          {/* Linha 3 */}
          <div className="grid grid-cols-4 gap-4 print:gap-3">
            <div>
              <span className="text-sm font-semibold">Caixas Vazadas </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">...........</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Paletes </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">...........</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Hora Inicial </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">...........</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Hora Filial </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">...........</span>
            </div>
          </div>

          {/* Linha 4 */}
          <div className="grid grid-cols-4 gap-4 print:gap-3">
            <div>
              <span className="text-sm font-semibold">Data carregamento: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[100px]">..........</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Placa: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">..........</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Hora Inicial: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">...........</span>
            </div>
            <div>
              <span className="text-sm font-semibold">Hora Filial: </span>
              <span className="text-gray-400 border-b border-dotted border-gray-400 inline-block min-w-[80px]">...........</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS para impressão */}
      <style jsx>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RomaneioPrint;

