import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, SearchableSelect, ConfirmModal } from '../ui';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Pagination } from '../ui';
import toast from 'react-hot-toast';
import FoodsApiService from '../../services/FoodsApiService';
import escolasService from '../../services/escolasService';
import { useAuth } from '../../contexts/AuthContext';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';

const TipoAtendimentoEscolaModal = ({
  isOpen,
  onClose,
  onSave,
  tiposAtendimento = [],
  editingItem = null,
  viewMode = false,
  loading = false,
  buscarPorEscola = async () => []
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
  const [escolasItemsPerPage, setEscolasItemsPerPage] = useState(20);
  const [buscaEscola, setBuscaEscola] = useState('');
  const [errors, setErrors] = useState({});
  const [statusAtivo, setStatusAtivo] = useState(true);
  const [confirmacao, setConfirmacao] = useState({ aberto: false, acao: null });
  const isEditing = Boolean(editingItem);
  const isViewMode = viewMode;
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

  useEffect(() => {
    if (!isOpen || isViewMode) {
      resetDirty();
    }
  }, [isOpen, isViewMode, resetDirty]);

  // Carregar filiais
  useEffect(() => {
    if (isOpen) {
      carregarFiliais();
    }
  }, [isOpen]);

  // Carregar escolas quando filial mudar (apenas criação)
  useEffect(() => {
    if (!isOpen || isEditing) {
      return;
    }

    if (filialId) {
      carregarEscolas(filialId, escolasPage, escolasItemsPerPage);
    } else {
      setEscolas([]);
      setEscolasTotalPages(1);
      setEscolasTotalItems(0);
    }
  }, [filialId, escolasPage, escolasItemsPerPage, isOpen, isEditing]);

  // Preparar estado quando abrir modal (criação ou edição)
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isEditing && editingItem) {
      const escolaId = editingItem.escola_id;
      const filialIdItem = editingItem.filial_id ? String(editingItem.filial_id) : '';

      setFilialId(filialIdItem);
      setBuscaEscola('');
      setEscolasPage(1);
      setStatusAtivo(editingItem.ativo !== undefined ? Boolean(editingItem.ativo) : true);

      const escolaSelecionada = {
        id: escolaId,
        nome_escola: editingItem.nome_escola || '',
        rota: editingItem.rota || '',
        cidade: editingItem.cidade || '',
        filial_id: editingItem.filial_id || null,
        filial_nome: editingItem.filial_nome || ''
      };

      setEscolas([escolaSelecionada]);
      setEscolasTotalItems(1);
      setEscolasTotalPages(1);

      const carregarTiposEscola = async () => {
        try {
          const tiposExistentes = await buscarPorEscola(escolaId);
          const tiposSelecionados = Array.isArray(tiposExistentes) && tiposExistentes.length > 0
            ? tiposExistentes
                .filter(item => item && item.tipo_atendimento)
                .map(item => item.tipo_atendimento)
            : editingItem.tipo_atendimento
              ? [editingItem.tipo_atendimento]
              : [];

          setVinculosSelecionados({
            [escolaId]: tiposSelecionados
          });
        } catch (error) {
          console.error('Erro ao carregar tipos da escola para edição:', error);
          setVinculosSelecionados({
            [escolaId]: editingItem.tipo_atendimento ? [editingItem.tipo_atendimento] : []
          });
        }
      };

      carregarTiposEscola();
    } else {
      setVinculosSelecionados({});
      setFilialId('');
      setBuscaEscola('');
      setEscolasPage(1);
      setStatusAtivo(true);
      setEscolas([]);
      setEscolasTotalItems(0);
      setEscolasTotalPages(1);
    }
  }, [isOpen, isEditing, editingItem, buscarPorEscola]);

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

  const carregarEscolas = async (filialIdParam, page = 1, limit = escolasItemsPerPage) => {
    setLoadingEscolas(true);
    try {
      const response = await escolasService.listar(
        { 
          filial_id: filialIdParam,
          page,
          limit,
          search: buscaEscola || undefined
        },
        user
      );
      if (response.success) {
        setEscolas(response.data || []);
        // Se a resposta tiver paginação, usar ela
        if (response.pagination) {
          const {
            totalItems: paginatedTotalItems,
            totalPages: paginatedTotalPages,
            itemsPerPage: paginatedItemsPerPage,
            total,
            last_page,
            per_page
          } = response.pagination;

          const resolvedItemsPerPage = paginatedItemsPerPage || per_page || limit || escolasItemsPerPage;
          const resolvedTotalItems = paginatedTotalItems ?? total ?? response.data?.length ?? 0;
          const resolvedTotalPages = paginatedTotalPages || last_page || Math.max(1, Math.ceil((resolvedTotalItems || 0) / (resolvedItemsPerPage || 1)));

          setEscolasTotalPages(resolvedTotalPages);
          setEscolasTotalItems(resolvedTotalItems);
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
    if (isEditing) {
      return;
    }
    setFilialId(value);
    setEscolasPage(1);
    setVinculosSelecionados({});
    setErrors(prev => ({ ...prev, filial_id: undefined }));
    if (!isViewMode) {
      markDirty();
    }
  };

  const handleTipoToggle = useCallback((escolaId, tipoValue) => {
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
    if (!isViewMode) {
      markDirty();
    }
  }, [isViewMode, markDirty]);

  const isTipoSelecionado = (escolaId, tipoValue) => {
    return vinculosSelecionados[escolaId]?.includes(tipoValue) || false;
  };

  const buscarTodasEscolasDaFilial = useCallback(async () => {
    if (!filialId) {
      return [];
    }

    try {
      let pagina = 1;
      const limite = 200;
      let todas = [];
      let continuar = true;

      while (continuar) {
        const response = await escolasService.listar(
          {
            filial_id: filialId,
            page: pagina,
            limit: limite
          },
          user
        );

        const dados = response?.data || [];
        todas = todas.concat(dados);

        if (dados.length < limite) {
          continuar = false;
        } else {
          pagina += 1;
        }
      }

      return todas;
    } catch (erro) {
      console.error('Erro ao buscar todas as escolas da filial:', erro);
      toast.error('Erro ao buscar instituições da filial selecionada');
      return [];
    }
  }, [filialId, user]);

  const confirmarAcaoMassa = useCallback((acao) => {
    if (isViewMode) {
      return;
    }

    if (acao === 'selecionar' && !filialId) {
      toast.error('Selecione uma filial para marcar as escolas');
      return;
    }

    setConfirmacao({ aberto: true, acao });
  }, [filialId, isViewMode]);

  const executarAcaoMassa = useCallback(async () => {
    if (confirmacao.acao === 'selecionar') {
      const todasEscolas = await buscarTodasEscolasDaFilial();

      if (!todasEscolas || todasEscolas.length === 0) {
        toast.error('Nenhuma escola encontrada para a filial selecionada');
        setConfirmacao({ aberto: false, acao: null });
        return;
      }

      const tiposDisponiveis = tiposAtendimento.map(tipo => tipo.value);

      setVinculosSelecionados(prev => {
        const novos = { ...prev };
        todasEscolas.forEach(escola => {
          novos[escola.id] = [...tiposDisponiveis];
        });
        return novos;
      });
      toast.success('Todos os tipos marcados para as escolas da filial selecionada.');
      markDirty();
    }

    if (confirmacao.acao === 'desmarcar') {
      setVinculosSelecionados({});
      toast.success('Todos os tipos foram desmarcados.');
      markDirty();
    }

    setConfirmacao({ aberto: false, acao: null });
  }, [confirmacao, buscarTodasEscolasDaFilial, tiposAtendimento, markDirty]);

  const fecharConfirmacao = useCallback(() => {
    setConfirmacao({ aberto: false, acao: null });
  }, []);

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

    if (!isEditing && totalVinculos === 0) {
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

    // Se estiver editando, atualizar tipos desta escola
    if (isEditing && editingItem) {
      await onSave({
        escola_id: editingItem.escola_id,
        tipos_atendimento: vinculosSelecionados[editingItem.escola_id] || [],
        ativo: statusAtivo
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
    resetDirty();
  };

  const handleBuscaEscola = (e) => {
    setBuscaEscola(e.target.value);
    setEscolasPage(1);
  };

  const handleBuscaEscolaSubmit = () => {
    if (!filialId) {
      toast.error('Selecione uma filial antes de buscar escolas');
      return;
    }

    carregarEscolas(filialId, 1, escolasItemsPerPage);
  };

  const handleItemsPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (Number.isNaN(value)) {
      return;
    }

    if (isEditing) {
      setEscolasItemsPerPage(value);
      return;
    }

    setEscolasItemsPerPage(value);
    setEscolasPage(1);
    if (filialId) {
      carregarEscolas(filialId, 1, value);
    }
  };

  const escolasExibidas = escolas;
  const inicioItem = escolasTotalItems === 0
    ? 0
    : (escolasPage - 1) * escolasItemsPerPage + 1;
  const fimItem = escolasTotalItems === 0
    ? 0
    : Math.min(escolasPage * escolasItemsPerPage, escolasTotalItems);
  const possuiEscolasListadas = filialId && escolasTotalItems > 0;

  const handleStatusChange = (e) => {
    setStatusAtivo(e.target.value === 'ativo');
  };

  // Modo edição: mostrar formulário simples
  const modalTitle = isEditing
    ? (isViewMode ? 'Visualizar Vínculo' : 'Editar Vínculo')
    : 'Vincular Tipos de Atendimento às Escolas';

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={() => requestClose(onClose)}
      title={modalTitle}
      size="full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Filial */}
        <div>
          <SearchableSelect
            label="Filial"
            value={filialId}
            onChange={handleFilialChange}
            options={filiais.map(filial => ({
              value: String(filial.id),
              label: filial.filial || filial.nome || `Filial ${filial.id}`
            }))}
            placeholder="Selecione uma filial..."
            disabled={loading || loadingFiliais || isViewMode || isEditing}
            required={!isEditing}
            error={errors.filial_id}
          />
        </div>

        {isEditing && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Filial</span>
              <p className="text-sm text-gray-900">
                {editingItem?.filial_nome || 'Não informada'}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Escola</span>
              <p className="text-sm text-gray-900">
                {editingItem?.nome_escola || `ID: ${editingItem?.escola_id}`}
              </p>
              <p className="text-xs text-gray-500">
                {[editingItem?.rota, editingItem?.cidade].filter(Boolean).join(' • ')}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
              {isViewMode ? (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  statusAtivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {statusAtivo ? 'Ativo' : 'Inativo'}
                </span>
              ) : (
                <select
                  value={statusAtivo ? 'ativo' : 'inativo'}
                  onChange={handleStatusChange}
                  disabled={loading}
                  className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    loading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              )}
            </div>
          </div>
        )}

        {/* Busca de Escola */}
        {!isEditing && filialId && (
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

        {!isEditing && filialId && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Itens por página</span>
              <select
                value={escolasItemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loadingEscolas}
              >
                {[10, 20, 30, 50].map(opcao => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 text-sm text-gray-600">
              {possuiEscolasListadas && (
                <span>
                  Exibindo {inicioItem}-{fimItem} de {escolasTotalItems}
                </span>
              )}
              {escolasTotalPages > 1 && (
                <Pagination
                  currentPage={escolasPage}
                  totalPages={escolasTotalPages}
                  totalItems={escolasTotalItems}
                  itemsPerPage={escolasItemsPerPage}
                  onPageChange={setEscolasPage}
                />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loadingEscolas || loading}
                  onClick={() => confirmarAcaoMassa('selecionar')}
                  className="text-xs"
                >
                  Marcar todos
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loadingEscolas || loading}
                  onClick={() => confirmarAcaoMassa('desmarcar')}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Desmarcar todos
                </Button>
              </div>
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
                    {tiposAtendimento
                      .slice()
                      .sort((a, b) => {
                        const ordem = [
                          'lanche_manha',
                          'parcial_manha',
                          'almoco',
                          'lanche_tarde',
                          'parcial_tarde',
                          'eja'
                        ];
                        const indexA = ordem.indexOf(a.value);
                        const indexB = ordem.indexOf(b.value);
                        const posA = indexA === -1 ? ordem.length : indexA;
                        const posB = indexB === -1 ? ordem.length : indexB;
                        return posA - posB;
                      })
                      .map(tipo => (
                      <th
                        key={tipo.value}
                        className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[120px]"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg mb-1">{tipo.icon}</span>
                          <span className="text-xs">
                            {tipo.label.replace(/[🌅🍽️🌆🥗🌙]/g, '').trim()}
                            {tipo.value === 'eja' ? ' (Noturno)' : ''}
                          </span>
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
                        {tiposAtendimento
                          .slice()
                          .sort((a, b) => {
                            const ordem = [
                              'lanche_manha',
                              'parcial_manha',
                              'almoco',
                              'lanche_tarde',
                              'parcial_tarde',
                              'eja'
                            ];
                            const indexA = ordem.indexOf(a.value);
                            const indexB = ordem.indexOf(b.value);
                            const posA = indexA === -1 ? ordem.length : indexA;
                            const posB = indexB === -1 ? ordem.length : indexB;
                            return posA - posB;
                          })
                          .map(tipo => (
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

        {/* Paginação e estatísticas */}
        {!isEditing && filialId && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Itens por página</span>
              <select
                value={escolasItemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loadingEscolas}
              >
                {[10, 20, 30, 50].map(opcao => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 text-sm text-gray-600">
              {possuiEscolasListadas && (
                <span>
                  Exibindo {inicioItem}-{fimItem} de {escolasTotalItems}
                </span>
              )}
              {escolasTotalPages > 1 && (
                <Pagination
                  currentPage={escolasPage}
                  totalPages={escolasTotalPages}
                  totalItems={escolasTotalItems}
                  itemsPerPage={escolasItemsPerPage}
                  onPageChange={setEscolasPage}
                />
              )}
            </div>
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
              onClick={() => requestClose(onClose)}
              variant="ghost"
              disabled={loading}
            >
              <FaTimes className="mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (!isEditing && loadingEscolas)}
            >
              <FaSave className="mr-2" />
              {loading
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Salvar Vínculos'}
            </Button>
          </div>
        )}
      </form>

      <ConfirmModal
        isOpen={confirmacao.aberto}
        onClose={fecharConfirmacao}
        onConfirm={executarAcaoMassa}
        title={confirmacao.acao === 'selecionar' ? 'Marcar todos os tipos?' : 'Desmarcar todos os tipos?'}
        message={confirmacao.acao === 'selecionar'
          ? 'Deseja marcar todos os tipos de atendimento para todas as escolas listadas?'
          : 'Deseja desmarcar todos os tipos de atendimento?'}
        confirmText={confirmacao.acao === 'selecionar' ? 'Marcar todos' : 'Desmarcar todos'}
        cancelText="Cancelar"
        variant={confirmacao.acao === 'desmarcar' ? 'danger' : 'primary'}
      />
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

export default TipoAtendimentoEscolaModal;
