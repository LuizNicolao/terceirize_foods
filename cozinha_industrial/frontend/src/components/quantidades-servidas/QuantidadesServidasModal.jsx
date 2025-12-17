import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, ConfirmModal } from '../ui';
import { FaList, FaChartLine, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';
import FoodsApiService from '../../services/FoodsApiService';
import { useAuth } from '../../contexts/AuthContext';
import quantidadesServidasService from '../../services/quantidadesServidas';
import periodosAtendimentoService from '../../services/periodosAtendimento';
import tiposCardapioService from '../../services/tiposCardapio';
import MediasCalculadasTab from './MediasCalculadasTab';
import HistoricoTab from './HistoricoTab';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';
import { SelecaoUnidadeData, TabelaQuantidades } from './sections';

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
  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [filialId, setFilialId] = useState('');
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
    filial_id: '',
    unidade_id: '',
    nutricionista_id: user?.id || '',
    data: getDataAtual(),
    quantidades: {} // Objeto dinâmico: { "tipo_cardapio_id-periodo_id": valor }
  }), [user]);

  const [periodosVinculados, setPeriodosVinculados] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [tiposCardapio, setTiposCardapio] = useState([]);
  const [loadingTiposCardapio, setLoadingTiposCardapio] = useState(false);
  const [produtosPorTipoCardapio, setProdutosPorTipoCardapio] = useState({}); // { tipo_cardapio_id: [produtos] }

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
      setFilialId('');
      setUnidadesEscolares([]);
    }
  }, [isOpen, criarEstadoInicial]);

  // Carregar filiais quando modal abrir
  useEffect(() => {
    const carregarFiliais = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingFiliais(true);
        let allFiliaisData = [];
        let page = 1;
        const limit = 100;
        let hasMore = true;
        
        // Buscar todas as filiais fazendo múltiplas requisições (paginação)
        while (hasMore && page <= 50) {
          const result = await FoodsApiService.getFiliais({
            page,
            limit
          });
          
          if (result.success && result.data) {
            // Verificar se é uma resposta HATEOAS ou direta
            let items = [];
            if (result.data.items && Array.isArray(result.data.items)) {
              items = result.data.items;
            } else if (Array.isArray(result.data)) {
              items = result.data;
            } else if (result.data.data && Array.isArray(result.data.data)) {
              items = result.data.data;
            }
            
            if (items.length > 0) {
              allFiliaisData = [...allFiliaisData, ...items];
            }
            
            // Verificar se há mais páginas
            if (items.length < limit) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        }
        
        // Filtrar apenas filiais ativas (status pode ser 1, 'ativo', ou true)
        const filiaisAtivas = allFiliaisData.filter(filial => {
          const status = filial.status;
          return status === 1 || status === 'ativo' || status === true || status === '1';
        });
        
        setFiliais(filiaisAtivas);
      } catch (error) {
        console.error('Erro ao carregar filiais:', error);
        toast.error('Erro ao carregar filiais. Verifique a conexão com o sistema Foods.');
        setFiliais([]);
      } finally {
        setLoadingFiliais(false);
      }
    };
    
    carregarFiliais();
  }, [isOpen]);

  // Carregar unidades escolares quando filial for selecionada
  useEffect(() => {
    const carregarUnidadesPorFilial = async () => {
      if (!isOpen || !filialId) {
        setUnidadesEscolares([]);
        return;
      }
      
      try {
        setLoadingEscolas(true);
        let todasEscolas = [];
        let page = 1;
        let hasMore = true;
        const limit = 100;
        
        // Buscar todas as unidades fazendo múltiplas requisições
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
        
        // Filtrar apenas unidades da filial selecionada
        const unidadesFiltradas = todasEscolas.filter(unidade => {
          if (unidade.filial_id) {
            return parseInt(unidade.filial_id) === parseInt(filialId);
          }
          return false;
        });
        
        setUnidadesEscolares(unidadesFiltradas);
      } catch (error) {
        console.error('Erro ao carregar unidades escolares:', error);
        setUnidadesEscolares([]);
      } finally {
        setLoadingEscolas(false);
      }
    };
    
    carregarUnidadesPorFilial();
  }, [isOpen, filialId]);
  
  // Estado para controlar se já carregou os dados iniciais
  const [dadosIniciaisCarregados, setDadosIniciaisCarregados] = useState(false);
  // Flag para controlar se já buscou os dados completos quando está editando
  const [dadosCompletosBuscados, setDadosCompletosBuscados] = useState(false);

  // Carregar dados do registro ao editar
  useEffect(() => {
    if (registro && isOpen) {
      // Quando há um registro, definir apenas os dados básicos
      // As quantidades serão carregadas pelo carregarRegistrosExistentes
      // que busca os dados completos do backend (incluindo produto_comercial_id)
      setFormData({
        filial_id: registro.filial_id || '',
        unidade_id: registro.unidade_id || '',
        nutricionista_id: registro.nutricionista_id || user?.id || '',
        data: registro.data || new Date().toISOString().split('T')[0],
        tipo_cardapio_id: registro.tipo_cardapio_id || '',
        quantidades: {} // Será preenchido pelo carregarRegistrosExistentes
      });
      
      // Atualizar filialId para preencher o select de filiais
      if (registro.filial_id) {
        setFilialId(String(registro.filial_id));
      }
      setUnidadeInicial(registro.unidade_id);
      setDataInicial(registro.data);
      setDadosIniciaisCarregados(true);
      setDadosCompletosBuscados(false); // Resetar flag para permitir busca dos dados completos
      resetDirty();
    } else if (!registro && isOpen) {
      // Resetar para novo registro com data atual
      setFormData(criarEstadoInicial());
      setUnidadeInicial(null);
      setDataInicial(null);
      setDadosIniciaisCarregados(false);
      setDadosCompletosBuscados(false);
      resetDirty();
    }
  }, [registro, isOpen, user, resetDirty]);

  // Armazenar valores iniciais da escola e data para comparação
  const [unidadeInicial, setUnidadeInicial] = useState(null);
  const [dataInicial, setDataInicial] = useState(null);

  // Carregar tipos de cardápio vinculados à unidade quando unidade mudar
  useEffect(() => {
    const buscarTiposCardapioPorUnidade = async () => {
      if (!isOpen || !formData.unidade_id) {
        setTiposCardapio([]);
        return;
      }

      try {
        setLoadingTiposCardapio(true);
        // Buscar tipos de cardápio vinculados à unidade
        const response = await tiposCardapioService.buscarTiposCardapioPorUnidades([formData.unidade_id]);
        
        if (response.success && response.data) {
          // Verificar diferentes formatos de resposta
          let tiposCardapioData = [];
          if (response.data.tipos_cardapio && Array.isArray(response.data.tipos_cardapio)) {
            tiposCardapioData = response.data.tipos_cardapio;
          } else if (Array.isArray(response.data)) {
            tiposCardapioData = response.data;
          }
          
          if (tiposCardapioData.length > 0) {
            // Ordenar tipos de cardápio por nome
            const tiposOrdenados = [...tiposCardapioData].sort((a, b) => 
              (a.nome || '').localeCompare(b.nome || '')
            );
            setTiposCardapio(tiposOrdenados);
            
            // Buscar produtos comerciais vinculados a cada tipo de cardápio
            const produtosMap = {};
            for (const tipoCardapio of tiposOrdenados) {
              try {
                const produtosResponse = await tiposCardapioService.buscarProdutosVinculados(tipoCardapio.id);
                if (produtosResponse.success && produtosResponse.data) {
                  produtosMap[tipoCardapio.id] = produtosResponse.data.map(p => ({
                    id: p.produto_comercial_id,
                    nome: p.produto_comercial_nome || `Produto ${p.produto_comercial_id}`
                  }));
                } else {
                  produtosMap[tipoCardapio.id] = [];
                }
              } catch (error) {
                console.error(`Erro ao buscar produtos do tipo de cardápio ${tipoCardapio.id}:`, error);
                produtosMap[tipoCardapio.id] = [];
              }
            }
            setProdutosPorTipoCardapio(produtosMap);
          } else {
            setTiposCardapio([]);
            setProdutosPorTipoCardapio({});
          }
    } else {
          setTiposCardapio([]);
        }
      } catch (error) {
        console.error('Erro ao buscar tipos de cardápio:', error);
        setTiposCardapio([]);
      } finally {
        setLoadingTiposCardapio(false);
    }
    };

    buscarTiposCardapioPorUnidade();
  }, [isOpen, formData.unidade_id]);

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
        // Se está editando, sempre buscar os dados completos do backend
        // para garantir que temos produto_comercial_id nas quantidades
        // Mas aguardar que os dados iniciais sejam carregados primeiro
        if (!dadosIniciaisCarregados || unidadeInicial === null || dataInicial === null) {
          return;
        }

        // Se já buscou os dados completos e unidade/data não mudaram, não buscar novamente
        if (dadosCompletosBuscados) {
          const unidadeMudou = formData.unidade_id !== unidadeInicial;
          const dataMudou = formData.data !== dataInicial;
          
          if (!unidadeMudou && !dataMudou) {
            return;
          } else {
            // Se unidade ou data mudaram, resetar flag para permitir nova busca
            setDadosCompletosBuscados(false);
          }
        }
      } else {
        // Se não está editando, verificar se unidade ou data mudaram
        if (unidadeInicial !== null && dataInicial !== null) {
        const unidadeMudou = formData.unidade_id !== unidadeInicial;
        const dataMudou = formData.data !== dataInicial;
        
        if (!unidadeMudou && !dataMudou) {
          return;
          }
        }
      }

          const result = await quantidadesServidasService.buscarPorUnidadeData(
            formData.unidade_id,
            formData.data
          );
          
          if (result.success && result.data?.quantidades) {
            const quantidades = result.data.quantidades;
            const filialId = result.data.filial_id;
            const filialNome = result.data.filial_nome;
        
        // O backend já retorna as chaves no formato correto: tipo_cardapio_id-produto_id-periodo_id
        // Apenas converter os valores para string
            const quantidadesNormalizadas = {};
        Object.keys(quantidades).forEach(chave => {
          const valor = quantidades[chave];
          
              if (valor && typeof valor === 'object' && valor.valor !== undefined) {
            // O backend já retornou a chave correta, apenas extrair o valor
            // A chave já está no formato: tipo_cardapio_id-produto_id-periodo_id
            quantidadesNormalizadas[chave] = String(valor.valor || '');
          } else if (typeof valor === 'number' || typeof valor === 'string') {
            // Se for valor direto (compatibilidade com formato antigo)
            quantidadesNormalizadas[chave] = valor != null ? String(valor) : '';
              }
            });
        
            setFormData(prev => ({
              ...prev,
              filial_id: filialId || prev.filial_id || '',
          quantidades: quantidadesNormalizadas,
          tipos_cardapio_quantidades: prev.tipos_cardapio_quantidades || {}
            }));
            
            // Atualizar filialId para preencher o select de filiais
            if (filialId) {
              setFilialId(String(filialId));
            }
            
            // Marcar que os dados completos foram buscados
            if (estaEditando) {
              setDadosCompletosBuscados(true);
            }
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
              data_cadastro: reg.data_cadastro,
              data_atualizacao: reg.data_atualizacao,
              unidade_id: reg.unidade_id,
              unidade_nome: reg.unidade_nome,
              data: reg.data,
              nutricionista_id: reg.nutricionista_id,
              id: reg.id,
              usuario_nome: user?.nome,
              tipo_cardapio_id: reg.tipo_cardapio_id,
              tipo_cardapio_nome: reg.tipo_cardapio_info !== 'N/A' ? reg.tipo_cardapio_info : null,
              produto_comercial_id: reg.produto_comercial_id,
              valores: reg.valores || {} // Objeto dinâmico com periodo_id como chave: { periodo_id: { valor, periodo_nome, periodo_codigo } }
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
  
  const handleFilialChange = (value) => {
    setFilialId(value || '');
    // Limpar seleção de unidade quando filial mudar
    setFormData(prev => ({
      ...prev,
      filial_id: value || '',
      unidade_id: ''
    }));
    if (!isViewMode) {
      markDirty();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (!isViewMode) {
      markDirty();
    }
  };
  
  const handleQuantidadeChange = (tipoCardapioId, produtoId, periodoId, value) => {
    const valorNormalizado = value === '' ? '' : String(Math.max(0, parseInt(value, 10) || 0));
    const chave = `${tipoCardapioId || 'sem-tipo'}-${produtoId || 'sem-produto'}-${periodoId}`;

    setFormData(prev => ({
      ...prev,
      quantidades: {
        ...prev.quantidades,
        [chave]: valorNormalizado
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
      toast.error('Selecione uma cozinha industrial');
      return;
    }
    
    if (!formData.data) {
      toast.error('Selecione uma data');
      return;
    }
    
    // Buscar nome da escola selecionada
    const unidadeSelecionada = unidadesEscolares.find(e => e.id === formData.unidade_id);
    const unidade_nome = unidadeSelecionada ? unidadeSelecionada.nome_escola : `Unidade ID ${formData.unidade_id}`;
    
    // Buscar nome da filial selecionada
    const filialSelecionada = filiais.find(f => String(f.id) === String(filialId));
    const filial_nome = filialSelecionada 
      ? (filialSelecionada.filial || filialSelecionada.nome || `Filial ${filialSelecionada.id}`)
      : null;
    
    // Adicionar nome da escola e filial aos dados
    // Filtrar apenas valores válidos e converter para números
    // Estrutura: { "tipo_cardapio_id-produto_id-periodo_id": valor }
    const tiposCardapioQuantidadesFiltradas = {};
    tiposCardapio.forEach(tipoCardapio => {
      const produtos = produtosPorTipoCardapio[tipoCardapio.id] || [];
      produtos.forEach(produto => {
    periodosVinculados.forEach(periodo => {
          const chave = `${tipoCardapio.id}-${produto.id}-${periodo.id}`;
          const valor = formData.quantidades[chave];
      if (valor !== undefined && valor !== null && valor !== '') {
            tiposCardapioQuantidadesFiltradas[chave] = {
              tipo_cardapio_id: tipoCardapio.id,
              produto_comercial_id: produto.id,
              periodo_atendimento_id: periodo.id,
              valor: Number(valor) || 0
            };
      }
        });
      });
    });

    // Validação: não permitir criar novo registro com todos os valores zero ou vazios
    if (!registro) {
      const valores = Object.values(tiposCardapioQuantidadesFiltradas).map(q => q.valor);
      const temValorMaiorQueZero = valores.some(valor => Number(valor) > 0);
      
      if (!temValorMaiorQueZero) {
        toast.error('É necessário informar pelo menos uma quantidade maior que zero para criar um novo registro');
        return;
      }
    }

    const resultado = await onSave({
      ...formData,
      unidade_nome,
      filial_id: filialId ? parseInt(filialId) : null,
      filial_nome,
      quantidades: {}, // Períodos sem tipo de cardápio (compatibilidade com registros antigos)
      tipos_cardapio_quantidades: tiposCardapioQuantidadesFiltradas
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
      // Adaptar valores para estrutura dinâmica com tipo_cardapio_id e produto_comercial_id
      const quantidades = {};
      if (item.valores) {
        Object.keys(item.valores).forEach(periodoId => {
          const valorPeriodo = item.valores[periodoId];
          
          if (valorPeriodo && typeof valorPeriodo === 'object' && valorPeriodo.valor !== undefined) {
            // Se for objeto com estrutura completa
            const tipoCardapioId = valorPeriodo.tipo_cardapio_id || item.tipo_cardapio_id || null;
            const produtoId = valorPeriodo.produto_comercial_id || null;
            const periodoIdNum = valorPeriodo.periodo_atendimento_id || parseInt(periodoId);
            
            const chave = tipoCardapioId 
              ? `${tipoCardapioId}-${produtoId || 'sem-produto'}-${periodoIdNum}` 
              : `sem-tipo-${produtoId || 'sem-produto'}-${periodoIdNum}`;
            
            quantidades[chave] = {
              tipo_cardapio_id: tipoCardapioId,
              produto_comercial_id: produtoId,
              periodo_atendimento_id: periodoIdNum,
              valor: valorPeriodo.valor ?? 0
            };
          } else {
            // Se for valor direto (formato antigo)
            const valorNum = typeof valorPeriodo === 'object' ? (valorPeriodo.valor ?? 0) : (valorPeriodo ?? 0);
            const tipoCardapioId = item.tipo_cardapio_id || null;
            const chave = tipoCardapioId 
              ? `${tipoCardapioId}-sem-produto-${periodoId}` 
              : `sem-tipo-sem-produto-${periodoId}`;
            
            quantidades[chave] = {
              tipo_cardapio_id: tipoCardapioId,
              produto_comercial_id: null,
              periodo_atendimento_id: parseInt(periodoId),
              valor: valorNum
            };
          }
        });
      }
      
      const registroParaEditar = {
        unidade_id: item.unidade_id,
        unidade_nome: item.unidade_nome,
        data: item.data,
        nutricionista_id: item.nutricionista_id,
        tipo_cardapio_id: item.tipo_cardapio_id || '',
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
          {/* Seção: Seleção de Unidade e Data */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <SelecaoUnidadeData
              formData={formData}
              filiais={filiais}
              filialId={filialId}
              loadingFiliais={loadingFiliais}
              unidadesEscolares={unidadesEscolares}
              loadingEscolas={loadingEscolas}
              isViewMode={isViewMode}
              onFilialChange={handleFilialChange}
              onInputChange={handleInputChange}
            />
          </div>
          
          {/* Seção: Tabela de Quantidades */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">
              Quantidade de Refeições Servidas
            </h3>
                {(tiposCardapio.length > 0 || periodosVinculados.length > 0) && (
                  <div className="text-xs text-gray-500">
                    {periodosVinculados.length} período(s) • {tiposCardapio.length} tipo(s) de cardápio
                        </div>
                )}
              </div>
                  </div>
                  
            <div className="p-4">
              <TabelaQuantidades
                formData={formData}
                unidadesEscolares={unidadesEscolares}
                periodosVinculados={periodosVinculados}
                tiposCardapio={tiposCardapio}
                produtosPorTipoCardapio={produtosPorTipoCardapio}
                loadingPeriodos={loadingPeriodos}
                loadingTiposCardapio={loadingTiposCardapio}
                isViewMode={isViewMode}
                onQuantidadeChange={handleQuantidadeChange}
              />
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

export default QuantidadesServidasModal;

