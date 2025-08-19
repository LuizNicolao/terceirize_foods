import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../ui';

const FilialForm = ({ 
  onSubmit, 
  initialData = null, 
  viewMode = false, 
  onConsultarCNPJ,
  loading = false 
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  const cnpj = watch('cnpj');

  // Função para consultar CNPJ
  const handleConsultarCNPJClick = async () => {
    if (!cnpj) {
      return;
    }
    
    const dados = await onConsultarCNPJ(cnpj);
    if (dados) {
      Object.keys(dados).forEach(key => {
        setValue(key, dados[key]);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Código da Filial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código da Filial
          </label>
          <Input
            type="text"
            placeholder="Código da filial"
            {...register('codigo_filial')}
            disabled={viewMode}
          />
        </div>

        {/* CNPJ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNPJ
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="00.000.000/0000-00"
              {...register('cnpj')}
              disabled={viewMode}
              className="flex-1"
            />
            {!viewMode && (
              <Button
                type="button"
                variant="info"
                size="sm"
                onClick={handleConsultarCNPJClick}
                disabled={!cnpj}
              >
                Consultar
              </Button>
            )}
          </div>
        </div>

        {/* Filial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filial *
          </label>
          <Input
            type="text"
            placeholder="Nome da filial"
            {...register('filial', { required: 'Nome da filial é obrigatório' })}
            disabled={viewMode}
            error={errors.filial?.message}
          />
        </div>

        {/* Razão Social */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razão Social *
          </label>
          <Input
            type="text"
            placeholder="Razão social da empresa"
            {...register('razao_social', { required: 'Razão social é obrigatória' })}
            disabled={viewMode}
            error={errors.razao_social?.message}
          />
        </div>

        {/* Logradouro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logradouro
          </label>
          <Input
            type="text"
            placeholder="Rua, avenida, etc."
            {...register('logradouro')}
            disabled={viewMode}
          />
        </div>

        {/* Número */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número
          </label>
          <Input
            type="text"
            placeholder="Número"
            {...register('numero')}
            disabled={viewMode}
          />
        </div>

        {/* Bairro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro
          </label>
          <Input
            type="text"
            placeholder="Bairro"
            {...register('bairro')}
            disabled={viewMode}
          />
        </div>

        {/* CEP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP
          </label>
          <Input
            type="text"
            placeholder="00000-000"
            {...register('cep')}
            disabled={viewMode}
          />
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade
          </label>
          <Input
            type="text"
            placeholder="Cidade"
            {...register('cidade')}
            disabled={viewMode}
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            {...register('estado')}
            disabled={viewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Selecione...</option>
            <option value="AC">AC</option>
            <option value="AL">AL</option>
            <option value="AP">AP</option>
            <option value="AM">AM</option>
            <option value="BA">BA</option>
            <option value="CE">CE</option>
            <option value="DF">DF</option>
            <option value="ES">ES</option>
            <option value="GO">GO</option>
            <option value="MA">MA</option>
            <option value="MT">MT</option>
            <option value="MS">MS</option>
            <option value="MG">MG</option>
            <option value="PA">PA</option>
            <option value="PB">PB</option>
            <option value="PR">PR</option>
            <option value="PE">PE</option>
            <option value="PI">PI</option>
            <option value="RJ">RJ</option>
            <option value="RN">RN</option>
            <option value="RO">RO</option>
            <option value="RR">RR</option>
            <option value="SC">SC</option>
            <option value="SP">SP</option>
            <option value="SE">SE</option>
            <option value="TO">TO</option>
          </select>
        </div>

        {/* Supervisão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supervisão
          </label>
          <Input
            type="text"
            placeholder="Supervisão"
            {...register('supervisao')}
            disabled={viewMode}
          />
        </div>

        {/* Coordenação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coordenação
          </label>
          <Input
            type="text"
            placeholder="Coordenação"
            {...register('coordenacao')}
            disabled={viewMode}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            {...register('status', { required: 'Status é obrigatório' })}
            disabled={viewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      {!viewMode && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {initialData ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default FilialForm; 