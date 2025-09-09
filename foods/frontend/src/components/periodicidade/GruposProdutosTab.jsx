import React, { useEffect, useState } from 'react';
import { FaBoxes, FaBox, FaSearch, FaCheckSquare, FaSquare, FaChevronDown, FaChevronRight, FaInfoCircle, FaFilter, FaList, FaTh, FaTimes } from 'react-icons/fa';
import { Button } from '../ui';
import GruposService from '../../services/grupos';
import PeriodicidadeService from '../../services/periodicidade';

const GruposProdutosTab = ({
  gruposSelecionados,
  onGruposChange,
  produtosIndividuais = [],
  onProdutosIndividuaisChange,
  isViewMode = false
}) => {
  // Estados para Grupos e Produtos
  const [gruposProdutos, setGruposProdutos] = useState([]);
  const [produtosPorGrupo, setProdutosPorGrupo] = useState({});
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState({});
  
  // Estados para seleção - NOVA LÓGICA
  const [gruposCompletos, setGruposCompletos] = useState([]); // Grupos selecionados por inteiro
  const [produtosIndividuaisLocal, setProdutosIndividuaisLocal] = useState(produtosIndividuais); // Produtos individuais selecionados
  
  // Estados para nova interface
  const [grupoSelecionado, setGrupoSelecionado] = useState(null); // Grupo selecionado para ver produtos
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'grupos', 'produtos'
  const [buscaGlobal, setBuscaGlobal] = useState('');

  // Carregar grupos de produtos
  const carregarGruposProdutos = async () => {
    try {
      setLoadingGrupos(true);
      const result = await GruposService.buscarAtivos();
      if (result.success) {
        setGruposProdutos(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos de produtos:', error);
      setGruposProdutos([]);
    } finally {
      setLoadingGrupos(false);
    }
  };

  // Carregar produtos de um grupo específico
  const carregarProdutosGrupo = async (grupoId) => {
    try {
      setLoadingProdutos(prev => ({ ...prev, [grupoId]: true }));
      const result = await PeriodicidadeService.buscarProdutosPorGrupo(grupoId);
      if (result.success) {
        setProdutosPorGrupo(prev => ({
          ...prev,
          [grupoId]: result.data || []
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos do grupo:', error);
      setProdutosPorGrupo(prev => ({
        ...prev,
        [grupoId]: []
      }));
    } finally {
      setLoadingProdutos(prev => ({ ...prev, [grupoId]: false }));
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    carregarGruposProdutos();
  }, []);

  // NOVA LÓGICA: Função para selecionar grupo completo
  const handleGrupoCompletoChange = (grupoId, checked) => {
    if (checked) {
      setGruposCompletos(prev => [...prev, grupoId]);
    } else {
      setGruposCompletos(prev => prev.filter(id => id !== grupoId));
    }
  };

  // NOVA LÓGICA: Função para selecionar produto individual
  const handleProdutoIndividualChange = (produtoId, grupoId, checked) => {
    if (checked) {
      const novosProdutos = [...produtosIndividuaisLocal, produtoId];
      setProdutosIndividuaisLocal(novosProdutos);
      onProdutosIndividuaisChange && onProdutosIndividuaisChange(novosProdutos);
    } else {
      const novosProdutos = produtosIndividuaisLocal.filter(id => id !== produtoId);
      setProdutosIndividuaisLocal(novosProdutos);
      onProdutosIndividuaisChange && onProdutosIndividuaisChange(novosProdutos);
    }
  };

  // Calcular total de produtos finais
  const calcularTotalProdutosFinais = () => {
    let total = 0;
    
    // Adicionar produtos de grupos completos
    gruposCompletos.forEach(grupoId => {
      const produtosGrupo = produtosPorGrupo[grupoId] || [];
      total += produtosGrupo.length;
    });
    
    // Adicionar produtos individuais (apenas os que não estão em grupos completos)
    produtosIndividuaisLocal.forEach(produtoId => {
      const produto = Object.values(produtosPorGrupo)
        .flat()
        .find(p => p.id === produtoId);
      
      if (produto && !gruposCompletos.includes(produto.grupo_id)) {
        total += 1;
      }
    });
    
    return total;
  };

  // NOVA FUNÇÃO: Verificar se produto está em grupo completo
  const isProdutoEmGrupoCompleto = (produtoId) => {
    const produto = Object.values(produtosPorGrupo)
      .flat()
      .find(p => p.id === produtoId);
    
    return produto && gruposCompletos.includes(produto.grupo_id);
  };

  // Funções para nova interface
  const contarProdutosSelecionadosNoGrupo = (grupoId) => {
    if (!produtosPorGrupo[grupoId]) return 0;
    return produtosPorGrupo[grupoId].filter(produto => 
      produtosIndividuaisLocal.includes(produto.id)
    ).length;
  };

  const isGrupoCompleto = (grupoId) => {
    return gruposCompletos.includes(grupoId);
  };

  const isGrupoParcial = (grupoId) => {
    const totalProdutos = produtosPorGrupo[grupoId]?.length || 0;
    const produtosSelecionados = contarProdutosSelecionadosNoGrupo(grupoId);
    return produtosSelecionados > 0 && produtosSelecionados < totalProdutos;
  };

  const filtrarGrupos = () => {
    let gruposFiltrados = gruposProdutos;
    
    if (buscaGlobal.trim()) {
      const termo = buscaGlobal.toLowerCase();
      gruposFiltrados = gruposFiltrados.filter(grupo => 
        grupo.nome.toLowerCase().includes(termo)
      );
    }
    
    if (filtroTipo === 'grupos') {
      gruposFiltrados = gruposFiltrados.filter(grupo => 
        isGrupoCompleto(grupo.id)
      );
    } else if (filtroTipo === 'produtos') {
      gruposFiltrados = gruposFiltrados.filter(grupo => 
        contarProdutosSelecionadosNoGrupo(grupo.id) > 0
      );
    }
    
    return gruposFiltrados;
  };

  const selecionarTodosGrupos = () => {
    const todosGrupos = gruposProdutos.map(grupo => grupo.id);
    setGruposCompletos(todosGrupos);
    setProdutosIndividuaisLocal([]);
  };

  const limparTudo = () => {
    setGruposCompletos([]);
    setProdutosIndividuaisLocal([]);
  };

  const selecionarTodosProdutos = () => {
    if (!grupoSelecionado) return;
    
    const produtosGrupo = produtosPorGrupo[grupoSelecionado.id] || [];
    const produtosIds = produtosGrupo.map(p => p.id);
    
    // Adicionar apenas produtos que não estão em grupos completos
    const novosProdutos = [...produtosIndividuaisLocal];
    produtosIds.forEach(id => {
      if (!novosProdutos.includes(id) && !isProdutoEmGrupoCompleto(id)) {
        novosProdutos.push(id);
      }
    });
    
    setProdutosIndividuaisLocal(novosProdutos);
    onProdutosIndividuaisChange && onProdutosIndividuaisChange(novosProdutos);
  };

  const limparProdutosGrupo = () => {
    if (!grupoSelecionado) return;
    
    const produtosGrupo = produtosPorGrupo[grupoSelecionado.id] || [];
    const produtosIds = produtosGrupo.map(p => p.id);
    
    const novosProdutos = produtosIndividuaisLocal.filter(id => !produtosIds.includes(id));
    setProdutosIndividuaisLocal(novosProdutos);
    onProdutosIndividuaisChange && onProdutosIndividuaisChange(novosProdutos);
  };

  // Sincronizar produtos individuais com as props
  useEffect(() => {
    setProdutosIndividuaisLocal(produtosIndividuais);
    
    // Se há produtos selecionados, precisamos carregar os produtos dos grupos
    // para calcular corretamente os contadores
    if (produtosIndividuais.length > 0 && gruposProdutos.length > 0) {
      // Carregar produtos de todos os grupos que podem ter produtos selecionados
      gruposProdutos.forEach(grupo => {
        if (!produtosPorGrupo[grupo.id] && !loadingProdutos[grupo.id]) {
          carregarProdutosGrupo(grupo.id);
        }
      });
    }
  }, [produtosIndividuais, gruposProdutos]);

  // Atualizar grupos selecionados quando mudanças ocorrem
  useEffect(() => {
    onGruposChange(gruposCompletos);
  }, [gruposCompletos, onGruposChange]);

  return (
    <div className="space-y-4">
      {/* Header com Resumo e Ações */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-blue-800 flex items-center">
            <FaBoxes className="mr-1 text-sm" />
            Seleção de Produtos
          </h3>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selecionarTodosGrupos}
              disabled={isViewMode}
              className="flex items-center"
            >
              <FaCheckSquare className="mr-1" />
              Todos os Grupos
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={limparTudo}
              disabled={isViewMode}
              className="flex items-center"
            >
              <FaTimes className="mr-1" />
              Limpar
            </Button>
          </div>
        </div>
        
         {/* Resumo da Seleção */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
           <div className="bg-white p-2 rounded border border-blue-200">
             <div className="flex items-center">
               <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
               <div>
                 <p className="text-xs text-gray-500">Grupos Completos</p>
                 <p className="text-sm font-bold text-blue-600">{gruposCompletos.length}</p>
               </div>
             </div>
           </div>
           <div className="bg-white p-2 rounded border border-green-200">
             <div className="flex items-center">
               <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
               <div>
                 <p className="text-xs text-gray-500">Produtos Individuais</p>
                 <p className="text-sm font-bold text-green-600">{produtosIndividuaisLocal.length}</p>
               </div>
             </div>
           </div>
           <div className="bg-white p-2 rounded border border-purple-200">
             <div className="flex items-center">
               <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
               <div>
                 <p className="text-xs text-gray-500">Total Final</p>
                 <p className="text-sm font-bold text-purple-600">{calcularTotalProdutosFinais()}</p>
               </div>
             </div>
           </div>
           <div className="bg-white p-2 rounded border border-gray-200">
             <div className="flex items-center">
               <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
               <div>
                 <p className="text-xs text-gray-500">Grupos Disponíveis</p>
                 <p className="text-sm font-bold text-gray-600">{gruposProdutos.length}</p>
               </div>
             </div>
           </div>
         </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-3 rounded border border-gray-200">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Busca Global */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Buscar grupos ou produtos..."
                value={buscaGlobal}
                onChange={(e) => setBuscaGlobal(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                disabled={isViewMode}
              />
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex space-x-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isViewMode}
            >
              <option value="todos">Todos</option>
              <option value="grupos">Apenas Grupos Completos</option>
              <option value="produtos">Apenas com Produtos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interface Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coluna Esquerda - Lista de Grupos */}
        <div className="bg-white rounded border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center">
              <FaList className="mr-1 text-xs" />
              Grupos de Produtos
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loadingGrupos ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando grupos...</p>
              </div>
            ) : (
              <div className="p-2">
                {filtrarGrupos().map(grupo => {
                  const produtosSelecionados = contarProdutosSelecionadosNoGrupo(grupo.id);
                  const totalProdutos = produtosPorGrupo[grupo.id]?.length || 0;
                  const isCompleto = isGrupoCompleto(grupo.id);
                  const isParcial = isGrupoParcial(grupo.id);
                  
                  return (
                     <div
                       key={grupo.id}
                       className={`p-2 mb-1 rounded border cursor-pointer transition-all duration-200 ${
                         grupoSelecionado?.id === grupo.id
                           ? 'border-blue-500 bg-blue-50'
                           : isCompleto
                           ? 'border-green-300 bg-green-50'
                           : isParcial
                           ? 'border-yellow-300 bg-yellow-50'
                           : 'border-gray-200 bg-white hover:bg-gray-50'
                       }`}
                       onClick={() => {
                         setGrupoSelecionado(grupo);
                         if (!produtosPorGrupo[grupo.id] && !loadingProdutos[grupo.id]) {
                           carregarProdutosGrupo(grupo.id);
                         }
                       }}
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex items-center">
                           <input
                             type="checkbox"
                             checked={isCompleto}
                             onChange={(e) => {
                               e.stopPropagation();
                               handleGrupoCompletoChange(grupo.id, e.target.checked);
                             }}
                             disabled={isViewMode}
                             className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                           />
                           <div>
                             <p className="text-sm font-medium text-gray-900">{grupo.nome}</p>
                             <p className="text-xs text-gray-500">
                               {totalProdutos} produto(s) • {produtosSelecionados} selecionado(s)
                             </p>
                           </div>
                         </div>
                         <div className="flex items-center space-x-1">
                           {isCompleto && (
                             <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                               Completo
                             </span>
                           )}
                           {isParcial && (
                             <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                               Parcial
                             </span>
                           )}
                           <FaChevronRight className="text-gray-400 text-xs" />
                         </div>
                       </div>
                     </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita - Produtos do Grupo Selecionado */}
        <div className="bg-white rounded border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                <FaBox className="mr-1 text-xs" />
                {grupoSelecionado ? `Produtos - ${grupoSelecionado.nome}` : 'Selecione um grupo'}
              </h3>
              {grupoSelecionado && !isViewMode && (
                <div className="flex space-x-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selecionarTodosProdutos}
                    className="text-xs px-2 py-1"
                  >
                    Todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={limparProdutosGrupo}
                    className="text-xs px-2 py-1"
                  >
                    Nenhuma
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {!grupoSelecionado ? (
              <div className="p-8 text-center text-gray-500">
                <FaBoxes className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>Selecione um grupo à esquerda para ver seus produtos</p>
              </div>
            ) : loadingProdutos[grupoSelecionado.id] ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando produtos...</p>
              </div>
            ) : (
              <div className="p-2">
                {produtosPorGrupo[grupoSelecionado.id]?.map(produto => {
                  const isChecked = produtosIndividuaisLocal.includes(produto.id);
                  const isDisabled = isViewMode || isProdutoEmGrupoCompleto(produto.id);
                  
                  return (
                     <label
                       key={produto.id}
                       className={`flex items-center p-2 mb-1 rounded border cursor-pointer transition-all duration-200 ${
                         isChecked
                           ? 'border-green-300 bg-green-50'
                           : 'border-gray-200 bg-white hover:bg-gray-50'
                       } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                       <input
                         type="checkbox"
                         checked={isChecked}
                         onChange={(e) => handleProdutoIndividualChange(produto.id, produto.grupo_id, e.target.checked)}
                         disabled={isDisabled}
                         className="mr-2 text-green-600 focus:ring-green-500 rounded"
                       />
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-gray-900 truncate">{produto.nome}</p>
                         <div className="text-xs text-gray-500 truncate">
                           {produto.codigo_produto && `Código: ${produto.codigo_produto}`}
                           {produto.informacoes_adicionais && ` • ${produto.informacoes_adicionais}`}
                         </div>
                       </div>
                       {isProdutoEmGrupoCompleto(produto.id) && (
                         <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                           Grupo Completo
                         </span>
                       )}
                     </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GruposProdutosTab;