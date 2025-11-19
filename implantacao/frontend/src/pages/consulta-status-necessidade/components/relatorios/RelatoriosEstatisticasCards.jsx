import React from 'react';
import { FaTable, FaSchool, FaBox, FaChartBar } from 'react-icons/fa';
import { StatCard } from '../../../../components/ui';

const RelatoriosEstatisticasCards = ({ estatisticas }) => {
  const formatarNumero = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatarQuantidade = (num) => {
    if (!num) return '0';
    const numFloat = parseFloat(num);
    if (Number.isInteger(numFloat)) {
      return numFloat.toLocaleString('pt-BR');
    }
    return numFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  };

  if (!estatisticas?.geral) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total de Necessidades"
        value={formatarNumero(estatisticas.geral.total_necessidades)}
        icon={FaTable}
        color="blue"
      />
      <StatCard
        title="Total de Escolas"
        value={formatarNumero(estatisticas.geral.total_escolas)}
        icon={FaSchool}
        color="green"
      />
      <StatCard
        title="Total de Produtos"
        value={formatarNumero(estatisticas.geral.total_produtos)}
        icon={FaBox}
        color="purple"
      />
      <StatCard
        title="Quantidade Total"
        value={formatarQuantidade(estatisticas.geral.total_quantidade)}
        icon={FaChartBar}
        color="orange"
      />
    </div>
  );
};

export default RelatoriosEstatisticasCards;

