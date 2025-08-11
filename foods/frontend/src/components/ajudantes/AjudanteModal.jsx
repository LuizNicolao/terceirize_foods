import React from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaBuilding, FaStickyNote } from 'react-icons/fa';
import { Modal, Input, Button } from '../ui';

const AjudanteModal = ({ show, viewMode, ajudante, filiais, onSubmit, onClose }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  React.useEffect(() => {
    if (ajudante) {
      reset(ajudante);
    } else {
      reset({});
    }
  }, [ajudante, reset]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateForBackend = (dateString) => {
    if (!dateString) return null;
    return dateString;
  };

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      data_admissao: formatDateForBackend(data.data_admissao),
      filial_id: data.filial_id ? parseInt(data.filial_id) : null
    };
    onSubmit(formattedData);
  };

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'ferias', label: 'Em Férias' },
    { value: 'licenca', label: 'Em Licença' }
  ];

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {viewMode ? 'Visualizar Ajudante' : ajudante ? 'Editar Ajudante' : 'Novo Ajudante'}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-600" />
              Informações Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome *"
                name="nome"
                register={register}
                validation={{ required: 'Nome é obrigatório' }}
                error={errors.nome}
                disabled={viewMode}
                icon={<FaUser />}
              />

              <Input
                label="CPF"
                name="cpf"
                register={register}
                validation={{ 
                  pattern: {
                    value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                    message: 'CPF deve estar no formato 000.000.000-00'
                  }
                }}
                error={errors.cpf}
                disabled={viewMode}
                icon={<FaIdCard />}
                placeholder="000.000.000-00"
              />

              <Input
                label="Telefone"
                name="telefone"
                register={register}
                error={errors.telefone}
                disabled={viewMode}
                icon={<FaPhone />}
                placeholder="(00) 00000-0000"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                register={register}
                validation={{
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email deve ser válido'
                  }
                }}
                error={errors.email}
                disabled={viewMode}
                icon={<FaEnvelope />}
              />
            </div>
          </div>

          {/* Informações de Trabalho */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaBuilding className="mr-2 text-green-600" />
              Informações de Trabalho
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filial
                </label>
                <select
                  {...register('filial_id')}
                  disabled={viewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Selecione uma filial</option>
                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.filial}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  disabled={viewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Data de Admissão"
                name="data_admissao"
                type="date"
                register={register}
                error={errors.data_admissao}
                disabled={viewMode}
                icon={<FaCalendarAlt />}
                value={ajudante?.data_admissao ? formatDateForInput(ajudante.data_admissao) : ''}
              />
            </div>
          </div>

          {/* Endereço e Observações */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-red-600" />
              Endereço e Observações
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Endereço"
                name="endereco"
                register={register}
                error={errors.endereco}
                disabled={viewMode}
                icon={<FaMapMarkerAlt />}
                multiline
                rows={3}
              />

              <Input
                label="Observações"
                name="observacoes"
                register={register}
                error={errors.observacoes}
                disabled={viewMode}
                icon={<FaStickyNote />}
                multiline
                rows={3}
              />
            </div>
          </div>

          {/* Botões */}
          {!viewMode && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {ajudante ? 'Atualizar' : 'Criar'} Ajudante
              </Button>
            </div>
          )}

          {viewMode && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Fechar
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default AjudanteModal;
