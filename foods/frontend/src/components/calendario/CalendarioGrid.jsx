import React, { useMemo, useState } from 'react';
import {
  FaCalendarCheck,
  FaTruck,
  FaShoppingCart,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

const CalendarioGrid = ({ dados, ano, mes, loading = false }) => {
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const handleAbrirDetalhes = (dia) => {
    setDiaSelecionado(dia);
  };

  const handleFecharModalDetalhes = () => {
    setDiaSelecionado(null);
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
      const totalExcecoes = dia.excecoes.length;
      const tiposResumo = dia.excecoes.reduce((acc, excecao) => {
        const tipo = excecao.tipo_destino || 'outros';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      const detalhesResumo = Object.entries(tiposResumo)
        .map(([tipo, quantidade]) => {
          switch (tipo) {
            case 'global':
              return `${quantidade} global(is)`;
            case 'filial':
              return `${quantidade} filial(is)`;
            case 'unidade':
              return `${quantidade} unidade(s)`;
            default:
              return `${quantidade} outro(s)`;
          }
        })
        .join(' · ');

      badges.push({
        key: `excecoes-${dia.id}`,
        icon: FaExclamationTriangle,
        text: `Exceções (${totalExcecoes})`,
        detailText:
          detalhesResumo.length > 0
            ? `Registros: ${detalhesResumo}`
            : `Existem ${totalExcecoes} ${totalExcecoes === 1 ? 'exceção' : 'exceções'} configuradas para este dia`,
        color: 'bg-amber-100 text-amber-800',
        showInline: true
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
                          onClick={() => handleAbrirDetalhes(dia)}
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
                          onClick={() => handleAbrirDetalhes(dia)}
                          className="mt-1 text-xs text-green-700 hover:text-green-900 flex items-center gap-1 font-medium focus:outline-none focus:underline"
                        >
                          <FaInfoCircle className="h-3.5 w-3.5" />
                          Ver detalhes
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <DetalhesDiaModal
        dia={diaSelecionado}
        gerarMeses={gerarMeses}
        obterBadges={obterBadges}
        onClose={handleFecharModalDetalhes}
      />
    </div>
  );
};

export default CalendarioGrid;

const DetalhesDiaModal = ({ dia, gerarMeses, obterBadges, onClose }) => {
  const dadosModal = useMemo(() => {
    if (!dia) return null;

    const data = dia.data ? new Date(`${dia.data}T00:00:00`) : null;
    const dataFormatada = data
      ? data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      : '-';

    const badges = obterBadges(dia);
    const excecoes = Array.isArray(dia.excecoes) ? dia.excecoes : [];
    const excecoesAgrupadas = excecoes.reduce((acc, excecao) => {
      const tipo = excecao.tipo_destino || 'outros';
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(excecao);
      return acc;
    }, {});

    return {
      dataFormatada,
      badges,
      excecoes,
      excecoesAgrupadas
    };
  }, [dia, obterBadges]);

  const [searchTerm, setSearchTerm] = useState('');
  const [gruposExpandidos, setGruposExpandidos] = useState(() => ({
    global: true,
    filial: true,
    unidade: true,
    outros: true
  }));

  const excecoesFiltradas = useMemo(() => {
    if (!dadosModal) return [];
    if (!searchTerm.trim()) return dadosModal.excecoes || [];

    const termo = searchTerm.toLowerCase();
    return (dadosModal.excecoes || []).filter((excecao) => {
      const destinoTexto = formatarDestino(excecao).toLowerCase();
      return (
        (excecao.descricao || '').toLowerCase().includes(termo) ||
        destinoTexto.includes(termo) ||
        (excecao.observacoes || '').toLowerCase().includes(termo)
      );
    });
  }, [dadosModal, searchTerm]);

  const excecoesAgrupadasFiltradas = useMemo(() => {
    return excecoesFiltradas.reduce((acc, excecao) => {
      const tipo = excecao.tipo_destino || 'outros';
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(excecao);
      return acc;
    }, {});
  }, [excecoesFiltradas]);

  const resumoExcecoesFiltradas = useMemo(() => {
    return Object.entries(excecoesAgrupadasFiltradas).map(([tipo, lista]) => ({
      tipo,
      quantidade: lista.length
    }));
  }, [excecoesAgrupadasFiltradas]);

  const totalExcecoes = dadosModal?.excecoes?.length || 0;
  const totalFiltradas = excecoesFiltradas?.length || 0;

  const toggleGrupo = (tipo) => {
    setGruposExpandidos((prev) => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  if (!dia || !dadosModal) {
    return null;
  }

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'global':
        return 'Global';
      case 'filial':
        return 'Filiais';
      case 'unidade':
        return 'Unidades escolares';
      default:
        return 'Outros';
    }
  };

  const formatarDestino = (excecao) => {
    if (excecao.tipo_destino === 'global') {
      return 'Todas as unidades';
    }
    if (excecao.tipo_destino === 'filial') {
      return `Filial: ${excecao.filial_nome || 'Não informada'}${excecao.filial_cidade ? ` (${excecao.filial_cidade})` : ''}`;
    }
    return `Unidade: ${excecao.unidade_nome || 'Não informada'}${excecao.unidade_cidade ? ` (${excecao.unidade_cidade})` : ''}`;
  };

  return (
    <Modal
      isOpen={Boolean(dia)}
      onClose={onClose}
      size={totalExcecoes > 0 ? 'xl' : 'lg'}
      title={`Detalhes do dia ${dadosModal.dataFormatada}`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <span className="text-sm text-gray-500">Dia da semana</span>
            <p className="text-lg font-semibold text-gray-900">
              {dia.dia_semana_nome || '-'}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <span className="text-sm text-gray-500">Referência</span>
            <p className="text-lg font-semibold text-gray-900">
              {gerarMeses()[Math.max(0, (dia.mes_referencia || dia.mes || 1) - 1)]} / {dia.ano || '-'}
            </p>
          </div>
        </div>

        {dadosModal.badges.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800">Indicadores do dia</h3>
            <div className="flex flex-wrap gap-2">
              {dadosModal.badges.map((badge) => (
                <span
                  key={`${badge.key}-modal`}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${badge.color}`}
                >
                  <badge.icon className="h-4 w-4" />
                  <span>{badge.detailText || badge.text}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {dia.observacoes && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800">Observações gerais</h3>
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {dia.observacoes}
            </p>
          </div>
        )}

        {totalExcecoes > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Dias não úteis (exceções)</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  Total: {totalFiltradas}
                  {totalFiltradas !== totalExcecoes && (
                    <span className="ml-1 text-[11px] text-green-700">
                      (filtrado de {totalExcecoes})
                    </span>
                  )}
                </span>
                {resumoExcecoesFiltradas.map((resumo) => (
                  <span
                    key={`resumo-${resumo.tipo}`}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                  >
                    {getTipoLabel(resumo.tipo)}: {resumo.quantidade}
                  </span>
                ))}
              </div>
            </div>

            <Input
              label="Buscar por descrição, destino ou observações"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite para filtrar..."
            />

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {Object.entries(excecoesAgrupadasFiltradas).map(([tipo, lista]) => (
                <div key={`grupo-${tipo}`} className="border-t border-gray-200 first:border-t-0">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">
                      {getTipoLabel(tipo)} ({lista.length})
                    </span>
                    <Button
                      onClick={() => toggleGrupo(tipo)}
                      variant="ghost"
                      size="xs"
                      className="text-xs"
                    >
                      {gruposExpandidos[tipo] ? 'Recolher' : 'Expandir'}
                    </Button>
                  </div>

                  {gruposExpandidos[tipo] && (
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                      {lista.map((excecao) => (
                        <div key={`excecao-${excecao.id}`} className="p-4 space-y-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {excecao.descricao || 'Exceção'}
                            </p>
                            <p className="text-xs text-gray-600">{formatarDestino(excecao)}</p>
                          </div>

                          {excecao.observacoes && (
                            <p className="text-xs text-gray-600 italic whitespace-pre-line">
                              {excecao.observacoes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {totalFiltradas === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">
                  Nenhum resultado encontrado para "{searchTerm}".
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
