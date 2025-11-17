import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SearchableSelect } from '../ui';
import { FaCalculator, FaSave, FaTimes } from 'react-icons/fa';
import { useNecessidades } from '../../hooks/necessidades';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import { calcularSemanaAbastecimento } from '../../utils/semanasAbastecimentoUtils';
import TipoAtendimentoEscolaService from '../../services/tipoAtendimentoEscolaService';
import toast from 'react-hot-toast';

// Função para obter a data atual no formato YYYY-MM-DD (sem problemas de fuso horário)
const obterDataAtual = () => {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const NecessidadeModal = ({ isOpen, onClose, onSave, escolas = [], grupos = [], loading = false }) => {
  const {
    produtos,
    percapitas,
    mediasPeriodo,
    carregarProdutosPorGrupo,
    calcularMediasPorPeriodo,
    limparMediasPeriodo,
    loading: necessidadesLoading,
    error: necessidadesError
  } = useNecessidades();

  // Hook para semanas de consumo do calendário
  const { opcoes: opcoesSemanasConsumo, obterValorPadrao: obterValorPadraoConsumo } = useSemanasConsumo();

  const [formData, setFormData] = useState({
    escola_id: '',
    escola: null, // Objeto completo da escola
    grupo_id: '',
    grupo: null, // Objeto completo do grupo
    data: '' // Será inicializado com semana atual
  });

  // Inicializar com semana de consumo atual
  useEffect(() => {
    const semanaConsumoAtual = obterValorPadraoConsumo();
    if (semanaConsumoAtual) {
      setFormData(prev => ({
        ...prev,
        data: semanaConsumoAtual
      }));
    }
  }, [obterValorPadraoConsumo]);

  const [produtosTabela, setProdutosTabela] = useState([]);
  const [tiposAtendimentoEscola, setTiposAtendimentoEscola] = useState([]);
  const [loadingTiposAtendimento, setLoadingTiposAtendimento] = useState(false);

  // Limpar dados quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      // Limpar dados imediatamente quando modal é fechado
      const semanaAtual = obterValorPadraoConsumo();
      setFormData({
        escola_id: '',
        escola: null,
        grupo_id: '',
        grupo: null,
        data: semanaAtual || ''
      });
      setProdutosTabela([]);
      setTiposAtendimentoEscola([]);
    }
  }, [isOpen, obterValorPadraoConsumo]);

  // Buscar tipos de atendimento quando escola for selecionada
  useEffect(() => {
    const buscarTiposAtendimento = async () => {
      if (formData.escola_id) {
        setLoadingTiposAtendimento(true);
        try {
          const result = await TipoAtendimentoEscolaService.buscarPorEscola(formData.escola_id);
          if (result.success) {
            const tipos = result.data.map(item => item.tipo_atendimento);
            setTiposAtendimentoEscola(tipos);
          } else {
            setTiposAtendimentoEscola([]);
          }
        } catch (error) {
          console.error('Erro ao buscar tipos de atendimento:', error);
          setTiposAtendimentoEscola([]);
        } finally {
          setLoadingTiposAtendimento(false);
        }
      } else {
        setTiposAtendimentoEscola([]);
      }
    };

    if (isOpen && formData.escola_id) {
      buscarTiposAtendimento();
    }
  }, [isOpen, formData.escola_id]);


  // Carregar produtos quando grupo mudar
  useEffect(() => {
    if (isOpen && formData.grupo_id) {
      carregarProdutosPorGrupo(formData.grupo_id);
    }
  }, [isOpen, formData.grupo_id, carregarProdutosPorGrupo]);

  // Calcular médias quando escola e data mudarem
  useEffect(() => {
    if (isOpen && formData.escola_id && formData.data) {
      calcularMediasPorPeriodo(formData.escola_id, formData.data);
    }
  }, [isOpen, formData.escola_id, formData.data, calcularMediasPorPeriodo]);

  // Função auxiliar para verificar se um tipo de atendimento está disponível
  const tipoDisponivel = (tipo) => {
    // Se não há tipos vinculados (escola não selecionada ou sem vínculos), mostrar todos
    if (!tiposAtendimentoEscola || tiposAtendimentoEscola.length === 0) {
      return true;
    }
    // Mapear tipos para os valores do banco
    const mapeamentoTipos = {
      'lanche_manha': 'lanche_manha',
      'almoco': 'almoco',
      'lanche_tarde': 'lanche_tarde',
      'parcial_manha': 'parcial_manha',
      'parcial_tarde': 'parcial_tarde',
      'eja': 'eja'
    };
    const tipoMapeado = mapeamentoTipos[tipo];
    if (!tipoMapeado) {
      return false;
    }
    return tiposAtendimentoEscola.includes(tipoMapeado);
  };

  // Configuração dos tipos de atendimento para renderização dinâmica
  const tiposConfig = [
    { 
      key: 'lanche_manha', 
      label: '🌅 LANCHE DA MANHA', 
      bgColor: 'bg-green-600', 
      bgCellColor: 'bg-green-50',
      icon: '🌅'
    },
    { 
      key: 'almoco', 
      label: '🍽️ ALMOÇO', 
      bgColor: 'bg-blue-600', 
      bgCellColor: 'bg-blue-50',
      icon: '🍽️'
    },
    { 
      key: 'lanche_tarde', 
      label: '🌆 LANCHE DA TARDE', 
      bgColor: 'bg-orange-600', 
      bgCellColor: 'bg-orange-50',
      icon: '🌆'
    },
    { 
      key: 'parcial_manha', 
      label: '🥗 PARCIAL MANHÃ', 
      bgColor: 'bg-purple-600', 
      bgCellColor: 'bg-purple-50',
      icon: '🥗',
      checkFunction: () => tiposAtendimentoEscola.includes('parcial_manha')
    },
    { 
      key: 'parcial_tarde', 
      label: '🥗 PARCIAL TARDE', 
      bgColor: 'bg-purple-700', 
      bgCellColor: 'bg-purple-100',
      icon: '🥗',
      checkFunction: () => tiposAtendimentoEscola.includes('parcial_tarde')
    },
    { 
      key: 'eja', 
      label: '🌙 EJA', 
      bgColor: 'bg-indigo-600', 
      bgCellColor: 'bg-indigo-50',
      icon: '🌙'
    }
  ];

  // Filtrar tipos disponíveis
  const tiposDisponiveis = tiposConfig.filter(tipo => {
    if (tipo.checkFunction) {
      return tipo.checkFunction();
    }
    return tipoDisponivel(tipo.key);
  });

  useEffect(() => {
    if (isOpen) {
      // console.log('[NecessidadeModal] ✅ tipos de atendimento disponíveis na tela', tiposDisponiveis.map(tipo => tipo.key));
    }
  }, [isOpen, tiposDisponiveis]);

  // Inicializar tabela quando produtos estiverem carregados
  useEffect(() => {
    if (isOpen && produtos.length > 0 && formData.grupo_id && formData.escola_id && formData.data) {
      // Verificar se as médias foram carregadas corretamente
      // Agora verificar apenas os tipos disponíveis
      const mediasCarregadas = Object.keys(mediasPeriodo).length > 0;
      
      // Aguardar tipos de atendimento serem carregados se escola estiver selecionada
      if (formData.escola_id && loadingTiposAtendimento) {
        return; // Aguardar carregamento dos tipos
      }
      
      if (mediasCarregadas) {
        inicializarTabelaProdutos();
      } else {
        // Se as médias não foram carregadas, aguardar mais um pouco
        const timer = setTimeout(() => {
          if (Object.keys(mediasPeriodo).length > 0) {
            inicializarTabelaProdutos();
          }
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, produtos, percapitas, mediasPeriodo, formData.grupo_id, formData.escola_id, formData.data, tiposAtendimentoEscola, loadingTiposAtendimento]);

  const inicializarTabelaProdutos = () => {
    // Preservar ajustes existentes
    const ajustesExistentes = {};
    produtosTabela.forEach(produto => {
      ajustesExistentes[produto.produto_id] = produto.ajuste;
    });
    
    const produtosComCalculos = produtos.map(produto => {
      // Usar valores reais do banco de dados com os 5 novos tipos (diretamente do produto)
      const percapitaLancheManha = Number(produto.per_capita_lanche_manha) || 0;
      const percapitaAlmoco = Number(produto.per_capita_almoco) || 0;
      const percapitaLancheTarde = Number(produto.per_capita_lanche_tarde) || 0;
      const percapitaParcial = Number(produto.per_capita_parcial) || 0;
      const percapitaParcialManha = Number(produto.per_capita_parcial_manha ?? percapitaParcial) || percapitaParcial;
      const percapitaParcialTarde = Number(produto.per_capita_parcial_tarde ?? percapitaParcial) || percapitaParcial;
      const percapitaEja = Number(produto.per_capita_eja) || 0;


      // Médias das escolas (número de alunos) - AUTOMÁTICO
      // Usar a estrutura correta das médias com os 5 novos tipos
      const mediaLancheManha = Math.round(Number(mediasPeriodo.lanche_manha?.media || 0)); // Número inteiro
      const mediaAlmoco = Math.round(Number(mediasPeriodo.almoco?.media || 0)); // Número inteiro
      const mediaLancheTarde = Math.round(Number(mediasPeriodo.lanche_tarde?.media || 0)); // Número inteiro
      const mediaParcial = Math.round(Number(mediasPeriodo.parcial?.media || 0)); // Número inteiro
      const mediaParcialManha = Math.round(Number(mediasPeriodo.parcial_manha?.media ?? mediasPeriodo.parcial?.media ?? 0));
      const mediaParcialTarde = Math.round(Number(mediasPeriodo.parcial_tarde?.media ?? mediasPeriodo.parcial?.media ?? 0));
      const mediaEja = Math.round(Number(mediasPeriodo.eja?.media || 0)); // Número inteiro
      
      // EDIÇÃO MANUAL (comentado - usar apenas se necessário no futuro)
      // const frequenciaAlmoco = 0; // Será editável
      // const frequenciaParcial = 0; // Será editável
      // const frequenciaLanche = 0; // Será editável
      // const frequenciaEja = 0; // Será editável

      // QTD inicial vazia - será calculada automaticamente quando o usuário preencher a frequência
      const qtdLancheManha = 0;
      const qtdAlmoco = 0;
      const qtdLancheTarde = 0;
      const qtdParcial = 0;
      const qtdParcialManha = 0;
      const qtdParcialTarde = 0;
      const qtdEja = 0;

      // Total - considerar apenas tipos disponíveis
      const qtds = {
        qtd_lanche_manha: qtdLancheManha,
        qtd_almoco: qtdAlmoco,
        qtd_lanche_tarde: qtdLancheTarde,
        qtd_parcial: qtdParcial,
        qtd_parcial_manha: qtdParcialManha,
        qtd_parcial_tarde: qtdParcialTarde,
        qtd_eja: qtdEja
      };
      const total = tiposDisponiveis.reduce((sum, tipo) => {
        const qtdKey = `qtd_${tipo.key}`;
        return sum + (qtds[qtdKey] || 0);
      }, 0);

      const produtoFinal = {
        id: produto.produto_id,
        nome: produto.produto_nome,
        unidade_medida: produto.unidade_medida,
        percapita_lanche_manha: percapitaLancheManha,
        percapita_almoco: percapitaAlmoco,
        percapita_lanche_tarde: percapitaLancheTarde,
        percapita_parcial: percapitaParcial,
        percapita_parcial_manha: percapitaParcialManha,
        percapita_parcial_tarde: percapitaParcialTarde,
        percapita_eja: percapitaEja,
        media_lanche_manha: mediaLancheManha, // Média das escolas (número de alunos)
        media_almoco: mediaAlmoco,
        media_lanche_tarde: mediaLancheTarde,
        media_parcial: mediaParcial,
        media_parcial_manha: mediaParcialManha,
        media_parcial_tarde: mediaParcialTarde,
        media_eja: mediaEja,
        frequencia_lanche_manha: '', // Começar em branco (editável)
        frequencia_almoco: '',
        frequencia_lanche_tarde: '',
        frequencia_parcial: '',
        frequencia_parcial_manha: '',
        frequencia_parcial_tarde: '',
        frequencia_eja: '',
        qtd_lanche_manha: qtdLancheManha, // Usar cálculo inicial
        qtd_almoco: qtdAlmoco,
        qtd_lanche_tarde: qtdLancheTarde,
        qtd_parcial: qtdParcial,
        qtd_parcial_manha: qtdParcialManha,
        qtd_parcial_tarde: qtdParcialTarde,
        qtd_eja: qtdEja,
        total: total, // Usar total calculado
        ajuste: ajustesExistentes[produto.produto_id] || '' // Preservar ajuste existente ou inicializar em branco
      };

      // console.log('[NecessidadeModal] ✅ produto calculado', {
      //   produtoId: produtoFinal.id,
      //   medias: {
      //     lanche_manha: produtoFinal.media_lanche_manha,
      //     parcial_manha: produtoFinal.media_parcial_manha,
      //     almoco: produtoFinal.media_almoco,
      //     lanche_tarde: produtoFinal.media_lanche_tarde,
      //     parcial_tarde: produtoFinal.media_parcial_tarde,
      //     eja: produtoFinal.media_eja
      //   }
      // });

      return produtoFinal;
    });

    setProdutosTabela(produtosComCalculos);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAjusteChange = (produtoId, valor) => {
    setProdutosTabela(prev => prev.map(produto => {
      if (produto.id === produtoId) {
        // Se o valor estiver vazio, manter vazio
        if (valor === '' || valor === null || valor === undefined) {
          return { ...produto, ajuste: '' };
        }
        return { ...produto, ajuste: parseFloat(valor) || 0 };
      }
      return produto;
    }));
  };

  const handleFrequenciaChange = (produtoId, tipo, valor) => {
    // Se o valor estiver vazio, manter vazio
    if (valor === '' || valor === null || valor === undefined) {
      setProdutosTabela(prev => prev.map(produto => {
        if (produto.id === produtoId) {
          const updated = { ...produto };
          updated[`frequencia_${tipo}`] = '';
          updated[`qtd_${tipo}`] = 0;
          
          // Recalcular total considerando apenas tipos disponíveis
          const total = tiposDisponiveis.reduce((sum, tipoDisponivel) => {
            const qtdKey = `qtd_${tipoDisponivel.key}`;
            return sum + (updated[qtdKey] || 0);
          }, 0);
          updated.total = Number(total);
          
          return updated;
        }
        return produto;
      }));
      return;
    }

    const novaFrequencia = Math.round(parseFloat(valor)) || 0; // Número inteiro
    setProdutosTabela(prev => prev.map(produto => {
      if (produto.id === produtoId) {
        const updated = { ...produto };
        updated[`frequencia_${tipo}`] = novaFrequencia;
        
        // Recalcular quantidade para este tipo: (percapta × média) × frequência
        const percapita = updated[`percapita_${tipo}`];
        const media = updated[`media_${tipo}`];
        // Se frequência for 0 ou vazia, qtd deve ser 0
        updated[`qtd_${tipo}`] = (novaFrequencia === 0 || novaFrequencia === '') ? 0 : Number((percapita * media) * novaFrequencia);
        
        // Recalcular total considerando apenas tipos disponíveis
        const total = tiposDisponiveis.reduce((sum, tipoDisponivel) => {
          const qtdKey = `qtd_${tipoDisponivel.key}`;
          return sum + (updated[qtdKey] || 0);
        }, 0);
        updated.total = Number(total);
        
        return updated;
      }
      return produto;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.escola_id || !formData.grupo_id || !formData.data) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (produtosTabela.length === 0) {
      toast.error('Nenhum produto encontrado para o grupo selecionado');
      return;
    }

    // Buscar dados completos da escola selecionada
    const escolaSelecionada = escolas.find(e => e.id === formData.escola_id);
    
    // Manter o formato da semana de consumo (DD/MM a DD/MM/YY)
    let semanaFormatada = formData.data;
    
    // Se a semana não tem o formato completo (DD/MM a DD/MM/YY), adicionar o ano no final
    if (semanaFormatada.includes(' a ') && !semanaFormatada.match(/^\(\d{2}\/\d{2} a \d{2}\/\d{2}\/\d{2}\)$/)) {
      // Extrair o mês da primeira data e aplicar na segunda
      const partes = semanaFormatada.replace(/[()]/g, '').split(' a ');
      if (partes.length === 2) {
        const primeiraData = partes[0]; // ex: "06/01"
        const segundaData = partes[1]; // ex: "12/01"
        const mes = primeiraData.split('/')[1]; // ex: "01"
        const ano = new Date().getFullYear().toString().slice(-2);
        semanaFormatada = `(${primeiraData} a ${segundaData}/${ano})`;
      }
    }
    
    
    // Filtrar apenas produtos com frequência > 0 E PEDIDO preenchido
    const produtosComFrequencia = produtosTabela.filter(produto => {
      const temFrequencia = 
        (produto.frequencia_lanche_manha && produto.frequencia_lanche_manha > 0) ||
        (produto.frequencia_almoco && produto.frequencia_almoco > 0) ||
        (produto.frequencia_lanche_tarde && produto.frequencia_lanche_tarde > 0) ||
        (produto.frequencia_parcial && produto.frequencia_parcial > 0) ||
        (produto.frequencia_parcial_manha && produto.frequencia_parcial_manha > 0) ||
        (produto.frequencia_parcial_tarde && produto.frequencia_parcial_tarde > 0) ||
        (produto.frequencia_eja && produto.frequencia_eja > 0);
      
      const temPedido = produto.ajuste && produto.ajuste > 0;
      
      return temFrequencia && temPedido;
    });

    if (produtosComFrequencia.length === 0) {
      toast.error('Preencha a frequência E o PEDIDO de pelo menos um produto antes de gerar a necessidade');
      return;
    }

    const dadosParaSalvar = {
      escola_id: Number(formData.escola_id), // Garantir que seja número
      escola_nome: escolaSelecionada?.nome_escola || '',
      escola_rota: escolaSelecionada?.rota || '',
      escola_codigo_teknisa: escolaSelecionada?.codigo_teknisa || '',
      semana_consumo: semanaFormatada,
      semana_abastecimento: calcularSemanaAbastecimento(formData.data),
      produtos: produtosComFrequencia.map(produto => ({
        produto_id: Number(produto.id), // Garantir que seja número
        produto_nome: produto.nome,
        produto_unidade: produto.unidade_medida,
        ajuste: Number(produto.ajuste) || 0, // Usar o campo PEDIDO (ajuste) preenchido pelo usuário
        total: Number(produto.total) || 0 // Total calculado automaticamente pelo sistema
      }))
    };

    
    

    try {
      const resultado = await onSave(dadosParaSalvar);
      
      // Limpar dados apenas se o salvamento foi bem-sucedido
      if (resultado && resultado.success) {
        setFormData({
          escola_id: '',
          grupo_id: '',
          data: obterDataAtual()
        });
        setProdutosTabela([]);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar necessidade:', error);
    }
  };


  const handleLimparDados = () => {
    setFormData({
      escola_id: '',
      grupo_id: '',
      data: obterDataAtual()
    });
    setProdutosTabela([]);
  };

  const formatarNumero = (numero) => {
    if (typeof numero !== 'number' || isNaN(numero)) {
      return '0,000';
    }
    return numero.toFixed(3).replace('.', ',');
  };

  const calcularPercentual = (total, pedido) => {
    // Se pedido for 0 ou vazio, retornar vazio
    if (!pedido || pedido === 0 || pedido === '' || isNaN(pedido)) {
      return '-';
    }
    
    // Se total for 0 ou vazio, retornar 100% (falta tudo)
    if (!total || total === 0 || total === '' || isNaN(total)) {
      const diferenca = pedido;
      return `100,00% (${formatarNumero(diferenca)})`;
    }
    
    // Calcular: 1 - (TOTAL / PEDIDO)
    const percentual = (1 - (total / pedido)) * 100;
    
    // Calcular diferença absoluta: PEDIDO - TOTAL
    const diferenca = pedido - total;
    
    // Formatar com 2 casas decimais para percentual e 3 para diferença
    return `${percentual.toFixed(2).replace('.', ',')}% (${formatarNumero(diferenca)})`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerar Necessidade"
      size="full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SearchableSelect
              label="Escola"
              value={formData.escola_id}
              onChange={(value) => handleInputChange('escola_id', value)}
              options={escolas.map(escola => ({
                value: escola.id,
                label: `${escola.nome_escola} - ${escola.rota}`,
                description: escola.cidade
              }))}
              placeholder="Digite para buscar uma escola..."
              disabled={necessidadesLoading || loading}
              required
              usePortal={false}
              filterBy={(option, searchTerm) => {
                const label = option.label.toLowerCase();
                const description = option.description?.toLowerCase() || '';
                const term = searchTerm.toLowerCase();
                return label.includes(term) || description.includes(term);
              }}
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
            <SearchableSelect
              label="Grupo de Produtos"
              value={formData.grupo_id}
              onChange={(value) => handleInputChange('grupo_id', value)}
              options={grupos.map(grupo => ({
                value: grupo.id,
                label: grupo.nome
              }))}
              placeholder="Digite para buscar um grupo..."
              disabled={necessidadesLoading || loading}
              required
              usePortal={false}
            />
          </div>
          
          <div>
            <SearchableSelect
              label="Semana de Consumo"
              value={formData.data}
              onChange={(value) => handleInputChange('data', value)}
              options={opcoesSemanasConsumo || []}
              placeholder="Selecione a semana de consumo..."
              disabled={necessidadesLoading || loading}
              required
              usePortal={false}
            />
          </div>
        </div>

        {/* Debug Info */}
        {necessidadesLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <span className="text-gray-600">Carregando produtos...</span>
          </div>
        )}

        {/* Mensagem quando não há produtos */}
        {!necessidadesLoading && produtos.length === 0 && formData.grupo_id && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum produto encontrado para o grupo selecionado.</p>
          </div>
        )}

        {/* Mensagem quando não há grupo selecionado */}
        {!necessidadesLoading && !formData.grupo_id && (
          <div className="text-center py-8 text-gray-500">
            <p>Selecione um grupo de produtos para visualizar a tabela.</p>
          </div>
        )}

        {/* Tabela de Produtos */}
        {produtosTabela.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th rowSpan="2" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                      Produtos
                    </th>
                    {tiposDisponiveis.map((tipo) => (
                      <th key={tipo.key} colSpan="4" className={`px-2 py-3 text-center text-xs font-medium text-white uppercase tracking-wider ${tipo.bgColor} border-r border-gray-300`}>
                        {tipo.label}
                      </th>
                    ))}
                    <th rowSpan="2" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                      TOTAL
                    </th>
                    <th rowSpan="2" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                      PEDIDO
                    </th>
                    <th rowSpan="2" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % (Nº)
                    </th>
                  </tr>
                  <tr>
                    {tiposDisponiveis.map((tipo) => (
                      <React.Fragment key={tipo.key}>
                        <th className={`px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider ${tipo.bgCellColor} border-r border-gray-200`}>
                          Percapta
                        </th>
                        <th className={`px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider ${tipo.bgCellColor} border-r border-gray-200`}>
                          Média
                        </th>
                        <th className={`px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider ${tipo.bgCellColor} border-r border-gray-200`}>
                          Frequência <span className="text-blue-600">*</span>
                        </th>
                        <th className={`px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider ${tipo.bgCellColor} border-r border-gray-300`}>
                          QTD
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {produtosTabela.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                        <div className="text-sm text-gray-500">({produto.unidade_medida})</div>
                      </td>
                      
                      {/* Renderizar células dinamicamente baseado nos tipos disponíveis */}
                      {tiposDisponiveis.map((tipo) => {
                        const tipoKey = tipo.key;
                        const percapitaKey = `percapita_${tipoKey}`;
                        const mediaKey = `media_${tipoKey}`;
                        const frequenciaKey = `frequencia_${tipoKey}`;
                        const qtdKey = `qtd_${tipoKey}`;
                        
                        return (
                          <React.Fragment key={tipoKey}>
                            <td className={`px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${tipo.bgCellColor} border-r border-gray-200`}>
                              {formatarNumero(produto[percapitaKey] || 0)}
                            </td>
                            <td className={`px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${tipo.bgCellColor} border-r border-gray-200`}>
                              {produto[mediaKey] || 0}
                            </td>
                            <td className={`px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${tipo.bgCellColor} border-r border-gray-200`}>
                              <input
                                type="number"
                                value={produto[frequenciaKey] || ''}
                                onChange={(e) => handleFrequenciaChange(produto.id, tipoKey, e.target.value)}
                                min="0"
                                step="1"
                                placeholder=""
                                className="w-16 text-center border border-gray-300 rounded px-1 py-1 text-xs bg-white"
                                disabled={loading}
                              />
                            </td>
                            <td className={`px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center ${tipo.bgCellColor} border-r border-gray-300`}>
                              {formatarNumero(produto[qtdKey] || 0)}
                            </td>
                          </React.Fragment>
                        );
                      })}
                      
                      {/* TOTAL */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center bg-gray-50 border-r border-gray-300">
                        {formatarNumero(produto.total)}
                      </td>
                      
                      {/* PEDIDO */}
                      <td className="px-4 py-4 whitespace-nowrap text-center bg-yellow-50 border-r border-gray-300">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={produto.ajuste}
                          onChange={(e) => handleAjusteChange(produto.id, e.target.value)}
                          placeholder=""
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                          disabled={necessidadesLoading || loading}
                        />
                      </td>
                      
                      {/* % */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center bg-gray-50">
                        {calcularPercentual(produto.total, produto.ajuste)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* Botões de Ação */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={handleLimparDados}
            disabled={loading}
            className="px-6 text-gray-600 hover:text-gray-800"
          >
            Limpar Dados
          </Button>
          
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="px-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !formData.escola_id || !formData.grupo_id || !formData.data || produtosTabela.length === 0}
              loading={loading}
              className="px-8"
            >
              <FaSave className="mr-2" />
              Gerar Necessidade
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NecessidadeModal;