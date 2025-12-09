import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import tiposPratosService from '../../services/tiposPratos';
import receitasService from '../../services/receitas';
import { InformacoesBasicas, Vinculacoes, FiliaisCentrosCusto, ReceitasProdutos } from './sections';
import ReceitaDuplicacaoModal from './ReceitaDuplicacaoModal';
import toast from 'react-hot-toast';

/**
 * Modal para Prato
 */
const PratoModal = ({
  isOpen,
  onClose,
  onSubmit,
  prato,
  isViewMode = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo_prato_id: null,
    tipo_prato_nome: '',
    filiais: [],
    centros_custo: [],
    receitas: [],
    produtos: [],
    status: 1
  });

  const [errors, setErrors] = useState({});
  
  // Estados para dados
  const [tiposPratos, setTiposPratos] = useState([]);
  const [loadingTiposPratos, setLoadingTiposPratos] = useState(false);
  
  // Estado para controle de abas
  const [abaAtiva, setAbaAtiva] = useState('informacoes'); // 'informacoes' ou 'produtos'
  
  // Estados para modal de duplicação de receita
  const [showDuplicacaoModal, setShowDuplicacaoModal] = useState(false);
  const [receitasParaDuplicar, setReceitasParaDuplicar] = useState([]); // Array de receitas que precisam ser duplicadas
  const [formDataPendente, setFormDataPendente] = useState(null);

  // Carregar tipos de pratos quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarTiposPratos();
    }
  }, [isOpen]);

  const carregarTiposPratos = async () => {
    setLoadingTiposPratos(true);
    try {
      let allTiposPratos = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await tiposPratosService.listar({
          page,
          limit: 100,
          status: 1
        });
        
        if (result.success && result.data && result.data.length > 0) {
          allTiposPratos = [...allTiposPratos, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setTiposPratos(allTiposPratos);
    } catch (error) {
      console.error('Erro ao carregar tipos de pratos:', error);
    } finally {
      setLoadingTiposPratos(false);
    }
  };

  // Limpar dados quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: '',
        descricao: '',
        tipo_prato_id: null,
        tipo_prato_nome: '',
        filiais: [],
        centros_custo: [],
        receitas: [],
        produtos: [],
        status: 1
      });
      setErrors({});
      setAbaAtiva('informacoes'); // Resetar para primeira aba
    }
  }, [isOpen]);

  // Preencher dados quando prato é fornecido
  useEffect(() => {
    if (isOpen && prato) {
      setFormData({
        nome: prato.nome || '',
        descricao: prato.descricao || '',
        tipo_prato_id: prato.tipo_prato_id || null,
        tipo_prato_nome: prato.tipo_prato_nome || prato.tipo_prato || '',
        filiais: prato.filiais || [],
        centros_custo: prato.centros_custo || [],
        receitas: prato.receitas || [],
        produtos: prato.produtos || [],
        status: prato.status !== undefined ? prato.status : 1
      });
    }
  }, [isOpen, prato]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando ele for atualizado
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        if (field === 'produtos' && newErrors.percapta) {
          // Verificar se todos os percaptas foram preenchidos
          const produtos = value || [];
          const centrosCusto = prev.centros_custo || [];
          const produtosSemPercapta = produtos.filter(produto => {
            if (produto.centro_custo_id && produto.receita_id && produto.produto_origem_id) {
              return produto.percapta === null || produto.percapta === undefined || produto.percapta === '';
            }
            return false;
          });
          
          if (produtosSemPercapta.length === 0) {
            delete newErrors.percapta;
            delete newErrors.produtosSemPercapta;
          }
        }
        return newErrors;
      });
    }
    
    // Se produtos foram atualizados, verificar se ainda há campos de percapta vazios
    if (field === 'produtos') {
      const produtos = value || [];
      const centrosCusto = formData.centros_custo || [];
      const produtosSemPercapta = produtos.filter(produto => {
        if (produto.centro_custo_id && produto.receita_id && produto.produto_origem_id) {
          return produto.percapta === null || produto.percapta === undefined || produto.percapta === '';
        }
        return false;
      });
      
      if (produtosSemPercapta.length === 0 && errors.percapta) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.percapta;
          delete newErrors.produtosSemPercapta;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação
    const newErrors = {};
    if (!formData.nome || formData.nome.trim() === '') {
      newErrors.nome = 'Nome do prato é obrigatório';
    }

    if (!formData.tipo_prato_id) {
      newErrors.tipo_prato_id = 'Tipo de prato é obrigatório';
    }

    // Validar campos de Percapta obrigatórios
    const produtos = formData.produtos || [];
    const centrosCusto = formData.centros_custo || [];
    const produtosSemPercapta = [];

    produtos.forEach(produto => {
      if (produto.centro_custo_id && produto.receita_id && produto.produto_origem_id) {
        // Verificar se o percapta está preenchido
        if (produto.percapta === null || produto.percapta === undefined || produto.percapta === '') {
          const centroCustoNome = centrosCusto.find(cc => cc.id === produto.centro_custo_id)?.nome || 'Centro de Custo';
          const receitaNome = formData.receitas?.find(r => r.id === produto.receita_id)?.nome || 'Receita';
          produtosSemPercapta.push({
            produto_origem_id: produto.produto_origem_id,
            receita_id: produto.receita_id,
            centro_custo_id: produto.centro_custo_id,
            produto_nome: produto.produto_origem_nome,
            receita_nome: receitaNome,
            centro_custo_nome: centroCustoNome
          });
        }
      }
    });

    if (produtosSemPercapta.length > 0) {
      newErrors.percapta = 'Todos os campos de Percapta são obrigatórios';
      newErrors.produtosSemPercapta = produtosSemPercapta;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.tipo_prato_id) {
        toast.error('Selecione o tipo de prato antes de salvar');
      }
      if (newErrors.percapta) {
        toast.error('Preencha todos os campos de Percapta antes de salvar');
      }
      return;
    }

    // Preparar dados para envio
    const dataToSubmit = {
      ...formData,
      produtos: formData.produtos.map(p => ({
        receita_id: p.receita_id || null,
        produto_origem_id: p.produto_origem_id,
        produto_origem_nome: p.produto_origem_nome || null,
        grupo_id: p.grupo_id || null,
        grupo_nome: p.grupo_nome || null,
        subgrupo_id: p.subgrupo_id || null,
        subgrupo_nome: p.subgrupo_nome || null,
        classe_id: p.classe_id || null,
        classe_nome: p.classe_nome || null,
        unidade_medida_id: p.unidade_medida_id || null,
        unidade_medida_sigla: p.unidade_medida_sigla || null,
        centro_custo_id: p.centro_custo_id,
        centro_custo_nome: p.centro_custo_nome || null,
        percapta: p.percapta ? parseFloat(p.percapta) : null
      }))
    };

    // Verificar se é criação de novo prato (não edição)
    if (!prato) {
      // Verificar receitas para cada centro de custo
      const centrosCusto = formData.centros_custo || [];
      const produtos = formData.produtos || [];
      const receitas = formData.receitas || [];

      // Agrupar produtos por centro de custo e receita
      const produtosPorCentroCusto = {};
      
      produtos.forEach(produto => {
        if (produto.centro_custo_id && produto.receita_id) {
          const key = `${produto.centro_custo_id}_${produto.receita_id}`;
          if (!produtosPorCentroCusto[key]) {
            produtosPorCentroCusto[key] = {
              centro_custo_id: produto.centro_custo_id,
              centro_custo_nome: produto.centro_custo_nome,
              receita_id: produto.receita_id,
              receita_nome: receitas.find(r => r.id === produto.receita_id)?.nome || '',
              produtos: []
            };
          }
          produtosPorCentroCusto[key].produtos.push({
            produto_origem_id: produto.produto_origem_id
          });
        }
      });

      // Verificar também combinações de receitas e centros de custo que não têm produtos criados
      // (caso onde a receita não está vinculada ao centro de custo e não foram criados produtos)
      receitas.forEach(receita => {
        centrosCusto.forEach(centroCusto => {
          const key = `${centroCusto.id}_${receita.id}`;
          if (!produtosPorCentroCusto[key]) {
            produtosPorCentroCusto[key] = {
              centro_custo_id: centroCusto.id,
              centro_custo_nome: centroCusto.nome,
              receita_id: receita.id,
              receita_nome: receita.nome || '',
              produtos: []
            };
          }
        });
      });

      // Verificar cada combinação de centro de custo e receita
      const receitasParaDuplicarList = [];
      const receitasExistentesParaUsar = []; // Receitas existentes que devem ser usadas ao invés de criar novas

      for (const key in produtosPorCentroCusto) {
        const item = produtosPorCentroCusto[key];
        
        // Primeiro: verificar se a receita selecionada está vinculada ao centro de custo
        const receitaSelecionada = receitas.find(r => r.id === item.receita_id);
        if (!receitaSelecionada) {
          continue; // Pular se não encontrou a receita
        }

        // Buscar receita completa para verificar vínculos
        const receitaCompleta = await receitasService.buscarPorId(item.receita_id);
        if (!receitaCompleta.success || !receitaCompleta.data) {
          continue;
        }

        const receitaCompletaData = receitaCompleta.data;
        const receitaCentrosCusto = receitaCompletaData.centros_custo || [];
        const receitaEstaVinculada = receitaCentrosCusto.some(cc => cc.id === item.centro_custo_id);

        // Se a receita não está vinculada ao centro de custo, verificar se já existe uma receita com os mesmos produtos
        if (!receitaEstaVinculada) {
          // Se há produtos, verificar se a receita selecionada tem os mesmos produtos
          if (item.produtos && item.produtos.length > 0) {
            // Verificar se a receita selecionada tem os mesmos produtos
            const produtosReceitaSelecionada = receitaCompletaData.produtos || [];
            const produtosIdsReceitaSelecionada = produtosReceitaSelecionada.map(p => p.produto_origem_id);
            const produtosIdsItem = item.produtos.map(p => p.produto_origem_id);
            
            const produtosIdsReceitaSet = new Set(produtosIdsReceitaSelecionada);
            const produtosIdsItemSet = new Set(produtosIdsItem);
            const mesmosProdutos = produtosIdsReceitaSelecionada.length === produtosIdsItem.length &&
                                   produtosIdsItem.every(id => produtosIdsReceitaSet.has(id)) &&
                                   produtosIdsReceitaSelecionada.every(id => produtosIdsItemSet.has(id));

            // Se a receita selecionada tem os mesmos produtos, adicionar à lista para mostrar no modal
            // (será apenas adicionado centro de custo, não duplicado)
            if (mesmosProdutos) {
              receitasParaDuplicarList.push({
                centro_custo: item,
                receita_referencia: receitaCompletaData,
                produtos: item.produtos,
                tipo: 'atualizar' // Indica que será apenas adicionado centro de custo, não duplicado
              });
              continue; // Não precisa verificar outras receitas
            }

            // Se não tem os mesmos produtos, verificar se existe outra receita com os mesmos produtos
            const resultado = await receitasService.verificarPorCentroCustoEProdutos(
              item.centro_custo_id,
              item.produtos
            );

            // Se já existe uma receita com os mesmos produtos, usar ela ao invés de criar uma nova
            if (resultado.success && resultado.data.existe && resultado.data.receita_referencia) {
              receitasExistentesParaUsar.push({
                receitaOriginal: item,
                receitaExistente: resultado.data.receita_referencia
              });
              continue; // Não precisa duplicar, já existe uma receita
            }
          }

          // Se não existe receita com os mesmos produtos, precisa duplicar
          receitasParaDuplicarList.push({
            centro_custo: item,
            receita_referencia: receitaCompletaData,
            produtos: item.produtos,
            tipo: 'duplicar' // Indica que será duplicada
          });
          continue; // Não precisa verificar produtos se não está vinculada
        }

        // Se está vinculada e há produtos, verificar se existe receita com esses produtos para este centro de custo
        if (item.produtos && item.produtos.length > 0) {
          const resultado = await receitasService.verificarPorCentroCustoEProdutos(
            item.centro_custo_id,
            item.produtos
          );

          if (resultado.success && !resultado.data.existe) {
            // Não existe receita com esses produtos para este centro de custo
            let receitaReferencia = null;
            
            // Se há uma receita de referência, usar ela; caso contrário, usar a receita completa já buscada
            if (resultado.data.receita_referencia) {
              receitaReferencia = resultado.data.receita_referencia;
            } else {
              receitaReferencia = receitaCompletaData;
            }

            if (receitaReferencia) {
              receitasParaDuplicarList.push({
                centro_custo: item,
                receita_referencia: receitaReferencia,
                produtos: item.produtos,
                tipo: 'duplicar' // Indica que será duplicada
              });
            }
          }
        }
        // Se está vinculada mas não há produtos, não precisa fazer nada (produtos serão criados normalmente)
      }

      // Se encontramos receitas existentes que devem ser usadas, atualizar formData e dataToSubmit
      if (receitasExistentesParaUsar.length > 0) {
        let produtosAtualizados = [...produtos];
        let receitasAtualizadas = [...receitas];

        receitasExistentesParaUsar.forEach(({ receitaOriginal, receitaExistente }) => {
          // Atualizar produtos para usar a receita existente
          produtosAtualizados = produtosAtualizados.map(produto => {
            if (produto.centro_custo_id === receitaOriginal.centro_custo_id && 
                produto.receita_id === receitaOriginal.receita_id) {
              return {
                ...produto,
                receita_id: receitaExistente.id
              };
            }
            return produto;
          });

          // Adicionar receita existente se ainda não estiver na lista
          const receitaJaExiste = receitasAtualizadas.find(r => r.id === receitaExistente.id);
          if (!receitaJaExiste) {
            receitasAtualizadas.push({
              id: receitaExistente.id,
              codigo: receitaExistente.codigo,
              nome: receitaExistente.nome
            });
          }
        });

        // Atualizar formData
        setFormData(prev => ({
          ...prev,
          receitas: receitasAtualizadas,
          produtos: produtosAtualizados
        }));

        // Atualizar dataToSubmit também
        dataToSubmit.receitas = receitasAtualizadas;
        dataToSubmit.produtos = produtosAtualizados;
      }

      if (receitasParaDuplicarList.length > 0) {
        // Mostrar modal de aviso com todas as receitas que precisam ser duplicadas
        setReceitasParaDuplicar(receitasParaDuplicarList);
        setFormDataPendente(dataToSubmit);
        setShowDuplicacaoModal(true);
        return;
      }
    }

    // Se não precisa verificar ou é edição, prosseguir com o salvamento
    onSubmit(dataToSubmit);
  };

  const handleConfirmarDuplicacao = async () => {
    try {
      if (!receitasParaDuplicar || receitasParaDuplicar.length === 0) {
        toast.error('Nenhuma receita para duplicar');
        setShowDuplicacaoModal(false);
        return;
      }

      let formDataAtualizado = { ...formDataPendente };
      const receitasCriadas = [];
      let todasReceitasSucesso = true;

      // Processar todas as receitas (atualizar ou duplicar)
      for (const item of receitasParaDuplicar) {
        const { centro_custo, receita_referencia, tipo = 'duplicar' } = item;
        
        // Buscar informações do centro de custo selecionado
        const centroCustoSelecionado = formData.centros_custo?.find(
          cc => cc.id === centro_custo.centro_custo_id
        );

        // Se for apenas atualizar (adicionar centro de custo à receita existente)
        if (tipo === 'atualizar') {
          // Adicionar o novo centro de custo à lista de centros de custo da receita
          const novosCentrosCusto = [...(receita_referencia.centros_custo || []), {
            id: centro_custo.centro_custo_id,
            nome: centro_custo.centro_custo_nome || '',
            filial_id: centroCustoSelecionado?.filial_id || null,
            filial_nome: centroCustoSelecionado?.filial_nome || null
          }];

          // Atualizar a receita
          const resultado = await receitasService.atualizar(receita_referencia.id, {
            nome: receita_referencia.nome,
            descricao: receita_referencia.descricao,
            tipo_receita_id: receita_referencia.tipo_receita_id,
            status: receita_referencia.status,
            filiais: receita_referencia.filiais || [],
            centros_custo: novosCentrosCusto,
            produtos: receita_referencia.produtos || []
          });

          if (resultado.success && resultado.data) {
            receitasCriadas.push({
              receitaCriada: resultado.data,
              centroCusto: centro_custo,
              receitaOriginal: receita_referencia,
              tipo: 'atualizada'
            });
          } else {
            todasReceitasSucesso = false;
            toast.error(`Erro ao atualizar receita "${receita_referencia.nome}" para adicionar centro de custo ${centro_custo.centro_custo_nome}`);
          }
          continue;
        }

        // Se for duplicar (criar nova receita)
        // Determinar filial: usar a filial do centro de custo selecionado, ou a primeira filial da receita original
        let filiaisParaNovaReceita = [];
        if (centroCustoSelecionado?.filial_id) {
          filiaisParaNovaReceita = [{
            id: centroCustoSelecionado.filial_id,
            nome: centroCustoSelecionado.filial_nome || ''
          }];
        } else if (receita_referencia.filiais && receita_referencia.filiais.length > 0) {
          // Usar a primeira filial da receita original
          filiaisParaNovaReceita = [receita_referencia.filiais[0]];
        }
        
        // Preparar centros de custo: apenas o centro de custo selecionado
        const centrosCustoParaNovaReceita = [{
          id: centro_custo.centro_custo_id,
          nome: centro_custo.centro_custo_nome || '',
          filial_id: centroCustoSelecionado?.filial_id || null,
          filial_nome: centroCustoSelecionado?.filial_nome || null
        }];
        
        // Preparar dados da nova receita
        const novaReceita = {
          nome: receita_referencia.nome,
          descricao: receita_referencia.descricao,
          filiais: filiaisParaNovaReceita,
          centros_custo: centrosCustoParaNovaReceita,
          tipo_receita_id: receita_referencia.tipo_receita_id,
          tipo_receita_nome: receita_referencia.tipo_receita_nome,
          status: receita_referencia.status || 1,
          produtos: receita_referencia.produtos.map(produto => ({
            produto_origem_id: produto.produto_origem_id,
            produto_origem: produto.produto_origem || produto.produto_origem_nome,
            grupo_id: produto.grupo_id,
            grupo_nome: produto.grupo_nome,
            subgrupo_id: produto.subgrupo_id,
            subgrupo_nome: produto.subgrupo_nome,
            classe_id: produto.classe_id,
            classe_nome: produto.classe_nome,
            unidade_medida_id: produto.unidade_medida_id,
            unidade_medida_sigla: produto.unidade_medida_sigla,
            percapta_sugerida: produto.percapta_sugerida
          })),
          receita_original_id: receita_referencia.id
        };

        // Criar a receita duplicada
        const resultado = await receitasService.criar(novaReceita);

        if (resultado.success && resultado.data) {
          receitasCriadas.push({
            receitaCriada: resultado.data,
            centroCusto: centro_custo,
            receitaOriginal: receita_referencia,
            tipo: 'duplicada'
          });
        } else {
          todasReceitasSucesso = false;
          toast.error(`Erro ao duplicar receita "${receita_referencia.nome}" para ${centro_custo.centro_custo_nome}`);
        }
      }

      if (todasReceitasSucesso && receitasCriadas.length > 0) {
        const receitasAtualizadas = receitasCriadas.filter(r => r.tipo === 'atualizada');
        const receitasDuplicadas = receitasCriadas.filter(r => r.tipo === 'duplicada');
        
        if (receitasAtualizadas.length > 0) {
          toast.success(`${receitasAtualizadas.length} receita(s) atualizada(s) com sucesso!`);
        }
        if (receitasDuplicadas.length > 0) {
          toast.success(`${receitasDuplicadas.length} receita(s) duplicada(s) com sucesso!`);
        }
        
        // Atualizar formData para incluir todas as novas receitas (apenas as duplicadas)
        const receitasAtuais = formDataPendente.receitas || [];
        const novasReceitas = [...receitasAtuais];
        
        receitasDuplicadas.forEach(({ receitaCriada }) => {
          const receitaJaExiste = novasReceitas.find(r => r.id === receitaCriada.id);
          if (!receitaJaExiste) {
            novasReceitas.push({
              id: receitaCriada.id,
              codigo: receitaCriada.codigo,
              nome: receitaCriada.nome
            });
          }
        });

        // Atualizar produtos para usar as novas receitas (apenas as duplicadas)
        let novosProdutos = [...formDataPendente.produtos];
        
        receitasDuplicadas.forEach(({ receitaCriada, centroCusto, receitaOriginal }) => {
          novosProdutos = novosProdutos.map(produto => {
            if (produto.centro_custo_id === centroCusto.centro_custo_id && 
                produto.receita_id === receitaOriginal.id) {
              return {
                ...produto,
                receita_id: receitaCriada.id
              };
            }
            return produto;
          });
        });

        // Atualizar formDataPendente
        formDataAtualizado = {
          ...formDataPendente,
          receitas: novasReceitas,
          produtos: novosProdutos
        };

        // Fechar modal e prosseguir com salvamento
        setShowDuplicacaoModal(false);
        setReceitasParaDuplicar([]);
        setFormDataPendente(null);

        // Salvar o prato
        onSubmit(formDataAtualizado);
      } else if (!todasReceitasSucesso) {
        toast.error('Algumas receitas não puderam ser duplicadas. Verifique os erros acima.');
      }
    } catch (error) {
      console.error('Erro ao duplicar receitas:', error);
      toast.error('Erro ao duplicar receitas');
    }
  };

  const handleCancelarDuplicacao = () => {
    toast.error('O prato não foi salvo. Ajuste o Centro de Custo ou os produtos selecionados.');
    setShowDuplicacaoModal(false);
    setReceitasParaDuplicar([]);
    setFormDataPendente(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewMode 
          ? 'Visualizar Prato' 
          : prato 
            ? 'Editar Prato' 
            : 'Novo Prato'
      }
      size="8xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Navegação por Abas */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setAbaAtiva('informacoes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === 'informacoes'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Informações do Prato
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('produtos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === 'produtos'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Produtos por Receita e Centro de Custo
              </button>
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          <div className="space-y-4 min-h-[400px]">
            {/* Aba: Informações do Prato */}
            {abaAtiva === 'informacoes' && (
              <div className="transition-opacity duration-300">
                {/* Duas colunas: Primeira coluna com Informações Básicas, Vinculações e Filiais e Centros de Custo */}
                {/* Segunda coluna com Filtrar por Tipo de Receita e Adicionar Receitas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                  {/* Primeira Coluna */}
                  <div className="space-y-4">
            {/* Seção: Informações Básicas */}
            <InformacoesBasicas
              prato={prato}
              formData={formData}
              errors={errors}
              isViewMode={isViewMode}
              onInputChange={handleInputChange}
            />

            {/* Seção: Vinculações */}
            <Vinculacoes
              formData={formData}
              isViewMode={isViewMode}
              tiposPratos={tiposPratos}
              loadingTiposPratos={loadingTiposPratos}
              onInputChange={handleInputChange}
                      errors={errors}
            />

            {/* Seção: Filiais e Centros de Custo */}
            <FiliaisCentrosCusto
              formData={formData}
              isViewMode={isViewMode}
              onInputChange={handleInputChange}
            />
          </div>

                  {/* Segunda Coluna */}
                  <div className="space-y-4">
                    {/* Seção: Filtro e Adição de Receitas */}
                    <ReceitasProdutos
                      formData={formData}
                      isViewMode={isViewMode}
                      onInputChange={handleInputChange}
                      errors={errors}
                      showOnlyFilters={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Aba: Produtos por Receita e Centro de Custo */}
            {abaAtiva === 'produtos' && (
              <div className="transition-opacity duration-300 h-full">
          <ReceitasProdutos
            formData={formData}
            isViewMode={isViewMode}
            onInputChange={handleInputChange}
                  errors={errors}
                  showOnlyTable={true}
          />
              </div>
            )}
          </div>

          {/* Botões */}
          {!isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {prato ? 'Atualizar Prato' : 'Salvar Prato'}
              </Button>
            </div>
          )}

          {isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="primary"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Modal de Duplicação de Receita */}
      <ReceitaDuplicacaoModal
        isOpen={showDuplicacaoModal}
        onClose={() => handleCancelarDuplicacao()}
        onConfirm={handleConfirmarDuplicacao}
        onCancel={handleCancelarDuplicacao}
        receitasParaDuplicar={receitasParaDuplicar}
      />
    </Modal>
  );
};

export default PratoModal;

