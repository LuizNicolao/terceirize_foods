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
  }, [filialId, isViewMode, onFilialChange]);

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
      setUnidadesSelecionadas(prev => [...prev, unidade]);
    } else {
      setUnidadesSelecionadas(prev => prev.filter(u => u.id !== unidade.id));
    }
  };

  const handleSelecionarTodas = () => {
    // Selecionar todas as unidades filtradas que ainda não estão selecionadas
    const novasSelecoes = unidadesFiltradas.filter(unidade => 
      !unidadesSelecionadas.some(selecionada => selecionada.id === unidade.id)
    );
    setUnidadesSelecionadas(prev => [...prev, ...novasSelecoes]);
  };

  const handleDesselecionarTodas = () => {
    setUnidadesSelecionadas([]);
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
                    : 'Nenhuma unidade escolar disponível para esta filial'
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
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {unidadesFiltradas.map((unidade) => {
                  const isSelected = unidadesSelecionadas.some(u => u.id === unidade.id);
                  return (
                    <div
                      key={unidade.id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelecionarUnidade(unidade, !isSelected)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelecionarUnidade(unidade, !isSelected)}
                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {unidade.nome_escola}
                        </div>
                        <div className="text-sm text-gray-500">
                          {unidade.codigo_teknisa} • {unidade.cidade}, {unidade.estado}
                        </div>
                        {unidade.endereco && (
                          <div className="text-xs text-gray-400">
                            {unidade.endereco}{unidade.numero ? `, ${unidade.numero}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {unidadesSelecionadas.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{unidadesSelecionadas.length}</span> unidade(s) selecionada(s)
                </div>
              </div>
            )}
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
