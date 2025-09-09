import React from 'react';
import { FaEdit } from 'react-icons/fa';
import { Input } from '../../ui';
import CalendarSelector from '../CalendarSelector';

const PeriodicidadeForm = ({
  register,
  errors,
  tiposPeriodicidade,
  tipoSelecionado,
  regrasCalendario,
  setRegrasCalendario,
  isViewMode
}) => {
  return (
    <>
      {/* Card Principal */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
          <FaEdit className="inline mr-2" />
          Informações do Agrupamento
        </h3>
        <div className="space-y-4">
          <Input
            label="Nome *"
            type="text"
            placeholder="Ex: Segundas-feiras, Quinzenal A, Mensal 15"
            {...register('nome', { 
              required: 'Nome é obrigatório',
              minLength: {
                value: 2,
                message: 'Nome deve ter pelo menos 2 caracteres'
              },
              maxLength: {
                value: 100,
                message: 'Nome deve ter no máximo 100 caracteres'
              }
            })}
            error={errors.nome?.message}
            disabled={isViewMode}
          />
          
          <Input
            label="Descrição"
            type="textarea"
            placeholder="Descrição opcional do agrupamento"
            rows={3}
            {...register('descricao')}
            disabled={isViewMode}
          />
          
          <Input
            label="Tipo de Periodicidade *"
            type="select"
            {...register('tipo_id', { required: 'Tipo de periodicidade é obrigatório' })}
            disabled={isViewMode}
            error={errors.tipo_id?.message}
          >
            <option value="">Selecione um tipo</option>
            {tiposPeriodicidade.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome} - {tipo.descricao}
              </option>
            ))}
          </Input>
          
          <Input
            label="Status"
            type="select"
            {...register('ativo')}
            disabled={isViewMode}
          >
            <option value={true}>Ativo</option>
            <option value={false}>Inativo</option>
          </Input>
        </div>
      </div>

      {/* Configuração do Calendário */}
      {tipoSelecionado && (
        <CalendarSelector
          tipoPeriodicidade={tiposPeriodicidade.find(t => t.id == tipoSelecionado)?.nome}
          regrasCalendario={regrasCalendario}
          onRegrasChange={setRegrasCalendario}
          disabled={isViewMode}
        />
      )}
    </>
  );
};

export default PeriodicidadeForm;
