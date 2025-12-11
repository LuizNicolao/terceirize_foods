import React, { useState, useMemo } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import CardapioPratosModal from '../CardapioPratosModal';

/**
 * Seção de Calendário do Cardápio
 */
const Calendario = ({
  formData,
  isViewMode,
  onInputChange
}) => {
  const [modalPratos, setModalPratos] = useState({
    isOpen: false,
    data: null,
    periodoAtendimentoId: null,
    produtoComercialId: null
  });

  const { mes_referencia, ano_referencia, numero_semanas, periodos_atendimento, produtos_comerciais, pratos = [] } = formData;

  // Validar se pode exibir calendário
  const podeExibirCalendario = mes_referencia && ano_referencia && numero_semanas && 
                                (periodos_atendimento || []).length > 0;

  // Gerar dias do calendário
  const diasCalendario = useMemo(() => {
    if (!podeExibirCalendario) return [];

    const mes = parseInt(mes_referencia);
    const ano = parseInt(ano_referencia);
    const semanas = parseInt(numero_semanas);

    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes - 1, 1);
    const diaSemana = primeiroDia.getDay(); // 0 = domingo, 1 = segunda, etc.

    // Ajustar para segunda-feira como primeiro dia (0 = segunda)
    const diaSemanaAjustado = diaSemana === 0 ? 6 : diaSemana - 1;

    // Primeira segunda-feira do mês (ou antes, se o mês começar na segunda)
    const primeiraSegunda = new Date(primeiroDia);
    primeiraSegunda.setDate(primeiraSegunda.getDate() - diaSemanaAjustado);

    const dias = [];
    const totalDias = semanas * 7;

    for (let i = 0; i < totalDias; i++) {
      const data = new Date(primeiraSegunda);
      data.setDate(primeiraSegunda.getDate() + i);

      // Verificar se o dia está dentro do mês de referência
      const estaNoMes = data.getMonth() === mes - 1 && data.getFullYear() === ano;

      dias.push({
        data: data.toISOString().split('T')[0],
        dia: data.getDate(),
        mes: data.getMonth() + 1,
        ano: data.getFullYear(),
        diaSemana: data.getDay(),
        estaNoMes
      });
    }

    return dias;
  }, [mes_referencia, ano_referencia, numero_semanas, podeExibirCalendario]);

  // Dividir dias em semanas
  const semanasCalendario = useMemo(() => {
    const semanas = [];
    for (let i = 0; i < diasCalendario.length; i += 7) {
      semanas.push(diasCalendario.slice(i, i + 7));
    }
    return semanas;
  }, [diasCalendario]);

  // Obter pratos de um dia específico
  const getPratosDoDia = (data) => {
    return pratos.filter(p => p.data === data);
  };

  // Abrir modal de pratos
  const handleAbrirModalPratos = (data, periodoId, produtoComercialId) => {
    setModalPratos({
      isOpen: true,
      data,
      periodoAtendimentoId: periodoId,
      produtoComercialId
    });
  };

  // Adicionar pratos ao dia
  const handleAdicionarPratos = (pratosSelecionados) => {
    const { data, periodoAtendimentoId, produtoComercialId } = modalPratos;

    const novosPratos = pratosSelecionados.map((prato, index) => ({
      data,
      periodo_atendimento_id: periodoAtendimentoId,
      prato_id: prato.id,
      prato_nome: prato.nome || `Prato ${prato.id}`,
      produto_comercial_id: produtoComercialId || null,
      ordem: index + 1
    }));

    onInputChange('pratos', [...pratos, ...novosPratos]);
    setModalPratos({ isOpen: false, data: null, periodoAtendimentoId: null, produtoComercialId: null });
  };

  // Remover prato
  const handleRemoverPrato = (pratoIndex) => {
    const novosPratos = pratos.filter((_, index) => index !== pratoIndex);
    onInputChange('pratos', novosPratos);
  };

  const nomesDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  if (!podeExibirCalendario) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800 text-sm">
          Preencha as informações básicas (mês, ano, número de semanas) e selecione períodos de atendimento para visualizar o calendário.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendário */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {nomesDias.map((dia, index) => (
            <div key={index} className="p-2 text-center text-xs font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
              {dia}
            </div>
          ))}
        </div>

        {/* Todas as semanas do calendário */}
        {semanasCalendario.map((semana, semanaIndex) => (
          <div key={semanaIndex} className="grid grid-cols-7">
            {semana.map((dia, index) => {
            const pratosDoDia = getPratosDoDia(dia.data);
            const estaNoMes = dia.estaNoMes;

            return (
              <div
                key={index}
                className={`min-h-32 p-2 border-r border-b border-gray-200 last:border-r-0 ${
                  estaNoMes ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${estaNoMes ? 'text-gray-900' : 'text-gray-400'}`}>
                    {dia.dia}
                  </span>
                  {estaNoMes && !isViewMode && (
                    <button
                      type="button"
                      onClick={() => {
                        // Abrir modal para primeiro período e primeiro produto comercial
                        const primeiroPeriodo = (periodos_atendimento || [])[0];
                        const primeiroProduto = (produtos_comerciais || [])[0];
                        if (primeiroPeriodo) {
                          handleAbrirModalPratos(
                            dia.data,
                            primeiroPeriodo.id,
                            primeiroProduto?.id || null
                          );
                        }
                      }}
                      className="text-green-600 hover:text-green-800 text-xs"
                      title="Adicionar prato"
                    >
                      <FaPlus />
                    </button>
                  )}
                </div>

                {/* Lista de pratos do dia */}
                <div className="space-y-1">
                  {pratosDoDia.map((prato, pratoIndex) => {
                    const pratoIndexGlobal = pratos.findIndex(p => 
                      p.data === prato.data && 
                      p.periodo_atendimento_id === prato.periodo_atendimento_id &&
                      p.prato_id === prato.prato_id
                    );

                    return (
                      <div
                        key={pratoIndex}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center justify-between"
                      >
                        <span className="truncate">{prato.prato_nome || `Prato ${prato.prato_id}`}</span>
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => handleRemoverPrato(pratoIndexGlobal)}
                            className="ml-1 text-red-600 hover:text-red-800"
                            title="Remover prato"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            })}
          </div>
        ))}
      </div>

      {/* Modal de seleção de pratos */}
      <CardapioPratosModal
        isOpen={modalPratos.isOpen}
        onClose={() => setModalPratos({ isOpen: false, data: null, periodoAtendimentoId: null, produtoComercialId: null })}
        onSelect={handleAdicionarPratos}
        periodoAtendimentoId={modalPratos.periodoAtendimentoId}
        produtoComercialId={modalPratos.produtoComercialId}
        pratosJaAdicionados={modalPratos.data ? getPratosDoDia(modalPratos.data) : []}
      />
    </div>
  );
};

export default Calendario;

