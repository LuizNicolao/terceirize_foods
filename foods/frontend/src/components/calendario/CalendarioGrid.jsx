import React from 'react';
import { FaCalendarCheck, FaTruck, FaShoppingCart, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';

const CalendarioGrid = ({ dados, ano, mes, loading = false }) => {
  const gerarMeses = () => {
    return [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
  };

  const obterDiasSemana = () => {
    return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  };

  const obterOrdemDiaSemana = (dataString) => {
    if (!dataString) return null;
    const data = new Date(`${dataString}T00:00:00`);
    const diaSemana = data.getDay(); // 0 (Domingo) a 6 (Sábado)
    return diaSemana === 0 ? 7 : diaSemana; // Converter para 1 (Segunda) a 7 (Domingo)
  };

  const ordenarDiasDaSemana = (dias = []) => {
    const diasOrdenados = [];
    for (let ordem = 1; ordem <= 7; ordem++) {
      const diaEncontrado = dias.find((dia) => obterOrdemDiaSemana(dia.data) === ordem);
      diasOrdenados.push(diaEncontrado || null);
    }
    return diasOrdenados;
  };

  const obterBadges = (dia) => {
    const badges = [];
    
    if (dia.dia_util) {
      badges.push({
        icon: FaCalendarCheck,
        text: 'Útil',
        color: 'bg-green-100 text-green-800'
      });
    }
    
    if (dia.dia_abastecimento) {
      badges.push({
        icon: FaTruck,
        text: 'Abastecimento',
        color: 'bg-yellow-100 text-yellow-800'
      });
    }
    
    if (dia.dia_consumo) {
      badges.push({
        icon: FaShoppingCart,
        text: 'Consumo',
        color: 'bg-purple-100 text-purple-800'
      });
    }
    
    if (dia.feriado) {
      badges.push({
        icon: FaExclamationTriangle,
        text: dia.nome_feriado || 'Feriado',
        color: 'bg-red-100 text-red-800'
      });
    }
    
    return badges;
  };

  const obterCorFundo = (dia) => {
    if (dia.feriado) return 'bg-red-50 border-red-200';
    if (dia.dia_util) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!dados || !dados.semanas) {
    return (
      <div className="text-center py-12">
        <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          Não há dados para o período selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {gerarMeses()[mes - 1]} {ano}
        </h3>
      </div>

      {/* Container do Calendário */}
      <div className="p-6">
        {/* Cabeçalho dos dias da semana (apenas uma vez) */}
        <div className="grid grid-cols-7 gap-2 mb-4" style={{ marginLeft: '200px' }}>
          {obterDiasSemana().map((diaSemana) => (
            <div key={diaSemana} className="text-center py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded">
              {diaSemana}
            </div>
          ))}
        </div>

        {/* Semanas com layout lado a lado */}
        {dados.semanas.map((semana, index) => (
          <div key={semana.numero} className="mb-6">
            <div className="grid grid-cols-7 gap-4" style={{ gridTemplateColumns: '200px 1fr' }}>
              {/* Card da Semana */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Semana {semana.numero}
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {semana.abastecimento && (
                    <>
                      <span className="font-medium">Abastecimento:</span><br />
                      ({semana.abastecimento})
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  {semana.consumo && (
                    <>
                      <span className="font-medium">Consumo:</span><br />
                      ({semana.consumo})
                    </>
                  )}
                </div>
              </div>

              {/* Grid dos Dias da Semana */}
              <div className="grid grid-cols-7 gap-1">
                {ordenarDiasDaSemana(semana.dias).map((dia, index) => {
                  if (!dia) {
                    return (
                      <div
                        key={`placeholder-${semana.numero}-${index}`}
                        className="p-3 rounded-lg border border-dashed border-gray-200 bg-white min-h-[100px] flex flex-col justify-between text-gray-300"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">-</span>
                          <span className="text-xs">{obterDiasSemana()[index]}</span>
                        </div>
                      </div>
                    );
                  }

                  const badges = obterBadges(dia);
                  const corFundo = obterCorFundo(dia);
                  const dataNormalizada = dia.data ? new Date(`${dia.data}T00:00:00`) : null;

                  return (
                    <div
                      key={dia.id}
                      className={`p-3 rounded-lg border ${corFundo} min-h-[100px]`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {dataNormalizada ? dataNormalizada.getDate() : '-'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dia.dia_semana_nome || obterDiasSemana()[index]}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="space-y-1">
                        {badges.map((badge, badgeIndex) => (
                          <div
                            key={badgeIndex}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                          >
                            <badge.icon className="h-3 w-3 mr-1" />
                            {badge.text}
                          </div>
                        ))}
                      </div>

                      {/* Observações */}
                      {dia.observacoes && (
                        <div className="mt-2 text-xs text-gray-600">
                          {dia.observacoes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarioGrid;
