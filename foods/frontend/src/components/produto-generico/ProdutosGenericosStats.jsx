import React from 'react';
import { FaBox, FaCheckCircle, FaTimesCircle, FaLink, FaStar, FaExchangeAlt } from 'react-icons/fa';
import { StatCard } from '../ui';

const ProdutosGenericosStats = ({ estatisticas }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <StatCard
        title="Total de Produtos Genéricos"
        value={estatisticas.total_produtos_genericos || 0}
        icon={FaBox}
        color="blue"
      />
      <StatCard
        title="Produtos Ativos"
        value={estatisticas.produtos_genericos_ativos || 0}
        icon={FaCheckCircle}
        color="green"
      />
      <StatCard
        title="Produtos Inativos"
        value={estatisticas.produtos_genericos_inativos || 0}
        icon={FaTimesCircle}
        color="red"
      />
      <StatCard
        title="Com Produtos Vinculados"
        value={estatisticas.total_produtos_vinculados || 0}
        icon={FaLink}
        color="purple"
      />
      <StatCard
        title="Produtos Padrão"
        value={estatisticas.produtos_padrao || 0}
        icon={FaStar}
        color="yellow"
      />
      <StatCard
        title="Com Produto Origem"
        value={estatisticas.com_produto_origem || 0}
        icon={FaExchangeAlt}
        color="orange"
      />
    </div>
  );
};

export default ProdutosGenericosStats;
