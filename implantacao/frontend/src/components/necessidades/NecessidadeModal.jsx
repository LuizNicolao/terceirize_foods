/**
 * Modal para Gerar Necessidades
 * Estrutura modular com abas para melhor organização e manutenibilidade
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button } from '../ui';
import { FaSave, FaTimes } from 'react-icons/fa';
import { useNecessidades } from '../../hooks/necessidades';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import { calcularSemanaAbastecimento } from '../../utils/semanasAbastecimentoUtils';
import TipoAtendimentoEscolaService from '../../services/tipoAtendimentoEscolaService';
import toast from 'react-hot-toast';
import NecessidadeModalCabecalho from './NecessidadeModalCabecalho';
import NecessidadeModalProdutos from './NecessidadeModalProdutos';
import NecessidadeModalReplicarFrequencias from './NecessidadeModalReplicarFrequencias';
import { tiposConfig, filtrarTiposDisponiveis } from './utils/necessidadeModalUtils';

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

  // Estado para controle de abas
  const [abaAtiva, setAbaAtiva] = useState('cabecalho');

  // Estados para filtros de ano e mês
  const [anoFiltro, setAnoFiltro] = useState('');
  const [mesFiltro, setMesFiltro] = useState('');

  // Hook para semanas de consumo do calendário com filtros de ano e mês
  const anoParaHook = anoFiltro && anoFiltro !== '' ? Number(anoFiltro) : new Date().getFullYear();
  const mesParaHook = mesFiltro && mesFiltro !== '' ? Number(mesFiltro) : null;
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo(anoParaHook, true, {}, mesParaHook);

  const [formData, setFormData] = useState({
    escola_id: '',
    escola: null,
    grupo_id: '',
    grupo: null,
    data: ''
  });

  const [produtosTabela, setProdutosTabela] = useState([]);
  const [tiposAtendimentoEscola, setTiposAtendimentoEscola] = useState([]);
  const [loadingTiposAtendimento, setLoadingTiposAtendimento] = useState(false);
  const [showModalReplicar, setShowModalReplicar] = useState(false);
  const [frequenciasCopiadas, setFrequenciasCopiadas] = useState(null);

  // Filtrar tipos disponíveis
  const tiposDisponiveis = filtrarTiposDisponiveis(
    tiposConfig.map(tipo => ({
      ...tipo,
      checkFunction: tipo.key === 'parcial_manha' ? () => tiposAtendimentoEscola.includes('parcial_manha') : 
                     tipo.key === 'parcial_tarde' ? () => tiposAtendimentoEscola.includes('parcial_tarde') : 
                     undefined
    })),
    tiposAtendimentoEscola
  );

  // Limpar dados quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        escola_id: '',
        escola: null,
        grupo_id: '',
        grupo: null,
        data: ''
      });
      setProdutosTabela([]);
      setTiposAtendimentoEscola([]);
      setAnoFiltro('');
      setMesFiltro('');
      setAbaAtiva('cabecalho');
      limparMediasPeriodo();
    }
  }, [isOpen, limparMediasPeriodo]);

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

  // Inicializar tabela quando produtos estiverem carregados
  useEffect(() => {
    if (isOpen && produtos.length > 0 && formData.grupo_id && formData.escola_id && formData.data) {
      const mediasCarregadas = Object.keys(mediasPeriodo).length > 0;
      
      if (formData.escola_id && loadingTiposAtendimento) {
        return;
      }
      
      if (mediasCarregadas) {
        inicializarTabelaProdutos();
      } else {
        const timer = setTimeout(() => {
          if (Object.keys(mediasPeriodo).length > 0) {
            inicializarTabelaProdutos();
          }
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, produtos, percapitas, mediasPeriodo, formData.grupo_id, formData.escola_id, formData.data, tiposAtendimentoEscola, loadingTiposAtendimento]);

  const inicializarTabelaProdutos = useCallback(() => {
    const ajustesExistentes = {};
    produtosTabela.forEach(produto => {
      ajustesExistentes[produto.produto_id] = produto.ajuste;
    });
    
    const produtosComCalculos = produtos.map(produto => {
      const percapitaLancheManha = Number(produto.per_capita_lanche_manha) || 0;
      const percapitaAlmoco = Number(produto.per_capita_almoco) || 0;
      const percapitaLancheTarde = Number(produto.per_capita_lanche_tarde) || 0;
      const percapitaParcial = Number(produto.per_capita_parcial) || 0;
      const percapitaParcialManha = Number(produto.per_capita_parcial_manha ?? percapitaParcial) || percapitaParcial;
      const percapitaParcialTarde = Number(produto.per_capita_parcial_tarde ?? percapitaParcial) || percapitaParcial;
      const percapitaEja = Number(produto.per_capita_eja) || 0;

      const mediaLancheManha = Math.round(Number(mediasPeriodo.lanche_manha?.media || 0));
      const mediaAlmoco = Math.round(Number(mediasPeriodo.almoco?.media || 0));
      const mediaLancheTarde = Math.round(Number(mediasPeriodo.lanche_tarde?.media || 0));
      const mediaParcial = Math.round(Number(mediasPeriodo.parcial?.media || 0));
      const mediaParcialManha = Math.round(Number(mediasPeriodo.parcial_manha?.media ?? mediasPeriodo.parcial?.media ?? 0));
      const mediaParcialTarde = Math.round(Number(mediasPeriodo.parcial_tarde?.media ?? mediasPeriodo.parcial?.media ?? 0));
      const mediaEja = Math.round(Number(mediasPeriodo.eja?.media || 0));

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
        media_lanche_manha: mediaLancheManha,
        media_almoco: mediaAlmoco,
        media_lanche_tarde: mediaLancheTarde,
        media_parcial: mediaParcial,
        media_parcial_manha: mediaParcialManha,
        media_parcial_tarde: mediaParcialTarde,
        media_eja: mediaEja,
        frequencia_lanche_manha: '',
        frequencia_almoco: '',
        frequencia_lanche_tarde: '',
        frequencia_parcial: '',
        frequencia_parcial_manha: '',
        frequencia_parcial_tarde: '',
        frequencia_eja: '',
        qtd_lanche_manha: 0,
        qtd_almoco: 0,
        qtd_lanche_tarde: 0,
        qtd_parcial: 0,
        qtd_parcial_manha: 0,
        qtd_parcial_tarde: 0,
        qtd_eja: 0,
        total: 0,
        ajuste: ajustesExistentes[produto.produto_id] || ''
      };

      return produtoFinal;
    });

    produtosComCalculos.sort((a, b) => {
      const nomeA = a.nome?.toUpperCase() || '';
      const nomeB = b.nome?.toUpperCase() || '';
      return nomeA.localeCompare(nomeB, 'pt-BR');
    });

    setProdutosTabela(produtosComCalculos);
  }, [produtos, mediasPeriodo, produtosTabela]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAjusteChange = (produtoId, valor) => {
    setProdutosTabela(prev => prev.map(produto => {
      if (produto.id === produtoId) {
        if (valor === '' || valor === null || valor === undefined) {
          return { ...produto, ajuste: '' };
        }
        return { ...produto, ajuste: parseFloat(valor) || 0 };
      }
      return produto;
    }));
  };

  // Função para recalcular produto após mudança de frequência
  const recalcularProduto = useCallback((produto) => {
    const updated = { ...produto };
    
    // Recalcular quantidades para cada tipo disponível
    tiposDisponiveis.forEach(tipo => {
      const tipoKey = tipo.key;
      const frequenciaKey = `frequencia_${tipoKey}`;
      const qtdKey = `qtd_${tipoKey}`;
      const percapitaKey = `percapita_${tipoKey}`;
      const mediaKey = `media_${tipoKey}`;
      
      const frequencia = updated[frequenciaKey];
      if (frequencia && frequencia !== '' && frequencia !== 0) {
        const percapita = updated[percapitaKey] || 0;
        const media = updated[mediaKey] || 0;
        updated[qtdKey] = Number((percapita * media) * frequencia);
      } else {
        updated[qtdKey] = 0;
      }
    });
    
    // Recalcular total
    const total = tiposDisponiveis.reduce((sum, tipo) => {
      const qtdKey = `qtd_${tipo.key}`;
      return sum + (updated[qtdKey] || 0);
    }, 0);
    updated.total = Number(total);
    
    return updated;
  }, [tiposDisponiveis]);

  const handleFrequenciaChange = (produtoId, tipo, valor) => {
    if (valor === '' || valor === null || valor === undefined) {
      setProdutosTabela(prev => prev.map(produto => {
        if (produto.id === produtoId) {
          const updated = { ...produto };
          updated[`frequencia_${tipo}`] = '';
          updated[`qtd_${tipo}`] = 0;
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

    const novaFrequencia = Math.round(parseFloat(valor)) || 0;
    setProdutosTabela(prev => prev.map(produto => {
      if (produto.id === produtoId) {
        const updated = { ...produto };
        updated[`frequencia_${tipo}`] = novaFrequencia;
        const percapita = updated[`percapita_${tipo}`];
        const media = updated[`media_${tipo}`];
        updated[`qtd_${tipo}`] = (novaFrequencia === 0 || novaFrequencia === '') ? 0 : Number((percapita * media) * novaFrequencia);
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

  // Função para replicar frequências
  const handleReplicarFrequencias = (turnoOrigem, turnosDestino) => {
    if (!turnoOrigem || !turnosDestino || turnosDestino.length === 0) {
      toast.error('Selecione o turno de origem e pelo menos um turno de destino');
      return;
    }

    let produtosAtualizados = 0;

    setProdutosTabela(prev => prev.map(produto => {
      const frequenciaOrigem = produto[`frequencia_${turnoOrigem}`];
      
      if (!frequenciaOrigem || frequenciaOrigem === '' || frequenciaOrigem === 0) {
        return produto;
      }

      const updated = { ...produto };
      let atualizado = false;

      turnosDestino.forEach(turnoDestino => {
        const turnoDestinoExiste = tiposDisponiveis.some(t => t.key === turnoDestino);
        if (!turnoDestinoExiste || turnoDestino === turnoOrigem) {
          return;
        }

        updated[`frequencia_${turnoDestino}`] = frequenciaOrigem;
        atualizado = true;
      });

      if (atualizado) {
        produtosAtualizados++;
        return recalcularProduto(updated);
      }

      return produto;
    }));

    if (produtosAtualizados > 0) {
      toast.success(`Frequências replicadas para ${produtosAtualizados} produto(s)`);
    } else {
      toast('Nenhum produto foi atualizado. Verifique se há frequências no turno de origem.');
    }
  };

  // Função para copiar frequências da escola atual
  const handleCopiarFrequencias = () => {
    if (produtosTabela.length === 0) {
      toast.error('Não há produtos para copiar frequências');
      return;
    }

    // Extrair apenas as frequências de cada produto
    const frequencias = produtosTabela.reduce((acc, produto) => {
      const frequenciasProduto = {};
      
      tiposDisponiveis.forEach(tipo => {
        const freqKey = `frequencia_${tipo.key}`;
        const frequencia = produto[freqKey];
        if (frequencia !== undefined && frequencia !== null && frequencia !== '') {
          frequenciasProduto[freqKey] = frequencia;
        }
      });

      // Só adicionar se tiver pelo menos uma frequência
      // Converter ID para string para garantir consistência
      if (Object.keys(frequenciasProduto).length > 0) {
        acc[String(produto.id)] = frequenciasProduto;
      }

      return acc;
    }, {});

    if (Object.keys(frequencias).length === 0) {
      toast.error('Nenhuma frequência preenchida para copiar');
      return;
    }

    // Salvar no localStorage e no state
    const dadosCopiados = {
      frequencias,
      grupo: formData.grupo,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('necessidades_frequencias_copiadas', JSON.stringify(dadosCopiados));
    setFrequenciasCopiadas(dadosCopiados);
    
    toast.success(`Frequências de ${Object.keys(frequencias).length} produto(s) copiadas com sucesso!`);
  };

  // Função para colar frequências da escola anterior
  const handleColarFrequencias = () => {
    // Tentar carregar do localStorage se não estiver no state
    let dadosCopiados = frequenciasCopiadas;
    if (!dadosCopiados) {
      const dadosSalvos = localStorage.getItem('necessidades_frequencias_copiadas');
      if (dadosSalvos) {
        try {
          dadosCopiados = JSON.parse(dadosSalvos);
        } catch (error) {
          console.error('Erro ao parsear frequências copiadas:', error);
        }
      }
    }

    if (!dadosCopiados || !dadosCopiados.frequencias || Object.keys(dadosCopiados.frequencias).length === 0) {
      toast.error('Não há frequências copiadas. Copie as frequências de uma escola primeiro.');
      return;
    }

    if (produtosTabela.length === 0) {
      toast.error('Carregue os produtos primeiro antes de colar as frequências');
      return;
    }

    const { frequencias: frequenciasCopiadasData } = dadosCopiados;
    let produtosAtualizados = 0;

    // Calcular produtos atualizados antes de atualizar o state
    const novosProdutos = produtosTabela.map(produto => {
      // Converter ID para string para garantir correspondência
      const produtoIdStr = String(produto.id);
      const frequenciasProduto = frequenciasCopiadasData[produtoIdStr];
      
      // Se não tem frequências copiadas para este produto, não fazer nada
      if (!frequenciasProduto || Object.keys(frequenciasProduto).length === 0) {
        return produto;
      }

      const updated = { ...produto };
      let atualizado = false;

      // Aplicar cada frequência copiada
      Object.keys(frequenciasProduto).forEach(freqKey => {
        const tipoKey = freqKey.replace('frequencia_', '');
        // Verificar se o tipo está disponível para esta escola
        const tipoDisponivel = tiposDisponiveis.some(t => t.key === tipoKey);
        if (tipoDisponivel) {
          const valorAnterior = updated[freqKey];
          const novoValor = frequenciasProduto[freqKey];
          updated[freqKey] = novoValor;
          // Só marcar como atualizado se o valor realmente mudou
          if (valorAnterior !== novoValor) {
            atualizado = true;
          }
        }
      });

      if (atualizado) {
        produtosAtualizados++;
        return recalcularProduto(updated);
      }

      return produto;
    });

    // Atualizar o state com os novos produtos
    setProdutosTabela(novosProdutos);

    // Mostrar mensagem apropriada
    if (produtosAtualizados > 0) {
      toast.success(`Frequências coladas para ${produtosAtualizados} produto(s)`);
    } else {
      toast('Nenhum produto foi atualizado. Verifique se os produtos correspondem aos copiados.');
    }
  };

  // Carregar frequências copiadas do localStorage quando modal abrir
  useEffect(() => {
    if (isOpen) {
      const dadosSalvos = localStorage.getItem('necessidades_frequencias_copiadas');
      if (dadosSalvos) {
        try {
          const dados = JSON.parse(dadosSalvos);
          setFrequenciasCopiadas(dados);
        } catch (error) {
          console.error('Erro ao carregar frequências copiadas:', error);
        }
      }
    }
  }, [isOpen]);

  // Função para carregar produtos (chamada quando usuário clica no botão)
  const handleCarregarProdutos = () => {
    if (!formData.escola_id || !formData.grupo_id || !formData.data || !mesFiltro) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Se já tem produtos, apenas mudar de aba
    if (produtosTabela.length > 0) {
      setAbaAtiva('produtos');
      return;
    }
    
    // Se ainda não tem produtos, aguardar carregamento
    if (produtos.length === 0) {
      toast('Carregando produtos...');
    } else {
      setAbaAtiva('produtos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.escola_id || !formData.grupo_id || !formData.data || !mesFiltro) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (produtosTabela.length === 0) {
      toast.error('Nenhum produto encontrado para o grupo selecionado');
      return;
    }

    const escolaSelecionada = escolas.find(e => e.id === formData.escola_id);
    
    let semanaFormatada = formData.data;
    
    if (semanaFormatada.includes(' a ') && !semanaFormatada.match(/^\(\d{2}\/\d{2} a \d{2}\/\d{2}\/\d{2}\)$/)) {
      const partes = semanaFormatada.replace(/[()]/g, '').split(' a ');
      if (partes.length === 2) {
        const primeiraData = partes[0];
        const segundaData = partes[1];
        const mes = primeiraData.split('/')[1];
        const ano = new Date().getFullYear().toString().slice(-2);
        semanaFormatada = `(${primeiraData} a ${segundaData}/${ano})`;
      }
    }
    
    const produtosComFrequencia = produtosTabela.filter(produto => {
      const temFrequencia = tiposDisponiveis.some(tipo => {
        const freqKey = `frequencia_${tipo.key}`;
        return produto[freqKey] && produto[freqKey] > 0;
      });
      const temPedido = produto.ajuste && produto.ajuste > 0;
      return temFrequencia && temPedido;
    });

    if (produtosComFrequencia.length === 0) {
      toast.error('Preencha a frequência E o PEDIDO de pelo menos um produto antes de gerar a necessidade');
      return;
    }

    const dadosParaSalvar = {
      escola_id: Number(formData.escola_id),
      escola_nome: escolaSelecionada?.nome_escola || '',
      escola_rota: escolaSelecionada?.rota || '',
      escola_codigo_teknisa: escolaSelecionada?.codigo_teknisa || '',
      semana_consumo: semanaFormatada,
      semana_abastecimento: calcularSemanaAbastecimento(formData.data),
      produtos: produtosComFrequencia.map(produto => ({
        produto_id: Number(produto.id),
        produto_nome: produto.nome,
        produto_unidade: produto.unidade_medida,
        ajuste: Number(produto.ajuste) || 0,
        total: Number(produto.total) || 0
      }))
    };

    try {
      const resultado = await onSave(dadosParaSalvar);
      
      if (resultado && resultado.success) {
        setFormData({
          escola_id: '',
          escola: null,
          grupo_id: '',
          grupo: null,
          data: ''
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
      escola: null,
      grupo_id: '',
      grupo: null,
      data: ''
    });
    setProdutosTabela([]);
    setAnoFiltro('');
    setMesFiltro('');
    setAbaAtiva('cabecalho');
  };

  // Verificar se pode ir para aba de produtos
  const podeIrParaProdutos = formData.escola_id && formData.grupo_id && formData.data && produtosTabela.length > 0;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Gerar Necessidade" size="full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Navegação por Abas */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setAbaAtiva('cabecalho')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === 'cabecalho'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Informações da Necessidade
              </button>
              <button
                type="button"
                onClick={() => {
                  if (podeIrParaProdutos) {
                    setAbaAtiva('produtos');
                  } else {
                    toast.error('Preencha todos os campos obrigatórios na aba anterior');
                  }
                }}
                disabled={!podeIrParaProdutos}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === 'produtos'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${!podeIrParaProdutos ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Produtos e Frequências
                {produtosTabela.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {produtosTabela.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          <div className="min-h-[400px]">
            {abaAtiva === 'cabecalho' && (
              <NecessidadeModalCabecalho
                formData={formData}
                onInputChange={handleInputChange}
                escolas={escolas}
                grupos={grupos}
                anoFiltro={anoFiltro}
                mesFiltro={mesFiltro}
                onAnoFiltroChange={setAnoFiltro}
                onMesFiltroChange={setMesFiltro}
                opcoesSemanasConsumo={opcoesSemanasConsumo || []}
                loading={loading}
                necessidadesLoading={necessidadesLoading}
              />
            )}

                  {abaAtiva === 'produtos' && (
                    <NecessidadeModalProdutos
                      produtosTabela={produtosTabela}
                      tiposDisponiveis={tiposDisponiveis}
                      onFrequenciaChange={handleFrequenciaChange}
                      onAjusteChange={handleAjusteChange}
                      onReplicarFrequencias={() => setShowModalReplicar(true)}
                      onCopiarFrequencias={handleCopiarFrequencias}
                      onColarFrequencias={handleColarFrequencias}
                      temFrequenciasCopiadas={!!frequenciasCopiadas}
                      loading={loading}
                      necessidadesLoading={necessidadesLoading}
                    />
                  )}
          </div>

          {/* Loading state */}
          {necessidadesLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <span className="text-gray-600">Carregando produtos...</span>
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
              {abaAtiva === 'cabecalho' && podeIrParaProdutos && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCarregarProdutos}
                  disabled={loading || necessidadesLoading}
                >
                  Carregar Produtos
                </Button>
              )}
              
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="px-8"
              >
                Cancelar
              </Button>
              
              {abaAtiva === 'produtos' && (
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
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal de Replicar Frequências */}
      <NecessidadeModalReplicarFrequencias
        isOpen={showModalReplicar}
        onClose={() => setShowModalReplicar(false)}
        onReplicar={handleReplicarFrequencias}
        tiposDisponiveis={tiposDisponiveis}
      />
    </>
  );
};

export default NecessidadeModal;
