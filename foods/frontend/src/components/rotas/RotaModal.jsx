import React from 'react';
import { useForm } from 'react-hook-form';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Button, Input, Modal, Table } from '../ui';

const RotaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  rota, 
  isViewMode = false,
  filiais = [],
  loadingFiliais = false,
  unidadesEscolares = [],
  loadingUnidades = false,
  showUnidades = false,
  totalUnidades = 0,
  onToggleUnidades,
  unidadesDisponiveis = [],
  loadingUnidadesDisponiveis = false,
  onFilialChange,
  onSelecionarUnidades
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [unidadesSelecionadas, setUnidadesSelecionadas] = React.useState([]);
  const [buscaUnidades, setBuscaUnidades] = React.useState('');
  
  const filialId = watch('filial_id');

  React.useEffect(() => {
    if (rota && isOpen) {
      // Preencher formulário com dados da rota
      Object.keys(rota).forEach(key => {
        if (rota[key] !== null && rota[key] !== undefined) {
          setValue(key, rota[key]);
        }
      });
    } else if (!rota && isOpen) {
      // Resetar formulário para nova rota
      reset();
      setValue('status', 'ativo');
      setValue('tipo_rota', 'semanal');
    }
  }, [rota, isOpen, setValue, reset]);

  // Carregar unidades disponíveis quando a filial mudar
  React.useEffect(() => {
    if (filialId && !isViewMode) {
      onFilialChange && onFilialChange(filialId);
    } else if (!filialId) {
      setUnidadesSelecionadas([]);
    }
    // Limpar busca quando filial mudar
    setBuscaUnidades('');
  }, [filialId, isViewMode]);

  // No modo de edição, marcar unidades já vinculadas como selecionadas
  React.useEffect(() => {
    if (rota && isOpen && unidadesEscolares.length > 0) {
      setUnidadesSelecionadas(unidadesEscolares);
    } else if (!rota && isOpen) {
      setUnidadesSelecionadas([]);
    }
  }, [rota, isOpen, unidadesEscolares]);

  const handleFormSubmit = (data) => {
    // Incluir unidades selecionadas nos dados
    const dataComUnidades = {
      ...data,
      unidades_selecionadas: unidadesSelecionadas
    };
    onSubmit(dataComUnidades);
  };

  const handleSelecionarUnidade = (unidade, isSelected) => {
    if (isSelected) {
      // Adicionar unidade com ordem_entrega padrão (próximo número disponível)
      const proximaOrdem = unidadesSelecionadas.length + 1;
      setUnidadesSelecionadas(prev => [...prev, { ...unidade, ordem_entrega: proximaOrdem }]);
    } else {
      setUnidadesSelecionadas(prev => prev.filter(u => u.id !== unidade.id));
    }
  };

  const handleSelecionarTodas = () => {
    // Selecionar todas as unidades filtradas que ainda não estão selecionadas
    const novasSelecoes = unidadesFiltradas.filter(unidade => 
      !unidadesSelecionadas.some(selecionada => selecionada.id === unidade.id)
    );
    // Adicionar ordem_entrega automática para cada nova seleção
    const comOrdem = novasSelecoes.map((unidade, index) => ({
      ...unidade,
      ordem_entrega: unidadesSelecionadas.length + index + 1
    }));
    setUnidadesSelecionadas(prev => [...prev, ...comOrdem]);
  };

  const handleDesselecionarTodas = () => {
    setUnidadesSelecionadas([]);
  };

  const handleUpdateOrdem = (unidadeId, novaOrdem) => {
    setUnidadesSelecionadas(prev => 
      prev.map(u => u.id === unidadeId ? { ...u, ordem_entrega: Number(novaOrdem) || 0 } : u)
    );
  };

  // Filtrar unidades baseado na busca
  const unidadesFiltradas = React.useMemo(() => {
    if (!buscaUnidades.trim()) {
      return unidadesDisponiveis;
    }

    const termoBusca = buscaUnidades.toLowerCase().trim();
    return unidadesDisponiveis.filter(unidade => 
      unidade.nome_escola?.toLowerCase().includes(termoBusca) ||
      unidade.codigo_teknisa?.toLowerCase().includes(termoBusca) ||
      unidade.cidade?.toLowerCase().includes(termoBusca) ||
      unidade.estado?.toLowerCase().includes(termoBusca) ||
      unidade.endereco?.toLowerCase().includes(termoBusca)
    );
  }, [unidadesDisponiveis, buscaUnidades]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Rota' : rota ? 'Editar Rota' : 'Adicionar Rota'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              <Input
                label="Filial *"
                type="select"
                {...register('filial_id')}
                disabled={isViewMode || loadingFiliais}
              >
                <option value="">
                  {loadingFiliais ? 'Carregando filiais...' : 'Selecione uma filial'}
                </option>
                {filiais.map(filial => (
                  <option key={filial.id} value={filial.id}>
                    {filial.filial}
                  </option>
                ))}
              </Input>

              <Input
                label="Código *"
                type="text"
                placeholder="Código da rota"
                {...register('codigo')}
                disabled={isViewMode}
              />

              <Input
                label="Nome *"
                type="text"
                placeholder="Nome da rota"
                {...register('nome')}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Configurações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Configurações
            </h3>
            <div className="space-y-3">
              <Input
                label="Tipo de Rota *"
                type="select"
                {...register('tipo_rota')}
                disabled={isViewMode}
              >
                <option value="">Selecione o tipo</option>
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="mensal">Mensal</option>
                <option value="transferencia">Transferência</option>
              </Input>

              <Input
                label="Status"
                type="select"
                {...register('status')}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Input>
            </div>
          </div>
        </div>


        {/* Seção de Seleção de Unidades Escolares (para criação e edição) */}
        {!isViewMode && filialId && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
              <h3 className="text-sm font-semibold text-gray-700">
                {rota ? 'Editar Unidades Escolares' : 'Selecionar Unidades Escolares'}
              </h3>
            </div>
            
            <div className="grid grid-cols-4 gap-4 h-96">
              {/* LADO ESQUERDO: 3 colunas de escolas disponíveis */}
              <div className="col-span-3 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">Escolas Disponíveis</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSelecionarTodas}
                      className="text-xs"
                      disabled={loadingUnidadesDisponiveis || unidadesFiltradas.length === 0}
                    >
                      Selecionar Todas
                    </Button>
                  </div>
                </div>

                {/* Campo de busca */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Buscar por nome, código, cidade..."
                    value={buscaUnidades}
                    onChange={(e) => setBuscaUnidades(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Grid de 3 colunas com scroll único */}
                {loadingUnidadesDisponiveis ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="text-gray-500 text-sm">Carregando unidades...</div>
                  </div>
                ) : unidadesFiltradas.length === 0 ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                      <div className="text-gray-500 text-sm">
                        {buscaUnidades.trim() 
                          ? `Nenhuma unidade encontrada`
                          : 'Nenhuma unidade disponível'}
                      </div>
                      {buscaUnidades.trim() && (
                        <button
                          type="button"
                          onClick={() => setBuscaUnidades('')}
                          className="text-green-600 hover:text-green-700 text-xs mt-2"
                        >
                          Limpar busca
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1">
                    <div className="grid grid-cols-3 gap-2">
                      {unidadesFiltradas.map((unidade) => {
                        const isSelected = unidadesSelecionadas.some(u => u.id === unidade.id);
                        return (
                          <div
                            key={unidade.id}
                            className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-green-50 border-green-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => handleSelecionarUnidade(unidade, !isSelected)}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelecionarUnidade(unidade, !isSelected)}
                                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-xs truncate" title={unidade.nome_escola}>
                                  {unidade.nome_escola}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {unidade.cidade}, {unidade.estado}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* LADO DIREITO: 1 coluna de escolas selecionadas com ordem */}
              <div className="col-span-1 flex flex-col border-l border-gray-300 pl-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Selecionadas ({unidadesSelecionadas.length})
                  </span>
                  {unidadesSelecionadas.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDesselecionarTodas}
                      className="text-xs"
                    >
                      Limpar
                    </Button>
                  )}
                </div>

                {unidadesSelecionadas.length === 0 ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="text-center text-xs text-gray-400">
                      Nenhuma escola<br/>selecionada
                    </div>
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1 space-y-2">
                    {unidadesSelecionadas
                      .sort((a, b) => (a.ordem_entrega || 0) - (b.ordem_entrega || 0))
                      .map((unidade) => (
                      <div
                        key={unidade.id}
                        className="p-2 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <input
                            type="number"
                            value={unidade.ordem_entrega || 0}
                            onChange={(e) => handleUpdateOrdem(unidade.id, e.target.value)}
                            min="0"
                            className="w-12 px-1 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="#"
                            title="Ordem de entrega"
                          />
                          <button
                            type="button"
                            onClick={() => handleSelecionarUnidade(unidade, false)}
                            className="text-red-500 hover:text-red-700 text-xs flex-shrink-0"
                            title="Remover"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="text-xs font-medium text-gray-900 truncate" title={unidade.nome_escola}>
                          {unidade.nome_escola}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {unidade.cidade}, {unidade.estado}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seção de Unidades Escolares (apenas para visualização/edição) */}
        {rota && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
              <h3 className="text-sm font-semibold text-gray-700">
                Unidades Escolares da Rota
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggleUnidades}
                className="text-xs"
              >
                {showUnidades ? (
                  <>
                    <FaChevronUp className="mr-1" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <FaChevronDown className="mr-1" />
                    Mostrar ({totalUnidades})
                  </>
                )}
              </Button>
            </div>
            
            {showUnidades && (
              <div className="mt-4">
                {loadingUnidades ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Carregando unidades...</p>
                  </div>
                ) : unidadesEscolares.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Endereço</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {unidadesEscolares.map((unidade) => (
                          <tr key={unidade.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{unidade.id}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                              {unidade.nome_escola || unidade.codigo_teknisa || 'Nome não informado'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {unidade.endereco ? 
                                `${unidade.endereco}, ${unidade.cidade}/${unidade.estado}` : 
                                `${unidade.cidade}/${unidade.estado}`
                              }
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                unidade.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhuma unidade escolar associada a esta rota
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isViewMode}
          >
            Cancelar
          </Button>
          {!isViewMode && (
            <Button type="submit">
              {rota ? 'Atualizar' : 'Criar'} Rota
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default RotaModal;
