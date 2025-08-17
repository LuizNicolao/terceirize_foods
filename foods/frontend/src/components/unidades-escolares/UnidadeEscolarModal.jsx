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
  const { register, handleSubmit, reset, setValue } = useForm();

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
                {...register('codigo_teknisa')}
                disabled={isViewMode}
              />

              <Input
                label="Nome da Escola *"
                type="text"
                placeholder="Nome da escola"
                {...register('nome_escola')}
                disabled={isViewMode}
              />

              <Input
                label="Cidade *"
                type="text"
                placeholder="Cidade"
                {...register('cidade')}
                disabled={isViewMode}
              />

              <Input
                label="Estado *"
                type="text"
                placeholder="Estado"
                {...register('estado')}
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
                {...register('pais')}
                disabled={isViewMode}
              />

              <Input
                label="CEP"
                type="text"
                placeholder="00000-000"
                {...register('cep')}
                disabled={isViewMode}
              />

              <Input
                label="Endereço *"
                type="text"
                placeholder="Endereço completo"
                {...register('endereco')}
                disabled={isViewMode}
              />

              <Input
                label="Bairro"
                type="text"
                placeholder="Bairro"
                {...register('bairro')}
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
                {...register('telefone')}
                disabled={isViewMode}
              />

              <Input
                label="Email"
                type="email"
                placeholder="email@escola.com"
                {...register('email')}
                disabled={isViewMode}
              />

              <Input
                label="Diretor"
                type="text"
                placeholder="Nome do diretor"
                {...register('diretor')}
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
                {...register('centro_distribuicao')}
                disabled={isViewMode}
              />

              <Input
                label="Status"
                type="select"
                {...register('status')}
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
              {unidade ? 'Atualizar' : 'Criar'} Unidade Escolar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UnidadeEscolarModal;
