import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

const CalendarSelector = ({ 
  tipoPeriodicidade, 
  regrasCalendario, 
  onRegrasChange, 
  disabled = false 
}) => {
  const diasSemana = [
    { id: 1, nome: 'Segunda', short: 'Seg' },
    { id: 2, nome: 'Terça', short: 'Ter' },
    { id: 3, nome: 'Quarta', short: 'Qua' },
    { id: 4, nome: 'Quinta', short: 'Qui' },
    { id: 5, nome: 'Sexta', short: 'Sex' },
    { id: 6, nome: 'Sábado', short: 'Sáb' },
    { id: 0, nome: 'Domingo', short: 'Dom' }
  ];

  // Função para normalizar os dados e garantir comparação correta
  const isDiaSelecionado = (diaId) => {
    const diasSelecionados = regrasCalendario?.dias_semana || [];
    return diasSelecionados.includes(diaId) || diasSelecionados.includes(diaId.toString());
  };

  const quinzenas = [
    { id: 'primeira_quinzena', nome: 'Primeira quinzena (1-15)' },
    { id: 'segunda_quinzena', nome: 'Segunda quinzena (16-31)' },
    { id: 'semanas_impares', nome: 'Semanas ímpares (1ª, 3ª, 5ª)' },
    { id: 'semanas_pares', nome: 'Semanas pares (2ª, 4ª)' },
    { id: 'ultima_semana', nome: 'Última semana do mês' }
  ];

  const diasMes = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleDiaSemanaChange = (diaId, checked) => {
    const diasAtuais = regrasCalendario?.dias_semana || [];
    let novosDias;
    
    if (checked) {
      novosDias = [...diasAtuais, diaId];
    } else {
      novosDias = diasAtuais.filter(dia => dia !== diaId);
    }
    
    onRegrasChange({
      ...regrasCalendario,
      dias_semana: novosDias
    });
  };

  const handleQuinzenaChange = (quinzena) => {
    onRegrasChange({
      ...regrasCalendario,
      quinzena: quinzena
    });
  };

  const handleDiaMesChange = (dia, checked) => {
    const diasAtuais = regrasCalendario?.dias_mes || [];
    let novosDias;
    
    if (checked) {
      novosDias = [...diasAtuais, dia];
    } else {
      novosDias = diasAtuais.filter(d => d !== dia);
    }
    
    onRegrasChange({
      ...regrasCalendario,
      dias_mes: novosDias
    });
  };

  const handleDiaMesUnicoChange = (dia) => {
    onRegrasChange({
      ...regrasCalendario,
      dia_mes: dia ? parseInt(dia) : null
    });
  };

  const renderSemanal = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dias da Semana *
        </label>
        <div className="grid grid-cols-7 gap-2">
          {diasSemana.map(dia => (
            <label key={dia.id} className="flex flex-col items-center">
              <input
                type="checkbox"
                checked={isDiaSelecionado(dia.id)}
                onChange={(e) => handleDiaSemanaChange(dia.id, e.target.checked)}
                disabled={disabled}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-xs text-gray-600 mt-1">{dia.short}</span>
            </label>
          ))}
        </div>
        {regrasCalendario?.dias_semana?.length === 0 && (
          <p className="text-sm text-red-600 mt-1">Selecione pelo menos um dia da semana</p>
        )}
      </div>
    </div>
  );

  const renderQuinzenal = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dias da Semana *
        </label>
        <div className="grid grid-cols-7 gap-2">
          {diasSemana.map(dia => (
            <label key={dia.id} className="flex flex-col items-center">
              <input
                type="checkbox"
                checked={isDiaSelecionado(dia.id)}
                onChange={(e) => handleDiaSemanaChange(dia.id, e.target.checked)}
                disabled={disabled}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-xs text-gray-600 mt-1">{dia.short}</span>
            </label>
          ))}
        </div>
        {regrasCalendario?.dias_semana?.length === 0 && (
          <p className="text-sm text-red-600 mt-1">Selecione pelo menos um dia da semana</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quinzena *
        </label>
        <div className="space-y-2">
          {quinzenas.map(quinzena => (
            <label key={quinzena.id} className="flex items-center">
              <input
                type="radio"
                name="quinzena"
                value={quinzena.id}
                checked={regrasCalendario?.quinzena === quinzena.id}
                onChange={(e) => handleQuinzenaChange(e.target.value)}
                disabled={disabled}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">{quinzena.nome}</span>
            </label>
          ))}
        </div>
        {!regrasCalendario?.quinzena && (
          <p className="text-sm text-red-600 mt-1">Selecione uma quinzena</p>
        )}
      </div>
    </div>
  );

  const renderMensal = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dias da Semana *
        </label>
        <div className="grid grid-cols-7 gap-2">
          {diasSemana.map(dia => (
            <label key={dia.id} className="flex flex-col items-center">
              <input
                type="checkbox"
                checked={isDiaSelecionado(dia.id)}
                onChange={(e) => handleDiaSemanaChange(dia.id, e.target.checked)}
                disabled={disabled}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-xs text-gray-600 mt-1">{dia.short}</span>
            </label>
          ))}
        </div>
        {regrasCalendario?.dias_semana?.length === 0 && (
          <p className="text-sm text-red-600 mt-1">Selecione pelo menos um dia da semana</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Entrega *
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="tipo_mensal"
              value="primeira"
              checked={regrasCalendario?.tipo_mensal === 'primeira'}
              onChange={() => onRegrasChange({ ...regrasCalendario, tipo_mensal: 'primeira' })}
              disabled={disabled}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Primeira ocorrência do mês</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tipo_mensal"
              value="ultima"
              checked={regrasCalendario?.tipo_mensal === 'ultima'}
              onChange={() => onRegrasChange({ ...regrasCalendario, tipo_mensal: 'ultima' })}
              disabled={disabled}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Última ocorrência do mês</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tipo_mensal"
              value="primeira_ultima"
              checked={regrasCalendario?.tipo_mensal === 'primeira_ultima'}
              onChange={() => onRegrasChange({ ...regrasCalendario, tipo_mensal: 'primeira_ultima' })}
              disabled={disabled}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Primeira e última ocorrência do mês</span>
          </label>
        </div>
        {!regrasCalendario?.tipo_mensal && (
          <p className="text-sm text-red-600 mt-1">Selecione um tipo de entrega</p>
        )}
      </div>
    </div>
  );

  const getTipoNome = () => {
    switch (tipoPeriodicidade) {
      case 'semanal': return 'Semanal';
      case 'quinzenal': return 'Quinzenal';
      case 'mensal': return 'Mensal';
      default: return 'Selecione um tipo';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center mb-4">
        <FaCalendarAlt className="h-5 w-5 text-green-600 mr-2" />
        <h3 className="text-sm font-semibold text-gray-700">
          Configuração do Calendário - {getTipoNome()}
        </h3>
      </div>
      
      {tipoPeriodicidade === 'semanal' && renderSemanal()}
      {tipoPeriodicidade === 'quinzenal' && renderQuinzenal()}
      {tipoPeriodicidade === 'mensal' && renderMensal()}
      
      {!tipoPeriodicidade && (
        <p className="text-sm text-gray-500 italic">
          Selecione um tipo de periodicidade para configurar o calendário
        </p>
      )}
    </div>
  );
};

export default CalendarSelector;
