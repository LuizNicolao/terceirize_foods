import React, { useState } from 'react';
import {
  FaCalendarCheck,
  FaTruck,
  FaShoppingCart,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaInfoCircle
} from 'react-icons/fa';

const CalendarioGrid = ({ dados, ano, mes, loading = false }) => {
  const [diaDetalhesAtivo, setDiaDetalhesAtivo] = useState(null);

  const handleToggleDetalhes = (diaId) => {
    setDiaDetalhesAtivo((prev) => (prev === diaId ? null : diaId));
  };

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
        key: `dia-util-${dia.id}`,
        icon: FaCalendarCheck,
        text: 'Útil',
        detailText: 'Dia útil',
        color: 'bg-green-100 text-green-800',
        showInline: true
      });
    }
    
    if (dia.dia_abastecimento) {
      badges.push({
        key: `abastecimento-${dia.id}`,
        icon: FaTruck,
        text: 'Abastecimento',
        detailText: 'Dia de abastecimento',
        color: 'bg-yellow-100 text-yellow-800',
        showInline: true
      });
    }
    
    if (dia.dia_consumo) {
      badges.push({
        key: `consumo-${dia.id}`,
        icon: FaShoppingCart,
        text: 'Consumo',
        detailText: 'Dia de consumo',
        color: 'bg-purple-100 text-purple-800',
        showInline: true
      });
    }
    
    if (dia.feriado) {
      badges.push({
        key: `feriado-${dia.id}`,
        icon: FaExclamationTriangle,
        text: dia.nome_feriado || 'Feriado',
        detailText: dia.nome_feriado || 'Feriado',
        color: 'bg-red-100 text-red-800',
        showInline: true
      });
    }

    if (Array.isArray(dia.excecoes) && dia.excecoes.length > 0) {
      dia.excecoes.forEach((excecao) => {
        const destino =
          excecao.tipo_destino === 'global'
            ? ''
            : excecao.tipo_destino === 'filial'
              ? ` - ${excecao.filial_nome || 'Filial'}`
              : ` - ${excecao.unidade_nome || 'Unidade'}`;

        badges.push({
          key: `excecao-${excecao.id}`,
          icon: FaExclamationTriangle,
          text: `${excecao.descricao}${destino}`,
          detailText: `${excecao.descricao}${destino}`,
          color: 'bg-amber-100 text-amber-800',
          showInline: false
        });
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
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {gerarMeses()[mes - 1]} {ano}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span className="font-semibold text-gray-700 mr-2">Legenda:</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              <FaCalendarCheck className="h-3.5 w-3.5 mr-1" />
              Útil
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              <FaTruck className="h-3.5 w-3.5 mr-1" />
              Abastecimento
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              <FaShoppingCart className="h-3.5 w-3.5 mr-1" />
              Consumo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              <FaExclamationTriangle className="h-3.5 w-3.5 mr-1" />
              Feriado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
              <FaExclamationTriangle className="h-3.5 w-3.5 mr-1" />
              Dia não útil personalizado
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <FaInfoCircle className="h-3.5 w-3.5" />
            Clique nos ícones para ver detalhes
          </div>
        </div>
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
                  const possuiObservacoes = Boolean(dia.observacoes);
                  const excecoesComObservacao = Array.isArray(dia.excecoes)
                    ? dia.excecoes.filter((ex) => ex.observacoes)
                    : [];
                  const possuiDetalhes = badges.length > 0 || possuiObservacoes || excecoesComObservacao.length > 0;

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

                      {/* Ícones de indicadores */}
                      {badges.length > 0 && (
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          {badges.map((badge) => (
                            <button
                              key={badge.key}
                              type="button"
                              title={badge.text}
                              onClick={() => handleToggleDetalhes(dia.id)}
                              className={`inline-flex items-center justify-center rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 px-2 py-1 text-xs font-medium ${badge.color}`}
                            >
                              <badge.icon className="h-3.5 w-3.5" />
                              {badge.showInline && (
                                <span className="ml-1 whitespace-nowrap">{badge.text}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Botão de detalhes */}
                      {possuiDetalhes && (
                        <button
                          type="button"
                          onClick={() => handleToggleDetalhes(dia.id)}
                          className="mt-1 text-xs text-green-700 hover:text-green-900 flex items-center gap-1 font-medium focus:outline-none focus:underline"
                        >
                          <FaInfoCircle className="h-3.5 w-3.5" />
                          {diaDetalhesAtivo === dia.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                        </button>
                      )}

                      {/* Detalhes expandido */}
                      {diaDetalhesAtivo === dia.id && (
                        <div className="mt-2 space-y-2 text-xs text-gray-600">
                          {badges.length > 0 && (
                            <div className="space-y-1">
                              {badges.map((badge) => (
                                <div
                                  key={`${badge.key}-detail`}
                                  className="flex items-start gap-2"
                                >
                                  <badge.icon className="h-3.5 w-3.5 mt-0.5 text-green-700" />
                                  <span>{badge.detailText || badge.text}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {dia.observacoes && (
                            <div>
                              <span className="font-semibold text-gray-700">Observações:</span>
                              <p className="mt-1 text-justify">{dia.observacoes}</p>
                            </div>
                          )}

                          {excecoesComObservacao.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-semibold text-gray-700">Observações das exceções:</span>
                              {excecoesComObservacao.map((excecao) => (
                                <div
                                  key={`excecao-observacao-${excecao.id}`}
                                  className="italic text-gray-600"
                                >
                                  {excecao.observacoes}
                                </div>
                              ))}
                            </div>
                          )}
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
