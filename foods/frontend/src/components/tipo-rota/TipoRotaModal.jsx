import React from 'react';
import { useForm } from 'react-hook-form';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Button, Input, Modal, Table } from '../ui';

const TipoRotaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  tipoRota, 
  isViewMode = false,
  filiais = [],
  loadingFiliais = false,
  grupos = [],
  loadingGrupos = false,
  unidadesEscolares = [],
  loadingUnidades = false,
  showUnidades = false,
  totalUnidades = 0,
  onToggleUnidades,
  unidadesDisponiveis = [],
  loadingUnidadesDisponiveis = false,
  onFilialEGrupoChange,
  onSelecionarUnidades
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [unidadesSelecionadas, setUnidadesSelecionadas] = React.useState([]);
  const [buscaUnidades, setBuscaUnidades] = React.useState('');
  
  const filialId = watch('filial_id');
  const grupoId = watch('grupo_id');

  React.useEffect(() => {
    if (tipoRota && isOpen) {
      Object.keys(tipoRota).forEach(key => {
        if (tipoRota[key] !== null && tipoRota[key] !== undefined) {
          setValue(key, tipoRota[key]);
        }
      });
    } else if (!tipoRota && isOpen) {
      reset();
      setValue('status', 'ativo');
    }
  }, [tipoRota, isOpen, setValue, reset]);

  // Carregar unidades disponíveis quando filial ou grupo mudar
  React.useEffect(() => {
    if (filialId && grupoId && !isViewMode) {
      onFilialEGrupoChange && onFilialEGrupoChange(filialId, grupoId, tipoRota?.id);
    } else if (!filialId || !grupoId) {
      setUnidadesSelecionadas([]);
    }
    setBuscaUnidades('');
  }, [filialId, grupoId, isViewMode, tipoRota?.id]);

  // No modo de edição, marcar unidades já vinculadas como selecionadas
  React.useEffect(() => {
    if (tipoRota && isOpen && unidadesEscolares.length > 0) {
      setUnidadesSelecionadas(unidadesEscolares);
    } else if (!tipoRota && isOpen) {
      setUnidadesSelecionadas([]);
    }
  }, [tipoRota, isOpen, unidadesEscolares]);

  const handleFormSubmit = (data) => {
    const dataComUnidades = {
      ...data,
      unidades_selecionadas: unidadesSelecionadas
    };
    onSubmit(dataComUnidades);
  };

  const handleSelecionarUnidade = (unidade, isSelected) => {
    if (isSelected) {
      const proximaOrdem = unidadesSelecionadas.length + 1;
      setUnidadesSelecionadas(prev => [...prev, { ...unidade, ordem_entrega: proximaOrdem }]);
    } else {
      setUnidadesSelecionadas(prev => prev.filter(u => u.id !== unidade.id));
    }
  };

  const handleSelecionarTodas = () => {
    const novasSelecoes = unidadesFiltradas.filter(unidade => 
      !unidadesSelecionadas.some(selecionada => selecionada.id === unidade.id)
    );
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

  const getOpcoesOrdemDisponiveis = (unidadeAtualId) => {
    const totalEscolas = unidadesSelecionadas.length;
    const ordensUsadas = unidadesSelecionadas
      .filter(u => u.id !== unidadeAtualId && u.ordem_entrega > 0)
      .map(u => u.ordem_entrega);
    
    const opcoesDisponiveis = [];
    for (let i = 1; i <= totalEscolas; i++) {
      if (!ordensUsadas.includes(i)) {
        opcoesDisponiveis.push(i);
      }
    }
    return opcoesDisponiveis;
  };

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
      title={isViewMode ? 'Visualizar Tipo de Rota' : tipoRota ? 'Editar Tipo de Rota' : 'Adicionar Tipo de Rota'}
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
                label="Nome da Rota *"
                type="text"
                placeholder="Nome da rota"
                {...register('nome')}
                disabled={isViewMode}
              />

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
                label="Grupo *"
                type="select"
                {...register('grupo_id')}
                disabled={isViewMode || loadingGrupos}
              >
                <option value="">
                  {loadingGrupos ? 'Carregando grupos...' : 'Selecione um grupo'}
                </option>
                {grupos.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </Input>
            </div>
          </div>

          {/* Card 2: Configurações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Configurações
            </h3>
            <div className="space-y-3">
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
        {!isViewMode && filialId && grupoId && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
              <h3 className="text-sm font-semibold text-gray-700">
                {tipoRota ? 'Editar Unidades Escolares' : 'Selecionar Unidades Escolares'}
              </h3>
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDesselecionarTodas}
                  className="text-xs"
                  disabled={unidadesSelecionadas.length === 0}
                >
                  Desselecionar Todas
                </Button>
              </div>
            </div>
            
            {/* Campo de busca */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Buscar por nome, código, cidade ou endereço..."
                value={buscaUnidades}
                onChange={(e) => setBuscaUnidades(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
            
            {loadingUnidadesDisponiveis ? (
              <div className="text-center py-4">
                <div className="text-gray-500">Carregando unidades disponíveis...</div>
              </div>
            ) : unidadesFiltradas.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-500">
                  {buscaUnidades.trim() 
                    ? `Nenhuma unidade encontrada para "${buscaUnidades}"`
                    : 'Selecione uma filial e um grupo para ver as unidades disponíveis'
                  }
                </div>
                {buscaUnidades.trim() && (
                  <button
                    type="button"
                    onClick={() => setBuscaUnidades('')}
                    className="text-green-600 hover:text-green-700 text-sm mt-2"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Lado Esquerdo: 3 colunas de escolas disponíveis */}
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Escolas Disponíveis ({unidadesFiltradas.length})
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1">
                    {unidadesFiltradas.map((unidade) => {
                      const isSelected = unidadesSelecionadas.some(u => u.id === unidade.id);
                      return (
                        <div
                          key={unidade.id}
                          className={`flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-green-50 border-green-300'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelecionarUnidade(unidade, !isSelected)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelecionarUnidade(unidade, !isSelected)}
                            className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded flex-shrink-0"
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
                      );
                    })}
                  </div>
                </div>

                {/* Lado Direito: Escolas selecionadas com ordem */}
                <div className="w-80 flex-shrink-0">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Escolas Selecionadas ({unidadesSelecionadas.length}) - Ordem de Entrega
                  </div>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto p-1 bg-gray-50 rounded-lg border-2 border-green-200">
                    {unidadesSelecionadas.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Selecione escolas ao lado<br/>para definir ordem de entrega
                      </div>
                    ) : (
                      unidadesSelecionadas
                        .sort((a, b) => (a.ordem_entrega || 0) - (b.ordem_entrega || 0))
                        .map((unidade) => {
                          const opcoesDisponiveis = getOpcoesOrdemDisponiveis(unidade.id);
                          const ordemAtual = unidade.ordem_entrega || 0;
                          
                          return (
                            <div
                              key={unidade.id}
                              className="flex items-center gap-2 p-2 bg-white rounded border border-green-200"
                            >
                              <div className="flex-shrink-0 w-14">
                                <select
                                  value={ordemAtual}
                                  onChange={(e) => handleUpdateOrdem(unidade.id, e.target.value)}
                                  className="w-full px-1 py-1 text-sm text-center font-semibold border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                                >
                                  <option value="0">-</option>
                                  {ordemAtual > 0 && !opcoesDisponiveis.includes(ordemAtual) && (
                                    <option value={ordemAtual}>{ordemAtual}</option>
                                  )}
                                  {opcoesDisponiveis.map(num => (
                                    <option key={num} value={num}>{num}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-xs truncate" title={unidade.nome_escola}>
                                  {unidade.nome_escola}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {unidade.cidade}, {unidade.estado}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelecionarUnidade(unidade, false)}
                                className="flex-shrink-0 text-red-500 hover:text-red-700 p-1"
                                title="Remover"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seção de Unidades Escolares (apenas para visualização/edição) */}
        {tipoRota && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-green-500">
              <h3 className="text-sm font-semibold text-gray-700">
                Unidades Escolares do Tipo de Rota
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
                    Nenhuma unidade escolar associada a este tipo de rota
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
              {tipoRota ? 'Atualizar' : 'Criar'} Tipo de Rota
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TipoRotaModal;

