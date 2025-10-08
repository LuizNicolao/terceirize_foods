import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUsers, FaWarehouse, FaBuilding, FaClipboardList, FaUtensils, FaCalendarAlt } from 'react-icons/fa';
import { Button, Input, Modal, MaskedFormInput } from '../ui';
import { usePermissions } from '../../contexts/PermissionsContext';

const UnidadeEscolarModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  unidade, 
  isViewMode = false,
  rotas = [],
  loadingRotas = false,
  filiais = [],
  loadingFiliais = false
}) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [activeTab, setActiveTab] = useState('info'); // Para implantacao, só usamos 'info'
  const { canView, canEdit, canDelete, canMovimentar } = usePermissions();

  React.useEffect(() => {
    if (isOpen) {
      if (unidade) {
        // Preencher formulário com dados da unidade escolar
        const unidadeData = unidade.data || unidade;
        Object.keys(unidadeData).forEach(key => {
          if (unidadeData[key] !== null && unidadeData[key] !== undefined) {
            setValue(key, unidadeData[key]);
          }
        });
      } else {
        // Resetar formulário para nova unidade escolar
        reset();
        setValue('status', 'ativo');
        setValue('pais', 'Brasil');
      }
      // Para implantacao, sempre usar aba de informações
      setActiveTab('info');
    }
  }, [unidade, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    setActiveTab('info');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? 'Visualizar Unidade Escolar' : unidade ? 'Editar Unidade Escolar' : 'Adicionar Unidade Escolar'}
      size="full"
    >
      {/* Para implantacao, só mostramos as informações básicas */}

      {/* Conteúdo das Abas */}
      {activeTab === 'info' && (
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

              <MaskedFormInput
                label="CEP"
                maskType="cep"
                register={register}
                fieldName="cep"
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
              <MaskedFormInput
                label="Telefone"
                maskType="telefone"
                register={register}
                fieldName="telefone"
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
              {isViewMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filial
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {unidade?.filial_nome || unidade?.filial || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rota
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {unidade?.rota_nome || unidade?.rota || '-'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label="Filial"
                    type="select"
                    {...register('filial_id')}
                    disabled={loadingFiliais}
                  >
                    <option value="">
                      {loadingFiliais ? 'Carregando filiais...' : 'Selecione uma filial'}
                    </option>
                    {filiais.map(filial => (
                      <option key={filial.id} value={filial.id}>
                        {filial.filial} ({filial.codigo_filial})
                      </option>
                    ))}
                  </Input>

                  <Input
                    label="Rota"
                    type="select"
                    {...register('rota_id')}
                    disabled={loadingRotas}
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
                </>
              )}

              <Input
                label="Centro de Distribuição"
                type="text"
                placeholder="Centro de distribuição"
                {...register('centro_distribuicao')}
                disabled={isViewMode}
              />

              {isViewMode ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="bg-white p-2 rounded border">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      unidade?.status === 'ativo' || unidade?.status === 1
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {unidade?.status === 'ativo' || unidade?.status === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ) : (
                <Input
                  label="Status"
                  type="select"
                  {...register('status')}
                >
                  <option value="">Selecione o status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </Input>
              )}
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
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {unidade ? 'Atualizar' : 'Criar'} Unidade Escolar
            </Button>
          </div>
        )}
      </form>
      )}






    </Modal>
  );
};

export default UnidadeEscolarModal;
