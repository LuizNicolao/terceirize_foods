import React from 'react';
import { FaUsers, FaTruck, FaBox, FaLayerGroup, FaBuilding, FaRoute, FaUser, FaRuler } from 'react-icons/fa';
import { StatCard } from '../../../components/ui';

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
          color="bg-blue-500"
        />
        
        <StatCard
          title="Fornecedores"
          value={statsData.totalFornecedores}
          subtitle="Fornecedores ativos"
          icon={FaTruck}
          color="bg-green-500"
        />
        
        <StatCard
          title="Clientes"
          value={statsData.totalClientes}
          subtitle="Clientes ativos"
          icon={FaUser}
          color="bg-purple-500"
        />
        
        <StatCard
          title="Produtos"
          value={statsData.totalProdutos}
          subtitle="Produtos cadastrados"
          icon={FaBox}
          color="bg-orange-500"
        />
      </div>

      {/* Cards de Estatísticas - Segunda Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Grupos"
          value={statsData.totalGrupos}
          subtitle="Grupos de produtos"
          icon={FaLayerGroup}
          color="bg-indigo-500"
        />
        
        <StatCard
          title="Subgrupos"
          value={statsData.totalSubgrupos}
          subtitle="Subgrupos ativos"
          icon={FaLayerGroup}
          color="bg-teal-500"
        />
        
        <StatCard
          title="Classes"
          value={statsData.totalClasses}
          subtitle="Classes ativas"
          icon={FaLayerGroup}
          color="bg-pink-500"
        />
        
        <StatCard
          title="Marcas"
          value={statsData.totalMarcas}
          subtitle="Marcas cadastradas"
          icon={FaBox}
          color="bg-red-500"
        />
      </div>

      {/* Cards de Estatísticas - Terceira Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Filiais"
          value={statsData.totalFiliais}
          subtitle="Filiais ativas"
          icon={FaBuilding}
          color="bg-cyan-500"
        />
        
        <StatCard
          title="Rotas"
          value={statsData.totalRotas}
          subtitle="Rotas configuradas"
          icon={FaRoute}
          color="bg-yellow-500"
        />
        
        <StatCard
          title="Motoristas"
          value={statsData.totalMotoristas}
          subtitle="Motoristas ativos"
          icon={FaUser}
          color="bg-gray-500"
        />
        
        <StatCard
          title="Ajudantes"
          value={statsData.totalAjudantes}
          subtitle="Ajudantes ativos"
          icon={FaUser}
          color="bg-lime-500"
        />
      </div>

      {/* Cards de Estatísticas - Quarta Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Veículos"
          value={statsData.totalVeiculos}
          subtitle="Veículos disponíveis"
          icon={FaTruck}
          color="bg-emerald-500"
        />
        
        <StatCard
          title="Unidades Escolares"
          value={statsData.totalUnidadesEscolares}
          subtitle="Unidades atendidas"
          icon={FaRuler}
          color="bg-violet-500"
        />
        
        <StatCard
          title="Unidades"
          value={statsData.totalUnidades}
          subtitle="Unidades de medida"
          icon={FaRuler}
          color="bg-amber-500"
        />
        
        <StatCard
          title="Nomes Genéricos"
          value={statsData.totalNomeGenerico}
          subtitle="Nomes genéricos"
          icon={FaBox}
          color="bg-slate-500"
        />
      </div>
    </>
  );
};
