/**
 * Arquivo centralizado de rotas
 * Organiza todas as rotas da aplicação para facilitar a aplicação de prefixos
 */

// Importar todas as rotas
// const authRoutes = require('./auth/authRoute'); // DESABILITADO - Autenticação centralizada no Foods
const usuariosRoutes = require('./usuarios');
const cotacoesRoutes = require('./cotacoes/index');
const dashboardRoutes = require('./dashboard/dashboardRoute');
const { savingRoute } = require('./saving');
const permissoesRoutes = require('./permissoes');
const { supervisorRoute } = require('./supervisor');
const { aprovacoesRoute } = require('./aprovacoes');
const auditoriaRoutes = require('./auditoria');

// Debug: verificar se as rotas foram importadas (comentado para limpeza)
// console.log('📦 Rotas importadas:');
// console.log('  authRoutes:', !!authRoutes);
// console.log('  usuariosRoutes:', !!usuariosRoutes);
// console.log('  cotacoesRoutes:', !!cotacoesRoutes);
// console.log('  dashboardRoutes:', !!dashboardRoutes);
// console.log('  savingRoute:', !!savingRoute);
// console.log('  permissoesRoutes:', !!permissoesRoutes);
// console.log('  supervisorRoute:', !!supervisorRoute);
// console.log('  aprovacoesRoute:', !!aprovacoesRoute);

// Definir todas as rotas com seus caminhos
const routes = [
  // { path: '/auth', router: authRoutes }, // DESABILITADO - Autenticação centralizada no Foods
  { path: '/users', router: usuariosRoutes },
  { path: '/cotacoes', router: cotacoesRoutes },
  { path: '/dashboard', router: dashboardRoutes },
  { path: '/saving', router: savingRoute },
  { path: '/permissoes', router: permissoesRoutes },
  { path: '/supervisor', router: supervisorRoute },
  { path: '/aprovacoes', router: aprovacoesRoute },
  { path: '/auditoria', router: auditoriaRoutes }
];

module.exports = routes;
