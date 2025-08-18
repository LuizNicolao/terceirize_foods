import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, FormattedInput } from '../ui';

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

const MotoristaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  motorista, 
  isViewMode = false,
  filiais = [],
  loadingFiliais = false
}) => {
  const { register, handleSubmit, reset, setValue } = useForm();

  React.useEffect(() => {
    if (motorista && isOpen) {
      // Preencher formulário com dados do motorista
      Object.keys(motorista).forEach(key => {
        if (motorista[key] !== null && motorista[key] !== undefined) {
          // Tratamento especial para campos de data
          if (key.includes('data_') || key.includes('validade')) {
            setValue(key, formatDateForInput(motorista[key]));
          } else {
            setValue(key, motorista[key]);
          }
        }
      });
    } else if (!motorista && isOpen) {
      // Resetar formulário para novo motorista
      reset();
      setValue('status', 'ativo');
    }
  }, [motorista, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    // Converter datas para o formato esperado pelo backend
    const processedData = { ...data };
    
    // Lista de campos de data
    const dateFields = [
      'data_admissao',
      'cnh_validade'
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
      title={isViewMode ? 'Visualizar Motorista' : motorista ? 'Editar Motorista' : 'Adicionar Motorista'}
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
                placeholder="Nome completo do motorista"
                {...register('nome')}
                disabled={isViewMode}
              />
              
              <FormattedInput
                label="CPF"
                formatType="cpf"
                type="text"
                placeholder="000.000.000-00"
                {...register('cpf')}
                disabled={isViewMode}
              />
              
              <FormattedInput
                label="Telefone"
                formatType="phone"
                type="text"
                placeholder="(00) 00000-0000"
                {...register('telefone')}
                disabled={isViewMode}
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="email@exemplo.com"
                {...register('email')}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Documentação */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Documentação
            </h3>
            <div className="space-y-3">
              <Input
                label="CNH"
                type="text"
                placeholder="Número da CNH"
                {...register('cnh')}
                disabled={isViewMode}
              />
              
              <Input
                label="Categoria CNH"
                type="select"
                {...register('categoria_cnh')}
                disabled={isViewMode}
              >
                <option value="">Selecione a categoria</option>
                <option value="A">A - Motocicletas</option>
                <option value="B">B - Automóveis</option>
                <option value="C">C - Caminhões</option>
                <option value="D">D - Ônibus</option>
                <option value="E">E - Reboques</option>
                <option value="AB">AB - Motos e Carros</option>
                <option value="AC">AC - Motos e Caminhões</option>
                <option value="AD">AD - Motos e Ônibus</option>
                <option value="AE">AE - Motos e Reboques</option>
                <option value="BC">BC - Carros e Caminhões</option>
                <option value="BD">BD - Carros e Ônibus</option>
                <option value="BE">BE - Carros e Reboques</option>
                <option value="CD">CD - Caminhões e Ônibus</option>
                <option value="CE">CE - Caminhões e Reboques</option>
                <option value="DE">DE - Ônibus e Reboques</option>
              </Input>
              
              <Input
                label="Validade CNH"
                type="date"
                {...register('cnh_validade')}
                disabled={isViewMode}
              />
              
              <Input
                label="Data de Admissão"
                type="date"
                {...register('data_admissao')}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Segunda Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 3: Localização e Status */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Localização e Status
            </h3>
            <div className="space-y-3">
              <Input
                label="Filial"
                type="select"
                {...register('filial_id')}
                disabled={isViewMode || loadingFiliais}
              >
                <option value="">
                  {loadingFiliais ? 'Carregando filiais...' : 'Selecione uma filial'}
                </option>
                {filiais.map(filial => (
                  <option key={filial.id} value={filial.id}>
                    {filial.filial}
                  </option>
                ))}
              </Input>
              
              <Input
                label="Status"
                type="select"
                {...register('status')}
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

          {/* Card 4: Observações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Observações
            </h3>
            <div className="space-y-3">
              <Input
                label="Endereço"
                type="textarea"
                placeholder="Endereço completo"
                {...register('endereco')}
                disabled={isViewMode}
              />
              
              <Input
                label="Observações"
                type="textarea"
                placeholder="Observações sobre o motorista"
                {...register('observacoes')}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {motorista ? 'Atualizar' : 'Criar'} Motorista
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default MotoristaModal;
