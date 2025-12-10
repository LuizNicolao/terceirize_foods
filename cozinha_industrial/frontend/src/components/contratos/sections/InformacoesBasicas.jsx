import React from 'react';
import { Input, SearchableSelect } from '../../ui';

/**
 * Seção de Informações Básicas do Contrato
 */
const InformacoesBasicas = ({
  nome,
  clienteId,
  filialId,
  centroCustoId,
  status,
  clientes,
  filiais,
  centrosCusto,
  loadingClientes,
  loadingFiliais,
  loadingCentrosCusto,
  isViewMode,
  errors,
  onNomeChange,
  onClienteChange,
  onFilialChange,
  onCentroCustoChange,
  onStatusChange
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Contrato <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value.toUpperCase())}
            placeholder="Digite o nome do contrato"
            disabled={isViewMode}
            required
            error={errors.nome}
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={clienteId}
            onChange={onClienteChange}
            options={clientes.map(c => ({
              value: String(c.id),
              label: c.razao_social || c.nome_fantasia || `Cliente ${c.id}`
            }))}
            placeholder="Selecione um cliente..."
            disabled={loadingClientes || isViewMode}
            required
            error={errors.clienteId}
            usePortal={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filial <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={filialId}
            onChange={onFilialChange}
            options={filiais.map(f => ({
              value: String(f.id),
              label: f.filial || f.nome || `Filial ${f.id}`
            }))}
            placeholder="Selecione uma filial..."
            disabled={loadingFiliais || isViewMode}
            required
            error={errors.filialId}
            usePortal={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Centro de Custo <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={centroCustoId}
            onChange={onCentroCustoChange}
            options={centrosCusto.map(cc => ({
              value: String(cc.id),
              label: cc.nome || `Centro de Custo ${cc.id}`
            }))}
            placeholder={filialId ? "Selecione um centro de custo..." : "Selecione uma filial primeiro"}
            disabled={loadingCentrosCusto || !filialId || isViewMode}
            required
            error={errors.centroCustoId}
            usePortal={false}
          />
        </div>
      </div>
    </div>
  );
};

export default InformacoesBasicas;

