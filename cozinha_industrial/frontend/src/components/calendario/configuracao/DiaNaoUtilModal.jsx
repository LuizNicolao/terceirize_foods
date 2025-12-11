import React from 'react';
import { FaSave } from 'react-icons/fa';
import { Button, Input, Modal, SearchableSelect } from '../../ui';

const DiaNaoUtilModal = ({
  isOpen,
  onClose,
  isEditando,
  formData,
  onFormChange,
  onTipoDestinoChange,
  onFilialChange,
  onToggleUnidade,
  onSelecionarTodasUnidades,
  onLimparSelecaoUnidades,
  buscaUnidadesTermo,
  onBuscaUnidadesChange,
  filiaisOptions,
  unidadesEscolares,
  unidadesFiltradas,
  loading,
  loadingListas,
  onSalvar
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditando ? "Editar Dia Não Útil Personalizado" : "Adicionar Dia Não Útil Personalizado"}
      size="6xl"
    >
      <div className="space-y-4">
        <Input
          label="Data"
          type="date"
          value={formData.data}
          onChange={(e) => onFormChange({ ...formData, data: e.target.value })}
          required
        />

        <Input
          label="Descrição"
          value={formData.descricao}
          onChange={(e) => onFormChange({ ...formData, descricao: e.target.value })}
          placeholder="Ex: Recesso municipal, Atividade interna..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aplicar para</label>
          <select
            value={formData.tipo_destino}
            onChange={(e) => onTipoDestinoChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
          >
            <option value="global">Todos (Global)</option>
            <option value="filial">Filial / Cidade</option>
            <option value="unidade">Unidade Escolar</option>
          </select>
        </div>

        {formData.tipo_destino === 'filial' && (
          <SearchableSelect
            label="Filial"
            value={formData.filial_id}
            onChange={onFilialChange}
            options={filiaisOptions}
            placeholder="Selecione uma filial..."
            loading={loadingListas}
            usePortal={false}
          />
        )}

        {formData.tipo_destino === 'unidade' && (
          <div className="space-y-4">
            <SearchableSelect
              label="Filtrar por Filial"
              value={formData.filial_id}
              onChange={onFilialChange}
              options={filiaisOptions}
              placeholder="Selecione a filial responsável..."
              loading={loadingListas}
              usePortal={false}
            />

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
              <Input
                label="Buscar unidades escolares"
                value={buscaUnidadesTermo}
                onChange={(e) => onBuscaUnidadesChange(e.target.value)}
                placeholder="Digite para buscar por nome, cidade ou código..."
                disabled={!formData.filial_id}
              />

              <h4 className="text-sm font-semibold text-gray-700">
                Unidades Escolares {formData.filial_id ? 'da filial selecionada' : '(selecione uma filial)'}
              </h4>

              {formData.filial_id ? (
                unidadesFiltradas.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Nenhuma unidade escolar encontrada para esta filial.
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSelecionarTodasUnidades(unidadesFiltradas)}
                      >
                        Selecionar todas
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onLimparSelecaoUnidades}
                      >
                        Limpar seleção
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {unidadesFiltradas.map((unidade) => (
                        <label
                          key={unidade.id}
                          className="flex items-start space-x-2 bg-white rounded-lg border border-gray-200 px-3 py-2 hover:border-green-400 transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            checked={formData.unidades_escola_ids?.includes(unidade.id) || false}
                            onChange={() => onToggleUnidade(unidade.id)}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{unidade.nome_escola}</div>
                            {(unidade.cidade || unidade.estado || unidade.codigo_teknisa) && (
                              <div className="text-xs text-gray-500 space-x-1">
                                {unidade.cidade && <span>{unidade.cidade}</span>}
                                {unidade.estado && <span>- {unidade.estado}</span>}
                                {unidade.codigo_teknisa && (
                                  <span className="inline-block text-gray-400">
                                    Código: {unidade.codigo_teknisa}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                )
              ) : (
                <div className="text-sm text-gray-500">
                  Selecione uma filial para listar as unidades disponíveis.
                </div>
              )}
            </div>
          </div>
        )}

        <Input
          label="Observações"
          value={formData.observacoes}
          onChange={(e) => onFormChange({ ...formData, observacoes: e.target.value })}
          placeholder="Observações adicionais..."
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSalvar}
            variant="primary"
            disabled={loading}
          >
            <FaSave className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DiaNaoUtilModal;

