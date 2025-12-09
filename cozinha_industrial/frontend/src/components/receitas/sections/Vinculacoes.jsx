import React from 'react';
import { SearchableSelect } from '../../ui';

/**
 * Seção de Vinculações da Receita (Filial e Centro de Custo)
 */
const Vinculacoes = ({
  formData,
  isViewMode,
  filiais,
  centrosCusto,
  tiposReceitas = [],
  loadingFiliais,
  loadingCentrosCusto,
  loadingTiposReceitas,
  onInputChange
}) => {

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Vinculações
      </h3>
      <div className="space-y-3">
        <div>
          <SearchableSelect
            label="Filial"
            value={formData.filial_id ? filiais.find(f => f.id === formData.filial_id)?.filial || filiais.find(f => f.id === formData.filial_id)?.nome || '' : ''}
            onChange={(value) => {
              const filialSelecionada = filiais.find(f => 
                (f.filial || f.nome || f.razao_social) === value
              );
              if (filialSelecionada) {
                onInputChange('filial_id', filialSelecionada.id);
                onInputChange('filial_nome', filialSelecionada.filial || filialSelecionada.nome || filialSelecionada.razao_social || '');
              } else {
                onInputChange('filial_id', null);
                onInputChange('filial_nome', '');
              }
            }}
            options={filiais.map(filial => ({
              value: filial.filial || filial.nome || filial.razao_social || '',
              label: filial.filial || filial.nome || filial.razao_social || '',
              description: filial.cidade ? `Cidade: ${filial.cidade}` : ''
            }))}
            placeholder="Digite para buscar uma filial..."
            disabled={isViewMode}
            loading={loadingFiliais}
            filterBy={(option, searchTerm) => {
              const label = option.label?.toLowerCase() || '';
              const description = option.description?.toLowerCase() || '';
              const term = searchTerm.toLowerCase();
              return label.includes(term) || description.includes(term);
            }}
            renderOption={(option) => (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                )}
              </div>
            )}
          />
        </div>
        <div>
          <SearchableSelect
            label="Centro de Custo"
            value={formData.centro_custo_id ? centrosCusto.find(c => c.id === formData.centro_custo_id)?.nome || '' : ''}
            onChange={(value) => {
              const centroSelecionado = centrosCusto.find(c => c.nome === value);
              if (centroSelecionado) {
                onInputChange('centro_custo_id', centroSelecionado.id);
                onInputChange('centro_custo_nome', centroSelecionado.nome || '');
              } else {
                onInputChange('centro_custo_id', null);
                onInputChange('centro_custo_nome', '');
              }
            }}
            options={centrosCusto.map(centro => ({
              value: centro.nome || '',
              label: centro.nome || '',
              description: centro.filial_nome ? `Filial: ${centro.filial_nome}` : ''
            }))}
            placeholder="Digite para buscar um centro de custo..."
            disabled={isViewMode}
            loading={loadingCentrosCusto}
            filterBy={(option, searchTerm) => {
              const label = option.label?.toLowerCase() || '';
              const description = option.description?.toLowerCase() || '';
              const term = searchTerm.toLowerCase();
              return label.includes(term) || description.includes(term);
            }}
            renderOption={(option) => (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                )}
              </div>
            )}
          />
        </div>
        <div>
          <SearchableSelect
            label="Tipo de Receita"
            value={formData.tipo_receita_id ? tiposReceitas.find(t => t.id === formData.tipo_receita_id)?.tipo_receita || formData.tipo_receita_nome || '' : ''}
            onChange={(value) => {
              const tipoSelecionado = tiposReceitas.find(t => t.tipo_receita === value);
              if (tipoSelecionado) {
                onInputChange('tipo_receita_id', tipoSelecionado.id);
                onInputChange('tipo_receita_nome', tipoSelecionado.tipo_receita || '');
              } else {
                onInputChange('tipo_receita_id', null);
                onInputChange('tipo_receita_nome', '');
              }
            }}
            options={tiposReceitas.map(tipo => ({
              value: tipo.tipo_receita || '',
              label: tipo.tipo_receita || '',
              description: tipo.descricao ? `Descrição: ${tipo.descricao}` : ''
            }))}
            placeholder="Digite para buscar um tipo de receita..."
            disabled={isViewMode}
            loading={loadingTiposReceitas}
            filterBy={(option, searchTerm) => {
              const label = option.label?.toLowerCase() || '';
              const description = option.description?.toLowerCase() || '';
              const term = searchTerm.toLowerCase();
              return label.includes(term) || description.includes(term);
            }}
            renderOption={(option) => (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                )}
              </div>
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status !== undefined ? formData.status : 1}
            onChange={(e) => onInputChange('status', parseInt(e.target.value))}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value={1}>Ativo</option>
            <option value={0}>Inativo</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Vinculacoes;

