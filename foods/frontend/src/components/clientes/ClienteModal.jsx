import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaSearch } from 'react-icons/fa';
import { Modal, Button, Input } from '../ui';

const ClienteModal = ({ isOpen, onClose, onSubmit, cliente, isViewMode }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (cliente) {
        // Preencher formulário com dados do cliente
        Object.keys(cliente).forEach(key => {
          setValue(key, cliente[key]);
        });
      } else {
        // Limpar formulário para novo cliente
        reset();
      }
    }
  }, [isOpen, cliente, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const buscarCNPJ = async () => {
    const cnpj = document.getElementById('cnpj').value;
    if (!cnpj || cnpj.length < 14) {
      alert('Digite um CNPJ válido');
      return;
    }

    try {
      // Aqui você pode implementar a busca do CNPJ via API
      console.log('Buscando CNPJ:', cnpj);
      // const result = await ClientesService.buscarCNPJ(cnpj);
      // if (result.success) {
      //   setValue('razao_social', result.data.razao_social);
      //   setValue('nome_fantasia', result.data.nome_fantasia);
      //   // ... outros campos
      // }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isViewMode ? 'Visualizar Cliente' : cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CNPJ */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="cnpj"
                    label="CNPJ"
                    {...register('cnpj', { 
                      required: 'CNPJ é obrigatório',
                      pattern: {
                        value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                        message: 'CNPJ deve estar no formato 00.000.000/0000-00'
                      }
                    })}
                    error={errors.cnpj?.message}
                    disabled={isViewMode}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                {!isViewMode && (
                  <Button
                    type="button"
                    onClick={buscarCNPJ}
                    variant="outline"
                    className="mt-6"
                  >
                    <FaSearch className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Razão Social */}
            <div className="md:col-span-2">
              <Input
                label="Razão Social"
                {...register('razao_social', { 
                  required: 'Razão social é obrigatória',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                })}
                error={errors.razao_social?.message}
                disabled={isViewMode}
                placeholder="Razão Social da empresa"
              />
            </div>

            {/* Nome Fantasia */}
            <div className="md:col-span-2">
              <Input
                label="Nome Fantasia"
                {...register('nome_fantasia')}
                error={errors.nome_fantasia?.message}
                disabled={isViewMode}
                placeholder="Nome Fantasia (opcional)"
              />
            </div>

            {/* Endereço */}
            <div className="md:col-span-2">
              <Input
                label="Logradouro"
                {...register('logradouro', { required: 'Logradouro é obrigatório' })}
                error={errors.logradouro?.message}
                disabled={isViewMode}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            {/* Número e CEP */}
            <div>
              <Input
                label="Número"
                {...register('numero')}
                error={errors.numero?.message}
                disabled={isViewMode}
                placeholder="Número"
              />
            </div>

            <div>
              <Input
                label="CEP"
                {...register('cep', {
                  pattern: {
                    value: /^\d{5}-\d{3}$/,
                    message: 'CEP deve estar no formato 00000-000'
                  }
                })}
                error={errors.cep?.message}
                disabled={isViewMode}
                placeholder="00000-000"
              />
            </div>

            {/* Bairro e Município */}
            <div>
              <Input
                label="Bairro"
                {...register('bairro')}
                error={errors.bairro?.message}
                disabled={isViewMode}
                placeholder="Bairro"
              />
            </div>

            <div>
              <Input
                label="Município"
                {...register('municipio', { required: 'Município é obrigatório' })}
                error={errors.municipio?.message}
                disabled={isViewMode}
                placeholder="Cidade"
              />
            </div>

            {/* UF e País */}
            <div>
              <Input
                label="UF"
                {...register('uf', { 
                  required: 'UF é obrigatória',
                  maxLength: { value: 2, message: 'Máximo 2 caracteres' }
                })}
                error={errors.uf?.message}
                disabled={isViewMode}
                placeholder="SP"
              />
            </div>

            <div>
              <Input
                label="País"
                {...register('pais')}
                error={errors.pais?.message}
                disabled={isViewMode}
                placeholder="Brasil"
              />
            </div>

            {/* Email e Telefone */}
            <div>
              <Input
                label="Email"
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                })}
                error={errors.email?.message}
                disabled={isViewMode}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <Input
                label="Telefone"
                {...register('telefone')}
                error={errors.telefone?.message}
                disabled={isViewMode}
                placeholder="(11) 99999-9999"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status', { required: 'Status é obrigatório' })}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.status ? 'border-red-300' : 'border-gray-300'
                } ${isViewMode ? 'bg-gray-100' : 'bg-white'}`}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                {...register('observacoes')}
                disabled={isViewMode}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.observacoes ? 'border-red-300' : 'border-gray-300'
                } ${isViewMode ? 'bg-gray-100' : 'bg-white'}`}
                placeholder="Observações adicionais..."
              />
              {errors.observacoes && (
                <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          {!isViewMode && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex items-center"
              >
                <FaSave className="mr-2 h-4 w-4" />
                {cliente ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default ClienteModal;
