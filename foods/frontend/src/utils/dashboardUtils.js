import { 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaLayerGroup, 
  FaChartLine, 
  FaUser,
  FaBuilding,
  FaRoute,
  FaRuler
} from 'react-icons/fa';

// Formatação de moeda
export const formatCurrency = (value) => {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatação de data
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Hoje';
  if (diffDays === 2) return 'Ontem';
  if (diffDays <= 7) return `${diffDays - 1} dias atrás`;
  
  return date.toLocaleDateString('pt-BR');
};

// Ícones por tipo de atividade
export const getActivityIcon = (tipo) => {
  const icons = {
    'produto': FaBox,
    'fornecedor': FaTruck,
    'cliente': FaUser,
    'grupo': FaLayerGroup,
    'usuario': FaUsers,
    'filial': FaBuilding,
    'rota': FaRoute,
    'unidade_escolar': FaRuler,
    'motorista': FaUser,
    'ajudante': FaUser,
    'veiculo': FaTruck
  };
  return icons[tipo] || FaChartLine;
};

// Cores por tipo de atividade
export const getActivityColor = (tipo) => {
  const colors = {
    'produto': 'bg-purple-500',
    'fornecedor': 'bg-green-500',
    'cliente': 'bg-blue-500',
    'grupo': 'bg-orange-500',
    'usuario': 'bg-indigo-500',
    'filial': 'bg-teal-500',
    'rota': 'bg-pink-500',
    'unidade_escolar': 'bg-red-500',
    'motorista': 'bg-yellow-500',
    'ajudante': 'bg-gray-500',
    'veiculo': 'bg-cyan-500'
  };
  return colors[tipo] || 'bg-gray-500';
};

// Cores por nível de alerta
export const getAlertaColor = (nivel) => {
  const colors = {
    'baixo': 'bg-yellow-100 text-yellow-800',
    'medio': 'bg-orange-100 text-orange-800',
    'alto': 'bg-red-100 text-red-800'
  };
  return colors[nivel] || 'bg-gray-100 text-gray-800';
};

// Preparar dados de estatísticas
export const prepareStatsData = (dashboardData) => ({
  totalUsuarios: dashboardData.usuarios || 0,
  totalVeiculos: dashboardData.veiculos || 0,
  totalProdutos: dashboardData.produtos || 0,
  totalGrupos: dashboardData.grupos || 0,
  totalFiliais: dashboardData.filiais || 0,
  totalRotas: dashboardData.rotas || 0,
  totalMotoristas: dashboardData.motoristas || 0,
  totalUnidadesEscolares: dashboardData.unidades_escolares || 0,
  totalFornecedores: dashboardData.fornecedores || 0,
  totalClientes: dashboardData.clientes || 0,
  totalSubgrupos: dashboardData.subgrupos || 0,
  totalClasses: dashboardData.classes || 0,
  totalMarcas: dashboardData.marcas || 0,
  totalUnidades: dashboardData.unidades || 0,
  totalAjudantes: dashboardData.ajudantes || 0,
  valorEstoque: dashboardData.valorEstoque || 0,
  produtosEstoqueBaixo: dashboardData.produtosEstoqueBaixo || 0,
  produtosSemEstoque: dashboardData.produtosSemEstoque || 0,
  produtosVencendo: dashboardData.produtosVencendo || 0,
  veiculosDocumentacaoVencendo: dashboardData.veiculosDocumentacaoVencendo || 0,
  motoristasCnhVencendo: dashboardData.motoristasCnhVencendo || 0
});
