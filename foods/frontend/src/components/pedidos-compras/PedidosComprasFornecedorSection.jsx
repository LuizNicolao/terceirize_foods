import React from 'react';
import { SearchableSelect } from '../ui';

const PedidosComprasFornecedorSection = ({
  register,
  errors,
  watch,
  setValue,
  fornecedores,
  loadingFornecedores,
  fornecedorSearchTerm,
  setFornecedorSearchTerm,
  setFornecedores,
  isViewMode
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fornecedor</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fornecedor
          </label>
          <SearchableSelect
            options={fornecedores.map(f => ({
              value: f.id.toString(),
              label: `${f.razao_social || f.nome || 'Fornecedor'} ${f.cnpj ? `- ${f.cnpj}` : ''}`
            }))}
            value={watch('fornecedor_id')?.toString() || ''}
            onChange={(value) => {
              setValue('fornecedor_id', value ? parseInt(value) : null);
              if (!value) {
                // Limpar campos ao deselecionar
                setValue('fornecedor_nome', '');
                setValue('fornecedor_cnpj', '');
                setFornecedorSearchTerm('');
                setFornecedores([]);
              }
            }}
            onSearchChange={(searchTerm) => {
              setFornecedorSearchTerm(searchTerm);
            }}
            disabled={isViewMode}
            loading={loadingFornecedores}
            placeholder="Digite para buscar fornecedor (mín. 2 caracteres)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Fornecedor <span className="text-red-500">*</span>
          </label>
          <input
            {...register('fornecedor_nome', {
              required: 'O nome do fornecedor é obrigatório'
            })}
            disabled={true}
            readOnly
            placeholder="Preenchido automaticamente"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
          />
          {errors.fornecedor_nome && (
            <p className="mt-1 text-sm text-red-600">{errors.fornecedor_nome.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CNPJ do Fornecedor
          </label>
          <input
            {...register('fornecedor_cnpj')}
            disabled={true}
            readOnly
            placeholder="Preenchido automaticamente"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

export default PedidosComprasFornecedorSection;

