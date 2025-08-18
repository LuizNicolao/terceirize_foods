import React from 'react';
import { 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaLayerGroup, 
  FaUser,
  FaBuilding,
  FaRoute,
  FaRuler
} from 'react-icons/fa';
import { StatCard } from '../ui';

export const DashboardStats = ({ statsData }) => {
  return (
    <>
      {/* Cards de Estatísticas - Primeira Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Usuários"
          value={statsData.totalUsuarios}
          subtitle="Total de usuários ativos"
          icon={FaUsers}
          color="blue"
        />
        
        <StatCard
          title="Fornecedores"
          value={statsData.totalFornecedores}
          subtitle="Fornecedores ativos"
          icon={FaTruck}
          color="green"
        />
        
        <StatCard
          title="Clientes"
          value={statsData.totalClientes}
          subtitle="Clientes ativos"
          icon={FaUser}
          color="purple"
        />
        
        <StatCard
          title="Produtos"
          value={statsData.totalProdutos}
          subtitle="Produtos cadastrados"
          icon={FaBox}
          color="orange"
        />
      </div>

      {/* Cards de Estatísticas - Segunda Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Grupos"
          value={statsData.totalGrupos}
          subtitle="Grupos de produtos"
          icon={FaLayerGroup}
          color="indigo"
        />
        
        <StatCard
          title="Subgrupos"
          value={statsData.totalSubgrupos}
          subtitle="Subgrupos ativos"
          icon={FaLayerGroup}
          color="teal"
        />
        
        <StatCard
          title="Classes"
          value={statsData.totalClasses}
          subtitle="Classes ativas"
          icon={FaLayerGroup}
          color="pink"
        />
        
        <StatCard
          title="Marcas"
          value={statsData.totalMarcas}
          subtitle="Marcas cadastradas"
          icon={FaBox}
          color="red"
        />
      </div>

      {/* Cards de Estatísticas - Terceira Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Filiais"
          value={statsData.totalFiliais}
          subtitle="Filiais ativas"
          icon={FaBuilding}
          color="cyan"
        />
        
        <StatCard
          title="Rotas"
          value={statsData.totalRotas}
          subtitle="Rotas configuradas"
          icon={FaRoute}
          color="yellow"
        />
        
        <StatCard
          title="Motoristas"
          value={statsData.totalMotoristas}
          subtitle="Motoristas ativos"
          icon={FaUser}
          color="gray"
        />
        
        <StatCard
          title="Ajudantes"
          value={statsData.totalAjudantes}
          subtitle="Ajudantes ativos"
          icon={FaUser}
          color="lime"
        />
      </div>

      {/* Cards de Estatísticas - Quarta Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Veículos"
          value={statsData.totalVeiculos}
          subtitle="Veículos disponíveis"
          icon={FaTruck}
          color="emerald"
        />
        
        <StatCard
          title="Unidades Escolares"
          value={statsData.totalUnidadesEscolares}
          subtitle="Unidades atendidas"
          icon={FaRuler}
          color="violet"
        />
        
        <StatCard
          title="Unidades"
          value={statsData.totalUnidades}
          subtitle="Unidades de medida"
          icon={FaRuler}
          color="amber"
        />
        
        <StatCard
          title="Nomes Genéricos"
          value={statsData.totalNomeGenerico || 0}
          subtitle="Nomes genéricos"
          icon={FaBox}
          color="slate"
        />
      </div>
    </>
  );
};
