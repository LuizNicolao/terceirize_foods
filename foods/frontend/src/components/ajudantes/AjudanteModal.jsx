import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '../../ui';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaBuilding, FaStickyNote } from 'react-icons/fa';

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
      Object.keys(ajudante).forEach(key => {
        if (ajudante[key] !== null && ajudante[key] !== undefined) {
          if (key.includes('data_')) {
            setValue(key, ajudante[key] ? ajudante[key].split('T')[0] : '');
          } else {
            setValue(key, ajudante[key]);
          }
        }
      });
    } else if (!ajudante && isOpen) {
      reset();
      setValue('status', 'ativo');
    }
  }, [ajudante, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Ajudante' : ajudante ? 'Editar Ajudante' : 'Novo Ajudante'}
      size="2xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Informações Pessoais */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FaUser className="w-5 h-5 text-blue-600" />
            Informações Pessoais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome *"
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
              {...register('cpf', { 
                maxLength: { value: 14, message: 'CPF deve ter no máximo 14 caracteres' }
              })}
              error={errors.cpf?.message}
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* Contato */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FaPhone className="w-5 h-5 text-green-600" />
            Contato
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefone"
              {...register('telefone', { 
                maxLength: { value: 20, message: 'Telefone deve ter no máximo 20 caracteres' }
              })}
              error={errors.telefone?.message}
              disabled={isViewMode}
            />
            
            <Input
              label="Email"
              type="email"
              {...register('email', { 
                pattern: { 
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                  message: 'Email inválido' 
                },
                maxLength: { value: 100, message: 'Email deve ter no máximo 100 caracteres' }
              })}
              error={errors.email?.message}
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="w-5 h-5 text-red-600" />
            Endereço
          </h3>
          
          <Input
            label="Endereço"
            {...register('endereco', { 
              maxLength: { value: 500, message: 'Endereço deve ter no máximo 500 caracteres' }
            })}
            error={errors.endereco?.message}
            disabled={isViewMode}
            multiline
            rows={3}
          />
        </div>

        {/* Informações Profissionais */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FaBuilding className="w-5 h-5 text-purple-600" />
            Informações Profissionais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="ferias">Em Férias</option>
                <option value="licenca">Em Licença</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filial
              </label>
              <select
                {...register('filial_id')}
                disabled={isViewMode || loadingFiliais}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Selecione uma filial</option>
                {filiais.map(filial => (
                  <option key={filial.id} value={filial.id}>
                    {filial.filial}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <Input
              label="Data de Admissão"
              type="date"
              {...register('data_admissao')}
              error={errors.data_admissao?.message}
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FaStickyNote className="w-5 h-5 text-yellow-600" />
            Observações
          </h3>
          
          <Input
            label="Observações"
            {...register('observacoes', { 
              maxLength: { value: 500, message: 'Observações devem ter no máximo 500 caracteres' }
            })}
            error={errors.observacoes?.message}
            disabled={isViewMode}
            multiline
            rows={3}
          />
        </div>

        {/* Botões */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {ajudante ? 'Atualizar' : 'Criar'} Ajudante
            </Button>
          </div>
        )}
        
        {isViewMode && (
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default AjudanteModal;
