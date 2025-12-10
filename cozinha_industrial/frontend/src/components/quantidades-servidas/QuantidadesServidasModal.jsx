import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input, SearchableSelect, ConfirmModal } from '../ui';
import { FaList, FaChartLine, FaHistory, FaSchool } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FoodsApiService from '../../services/FoodsApiService';
import { useAuth } from '../../contexts/AuthContext';
import quantidadesServidasService from '../../services/quantidadesServidas';
import periodosAtendimentoService from '../../services/periodosAtendimento';
import MediasCalculadasTab from './MediasCalculadasTab';
import HistoricoTab from './HistoricoTab';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';

const QuantidadesServidasModal = ({ 
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
  
  const criarEstadoInicial = useCallback(() => ({
    unidade_id: '',
    nutricionista_id: user?.id || '',
    data: getDataAtual(),
    quantidades: {} // Objeto dinâmico: { periodo_id: valor }
  }), [user]);

  const [periodosVinculados, setPeriodosVinculados] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  const [formData, setFormData] = useState(criarEstadoInicial());
  
  useEffect(() => {
    if (!isOpen || isViewMode) {
      resetDirty();
    }
  }, [isOpen, isViewMode, resetDirty]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(criarEstadoInicial());
      setDadosIniciaisCarregados(false);
      setUnidadeInicial(null);
      setDataInicial(null);
    }
  }, [isOpen, criarEstadoInicial]);
  
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
      // Processar quantidades: pode vir como objeto simples { periodo_id: valor } 
      // ou como objeto aninhado { periodo_id: { valor: ..., periodo_atendimento_id: ... } }
      const quantidadesProcessadas = {};
      if (registro.quantidades) {
        Object.keys(registro.quantidades).forEach(periodoId => {
          const valorPeriodo = registro.quantidades[periodoId];
          if (valorPeriodo && typeof valorPeriodo === 'object' && valorPeriodo.valor !== undefined) {
            // Se for objeto aninhado: { valor: 1, periodo_atendimento_id: 24, ... }
            quantidadesProcessadas[periodoId] = String(valorPeriodo.valor || '');
          } else {
            // Se for valor direto
            quantidadesProcessadas[periodoId] = valorPeriodo != null ? String(valorPeriodo) : '';
          }
        });
      }
      
      setFormData({
        unidade_id: registro.unidade_id || '',
        nutricionista_id: registro.nutricionista_id || user?.id || '',
        data: registro.data || new Date().toISOString().split('T')[0],
        quantidades: quantidadesProcessadas
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
  const [unidadeInicial, setUnidadeInicial] = useState(null);
  const [dataInicial, setDataInicial] = useState(null);

  // Atualizar valores iniciais quando registro carregar
  useEffect(() => {
    if (registro && isOpen) {
      setUnidadeInicial(registro.unidade_id);
      setDataInicial(registro.data);
    } else {
      setUnidadeInicial(null);
      setDataInicial(null);
    }
  }, [registro, isOpen]);

  // Carregar períodos de atendimento vinculados à unidade quando unidade mudar
  useEffect(() => {
    const buscarPeriodosPorUnidade = async () => {
      if (!isOpen || !formData.unidade_id) {
        setPeriodosVinculados([]);
        return;
      }

      try {
        setLoadingPeriodos(true);
        const response = await periodosAtendimentoService.buscarPeriodosPorUnidades([formData.unidade_id]);
        
        if (response.success && response.data && response.data.periodos) {
          // Ordenar períodos por nome
          const periodosOrdenados = [...response.data.periodos].sort((a, b) => 
            (a.nome || '').localeCompare(b.nome || '')
          );
          setPeriodosVinculados(periodosOrdenados);
          
          // Inicializar quantidades para os períodos encontrados (se não existirem)
          setFormData(prev => {
            const novasQuantidades = { ...prev.quantidades };
            periodosOrdenados.forEach(periodo => {
              if (!(periodo.id in novasQuantidades)) {
                novasQuantidades[periodo.id] = '';
              }
            });
            return {
              ...prev,
              quantidades: novasQuantidades
            };
          });
        } else {
          setPeriodosVinculados([]);
        }
      } catch (error) {
        console.error('Erro ao buscar períodos de atendimento:', error);
        setPeriodosVinculados([]);
      } finally {
        setLoadingPeriodos(false);
      }
    };

    buscarPeriodosPorUnidade();
  }, [isOpen, formData.unidade_id]);

  // Carregar registros existentes quando escola e data forem selecionados
  useEffect(() => {
    const carregarRegistrosExistentes = async () => {
      if (!isOpen || !formData.unidade_id || !formData.data) {
        return;
      }

      const estaEditando = Boolean(registro);

      if (estaEditando) {
        if (!dadosIniciaisCarregados || unidadeInicial === null || dataInicial === null) {
          return;
        }

        const unidadeMudou = formData.unidade_id !== unidadeInicial;
        const dataMudou = formData.data !== dataInicial;
        
        if (!unidadeMudou && !dataMudou) {
          return;
        }
      }

          const result = await quantidadesServidasService.buscarPorUnidadeData(
            formData.unidade_id,
            formData.data
          );
          
          if (result.success && result.data?.quantidades) {
            const quantidades = result.data.quantidades;
            // Normalizar quantidades: converter valores para string e usar periodo_id como chave
            const quantidadesNormalizadas = {};
            Object.keys(quantidades).forEach(periodoId => {
              const valor = quantidades[periodoId];
              if (valor && typeof valor === 'object' && valor.valor !== undefined) {
                // Se for objeto com estrutura { periodo_atendimento_id, valor, ... }
                quantidadesNormalizadas[valor.periodo_atendimento_id || periodoId] = String(valor.valor || '');
              } else {
                // Se for valor direto
                quantidadesNormalizadas[periodoId] = valor != null ? String(valor) : '';
              }
            });
            setFormData(prev => ({
              ...prev,
              quantidades: quantidadesNormalizadas
            }));
      }
    };
    
    carregarRegistrosExistentes();
  }, [
    formData.unidade_id,
    formData.data,
    registro,
    dadosIniciaisCarregados,
    unidadeInicial,
    dataInicial,
    isOpen
  ]);

  // Períodos disponíveis são os períodos vinculados à unidade selecionada
  // Cada período tem: { id, nome, codigo, status }
  
  // Carregar médias quando aba de médias for ativada (apenas em modo visualização)
  useEffect(() => {
    const carregarMedias = async () => {
      if (isViewMode && abaAtiva === 'medias' && formData.unidade_id) {
        setLoadingMedias(true);
        const result = await quantidadesServidasService.listarMedias(formData.unidade_id);
        if (result.success) {
          setMedias(result.data);
        }
        setLoadingMedias(false);
      }
    };
    
    carregarMedias();
  }, [abaAtiva, formData.unidade_id, isViewMode]);
  
  // Carregar histórico quando aba de histórico for ativada (apenas em modo visualização)
  useEffect(() => {
    const carregarHistorico = async () => {
      if (isViewMode && abaAtiva === 'historico' && formData.unidade_id) {
        setLoadingHistorico(true);
        
        try {
          const result = await quantidadesServidasService.listarHistorico(formData.unidade_id);
          
          if (result.success && result.data.length > 0) {
            // Transformar dados do backend para formato do HistoricoTab
            const historicoFormatado = result.data.map((reg, index) => ({
              acao: index === 0 ? 'criacao' : 'edicao',
              data_acao: reg.data_atualizacao || reg.data_cadastro,
              unidade_id: reg.unidade_id,
              unidade_nome: reg.unidade_nome,
              data: reg.data,
              nutricionista_id: reg.nutricionista_id,
              id: reg.id,
              usuario_nome: user?.nome,
              valores: reg.quantidades || {} // Objeto dinâmico com periodo_id como chave
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
  }, [abaAtiva, formData.unidade_id, isViewMode, user]);
  
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
    if (!formData.unidade_id) {
      toast.error('Selecione uma escola');
      return;
    }
    
    if (!formData.data) {
      toast.error('Selecione uma data');
      return;
    }
    
    // Buscar nome da escola selecionada
    const unidadeSelecionada = unidadesEscolares.find(e => e.id === formData.unidade_id);
    const unidade_nome = unidadeSelecionada ? unidadeSelecionada.nome_escola : `Unidade ID ${formData.unidade_id}`;
    
    // Adicionar nome da escola aos dados
    // Filtrar apenas períodos vinculados e converter valores para números
    const quantidadesFiltradas = {};
    periodosVinculados.forEach(periodo => {
      const periodoId = periodo.id;
      const valor = formData.quantidades[periodoId];
      if (valor !== undefined && valor !== null && valor !== '') {
        quantidadesFiltradas[periodoId] = Number(valor) || 0;
      }
    });

    // Validação: não permitir criar novo registro com todos os valores zero ou vazios
    if (!registro) {
      const valores = Object.values(quantidadesFiltradas);
      const temValorMaiorQueZero = valores.some(valor => Number(valor) > 0);
      
      if (!temValorMaiorQueZero) {
        toast.error('É necessário informar pelo menos uma quantidade maior que zero para criar um novo registro');
        return;
      }
    }

    const resultado = await onSave({
      ...formData,
      unidade_nome,
      quantidades: quantidadesFiltradas
    }, !registro); // Manter modal aberto se for novo registro (não edição)
    
    // Se o registro foi salvo com sucesso e deve manter o modal aberto (novo registro)
    if (resultado?.success && resultado?.manterModalAberto) {
      // Resetar o formulário para um novo registro
      setFormData(criarEstadoInicial());
      resetDirty();
      // Modal permanece aberto
    } else {
    resetDirty();
    }
  };

  const handleHistoricoEdit = (item) => {
    setAbaAtiva('detalhes');

    if (typeof onRequestEdit === 'function') {
      // Adaptar valores para estrutura dinâmica
      const quantidades = {};
      if (item.valores) {
        // Se valores já está no formato { periodo_id: valor }
        Object.keys(item.valores).forEach(periodoId => {
          quantidades[periodoId] = item.valores[periodoId] ?? 0;
        });
      }
      
      const registroParaEditar = {
        unidade_id: item.unidade_id,
        unidade_nome: item.unidade_nome,
        data: item.data,
        nutricionista_id: item.nutricionista_id,
        quantidades: quantidades
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
              label="Escola"
              value={formData.unidade_id}
              onChange={(value) => handleInputChange('unidade_id', value)}
              options={unidadesEscolares.map(escola => ({
                value: escola.id,
                label: escola.nome_escola,
                description: `${escola.cidade} - ${escola.rota_nome || 'Sem rota'}`
              }))}
              placeholder="Selecione uma escola..."
              disabled={isViewMode || loadingEscolas}
              required
              usePortal={false}
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
              Data <span className="text-red-500">*</span>
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
        
        {/* Tabela de Quantidades - Layout igual ao de Médias Calculadas */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              Quantidade de Refeições Servidas
            </h3>
          </div>
          
          {loadingPeriodos ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Carregando períodos...</span>
            </div>
          ) : periodosVinculados.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500">
              {formData.unidade_id 
                ? 'Nenhum período de atendimento vinculado a esta unidade. Vá em "Períodos de Atendimento" para vincular períodos.'
                : 'Selecione uma unidade para ver os períodos de atendimento disponíveis.'}
            </div>
          ) : (
            <>
              {/* Desktop - Tabela */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                      {periodosVinculados.map(periodo => (
                        <th key={periodo.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {periodo.nome || periodo.codigo || `Período ${periodo.id}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FaSchool className="text-green-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formData.unidade_id 
                              ? unidadesEscolares.find(u => u.id === parseInt(formData.unidade_id))?.nome_escola || 
                                unidadesEscolares.find(u => u.id === parseInt(formData.unidade_id))?.nome || 
                                `Unidade ID ${formData.unidade_id}`
                              : 'Selecione uma unidade'}
                          </span>
                        </div>
                      </td>
                      {periodosVinculados.map(periodo => {
                        const valor = formData.quantidades[periodo.id] || '';
                        const corIndex = periodo.id % 8;
                        const cores = [
                          'bg-blue-100 text-blue-800',
                          'bg-green-100 text-green-800',
                          'bg-purple-100 text-purple-800',
                          'bg-orange-100 text-orange-800',
                          'bg-rose-100 text-rose-800',
                          'bg-yellow-100 text-yellow-800',
                          'bg-indigo-100 text-indigo-800',
                          'bg-pink-100 text-pink-800'
                        ];
                        
                        return (
                          <td key={periodo.id} className="px-6 py-4 text-center">
                            {isViewMode ? (
                              <span className={`inline-flex items-center px-3 py-1 ${cores[corIndex]} rounded-full text-sm font-medium`}>
                                {valor || '0'}
                              </span>
                            ) : (
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={valor}
                                onChange={(e) => handleQuantidadeChange(periodo.id, e.target.value)}
                                className="w-24 text-center mx-auto"
                                placeholder="0"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Mobile - Cards */}
              <div className="xl:hidden p-4 space-y-3">
                <div className="bg-white rounded-lg shadow-sm p-4 border">
                  <div className="flex items-center mb-3">
                    <FaSchool className="text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {formData.unidade_id 
                        ? unidadesEscolares.find(u => u.id === parseInt(formData.unidade_id))?.nome_escola || 
                          unidadesEscolares.find(u => u.id === parseInt(formData.unidade_id))?.nome || 
                          `Unidade ID ${formData.unidade_id}`
                        : 'Selecione uma unidade'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {periodosVinculados.map(periodo => {
                      const valor = formData.quantidades[periodo.id] || '';
                      const corIndex = periodo.id % 8;
                      const cores = [
                        'bg-blue-100 text-blue-800',
                        'bg-green-100 text-green-800',
                        'bg-purple-100 text-purple-800',
                        'bg-orange-100 text-orange-800',
                        'bg-rose-100 text-rose-800',
                        'bg-yellow-100 text-yellow-800',
                        'bg-indigo-100 text-indigo-800',
                        'bg-pink-100 text-pink-800'
                      ];
                      
                      return (
                        <div key={periodo.id} className="flex justify-between items-center">
                          <span className="text-gray-500">
                            {periodo.nome || periodo.codigo || `Período ${periodo.id}`}:
                          </span>
                          {isViewMode ? (
                            <span className={`px-2 py-0.5 ${cores[corIndex]} rounded-full font-medium`}>
                              {valor || '0'}
                            </span>
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={valor}
                              onChange={(e) => handleQuantidadeChange(periodo.id, e.target.value)}
                              className="w-20 text-center text-xs"
                              placeholder="0"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
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

export default QuantidadesServidasModal;

