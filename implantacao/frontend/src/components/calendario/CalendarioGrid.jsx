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
    return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
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

      {/* Grid do Calendário */}
      <div className="p-6">
        {dados.semanas.map((semana, index) => (
          <div key={semana.numero} className="mb-8">
            {/* Header da Semana */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Semana {semana.numero}
                  </h4>
                  <div className="text-sm text-gray-600">
                    {semana.abastecimento && (
                      <span className="mr-4">
                        <strong>Abastecimento:</strong> {semana.abastecimento}
                      </span>
                    )}
                    {semana.consumo && (
                      <span>
                        <strong>Consumo:</strong> {semana.consumo}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {semana.mes_referencia}
                </div>
              </div>
            </div>

            {/* Grid de Dias */}
            <div className="grid grid-cols-7 gap-2">
              {/* Header dos dias da semana */}
              {obterDiasSemana().map((diaSemana) => (
                <div key={diaSemana} className="text-center py-2 text-sm font-medium text-gray-500">
                  {diaSemana}
                </div>
              ))}

              {/* Dias da semana */}
              {semana.dias.map((dia) => {
                const badges = obterBadges(dia);
                const corFundo = obterCorFundo(dia);
                
                return (
                  <div
                    key={dia.id}
                    className={`p-3 rounded-lg border ${corFundo} min-h-[120px]`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {dia.dia}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dia.dia_semana_nome}
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
        ))}
      </div>
    </div>
  );
};

export default CalendarioGrid;
