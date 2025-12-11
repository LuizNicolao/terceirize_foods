import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaEye } from 'react-icons/fa';
import { Modal, Input, Button, SearchableSelect } from '../ui';
import pratosService from '../../services/pratos';
import tiposPratosService from '../../services/tiposPratos';
import ProdutosPratoModal from './ProdutosPratoModal';
import toast from 'react-hot-toast';

/**
 * Modal para buscar e selecionar pratos
 */
const CardapioPratosModal = ({
  isOpen,
  onClose,
  onSelect,
  periodoAtendimentoId,
  produtoComercialId,
  pratosJaAdicionados = [] // Array de IDs dos pratos já adicionados no dia
}) => {
  const [pratos, setPratos] = useState([]);
  const [pratosCompletos, setPratosCompletos] = useState([]); // Pratos com dados completos
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPratos, setSelectedPratos] = useState([]);
  const [tiposPratos, setTiposPratos] = useState([]);
  const [tipoPratoFiltro, setTipoPratoFiltro] = useState(null);
  const [loadingTiposPratos, setLoadingTiposPratos] = useState(false);
  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [pratoSelecionadoProdutos, setPratoSelecionadoProdutos] = useState(null); // { id, nome }

  useEffect(() => {
    if (isOpen) {
      carregarTiposPratos();
      carregarPratos();
    } else {
      setSearch('');
      setSelectedPratos([]);
      setTipoPratoFiltro(null);
      setProdutoModalOpen(false);
      setPratoSelecionadoProdutos(null);
    }
  }, [isOpen, pratosJaAdicionados]);

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

  const carregarPratos = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 1000,
        status: 'ativo',
        search: search || undefined,
        tipo_prato_id: tipoPratoFiltro || undefined
      };

      const response = await pratosService.listar(params);

      if (response.success && response.data) {
        // Filtrar pratos já adicionados no dia
        const pratosIdsJaAdicionados = (pratosJaAdicionados || []).map(p => p.prato_id || p.id);
        const pratosFiltrados = response.data.filter(prato => 
          !pratosIdsJaAdicionados.includes(prato.id)
        );
        setPratos(pratosFiltrados);
        setPratosCompletos(pratosFiltrados);
      }
    } catch (error) {
      console.error('Erro ao carregar pratos:', error);
      toast.error('Erro ao carregar pratos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    carregarPratos();
  };

  const handleTipoPratoChange = (tipo) => {
    setTipoPratoFiltro(tipo?.id || null);
  };

  // Aplicar filtro de tipo de prato
  useEffect(() => {
    if (tipoPratoFiltro) {
      const filtrados = pratosCompletos.filter(p => p.tipo_prato_id === tipoPratoFiltro);
      setPratos(filtrados);
    } else {
      setPratos(pratosCompletos);
    }
  }, [tipoPratoFiltro, pratosCompletos]);

  const handleTogglePrato = (prato) => {
    setSelectedPratos(prev => {
      const existe = prev.find(p => p.id === prato.id);
      if (existe) {
        return prev.filter(p => p.id !== prato.id);
      } else {
        return [...prev, prato];
      }
    });
  };

  const handleVisualizarProdutos = (pratoId) => {
    const prato = pratos.find(p => p.id === pratoId);
    if (prato) {
      setPratoSelecionadoProdutos({
        id: pratoId,
        nome: prato.nome || `Prato ${pratoId}`
      });
      setProdutoModalOpen(true);
    }
  };

  const handleConfirm = () => {
    if (selectedPratos.length === 0) {
      toast.error('Selecione pelo menos um prato');
      return;
    }

    if (onSelect) {
      onSelect(selectedPratos);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" title="Selecionar Pratos">
      <div className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Busca por nome */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Buscar prato por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="flex-1"
            />
            <Button type="button" onClick={handleSearch} disabled={loading}>
              <FaSearch className="mr-2" />
              Buscar
            </Button>
          </div>

          {/* Filtro por tipo de prato */}
          <div>
            <SearchableSelect
              placeholder="Filtrar por tipo de prato..."
              options={tiposPratos.map(tp => ({
                value: tp.id,
                label: tp.tipo_prato || tp.nome || ''
              }))}
              value={tipoPratoFiltro ? {
                value: tipoPratoFiltro,
                label: tiposPratos.find(tp => tp.id === tipoPratoFiltro)?.tipo_prato || 
                       tiposPratos.find(tp => tp.id === tipoPratoFiltro)?.nome || ''
              } : null}
              onChange={handleTipoPratoChange}
              isClearable
              isLoading={loadingTiposPratos}
            />
          </div>
        </div>

        {/* Lista de pratos */}
        <div className="border border-gray-200 rounded-lg max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando...</p>
            </div>
          ) : pratos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum prato encontrado
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pratos.map((prato) => {
                const isSelected = selectedPratos.some(p => p.id === prato.id);

                return (
                  <div key={prato.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTogglePrato(prato)}
                        className="mr-2"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{prato.nome}</div>
                        <div className="flex items-center gap-4 mt-1">
                          {prato.tipo_prato_nome && (
                            <div className="text-sm text-gray-500">
                              Tipo: {prato.tipo_prato_nome}
                            </div>
                          )}
                          {prato.codigo && (
                            <div className="text-sm text-gray-500">
                              Código: {prato.codigo}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVisualizarProdutos(prato.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Visualizar produtos"
                      >
                        <FaEye className="mr-1" />
                        Ver Produtos
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contador */}
        {selectedPratos.length > 0 && (
          <div className="text-sm text-gray-600">
            {selectedPratos.length} prato(s) selecionado(s)
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Adicionar {selectedPratos.length > 0 && `(${selectedPratos.length})`}
          </Button>
        </div>
      </div>

      {/* Modal de produtos do prato */}
      <ProdutosPratoModal
        isOpen={produtoModalOpen}
        onClose={() => {
          setProdutoModalOpen(false);
          setPratoSelecionadoProdutos(null);
        }}
        pratoId={pratoSelecionadoProdutos?.id}
        pratoNome={pratoSelecionadoProdutos?.nome}
      />
    </Modal>
  );
};

export default CardapioPratosModal;
