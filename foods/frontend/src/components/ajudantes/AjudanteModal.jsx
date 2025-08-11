import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';

// Função para converter data do formato YYYY-MM-DD para o formato do input date
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

// Função para converter data do input para o formato esperado pelo backend
const formatDateForBackend = (dateString) => {
  if (!dateString) return null;
  return dateString;
};

const AjudanteModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  ajudante, 
  isViewMode = false,
  filiais = [],
  loadingFiliais = false
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  React.useEffect(() => {
    if (ajudante && isOpen) {
      // Preencher formulário com dados do ajudante
      Object.keys(ajudante).forEach(key => {
        if (ajudante[key] !== null && ajudante[key] !== undefined) {
          // Tratamento especial para campos de data
          if (key.includes('data_')) {
            setValue(key, formatDateForInput(ajudante[key]));
          } else {
            setValue(key, ajudante[key]);
          }
        }
      });
    } else if (!ajudante && isOpen) {
      // Resetar formulário para novo ajudante
      reset();
      setValue('status', 'ativo');
    }
  }, [ajudante, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    // Converter datas para o formato esperado pelo backend
    const processedData = { ...data };
    
    // Lista de campos de data
    const dateFields = [
      'data_admissao'
    ];
    
    // Processar cada campo de data
    dateFields.forEach(field => {
      if (processedData[field]) {
        processedData[field] = formatDateForBackend(processedData[field]);
      }
    });
    
    onSubmit(processedData);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Ajudante' : ajudante ? 'Editar Ajudante' : 'Adicionar Ajudante'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Pessoais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Pessoais
            </h3>
            <div className="space-y-3">
              <Input
                label="Nome *"
                type="text"
                placeholder="Nome completo do ajudante"
                {...register('nome', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
                  maxLength: { value: 100, message: 'Nome deve ter no máximo 100 caracteres' }
                })}
                error={errors.nome?.message}
                disabled={isViewMode}
              />
              <Input
                label="CPF"
                type="text"
                placeholder="000.000.000-00"
                {...register('cpf', { 
                  maxLength: { value: 14, message: 'CPF deve ter no máximo 14 caracteres' }
                })}
                error={errors.cpf?.message}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Informações de Contato */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações de Contato
            </h3>
            <div className="space-y-3">
              <Input
                label="Telefone"
                type="text"
                placeholder="(00) 00000-0000"
                {...register('telefone', { 
                  maxLength: { value: 20, message: 'Telefone deve ter no máximo 20 caracteres' }
                })}
                error={errors.telefone?.message}
                disabled={isViewMode}
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@exemplo.com"
                {...register('email', { 
                  pattern: { 
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                    message: 'Email inválido' 
                  }
                })}
                error={errors.email?.message}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Segunda Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 3: Informações Profissionais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Profissionais
            </h3>
            <div className="space-y-3">
              <Input
                label="Filial"
                type="select"
                {...register('filial_id')}
                error={errors.filial_id?.message}
                disabled={isViewMode || loadingFiliais}
              >
                <option value="">Selecione uma filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.nome}
                  </option>
                ))}
              </Input>
              <Input
                label="Data de Admissão"
                type="date"
                {...register('data_admissao')}
                error={errors.data_admissao?.message}
                disabled={isViewMode}
              />
              <Input
                label="Status *"
                type="select"
                {...register('status', { required: 'Status é obrigatório' })}
                error={errors.status?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="ferias">Em Férias</option>
                <option value="licenca">Em Licença</option>
              </Input>
            </div>
          </div>
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              {ajudante ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default AjudanteModal;
