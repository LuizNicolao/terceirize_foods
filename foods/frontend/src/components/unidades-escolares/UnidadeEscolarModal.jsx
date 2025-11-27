import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUsers, FaBuilding, FaClipboardList, FaUtensils, FaCalendarAlt } from 'react-icons/fa';
import { Button, Input, Modal, MaskedFormInput } from '../ui';
import EfetivosContent from './EfetivosContent';
import TiposCardapioContent from './TiposCardapioContent';
import PeriodosRefeicaoContent from './PeriodosRefeicaoContent';
import PeriodicidadeContent from './PeriodicidadeContent';
import { PatrimoniosList } from '../patrimonios';
import { usePermissions } from '../../contexts/PermissionsContext';
import centroCustoService from '../../services/centroCusto';
import almoxarifadoService from '../../services/almoxarifadoService';

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
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'efetivos', 'patrimonios', 'tipos-cardapio', 'periodos-refeicao' ou 'periodicidade'
  const { canView, canEdit, canDelete, canMovimentar } = usePermissions();
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [carregandoCentrosCusto, setCarregandoCentrosCusto] = useState(false);
  const [centroCustoId, setCentroCustoId] = useState('');
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [carregandoAlmoxarifados, setCarregandoAlmoxarifados] = useState(false);
  const [almoxarifadoId, setAlmoxarifadoId] = useState('');
  
  // Observar mudanças na filial selecionada
  const filialSelecionada = watch('filial_id');

  // Carregar centros de custo quando filial for selecionada ou quando unidade for carregada
  useEffect(() => {
    const carregarCentrosCusto = async () => {
      // Usar filial da unidade se não houver filial selecionada no formulário
      const filialParaBuscar = filialSelecionada || (unidade?.filial_id ? String(unidade.filial_id) : null);
      
      if (isOpen && filialParaBuscar) {
        setCarregandoCentrosCusto(true);
        try {
          const response = await centroCustoService.buscarAtivos();
          if (response.success) {
            // Filtrar por filial selecionada
            const filialIdNum = parseInt(filialParaBuscar);
            const centrosFiltrados = (response.data || []).filter(
              cc => String(cc.filial_id) === String(filialParaBuscar) || cc.filial_id === filialIdNum
            );
            setCentrosCusto(centrosFiltrados);
          }
        } catch (error) {
          console.error('Erro ao carregar centros de custo:', error);
          setCentrosCusto([]);
        } finally {
          setCarregandoCentrosCusto(false);
        }
      } else if (!filialParaBuscar) {
        setCentrosCusto([]);
      }
    };

    carregarCentrosCusto();
  }, [filialSelecionada, isOpen, unidade?.filial_id]);

  // Carregar almoxarifados quando filial for selecionada ou quando unidade for carregada
  useEffect(() => {
    const carregarAlmoxarifados = async () => {
      // Usar filial da unidade se não houver filial selecionada no formulário
      const filialParaBuscar = filialSelecionada || (unidade?.filial_id ? String(unidade.filial_id) : null);
      
      if (isOpen && filialParaBuscar) {
        setCarregandoAlmoxarifados(true);
        try {
          // Buscar apenas almoxarifados do tipo "unidade_escolar" vinculados à filial
          const response = await almoxarifadoService.listar({ 
            filial_id: filialParaBuscar, 
            status: 1 
          });
          if (response.success) {
            const dados = response.data?.data || response.data || [];
            // Filtrar apenas os do tipo "unidade_escolar" que não estão vinculados a outra unidade
            // ou que já estão vinculados à unidade atual (para permitir edição)
            const almoxarifadosDisponiveis = dados.filter(
              almox => (almox.tipo_vinculo === 'unidade_escolar' || !almox.tipo_vinculo) && 
                       (!almox.unidade_escolar_id || String(almox.unidade_escolar_id) === String(unidade?.id))
            );
            setAlmoxarifados(almoxarifadosDisponiveis);
          }
        } catch (error) {
          console.error('Erro ao carregar almoxarifados:', error);
          setAlmoxarifados([]);
        } finally {
          setCarregandoAlmoxarifados(false);
        }
      } else if (!filialParaBuscar) {
        setAlmoxarifados([]);
      }
    };

    carregarAlmoxarifados();
  }, [filialSelecionada, isOpen, unidade?.filial_id, unidade?.id]);

  React.useEffect(() => {
    if (isOpen) {
      if (unidade) {
        // Resetar formulário primeiro
        reset();
        
        // Aguardar um tick para garantir que o reset foi aplicado
        setTimeout(() => {
          // Preencher formulário com dados da unidade escolar
          Object.keys(unidade).forEach(key => {
            // Definir valor mesmo se for null/undefined (para limpar campos)
            let value = unidade[key] !== null && unidade[key] !== undefined ? unidade[key] : '';
            // Converter centro_custo_id para string se necessário (para compatibilidade com select)
            if (key === 'centro_custo_id' && value) {
              value = String(value);
              setCentroCustoId(value);
            }
            // Converter almoxarifado_id para string se necessário (para compatibilidade com select)
            if (key === 'almoxarifado_id' && value) {
              value = String(value);
              setAlmoxarifadoId(value);
            }
            setValue(key, value, { shouldValidate: false, shouldDirty: false });
          });
          
          // Garantir que campos padrão sejam definidos se não existirem
          if (!unidade.status) setValue('status', 'ativo', { shouldValidate: false, shouldDirty: false });
          if (!unidade.pais) setValue('pais', 'Brasil', { shouldValidate: false, shouldDirty: false });
        }, 0);
      } else {
        // Resetar formulário para nova unidade escolar
        reset();
        setCentroCustoId('');
        setAlmoxarifadoId('');
        setValue('status', 'ativo');
        setValue('pais', 'Brasil');
      }
      // Resetar para aba de informações
      setActiveTab('info');
    }
  }, [unidade, isOpen, setValue, reset]);

  // Limpar estado quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setCentroCustoId('');
    }
  }, [isOpen]);

  const handleFormSubmit = (data) => {
    // Remover almoxarifado_id do formulário, pois não é editável
    const { almoxarifado_id, ...dataToSubmit } = data;
    onSubmit(dataToSubmit);
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
        {/* Primeira Linha - 2 Cards Menores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Básicas */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                label="Código Teknisa *"
                type="text"
                placeholder="Código da unidade"
                {...register('codigo_teknisa')}
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
              <Input
                label="Nome da Escola *"
                type="text"
                placeholder="Nome da escola"
                {...register('nome_escola')}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Coordenação e Supervisão */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b-2 border-green-500">
              Coordenação e Supervisão
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
              </div>
              <Input
                label="Observações"
                type="textarea"
                placeholder="Observações sobre a unidade escolar"
                {...register('observacoes')}
                disabled={isViewMode}
              />
              {/* Campo da Nutricionista (apenas para visualização) */}
              {isViewMode && unidade && unidade.nutricionista_nome && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Nutricionista Responsável
                  </label>
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs font-medium text-gray-900">
                          {unidade.nutricionista_nome}
                        </div>
                      </div>
                      {unidade.nutricionista_email && (
                        <div className="text-xs text-gray-500">
                          {unidade.nutricionista_email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Segunda Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 3: Localização */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Localização
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Número"
                type="text"
                placeholder="Número"
                {...register('numero')}
                disabled={isViewMode}
              />
              <Input
                label="País"
                type="text"
                placeholder="País"
                {...register('pais')}
                disabled={isViewMode}
              />
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {/* Card 4: Informações Operacionais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Operacionais
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  label="Centro de Distribuição"
                  type="text"
                  placeholder="Centro de distribuição"
                  {...register('centro_distribuicao')}
                  disabled={isViewMode}
                />
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  label="Regional"
                  type="text"
                  placeholder="Regional"
                  {...register('regional')}
                  disabled={isViewMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Centro de Custo"
                  type="select"
                  name="centro_custo_id"
                  value={centroCustoId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCentroCustoId(value);
                    setValue('centro_custo_id', value, { shouldValidate: false, shouldDirty: false });
                  }}
                  disabled={isViewMode || (!filialSelecionada && !unidade?.filial_id) || carregandoCentrosCusto}
                >
                  <option value="">
                    {(!filialSelecionada && !unidade?.filial_id)
                      ? 'Selecione primeiro uma filial' 
                      : carregandoCentrosCusto 
                        ? 'Carregando...' 
                        : 'Selecione um centro de custo'}
                  </option>
                  {centrosCusto.map(centroCusto => (
                    <option key={centroCusto.id} value={String(centroCusto.id)}>
                      {centroCusto.codigo} - {centroCusto.nome}
                    </option>
                  ))}
                </Input>
                <Input
                  label="Almoxarifado"
                  type="select"
                  name="almoxarifado_id"
                  value={almoxarifadoId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAlmoxarifadoId(value);
                    setValue('almoxarifado_id', value, { shouldValidate: false, shouldDirty: false });
                  }}
                  disabled={true}
                >
                  <option value="">
                    {carregandoAlmoxarifados 
                      ? 'Carregando...' 
                      : almoxarifadoId 
                        ? 'Almoxarifado vinculado' 
                        : 'Nenhum almoxarifado vinculado'}
                  </option>
                  {almoxarifados.map(almoxarifado => (
                    <option key={almoxarifado.id} value={String(almoxarifado.id)}>
                      {almoxarifado.codigo} - {almoxarifado.nome}
                    </option>
                  ))}
                </Input>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
