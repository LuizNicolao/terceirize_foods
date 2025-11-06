import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, SearchableSelect } from '../ui';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Pagination } from '../ui';
import toast from 'react-hot-toast';
import FoodsApiService from '../../services/FoodsApiService';
import escolasService from '../../services/escolasService';
import { useAuth } from '../../contexts/AuthContext';

const TipoAtendimentoEscolaModal = ({
  isOpen,
  onClose,
  onSave,
  tiposAtendimento = [],
  editingItem = null,
  viewMode = false,
  loading = false
}) => {
  const { user } = useAuth();
  const [filialId, setFilialId] = useState('');
  const [filiais, setFiliais] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [vinculosSelecionados, setVinculosSelecionados] = useState({}); // { escola_id: [tipo1, tipo2, ...] }
  const [escolasPage, setEscolasPage] = useState(1);
  const [escolasTotalPages, setEscolasTotalPages] = useState(1);
  const [escolasTotalItems, setEscolasTotalItems] = useState(0);
  const [escolasItemsPerPage] = useState(20);
  const [buscaEscola, setBuscaEscola] = useState('');
  const [errors, setErrors] = useState({});
  const [statusAtivo, setStatusAtivo] = useState(true);

  // Carregar filiais
  useEffect(() => {
    if (isOpen && !editingItem) {
      carregarFiliais();
    }
  }, [isOpen, editingItem]);

  // Carregar escolas quando filial mudar
  useEffect(() => {
    if (filialId && isOpen && !editingItem) {
      carregarEscolas(filialId, escolasPage);
    } else {
      setEscolas([]);
    }
  }, [filialId, escolasPage, isOpen, editingItem]);

  // Carregar vínculos existentes quando estiver editando
  useEffect(() => {
    if (editingItem && isOpen) {
      // Modo edição: mostrar apenas o vínculo atual
      setVinculosSelecionados({
        [editingItem.escola_id]: [editingItem.tipo_atendimento]
      });
      setStatusAtivo(editingItem.ativo !== undefined ? editingItem.ativo : true);
    } else if (isOpen) {
      // Modo criação: limpar seleções
      setVinculosSelecionados({});
      setFilialId('');
      setBuscaEscola('');
      setEscolasPage(1);
      setStatusAtivo(true);
    }
  }, [editingItem, isOpen]);

  const carregarFiliais = async () => {
    setLoadingFiliais(true);
    try {
      const response = await FoodsApiService.getFiliais({ ativo: true });
      if (response.success) {
        setFiliais(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  };

  const carregarEscolas = async (filialIdParam, page = 1) => {
    setLoadingEscolas(true);
    try {
      const response = await escolasService.listar(
        { 
          filial_id: filialIdParam,
          page,
          limit: escolasItemsPerPage,
          search: buscaEscola || undefined
        },
        user
      );
      if (response.success) {
        setEscolas(response.data || []);
        // Se a resposta tiver paginação, usar ela
        if (response.pagination) {
          setEscolasTotalPages(response.pagination.totalPages || 1);
          setEscolasTotalItems(response.pagination.totalItems || 0);
        } else {
          // Fallback: calcular paginação básica
          setEscolasTotalPages(1);
          setEscolasTotalItems(response.data?.length || 0);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      toast.error('Erro ao carregar escolas');
    } finally {
      setLoadingEscolas(false);
    }
  };

  const handleFilialChange = (value) => {
    setFilialId(value);
    setEscolasPage(1);
    setVinculosSelecionados({});
  };

  const handleTipoToggle = (escolaId, tipoValue) => {
    setVinculosSelecionados(prev => {
      const escolaVinculos = prev[escolaId] || [];
      const novosVinculos = escolaVinculos.includes(tipoValue)
        ? escolaVinculos.filter(t => t !== tipoValue)
        : [...escolaVinculos, tipoValue];
      
      return {
        ...prev,
        [escolaId]: novosVinculos.length > 0 ? novosVinculos : undefined
      };
    });
  };

  const isTipoSelecionado = (escolaId, tipoValue) => {
    return vinculosSelecionados[escolaId]?.includes(tipoValue) || false;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editingItem && !filialId) {
      newErrors.filial_id = 'Filial é obrigatória';
    }

    // Verificar se há pelo menos um vínculo selecionado
    const totalVinculos = Object.values(vinculosSelecionados).reduce(
      (acc, tipos) => acc + (tipos?.length || 0),
      0
    );

    if (totalVinculos === 0) {
      newErrors.vinculos = 'Selecione ao menos um tipo de atendimento para uma escola';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Se estiver editando, manter formato antigo
    if (editingItem) {
      await onSave({
        escola_id: editingItem.escola_id,
        tipo_atendimento: vinculosSelecionados[editingItem.escola_id]?.[0],
        ativo: editingItem.ativo
      });
    } else {
      // Criar array de vínculos para salvar
      const vinculosParaSalvar = [];
      Object.entries(vinculosSelecionados).forEach(([escolaId, tipos]) => {
        if (tipos && tipos.length > 0) {
          tipos.forEach(tipo => {
            vinculosParaSalvar.push({
              escola_id: parseInt(escolaId),
              tipo_atendimento: tipo,
              ativo: true
            });
          });
        }
      });

      await onSave({
        vinculos: vinculosParaSalvar
      });
    }
  };

  const handleBuscaEscola = (e) => {
    setBuscaEscola(e.target.value);
    setEscolasPage(1);
  };

  const handleBuscaEscolaSubmit = () => {
    if (filialId) {
      carregarEscolas(filialId, 1);
    }
  };

  // Filtrar escolas localmente se necessário (fallback)
  const escolasExibidas = buscaEscola && escolas.length > 0
    ? escolas.filter(escola =>
        (escola.nome_escola || '').toLowerCase().includes(buscaEscola.toLowerCase()) ||
        (escola.rota || '').toLowerCase().includes(buscaEscola.toLowerCase()) ||
        (escola.cidade || '').toLowerCase().includes(buscaEscola.toLowerCase())
      )
    : escolas;

  const handleStatusChange = (e) => {
    setStatusAtivo(e.target.value === 'ativo');
  };

  // Modo edição: mostrar formulário simples
  if (editingItem) {

    const handleEditSubmit = async (e) => {
      e.preventDefault();
      await onSave({
        escola_id: editingItem.escola_id,
        tipo_atendimento: editingItem.tipo_atendimento,
        ativo: statusAtivo
      });
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={viewMode ? 'Visualizar Vínculo' : 'Editar Vínculo'}
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-2">Escola:</p>
            <p>{editingItem.nome_escola || `ID: ${editingItem.escola_id}`}</p>
            <p className="font-medium mt-4 mb-2">Tipo de Atendimento:</p>
            <p>{tiposAtendimento.find(t => t.value === editingItem.tipo_atendimento)?.label || editingItem.tipo_atendimento}</p>
          </div>

          {!viewMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusAtivo ? 'ativo' : 'inativo'}
                onChange={handleStatusChange}
                disabled={loading || viewMode}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  loading || viewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={loading}
            >
              <FaTimes className="mr-2" />
              {viewMode ? 'Fechar' : 'Cancelar'}
            </Button>
            {!viewMode && (
              <Button
                type="submit"
                disabled={loading}
              >
                <FaSave className="mr-2" />
                {loading ? 'Salvando...' : 'Atualizar'}
              </Button>
            )}
          </div>
        </form>
      </Modal>
    );
  }

  // Modo criação: mostrar matriz
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular Tipos de Atendimento às Escolas"
      size="full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Filial */}
        <div>
          <SearchableSelect
            label="Filial *"
            value={filialId}
            onChange={handleFilialChange}
            options={filiais.map(filial => ({
              value: filial.id,
              label: filial.filial || filial.nome || `Filial ${filial.id}`
            }))}
            placeholder="Selecione uma filial..."
            disabled={loading || loadingFiliais || viewMode}
            required
            error={errors.filial_id}
          />
        </div>

        {/* Busca de Escola */}
        {filialId && (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar escola por nome, rota ou cidade..."
                value={buscaEscola}
                onChange={handleBuscaEscola}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleBuscaEscolaSubmit())}
                disabled={loadingEscolas}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
              <Button
                type="button"
                onClick={handleBuscaEscolaSubmit}
                disabled={loadingEscolas}
                size="sm"
              >
                Buscar
              </Button>
            </div>
          </div>
        )}

        {/* Tabela Matriz */}
        {filialId && (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                      Escola
                    </th>
                    {tiposAtendimento.map(tipo => (
                      <th
                        key={tipo.value}
                        className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg mb-1">{tipo.icon}</span>
                          <span className="text-xs">{tipo.label.replace(/[🌅🍽️🌆🥗🌙]/g, '').trim()}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingEscolas ? (
                    <tr>
                      <td colSpan={tiposAtendimento.length + 1} className="px-4 py-8 text-center text-gray-500">
                        Carregando escolas...
                      </td>
                    </tr>
                  ) : escolasExibidas.length === 0 ? (
                    <tr>
                      <td colSpan={tiposAtendimento.length + 1} className="px-4 py-8 text-center text-gray-500">
                        {filialId ? 'Nenhuma escola encontrada' : 'Selecione uma filial para ver as escolas'}
                      </td>
                    </tr>
                  ) : (
                    escolasExibidas.map(escola => (
                      <tr key={escola.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 bg-white z-10">
                          <div className="font-medium">{escola.nome_escola}</div>
                          {escola.rota && (
                            <div className="text-xs text-gray-500">{escola.rota}</div>
                          )}
                          {escola.cidade && (
                            <div className="text-xs text-gray-500">{escola.cidade}</div>
                          )}
                        </td>
                        {tiposAtendimento.map(tipo => (
                          <td key={tipo.value} className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isTipoSelecionado(escola.id, tipo.value)}
                              onChange={() => handleTipoToggle(escola.id, tipo.value)}
                              disabled={viewMode || loading}
                              className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginação */}
        {filialId && escolasTotalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={escolasPage}
              totalPages={escolasTotalPages}
              totalItems={escolasTotalItems}
              itemsPerPage={escolasItemsPerPage}
              onPageChange={setEscolasPage}
            />
          </div>
        )}

        {/* Erro de validação */}
        {errors.vinculos && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errors.vinculos}</p>
          </div>
        )}

        {/* Botões */}
        {!viewMode && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={loading}
            >
              <FaTimes className="mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingEscolas}
            >
              <FaSave className="mr-2" />
              {loading ? 'Salvando...' : 'Salvar Vínculos'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default TipoAtendimentoEscolaModal;
