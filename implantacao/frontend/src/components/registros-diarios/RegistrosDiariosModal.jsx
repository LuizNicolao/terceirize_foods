import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SearchableSelect, ConfirmModal } from '../ui';
import { FaList, FaChartLine, FaHistory } from 'react-icons/fa';
import FoodsApiService from '../../services/FoodsApiService';
import { useAuth } from '../../contexts/AuthContext';
import RegistrosDiariosService from '../../services/registrosDiarios';
import MediasCalculadasTab from './MediasCalculadasTab';
import HistoricoTab from './HistoricoTab';
import TipoAtendimentoEscolaService from '../../services/tipoAtendimentoEscolaService';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';

const RegistrosDiariosModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  registro = null,
  isViewMode = false,
  onRequestEdit
}) => {
  const { user } = useAuth();
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('detalhes');
  const [medias, setMedias] = useState([]);
  const [loadingMedias, setLoadingMedias] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const {
    markDirty,
    resetDirty,
    requestClose,
    showConfirm,
    confirmClose,
    cancelClose,
    confirmTitle,
    confirmMessage
  } = useUnsavedChangesPrompt();
  
  // Função para obter data atual no formato YYYY-MM-DD
  const getDataAtual = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };
  
  const criarEstadoInicial = () => ({
    escola_id: '',
    nutricionista_id: user?.id || '',
    data: getDataAtual(),
    quantidades: {
      lanche_manha: '',
      parcial_manha: '',
      almoco: '',
      lanche_tarde: '',
      parcial_tarde: '',
      eja: ''
    }
  });

  const [tiposAtendimentoEscola, setTiposAtendimentoEscola] = useState([]);
  const [loadingTiposAtendimento, setLoadingTiposAtendimento] = useState(false);

  const [formData, setFormData] = useState(criarEstadoInicial());
  
  useEffect(() => {
    if (!isOpen || isViewMode) {
      resetDirty();
    }
  }, [isOpen, isViewMode, resetDirty]);
  
  // Carregar TODAS as escolas quando modal abrir
  useEffect(() => {
    const carregarTodasEscolas = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingEscolas(true);
        let todasEscolas = [];
        let page = 1;
        let hasMore = true;
        const limit = 100;
        
        // Buscar todas as escolas fazendo múltiplas requisições
        while (hasMore) {
          const result = await FoodsApiService.getUnidadesEscolares({
            page,
            limit,
            status: 'ativo'
          });
          
          if (result.success && result.data && result.data.length > 0) {
            todasEscolas = [...todasEscolas, ...result.data];
            
            if (result.data.length < limit) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
          
          // Limite de segurança
          if (page > 50) {
            hasMore = false;
          }
        }
        
        setUnidadesEscolares(todasEscolas);
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        setUnidadesEscolares([]);
      } finally {
        setLoadingEscolas(false);
      }
    };
    
    carregarTodasEscolas();
  }, [isOpen]);
  
  // Estado para controlar se já carregou os dados iniciais
  const [dadosIniciaisCarregados, setDadosIniciaisCarregados] = useState(false);

  // Carregar dados do registro ao editar
  useEffect(() => {
    if (registro && isOpen) {
      setFormData({
        escola_id: registro.escola_id || '',
        nutricionista_id: registro.nutricionista_id || user?.id || '',
        data: registro.data || new Date().toISOString().split('T')[0],
        quantidades: {
          lanche_manha: registro.lanche_manha != null ? String(registro.lanche_manha) : '',
          parcial_manha: registro.parcial_manha != null
            ? String(registro.parcial_manha)
            : registro.parcial != null
              ? String(registro.parcial)
              : '',
          almoco: registro.almoco != null ? String(registro.almoco) : '',
          lanche_tarde: registro.lanche_tarde != null ? String(registro.lanche_tarde) : '',
          parcial_tarde: registro.parcial_tarde != null ? String(registro.parcial_tarde) : '',
          eja: registro.eja != null ? String(registro.eja) : ''
        }
      });
      setDadosIniciaisCarregados(true);
      resetDirty();
    } else if (!registro && isOpen) {
      // Resetar para novo registro com data atual
      setFormData(criarEstadoInicial());
      setDadosIniciaisCarregados(false);
      resetDirty();
    }
  }, [registro, isOpen, user, resetDirty]);

  // Armazenar valores iniciais da escola e data para comparação
  const [escolaInicial, setEscolaInicial] = useState(null);
  const [dataInicial, setDataInicial] = useState(null);

  // Atualizar valores iniciais quando registro carregar
  useEffect(() => {
    if (registro && isOpen) {
      setEscolaInicial(registro.escola_id);
      setDataInicial(registro.data);
    } else {
      setEscolaInicial(null);
      setDataInicial(null);
    }
  }, [registro, isOpen]);

  // Carregar tipos de atendimento quando escola mudar
  useEffect(() => {
    const buscarTiposAtendimento = async () => {
      if (!isOpen || !formData.escola_id) {
        setTiposAtendimentoEscola([]);
        return;
      }

      try {
        setLoadingTiposAtendimento(true);
        const result = await TipoAtendimentoEscolaService.buscarPorEscola(formData.escola_id);
        if (result.success) {
          const tipos = result.data.map(item => item.tipo_atendimento);
          setTiposAtendimentoEscola(tipos);
        } else {
          setTiposAtendimentoEscola([]);
        }
      } catch (error) {
        console.error('Erro ao buscar tipos de atendimento para registros diários:', error);
        setTiposAtendimentoEscola([]);
      } finally {
        setLoadingTiposAtendimento(false);
      }
    };

    buscarTiposAtendimento();
  }, [isOpen, formData.escola_id]);

  // Carregar registros existentes quando escola e data forem selecionados
  useEffect(() => {
    const carregarRegistrosExistentes = async () => {
      if (formData.escola_id && formData.data) {
        // Se está criando novo registro, sempre busca
        // Se está editando, só busca se escola ou data mudaram
        const deveBuscar = !registro || 
          (dadosIniciaisCarregados && 
           (formData.escola_id !== escolaInicial || formData.data !== dataInicial));
        
        if (deveBuscar) {
          const result = await RegistrosDiariosService.buscarPorEscolaData(
            formData.escola_id,
            formData.data
          );
          
          if (result.success && result.data?.quantidades) {
            const quantidades = result.data.quantidades;
            const quantidadesNormalizadas = {
              lanche_manha: quantidades.lanche_manha != null ? String(quantidades.lanche_manha) : '',
              parcial_manha: quantidades.parcial_manha != null
                ? String(quantidades.parcial_manha)
                : quantidades.parcial != null
                  ? String(quantidades.parcial)
                  : '',
              almoco: quantidades.almoco != null ? String(quantidades.almoco) : '',
              lanche_tarde: quantidades.lanche_tarde != null ? String(quantidades.lanche_tarde) : '',
              parcial_tarde: quantidades.parcial_tarde != null ? String(quantidades.parcial_tarde) : '',
              eja: quantidades.eja != null ? String(quantidades.eja) : ''
            };
            setFormData(prev => ({
              ...prev,
              quantidades: quantidadesNormalizadas
            }));
          }
        }
      }
    };
    
    carregarRegistrosExistentes();
  }, [formData.escola_id, formData.data, registro, dadosIniciaisCarregados, escolaInicial, dataInicial]);

  // Configuração dos tipos de atendimento exibidos no modal
  const tiposConfig = [
    { key: 'lanche_manha', label: 'Lanche da Manhã', icon: '🌅' },
    { key: 'parcial_manha', label: 'Parcial Manhã', icon: '🥗' },
    { key: 'almoco', label: 'Almoço', icon: '🍽️' },
    { key: 'lanche_tarde', label: 'Lanche da Tarde', icon: '🌆' },
    { key: 'parcial_tarde', label: 'Parcial Tarde', icon: '🌇' },
    { key: 'eja', label: 'EJA (Noturno)', icon: '🌙' }
  ];

  const tiposDisponiveis = tiposAtendimentoEscola && tiposAtendimentoEscola.length > 0
    ? tiposConfig.filter(tipo => {
        if (tipo.key === 'parcial_manha') {
          return tiposAtendimentoEscola.includes('parcial_manha') || tiposAtendimentoEscola.includes('parcial');
        }
        if (tipo.key === 'parcial_tarde') {
          return tiposAtendimentoEscola.includes('parcial_tarde');
        }
        return tiposAtendimentoEscola.includes(tipo.key);
      })
    : tiposConfig;
  
  // Carregar médias quando aba de médias for ativada (apenas em modo visualização)
  useEffect(() => {
    const carregarMedias = async () => {
      if (isViewMode && abaAtiva === 'medias' && formData.escola_id) {
        setLoadingMedias(true);
        const result = await RegistrosDiariosService.listarMedias(formData.escola_id);
        if (result.success) {
          setMedias(result.data);
        }
        setLoadingMedias(false);
      }
    };
    
    carregarMedias();
  }, [abaAtiva, formData.escola_id, isViewMode]);
  
  // Carregar histórico quando aba de histórico for ativada (apenas em modo visualização)
  useEffect(() => {
    const carregarHistorico = async () => {
      if (isViewMode && abaAtiva === 'historico' && formData.escola_id) {
        setLoadingHistorico(true);
        
        try {
          const result = await RegistrosDiariosService.listarHistorico(formData.escola_id);
          
          if (result.success && result.data.length > 0) {
            // Transformar dados do backend para formato do HistoricoTab
            const historicoFormatado = result.data.map((reg, index) => ({
              acao: index === 0 ? 'criacao' : 'edicao',
              data_acao: reg.data_atualizacao || reg.data_cadastro,
              escola_id: reg.escola_id,
              escola_nome: reg.escola_nome,
              data: reg.data,
              nutricionista_id: reg.nutricionista_id,
              id: reg.id,
              usuario_nome: user?.nome,
              valores: {
                lanche_manha: reg.lanche_manha || 0,
                parcial_manha: reg.parcial_manha ?? reg.parcial ?? 0,
                almoco: reg.almoco || 0,
                lanche_tarde: reg.lanche_tarde || 0,
                parcial_tarde: reg.parcial_tarde || 0,
                eja: reg.eja || 0,
                parcial: reg.parcial || 0
              }
            }));
            setHistorico(historicoFormatado);
          } else {
            setHistorico([]);
          }
        } catch (error) {
          console.error('Erro ao carregar histórico:', error);
          setHistorico([]);
        }
        
        setLoadingHistorico(false);
      }
    };
    
    carregarHistorico();
  }, [abaAtiva, formData.escola_id, isViewMode, user]);
  
  // Resetar aba ao abrir/fechar modal
  useEffect(() => {
    if (isOpen) {
      setAbaAtiva('detalhes');
    }
  }, [isOpen]);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (!isViewMode) {
      markDirty();
    }
  };
  
  const handleQuantidadeChange = (tipo, value) => {
    const valorNormalizado = value === '' ? '' : String(Math.max(0, parseInt(value, 10) || 0));

    setFormData(prev => ({
      ...prev,
      quantidades: {
        ...prev.quantidades,
        [tipo]: valorNormalizado
      }
    }));
    if (!isViewMode) {
      markDirty();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.escola_id) {
      toast.error('Selecione uma escola');
      return;
    }
    
    if (!formData.data) {
      toast.error('Selecione uma data');
      return;
    }
    
    // Buscar nome da escola selecionada
    const escolaSelecionada = unidadesEscolares.find(e => e.id === formData.escola_id);
    const escola_nome = escolaSelecionada ? escolaSelecionada.nome_escola : `Escola ID ${formData.escola_id}`;
    
    // Adicionar nome da escola aos dados
    const quantidadesFiltradas = {};
    tiposConfig.forEach(({ key }) => {
      const ehDisponivel = tiposDisponiveis.find(tipo => tipo.key === key);
      if (ehDisponivel) {
        quantidadesFiltradas[key] = Number(formData.quantidades[key]) || 0;
      }
    });

    // Compatibilidade: se houver parcial_manha e não parcial, enviar também parcial
    if (quantidadesFiltradas.parcial_manha !== undefined && quantidadesFiltradas.parcial === undefined) {
      quantidadesFiltradas.parcial = quantidadesFiltradas.parcial_manha;
    }

    await onSave({
      ...formData,
      escola_nome,
      quantidades: quantidadesFiltradas
    });
    resetDirty();
  };

  const handleHistoricoEdit = (item) => {
    setAbaAtiva('detalhes');

    if (typeof onRequestEdit === 'function') {
      const registroParaEditar = {
        escola_id: item.escola_id,
        escola_nome: item.escola_nome,
        data: item.data,
        nutricionista_id: item.nutricionista_id,
        lanche_manha: item.valores?.lanche_manha ?? 0,
        parcial_manha: item.valores?.parcial_manha ?? item.valores?.parcial ?? 0,
        parcial: item.valores?.parcial ?? 0,
        almoco: item.valores?.almoco ?? 0,
        lanche_tarde: item.valores?.lanche_tarde ?? 0,
        parcial_tarde: item.valores?.parcial_tarde ?? 0,
        eja: item.valores?.eja ?? 0
      };

      onRequestEdit(registroParaEditar);
    }
  };
  
  if (!isOpen) return null;
  
  const abas = [
    { id: 'detalhes', label: 'Registros Diários', icon: FaList },
    { id: 'medias', label: 'Médias Calculadas', icon: FaChartLine },
    { id: 'historico', label: 'Histórico', icon: FaHistory }
  ];
  
  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={() => requestClose(onClose)}
      title={isViewMode ? 'Visualizar Quantidade Servida' : registro ? 'Editar Quantidade Servida' : 'Nova Quantidade Servida'}
      size="6xl"
    >
      {isViewMode && (
        <div className="mb-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {abas.map((aba) => {
                const Icon = aba.icon;
                const isActive = abaAtiva === aba.id;
                
                return (
                  <button
                    key={aba.id}
                    type="button"
                    onClick={() => setAbaAtiva(aba.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${isActive
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        -ml-0.5 mr-2 h-5 w-5
                        ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                    />
                    {aba.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      
      {/* Conteúdo das abas em modo visualização */}
      {isViewMode && abaAtiva === 'medias' && (
        <div className="max-h-96 overflow-y-auto">
          <MediasCalculadasTab medias={medias} loading={loadingMedias} />
        </div>
      )}
      
      {isViewMode && abaAtiva === 'historico' && (
        <HistoricoTab
          historico={historico}
          loading={loadingHistorico}
          onEdit={onRequestEdit ? handleHistoricoEdit : undefined}
        />
      )}
      
      {/* Formulário (modo criar/editar ou aba detalhes em visualização) */}
      {(!isViewMode || abaAtiva === 'detalhes') && (
        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seleção de Escola e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SearchableSelect
              label="Escola *"
              value={formData.escola_id}
              onChange={(value) => handleInputChange('escola_id', value)}
              options={unidadesEscolares.map(escola => ({
                value: escola.id,
                label: escola.nome_escola,
                description: `${escola.cidade} - ${escola.rota_nome || 'Sem rota'}`
              }))}
              placeholder="Selecione uma escola..."
              disabled={isViewMode || loadingEscolas}
              required
              renderOption={(option) => (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                  )}
                </div>
              )}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data *
            </label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              disabled={isViewMode}
              required
            />
          </div>
        </div>
        
        {/* Tabela de Quantidades */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Quantidade de Refeições Servidas
          </h3>
          
          <div className="space-y-3">
            {tiposDisponiveis.map(refeicao => (
              <div key={refeicao.key} className="flex items-center gap-3">
                <span className="text-2xl">{refeicao.icon}</span>
                <label className="flex-1 text-sm font-medium text-gray-700">
                  {refeicao.label}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantidades[refeicao.key]}
                  onChange={(e) => handleQuantidadeChange(refeicao.key, e.target.value)}
                  disabled={isViewMode}
                  className="w-24 text-center"
                  placeholder=""
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Botões */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => requestClose(onClose)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {registro ? 'Atualizar' : 'Salvar Registro'}
            </Button>
          </div>
        )}
        </form>
      )}
      
      {isViewMode && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => requestClose(onClose)}
          >
            Fechar
          </Button>
        </div>
      )}
    </Modal>
    <ConfirmModal
      isOpen={showConfirm}
      onClose={cancelClose}
      onConfirm={confirmClose}
      title={confirmTitle}
      message={confirmMessage}
      confirmText="Descartar"
      cancelText="Continuar editando"
      variant="danger"
    />
    </>
  );
};

export default RegistrosDiariosModal;

