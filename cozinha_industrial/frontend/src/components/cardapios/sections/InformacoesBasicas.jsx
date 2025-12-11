import React from 'react';
import { Input } from '../../ui';

/**
 * Seção de Informações Básicas do Cardápio
 */
const InformacoesBasicas = ({
  nome,
  mesReferencia,
  anoReferencia,
  numeroSemanas,
  status,
  isViewMode,
  errors,
  onNomeChange,
  onMesReferenciaChange,
  onAnoReferenciaChange,
  onNumeroSemanasChange,
  onStatusChange
}) => {
  const meses = [
    { value: '', label: 'Selecione o mês' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const anos = [];
  const anoAtual = new Date().getFullYear();
  for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
    anos.push(i);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Cardápio <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={nome}
          onChange={(e) => onNomeChange(e.target.value.toUpperCase())}
          placeholder="Digite o nome do cardápio"
          disabled={isViewMode}
          required
          error={errors.nome}
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mês de Referência <span className="text-red-500">*</span>
        </label>
        <select
          value={mesReferencia}
          onChange={(e) => onMesReferenciaChange(e.target.value)}
          disabled={isViewMode}
          required
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
            errors.mes_referencia ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {meses.map((mes) => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>
        {errors.mes_referencia && (
          <p className="mt-1 text-sm text-red-600">{errors.mes_referencia}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ano de Referência <span className="text-red-500">*</span>
        </label>
        <select
          value={anoReferencia}
          onChange={(e) => onAnoReferenciaChange(e.target.value)}
          disabled={isViewMode}
          required
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
            errors.ano_referencia ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Selecione o ano</option>
          {anos.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
        {errors.ano_referencia && (
          <p className="mt-1 text-sm text-red-600">{errors.ano_referencia}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de Semanas <span className="text-red-500">*</span>
        </label>
        <select
          value={numeroSemanas}
          onChange={(e) => onNumeroSemanasChange(e.target.value)}
          disabled={isViewMode}
          required
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
            errors.numero_semanas ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="1">1 semana</option>
          <option value="2">2 semanas</option>
          <option value="3">3 semanas</option>
          <option value="4">4 semanas</option>
          <option value="5">5 semanas</option>
        </select>
        {errors.numero_semanas && (
          <p className="mt-1 text-sm text-red-600">{errors.numero_semanas}</p>
        )}
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
    </div>
  );
};

export default InformacoesBasicas;

