import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUsers, FaWarehouse, FaBuilding, FaClipboardList, FaUtensils, FaCalendarAlt } from 'react-icons/fa';
import { Button, Input, Modal, MaskedFormInput } from '../ui';
import EfetivosContent from './EfetivosContent';
import AlmoxarifadoContent from './AlmoxarifadoContent';
import TiposCardapioContent from './TiposCardapioContent';
import PeriodosRefeicaoContent from './PeriodosRefeicaoContent';
import PeriodicidadeContent from './PeriodicidadeContent';
import { PatrimoniosList } from '../patrimonios';
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
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'efetivos', 'almoxarifado', 'patrimonios', 'tipos-cardapio' ou 'periodos-refeicao'
  const { canView, canEdit, canDelete, canMovimentar } = usePermissions();

  React.useEffect(() => {
    if (isOpen) {
      if (unidade) {
        console.log('📊 Dados da unidade recebidos:', unidade);
        // Resetar formulário primeiro
        reset();
        
        // Aguardar um tick para garantir que o reset foi aplicado
        setTimeout(() => {
          // Preencher formulário com dados da unidade escolar
          Object.keys(unidade).forEach(key => {
            // Definir valor mesmo se for null/undefined (para limpar campos)
            const value = unidade[key] !== null && unidade[key] !== undefined ? unidade[key] : '';
            console.log(`📝 Campo ${key}:`, unidade[key], '→', value);
            setValue(key, value, { shouldValidate: false, shouldDirty: false });
          });
          
          // Garantir que campos padrão sejam definidos se não existirem
          if (!unidade.status) setValue('status', 'ativo', { shouldValidate: false, shouldDirty: false });
          if (!unidade.pais) setValue('pais', 'Brasil', { shouldValidate: false, shouldDirty: false });
        }, 0);
      } else {
        // Resetar formulário para nova unidade escolar
        reset();
        setValue('status', 'ativo');
        setValue('pais', 'Brasil');
      }
      // Resetar para aba de informações
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
      {/* Abas */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informações
          </button>
          {unidade && (
            <button
              onClick={() => setActiveTab('efetivos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'efetivos'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUsers className="text-sm" />
              Efetivos
            </button>
          )}
          {unidade && (
            <button
              onClick={() => setActiveTab('almoxarifado')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'almoxarifado'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaWarehouse className="text-sm" />
              Almoxarifado
            </button>
          )}
          {unidade && (
            <button
              onClick={() => setActiveTab('patrimonios')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'patrimonios'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBuilding />
              Patrimônios
            </button>
          )}
          {unidade && (
            <button
              onClick={() => setActiveTab('tipos-cardapio')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'tipos-cardapio'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaClipboardList />
              Tipos de Cardápio
            </button>
          )}
          {unidade && (
            <button
              onClick={() => setActiveTab('periodos-refeicao')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'periodos-refeicao'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUtensils />
              Períodos de Refeição
            </button>
          )}
          {unidade && (
            <button
              onClick={() => setActiveTab('periodicidade')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'periodicidade'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCalendarAlt />
              Periodicidade
            </button>
          )}
        </nav>
      </div>

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

              <Input
                label="Número"
                type="text"
                placeholder="Número"
                {...register('numero')}
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
          {/* Card 3: Informações Adicionais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Adicionais
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

          {/* Card 3: Configurações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Configurações
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
                    {filial.filial} ({filial.codigo_filial})
                  </option>
                ))}
              </Input>

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

        {/* Terceira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 4: Informações Operacionais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Operacionais
            </h3>
            <div className="space-y-3">
              <Input
                label="Regional"
                type="text"
                placeholder="Regional"
                {...register('regional')}
                disabled={isViewMode}
              />

              <Input
                label="LOTE"
                type="text"
                placeholder="Lote"
                {...register('lot')}
                disabled={isViewMode}
              />

              <Input
                label="C.C. Senior"
                type="text"
                placeholder="C.C. Senior"
                {...register('cc_senior')}
                disabled={isViewMode}
              />

              <Input
                label="Código Senior"
                type="text"
                placeholder="Código Senior"
                {...register('codigo_senior')}
                disabled={isViewMode}
              />

              <Input
                label="Abastecimento"
                type="text"
                placeholder="Tipo de abastecimento"
                {...register('abastecimento')}
                disabled={isViewMode}
              />

              <Input
                label="Ordem de Entrega"
                type="number"
                placeholder="Ordem de entrega"
                {...register('ordem_entrega')}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 5: Coordenação e Supervisão */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Coordenação e Supervisão
            </h3>
            <div className="space-y-3">
              <Input
                label="Supervisão"
                type="text"
                placeholder="Nome do supervisor"
                {...register('supervisao')}
                disabled={isViewMode}
              />

              <Input
                label="Coordenação"
                type="text"
                placeholder="Nome do coordenador"
                {...register('coordenacao')}
                disabled={isViewMode}
              />

              <Input
                label="LAT (Latitude)"
                type="number"
                step="any"
                placeholder="Ex: -23.5505"
                {...register('lat')}
                disabled={isViewMode}
              />

              <Input
                label="LONG (Longitude)"
                type="number"
                step="any"
                placeholder="Ex: -46.6333"
                {...register('long')}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Quarta Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 6: Horários e Atendimento */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Horários e Atendimento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Atendimento"
                type="text"
                placeholder="Ex: Manhã, Tarde, Integral"
                {...register('atendimento')}
                disabled={isViewMode}
              />
              <Input
                label="Horário"
                type="text"
                placeholder="Ex: 07:00 às 17:00"
                {...register('horario')}
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

      {/* Aba de Efetivos */}
      {activeTab === 'efetivos' && unidade && (
        <div className="max-h-[75vh] overflow-y-auto">
          <EfetivosContent
            unidadeEscolarId={unidade.id}
            viewMode={isViewMode}
          />
        </div>
      )}

      {/* Aba de Almoxarifado */}
      {activeTab === 'almoxarifado' && unidade && (
        <div className="max-h-[75vh] overflow-y-auto">
          <AlmoxarifadoContent
            unidadeEscolarId={unidade.id}
            viewMode={isViewMode}
          />
        </div>
      )}

      {/* Aba de Patrimônios */}
      {activeTab === 'patrimonios' && unidade && (
        <div className="max-h-[75vh] overflow-y-auto">
          <PatrimoniosList
            tipoLocal="unidade_escolar"
            localId={unidade.id}
            localNome={unidade.nome_escola}
            canView={canView('patrimonios')}
            canEdit={canEdit('patrimonios')}
            canDelete={canDelete('patrimonios')}
            canMovimentar={canMovimentar('patrimonios')}
          />
        </div>
      )}

      {/* Aba de Tipos de Cardápio */}
      {activeTab === 'tipos-cardapio' && unidade && (
        <div className="max-h-[75vh] overflow-y-auto">
          <TiposCardapioContent
            unidade={unidade}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </div>
      )}

      {/* Aba de Períodos de Refeição */}
      {activeTab === 'periodos-refeicao' && unidade && (
        <div className="max-h-[75vh] overflow-y-auto">
          <PeriodosRefeicaoContent
            unidade={unidade}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </div>
      )}

      {/* Aba de Periodicidade */}
      {activeTab === 'periodicidade' && unidade && (
        <div className="max-h-[75vh] overflow-y-auto">
          <PeriodicidadeContent
            unidadeEscolarId={unidade.id}
            viewMode={isViewMode}
          />
        </div>
      )}
    </Modal>
  );
};

export default UnidadeEscolarModal;
