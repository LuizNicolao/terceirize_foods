import React from 'react';
import { useForm } from 'react-hook-form';
import { FaChevronDown, FaChevronUp, FaPlus } from 'react-icons/fa';
import { Button, Input, Modal, Table } from '../ui';
import RotasService from '../../services/rotas';
import toast from 'react-hot-toast';

const RotaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  rota, 
  isViewMode = false,
  filiais = [],
  loadingFiliais = false,
  tiposRota = [],
  loadingTiposRota = false,
  onFilialChange,
  unidadesEscolares = [],
  loadingUnidades = false,
  showUnidades = false,
  totalUnidades = 0,
  onToggleUnidades,
  unidadesDisponiveis = [],
  loadingUnidadesDisponiveis = false,
  onSelecionarUnidades
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [unidadesSelecionadas, setUnidadesSelecionadas] = React.useState([]);
  const [buscaUnidades, setBuscaUnidades] = React.useState('');
  const [frequencias, setFrequencias] = React.useState([]);
  const [loadingFrequencias, setLoadingFrequencias] = React.useState(false);
  const [showModalNovaFrequencia, setShowModalNovaFrequencia] = React.useState(false);
  const [novaFrequenciaNome, setNovaFrequenciaNome] = React.useState('');
  const [salvandoFrequencia, setSalvandoFrequencia] = React.useState(false);
  
  const filialId = watch('filial_id');
  const tipoRotaId = watch('tipo_rota_id');
  
  // Buscar grupos do tipo de rota selecionado
  const tipoRotaSelecionado = tiposRota.find(t => t.id === parseInt(tipoRotaId));
  const gruposIds = tipoRotaSelecionado?.grupos_id || (tipoRotaSelecionado?.grupo_id ? [tipoRotaSelecionado.grupo_id] : []);
  // Para compatibilidade com código que ainda espera grupoId (primeiro grupo)
  const grupoId = gruposIds.length > 0 ? gruposIds[0] : null;

  // Carregar frequências do ENUM
  const loadFrequencias = React.useCallback(async () => {
    try {
      setLoadingFrequencias(true);
      const result = await RotasService.listarFrequenciasEntrega();
      if (result.success) {
        setFrequencias(result.data || []);
      } else {
        // Fallback para valores padrão se houver erro
        setFrequencias(['semanal', 'quinzenal', 'mensal', 'transferencia']);
        console.error('Erro ao carregar frequências:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar frequências:', error);
      setFrequencias(['semanal', 'quinzenal', 'mensal', 'transferencia']);
    } finally {
      setLoadingFrequencias(false);
    }
  }, []);

  // Carregar frequências disponíveis quando o modal abrir (sempre, inclusive em viewMode)
  React.useEffect(() => {
    if (isOpen) {
      loadFrequencias();
    }
  }, [isOpen, loadFrequencias]);

  // Ref para rastrear se o formulário já foi preenchido (para evitar sobrescrever seleções do usuário)
  const formularioPreenchidoRef = React.useRef(false);
  const rotaAnteriorRef = React.useRef(null);

  // Resetar ref quando modal fechar ou rota mudar
  React.useEffect(() => {
    if (!isOpen) {
      formularioPreenchidoRef.current = false;
      rotaAnteriorRef.current = null;
      return;
    }

    // Se a rota mudou (ID diferente), resetar flag de preenchimento
    if (rota?.id !== rotaAnteriorRef.current?.id) {
      formularioPreenchidoRef.current = false;
      rotaAnteriorRef.current = rota;
    }
  }, [isOpen, rota]);

  // Preencher formulário com dados da rota quando rota, frequências e tipos de rota estiverem disponíveis
  // Este useEffect só executa quando as frequências e tipos de rota terminarem de carregar
  React.useEffect(() => {
    // Só processar se modal está aberto
    if (!isOpen) return;

    // Se já preencheu uma vez e está editando a mesma rota, não preencher novamente
    // (evita sobrescrever valores que o usuário pode ter alterado)
    if (rota && formularioPreenchidoRef.current) {
      return;
    }

    if (rota) {
      // Só preencher se frequências e tipos de rota já foram carregadas (não estão mais carregando)
      // Isso garante que os dropdowns já têm as opções disponíveis antes de setar os valores
      const frequenciasProntas = !loadingFrequencias && frequencias.length > 0;
      const tiposRotaProntos = !loadingTiposRota && (tiposRota.length > 0 || !rota.tipo_rota_id);
      
      if (frequenciasProntas && tiposRotaProntos) {
        // Preencher formulário com dados da rota
        Object.keys(rota).forEach(key => {
          if (rota[key] !== null && rota[key] !== undefined) {
            setValue(key, rota[key]);
          }
        });
        formularioPreenchidoRef.current = true;
      }
    } else {
      // Resetar formulário para nova rota (apenas se frequências já estiverem carregadas)
      // E só se ainda não resetou (para evitar resetar valores que o usuário preencheu)
      if (!loadingFrequencias && frequencias.length > 0 && !formularioPreenchidoRef.current) {
        reset();
        setValue('status', 'ativo');
        setValue('frequencia_entrega', 'semanal');
        formularioPreenchidoRef.current = true;
      }
    }
  }, [rota, isOpen, setValue, reset, frequencias, loadingFrequencias, tiposRota, loadingTiposRota]);

  // Carregar tipos de rota quando filial mudar OU quando modal abrir com rota que já tem filial
  // Usar ref para evitar múltiplas chamadas e loops
  const filialProcessadaRef = React.useRef(null);
  const onFilialChangeRef = React.useRef(onFilialChange);
  
  // Atualizar ref quando onFilialChange mudar
  React.useEffect(() => {
    onFilialChangeRef.current = onFilialChange;
  }, [onFilialChange]);
  
  // Ref para rastrear a filial anterior e limpar tipo de rota quando filial mudar
  const filialAnteriorRef = React.useRef(null);
  // Ref para rastrear se unidades já foram carregadas para esta combinação de filial + tipo de rota
  const unidadesCarregadasRef = React.useRef(null);

  // Carregar tipos de rota quando filial mudar ou modal abrir
  React.useEffect(() => {
    // Resetar refs quando modal fechar
    if (!isOpen) {
      filialProcessadaRef.current = null;
      filialAnteriorRef.current = null;
      unidadesCarregadasRef.current = null;
      setUnidadesSelecionadas([]);
      setBuscaUnidades('');
      return;
    }

    // Se modal abriu e tem rota com filial, mas filialId ainda não foi setado no form
    if (rota?.filial_id && !filialId) {
      const key = `rota-${rota.id}`;
      if (filialProcessadaRef.current !== key) {
        // Aguardar um ciclo para que o formulário seja preenchido primeiro
        const timer = setTimeout(() => {
          const filialIdDaRota = rota.filial_id;
          if (filialIdDaRota && filialProcessadaRef.current !== key) {
            filialProcessadaRef.current = key;
            filialAnteriorRef.current = filialIdDaRota;
            // Carregar apenas tipos de rota, não unidades ainda
            onFilialChangeRef.current && onFilialChangeRef.current(filialIdDaRota, null, rota.id);
          }
        }, 300);
        return () => clearTimeout(timer);
      }
      return;
    }
    
    // Se filialId mudou (via watch) e não é o mesmo que já foi processado
    if (filialId && !isViewMode) {
      const key = `filial-${filialId}`;
      
      // Se a filial realmente mudou (não apenas foi inicializada), limpar tipo de rota
      // Usar watch para obter valor atual sem adicionar como dependência
      const tipoRotaAtual = watch('tipo_rota_id');
      if (filialAnteriorRef.current && filialAnteriorRef.current !== filialId && tipoRotaAtual) {
        setValue('tipo_rota_id', '', { shouldValidate: false });
        setUnidadesSelecionadas([]);
        setBuscaUnidades('');
      }
      
      if (filialProcessadaRef.current !== key) {
        filialProcessadaRef.current = key;
        filialAnteriorRef.current = filialId;
        // Carregar apenas tipos de rota quando filial mudar, não unidades ainda
        // Unidades serão carregadas quando tipo de rota for selecionado
        onFilialChangeRef.current && onFilialChangeRef.current(filialId, null, null);
      }
    } else if (filialId && filialAnteriorRef.current !== filialId) {
      // Atualizar referência mesmo se não processar (para rastrear mudanças)
      filialAnteriorRef.current = filialId;
    }
  }, [isOpen, rota?.filial_id, rota?.id, filialId, isViewMode, setValue, watch]);

  // Carregar unidades quando tipo de rota for selecionado (além da filial)
  React.useEffect(() => {
    if (!isOpen || isViewMode) return;

    // Só carregar unidades se filial E tipo de rota estiverem selecionados
    if (filialId && tipoRotaId) {
      const chaveUnidades = `${filialId}-${tipoRotaId}-${rota?.id || 'new'}`;
      
      // Só carregar se ainda não carregou para esta combinação
      if (unidadesCarregadasRef.current !== chaveUnidades) {
        const tipoSelecionado = tiposRota.find(t => t.id === parseInt(tipoRotaId));
        // Para compatibilidade: passar primeiro grupo ou null
        const gruposIdsDoTipo = tipoSelecionado?.grupos_id || (tipoSelecionado?.grupo_id ? [tipoSelecionado.grupo_id] : []);
        const grupoIdDoTipo = gruposIdsDoTipo.length > 0 ? gruposIdsDoTipo[0] : null;
        const rotaIdParaBusca = rota?.id || null;
        
        unidadesCarregadasRef.current = chaveUnidades;
        // Carregar unidades considerando grupo do tipo de rota
        onFilialChangeRef.current && onFilialChangeRef.current(filialId, grupoIdDoTipo, rotaIdParaBusca);
      }
    } else {
      // Se tipo de rota foi removido, resetar ref
      unidadesCarregadasRef.current = null;
    }
  }, [isOpen, filialId, tipoRotaId, tiposRota, rota?.id, isViewMode]);

  // No modo de edição, marcar unidades já vinculadas como selecionadas
  React.useEffect(() => {
    if (rota && isOpen && unidadesEscolares.length > 0) {
      setUnidadesSelecionadas(unidadesEscolares);
    } else if (!rota && isOpen) {
      setUnidadesSelecionadas([]);
    }
  }, [rota, isOpen, unidadesEscolares]);

  const handleFormSubmit = (data) => {
    // Incluir unidades selecionadas nos dados
    const dataComUnidades = {
      ...data,
      unidades_selecionadas: unidadesSelecionadas
    };
    onSubmit(dataComUnidades);
  };

  const handleSelecionarUnidade = (unidade, isSelected) => {
    if (isSelected) {
      // Adicionar unidade com ordem_entrega padrão (próximo número disponível)
      const proximaOrdem = unidadesSelecionadas.length + 1;
      setUnidadesSelecionadas(prev => [...prev, { ...unidade, ordem_entrega: proximaOrdem }]);
    } else {
      setUnidadesSelecionadas(prev => prev.filter(u => u.id !== unidade.id));
    }
  };

  const handleSelecionarTodas = () => {
    // Selecionar todas as unidades filtradas que ainda não estão selecionadas
    const novasSelecoes = unidadesFiltradas.filter(unidade => 
      !unidadesSelecionadas.some(selecionada => selecionada.id === unidade.id)
    );
    // Adicionar ordem_entrega automática para cada nova seleção
    const comOrdem = novasSelecoes.map((unidade, index) => ({
      ...unidade,
      ordem_entrega: unidadesSelecionadas.length + index + 1
    }));
    setUnidadesSelecionadas(prev => [...prev, ...comOrdem]);
  };

  const handleDesselecionarTodas = () => {
    setUnidadesSelecionadas([]);
  };

  const handleUpdateOrdem = (unidadeId, novaOrdem) => {
    setUnidadesSelecionadas(prev => 
      prev.map(u => u.id === unidadeId ? { ...u, ordem_entrega: Number(novaOrdem) || 0 } : u)
    );
  };

  // Gerar opções disponíveis de ordem para um select
  const getOpcoesOrdemDisponiveis = (unidadeAtualId) => {
    const totalEscolas = unidadesSelecionadas.length;
    const ordensUsadas = unidadesSelecionadas
      .filter(u => u.id !== unidadeAtualId && u.ordem_entrega > 0)
      .map(u => u.ordem_entrega);
    
    const opcoesDisponiveis = [];
    for (let i = 1; i <= totalEscolas; i++) {
      if (!ordensUsadas.includes(i)) {
        opcoesDisponiveis.push(i);
      }
    }
    return opcoesDisponiveis;
  };

  // Filtrar unidades baseado na busca
  const unidadesFiltradas = React.useMemo(() => {
    if (!buscaUnidades.trim()) {
      return unidadesDisponiveis;
    }

    const termoBusca = buscaUnidades.toLowerCase().trim();
    return unidadesDisponiveis.filter(unidade => 
      unidade.nome_escola?.toLowerCase().includes(termoBusca) ||
      unidade.codigo_teknisa?.toLowerCase().includes(termoBusca) ||
      unidade.cidade?.toLowerCase().includes(termoBusca) ||
      unidade.estado?.toLowerCase().includes(termoBusca) ||
      unidade.endereco?.toLowerCase().includes(termoBusca)
    );
  }, [unidadesDisponiveis, buscaUnidades]);

  // Função para formatar nome da frequência (capitalizar primeira letra)
  const formatarFrequencia = (freq) => {
    if (!freq) return '';
    const freqLower = freq.toLowerCase();
    const traducoes = {
      'semanal': 'Semanal',
      'quinzenal': 'Quinzenal',
      'mensal': 'Mensal',
      'transferencia': 'Transferência'
    };
    return traducoes[freqLower] || freqLower.charAt(0).toUpperCase() + freqLower.slice(1);
  };

  // Função para abrir modal de nova frequência
  const handleAbrirModalNovaFrequencia = () => {
    setShowModalNovaFrequencia(true);
    setNovaFrequenciaNome('');
  };

  // Função para salvar nova frequência
  const handleSalvarNovaFrequencia = async () => {
    if (!novaFrequenciaNome.trim()) {
      toast.error('Digite o nome da frequência');
      return;
    }

    try {
      setSalvandoFrequencia(true);
      const result = await RotasService.adicionarFrequenciaEntrega(novaFrequenciaNome);
      
      if (result.success) {
        toast.success(result.message || 'Frequência adicionada com sucesso!');
        
        // Recarregar frequências e atualizar dropdown
        await loadFrequencias();
        
        // Selecionar automaticamente a nova frequência
        const nomeLimpo = novaFrequenciaNome.trim().toLowerCase();
        setValue('frequencia_entrega', nomeLimpo);
        
        // Fechar modal
        setShowModalNovaFrequencia(false);
        setNovaFrequenciaNome('');
      } else {
        toast.error(result.error || 'Erro ao adicionar frequência');
      }
    } catch (error) {
      console.error('Erro ao adicionar frequência:', error);
      toast.error('Erro ao adicionar frequência de entrega');
    } finally {
      setSalvandoFrequencia(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Rota' : rota ? 'Editar Rota' : 'Adicionar Rota'}
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
                label="Filial *"
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
                label="Código *"
                type="text"
                placeholder="Código da rota"
                {...register('codigo')}
                disabled={isViewMode}
              />

              <Input
                label="Nome *"
                type="text"
                placeholder="Nome da rota"
                {...register('nome')}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Configurações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Configurações
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Rota *
                </label>
                <select
                  {...register('tipo_rota_id', { required: 'Tipo de rota é obrigatório' })}
                  disabled={isViewMode || loadingTiposRota || !filialId}
                  onChange={(e) => {
                    setValue('tipo_rota_id', e.target.value);
                    // Recarregar unidades quando tipo de rota mudar (para atualizar grupo)
                    if (filialId && !isViewMode) {
                      const tipoSelecionado = tiposRota.find(t => t.id === parseInt(e.target.value));
                      // Para compatibilidade: passar primeiro grupo ou null
                      const novosGruposIds = tipoSelecionado?.grupos_id || (tipoSelecionado?.grupo_id ? [tipoSelecionado.grupo_id] : []);
                      const novoGrupoId = novosGruposIds.length > 0 ? novosGruposIds[0] : null;
                      const rotaIdParaBusca = rota?.id || null;
                      onFilialChange && onFilialChange(filialId, novoGrupoId, rotaIdParaBusca);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingTiposRota ? 'Carregando tipos de rota...' : !filialId ? 'Selecione uma filial primeiro' : 'Selecione o tipo de rota'}
                  </option>
                  {tiposRota.length === 0 && !loadingTiposRota && filialId && (
                    <option value="" disabled>Nenhum tipo de rota encontrado para esta filial</option>
                  )}
                  {tiposRota.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nome} {tipo.grupo_nome ? `(${tipo.grupo_nome})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência de Entrega *
                </label>
                <select
                  {...register('frequencia_entrega')}
                  disabled={isViewMode || loadingFrequencias}
                  onChange={(e) => {
                    if (e.target.value === '__nova__') {
                      handleAbrirModalNovaFrequencia();
                      setValue('frequencia_entrega', '');
                    } else {
                      setValue('frequencia_entrega', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingFrequencias ? 'Carregando frequências...' : 'Selecione a frequência'}
                  </option>
                  {frequencias.map(freq => (
                    <option key={freq} value={freq}>
                      {formatarFrequencia(freq)}
                    </option>
                  ))}
                  {!isViewMode && !loadingFrequencias && (
                    <option value="__nova__" style={{ fontWeight: 'bold', color: '#16a34a' }}>
                      ➕ Adicionar nova frequência...
                    </option>
                  )}
                </select>
              </div>

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


        {/* Seção de Seleção de Unidades Escolares (para criação e edição) */}
        {!isViewMode && filialId && tipoRotaId && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
              <h3 className="text-sm font-semibold text-gray-700">
                {rota ? 'Editar Unidades Escolares' : 'Selecionar Unidades Escolares'}
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelecionarTodas}
                  className="text-xs"
                  disabled={loadingUnidadesDisponiveis || unidadesFiltradas.length === 0}
                >
                  Selecionar Todas
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDesselecionarTodas}
                  className="text-xs"
                  disabled={unidadesSelecionadas.length === 0}
                >
                  Desselecionar Todas
                </Button>
              </div>
            </div>
            
            {/* Campo de busca */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Buscar por nome, código, cidade ou endereço..."
                value={buscaUnidades}
                onChange={(e) => setBuscaUnidades(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
            
            {loadingUnidadesDisponiveis ? (
              <div className="text-center py-4">
                <div className="text-gray-500">Carregando unidades disponíveis...</div>
              </div>
            ) : unidadesFiltradas.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-500">
                  {buscaUnidades.trim() 
                    ? `Nenhuma unidade encontrada para "${buscaUnidades}"`
                    : 'Nenhuma unidade escolar disponível para esta filial e tipo de rota'
                  }
                </div>
                {buscaUnidades.trim() && (
                  <button
                    type="button"
                    onClick={() => setBuscaUnidades('')}
                    className="text-green-600 hover:text-green-700 text-sm mt-2"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Lado Esquerdo: 3 colunas de escolas disponíveis */}
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Escolas Disponíveis ({unidadesFiltradas.length})
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1">
                {unidadesFiltradas.map((unidade) => {
                  const isSelected = unidadesSelecionadas.some(u => u.id === unidade.id);
                  return (
                    <div
                      key={unidade.id}
                          className={`flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                              ? 'bg-green-50 border-green-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelecionarUnidade(unidade, !isSelected)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelecionarUnidade(unidade, !isSelected)}
                            className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-xs truncate" title={unidade.nome_escola}>
                          {unidade.nome_escola}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                              {unidade.cidade}, {unidade.estado}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
                </div>

                {/* Lado Direito: Escolas selecionadas com ordem */}
                <div className="w-80 flex-shrink-0">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Escolas Selecionadas ({unidadesSelecionadas.length}) - Ordem de Entrega
                  </div>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto p-1 bg-gray-50 rounded-lg border-2 border-green-200">
                    {unidadesSelecionadas.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Selecione escolas ao lado<br/>para definir ordem de entrega
                      </div>
                    ) : (
                      unidadesSelecionadas
                        .sort((a, b) => (a.ordem_entrega || 0) - (b.ordem_entrega || 0))
                        .map((unidade) => {
                          const opcoesDisponiveis = getOpcoesOrdemDisponiveis(unidade.id);
                          const ordemAtual = unidade.ordem_entrega || 0;
                          
                          return (
                            <div
                              key={unidade.id}
                              className="flex items-center gap-2 p-2 bg-white rounded border border-green-200"
                            >
                              <div className="flex-shrink-0 w-14">
                                <select
                                  value={ordemAtual}
                                  onChange={(e) => handleUpdateOrdem(unidade.id, e.target.value)}
                                  className="w-full px-1 py-1 text-sm text-center font-semibold border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                >
                                  <option value="0">-</option>
                                  {ordemAtual > 0 && !opcoesDisponiveis.includes(ordemAtual) && (
                                    <option value={ordemAtual}>{ordemAtual}</option>
                                  )}
                                  {opcoesDisponiveis.map(num => (
                                    <option key={num} value={num}>{num}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-xs truncate" title={unidade.nome_escola}>
                                  {unidade.nome_escola}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {unidade.cidade}, {unidade.estado}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelecionarUnidade(unidade, false)}
                                className="flex-shrink-0 text-red-500 hover:text-red-700 p-1"
                                title="Remover"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seção de Unidades Escolares (apenas para visualização/edição) */}
        {rota && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
              <h3 className="text-sm font-semibold text-gray-700">
                Unidades Escolares da Rota
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggleUnidades}
                className="text-xs"
              >
                {showUnidades ? (
                  <>
                    <FaChevronUp className="mr-1" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <FaChevronDown className="mr-1" />
                    Mostrar ({totalUnidades})
                  </>
                )}
              </Button>
            </div>
            
            {showUnidades && (
              <div className="mt-4">
                {loadingUnidades ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Carregando unidades...</p>
                  </div>
                ) : unidadesEscolares.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Endereço</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {unidadesEscolares.map((unidade) => (
                          <tr key={unidade.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{unidade.id}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                              {unidade.nome_escola || unidade.codigo_teknisa || 'Nome não informado'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {unidade.endereco ? 
                                `${unidade.endereco}, ${unidade.cidade}/${unidade.estado}` : 
                                `${unidade.cidade}/${unidade.estado}`
                              }
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                unidade.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhuma unidade escolar associada a esta rota
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isViewMode}
          >
            Cancelar
          </Button>
          {!isViewMode && (
            <Button type="submit">
              {rota ? 'Atualizar' : 'Criar'} Rota
            </Button>
          )}
        </div>
      </form>

      {/* Modal para adicionar nova frequência */}
      {showModalNovaFrequencia && (
        <Modal
          isOpen={showModalNovaFrequencia}
          onClose={() => {
            setShowModalNovaFrequencia(false);
            setNovaFrequenciaNome('');
            setValue('frequencia_entrega', '');
          }}
          title="Adicionar Nova Frequência de Entrega"
          size="sm"
        >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Frequência *
            </label>
            <input
              type="text"
              value={novaFrequenciaNome}
              onChange={(e) => setNovaFrequenciaNome(e.target.value)}
              placeholder="Ex: bimestral, trimestral..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSalvarNovaFrequencia();
                }
              }}
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              Use apenas letras minúsculas e underscore. Ex: bimestral, trimestral, semanal_especial
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModalNovaFrequencia(false);
                setNovaFrequenciaNome('');
                setValue('frequencia_entrega', '');
              }}
              disabled={salvandoFrequencia}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSalvarNovaFrequencia}
              disabled={salvandoFrequencia || !novaFrequenciaNome.trim()}
            >
              {salvandoFrequencia ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
        </Modal>
      )}
    </Modal>
  );
};

export default RotaModal;
