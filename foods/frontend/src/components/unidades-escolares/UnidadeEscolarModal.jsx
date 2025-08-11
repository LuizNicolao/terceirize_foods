import React from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

const UnidadeEscolarModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  unidade, 
  isViewMode = false,
  rotas = [],
  loadingRotas = false
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  React.useEffect(() => {
    if (unidade && isOpen) {
      // Preencher formulário com dados da unidade escolar
      Object.keys(unidade).forEach(key => {
        if (unidade[key] !== null && unidade[key] !== undefined) {
          setValue(key, unidade[key]);
        }
      });
    } else if (!unidade && isOpen) {
      // Resetar formulário para nova unidade escolar
      reset();
      setValue('status', 'ativo');
      setValue('pais', 'Brasil');
    }
  }, [unidade, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Unidade Escolar' : unidade ? 'Editar Unidade Escolar' : 'Adicionar Unidade Escolar'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              <Input
                label="Código Teknisa *"
                type="text"
                placeholder="Código da unidade"
                {...register('codigo_teknisa', { 
                  required: 'Código Teknisa é obrigatório',
                  minLength: { value: 1, message: 'Código deve ter pelo menos 1 caractere' },
                  maxLength: { value: 50, message: 'Código deve ter no máximo 50 caracteres' }
                })}
                error={errors.codigo_teknisa?.message}
                disabled={isViewMode}
              />

              <Input
                label="Nome da Escola *"
                type="text"
                placeholder="Nome da escola"
                {...register('nome_escola', { 
                  required: 'Nome da escola é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
                  maxLength: { value: 200, message: 'Nome deve ter no máximo 200 caracteres' }
                })}
                error={errors.nome_escola?.message}
                disabled={isViewMode}
              />

              <Input
                label="Cidade *"
                type="text"
                placeholder="Cidade"
                {...register('cidade', { 
                  required: 'Cidade é obrigatória',
                  minLength: { value: 2, message: 'Cidade deve ter pelo menos 2 caracteres' },
                  maxLength: { value: 100, message: 'Cidade deve ter no máximo 100 caracteres' }
                })}
                error={errors.cidade?.message}
                disabled={isViewMode}
              />

              <Input
                label="Estado *"
                type="text"
                placeholder="Estado"
                {...register('estado', { 
                  required: 'Estado é obrigatório',
                  minLength: { value: 2, message: 'Estado deve ter 2 caracteres' },
                  maxLength: { value: 2, message: 'Estado deve ter 2 caracteres' }
                })}
                error={errors.estado?.message}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Localização */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Localização
            </h3>
            <div className="space-y-3">
              <Input
                label="País"
                type="text"
                placeholder="País"
                {...register('pais', {
                  maxLength: { value: 100, message: 'País deve ter no máximo 100 caracteres' }
                })}
                error={errors.pais?.message}
                disabled={isViewMode}
              />

              <Input
                label="CEP"
                type="text"
                placeholder="00000-000"
                {...register('cep', {
                  pattern: {
                    value: /^\d{5}-?\d{3}$/,
                    message: 'CEP deve estar no formato 00000-000'
                  }
                })}
                error={errors.cep?.message}
                disabled={isViewMode}
              />

              <Input
                label="Endereço *"
                type="text"
                placeholder="Endereço completo"
                {...register('endereco', { 
                  required: 'Endereço é obrigatório',
                  maxLength: { value: 300, message: 'Endereço deve ter no máximo 300 caracteres' }
                })}
                error={errors.endereco?.message}
                disabled={isViewMode}
              />

              <Input
                label="Bairro"
                type="text"
                placeholder="Bairro"
                {...register('bairro', {
                  maxLength: { value: 100, message: 'Bairro deve ter no máximo 100 caracteres' }
                })}
                error={errors.bairro?.message}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Segunda Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 3: Contato */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Contato
            </h3>
            <div className="space-y-3">
              <Input
                label="Telefone"
                type="text"
                placeholder="(00) 00000-0000"
                {...register('telefone', {
                  pattern: {
                    value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
                    message: 'Telefone deve estar no formato (00) 00000-0000'
                  }
                })}
                error={errors.telefone?.message}
                disabled={isViewMode}
              />

              <Input
                label="Email"
                type="email"
                placeholder="email@escola.com"
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email deve ser válido'
                  }
                })}
                error={errors.email?.message}
                disabled={isViewMode}
              />

              <Input
                label="Diretor"
                type="text"
                placeholder="Nome do diretor"
                {...register('diretor', {
                  maxLength: { value: 100, message: 'Diretor deve ter no máximo 100 caracteres' }
                })}
                error={errors.diretor?.message}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 4: Configurações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Configurações
            </h3>
            <div className="space-y-3">
              <Input
                label="Rota"
                type="select"
                {...register('rota_id')}
                error={errors.rota_id?.message}
                disabled={isViewMode || loadingRotas}
              >
                <option value="">
                  {loadingRotas ? 'Carregando rotas...' : 'Selecione uma rota'}
                </option>
                {rotas.map(rota => (
                  <option key={rota.id} value={rota.id}>
                    {rota.nome} ({rota.codigo})
                  </option>
                ))}
              </Input>

              <Input
                label="Centro de Distribuição"
                type="text"
                placeholder="Centro de distribuição"
                {...register('centro_distribuicao', {
                  maxLength: { value: 100, message: 'Centro de distribuição deve ter no máximo 100 caracteres' }
                })}
                error={errors.centro_distribuicao?.message}
                disabled={isViewMode}
              />

              <Input
                label="Status"
                type="select"
                {...register('status')}
                error={errors.status?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Input>
            </div>
          </div>
        </div>

        {/* Terceira Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 5: Observações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Observações
            </h3>
            <div className="space-y-3">
              <Input
                label="Observações"
                type="textarea"
                placeholder="Observações sobre a unidade escolar"
                {...register('observacoes', {
                  maxLength: { value: 500, message: 'Observações devem ter no máximo 500 caracteres' }
                })}
                error={errors.observacoes?.message}
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
              {unidade ? 'Atualizar' : 'Criar'} Unidade Escolar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UnidadeEscolarModal;
