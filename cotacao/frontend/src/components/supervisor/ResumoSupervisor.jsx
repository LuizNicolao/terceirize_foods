import React from 'react';
import { FaChartPie } from 'react-icons/fa';
import { Card } from '../../design-system/components';

const ResumoSupervisor = ({ estatisticas, formatarValor }) => {
  return (
    <Card className="p-6 mb-6">
      <h4 className="text-gray-800 text-lg font-semibold mb-5 flex items-center gap-2">
        <FaChartPie />
        Resumo do Orçamento
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="text-center p-5 rounded-lg bg-white border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {estatisticas?.totalProdutos || 0}
          </div>
          <div className="text-sm text-gray-500 font-medium">Produtos</div>
        </div>
        <div className="text-center p-5 rounded-lg bg-white border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {estatisticas?.totalFornecedores || 0}
          </div>
          <div className="text-sm text-gray-500 font-medium">Fornecedores</div>
        </div>
        <div className="text-center p-5 rounded-lg bg-white border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {(estatisticas?.totalQuantidade || 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 font-medium">Quantidade Total</div>
        </div>
        <div className="text-center p-5 rounded-lg bg-white border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatarValor(estatisticas?.valorTotal)}
          </div>
          <div className="text-sm text-gray-500 font-medium">Valor Total</div>
        </div>
      </div>
    </Card>
  );
};

export default ResumoSupervisor;
