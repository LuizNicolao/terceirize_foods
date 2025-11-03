/**
 * Arquivo centralizado de rotas
 * Organiza todas as rotas da aplicação para facilitar a aplicação de prefixos
 */

// Importar todas as rotas
const authRoutes = require('./auth');
const usuariosRoutes = require('./usuarios');
const fornecedoresRoutes = require('./fornecedores');
const clientesRoutes = require('./clientes');
const filiaisRoutes = require('./filiais');
const rotasRoutes = require('./rotas');
const tipoRotaRoutes = require('./tipo-rota');
const unidadesEscolaresRoutes = require('./unidades_escolares');
const produtosRoutes = require('./produtos');
const gruposRoutes = require('./grupos');
const subgruposRoutes = require('./subgrupos');
const unidadesRoutes = require('./unidades');
const marcasRoutes = require('./marcas');
const classesRoutes = require('./classes');
const permissoesRoutes = require('./permissoes');
const dashboardRoutes = require('./dashboard');
const auditoriaRoutes = require('./auditoria');
const veiculosRoutes = require('./veiculos');
const motoristasRoutes = require('./motoristas');
const ajudantesRoutes = require('./ajudantes');
const produtoOrigemRoutes = require('./produto-origem');
const produtoGenericoRoutes = require('./produto-generico');
const intoleranciasRoutes = require('./intolerancias');
const rotasNutricionistasRoutes = require('./rotas-nutricionistas');
const tiposCardapioRoutes = require('./tipos-cardapio');
const periodosRefeicaoRoutes = require('./periodos-refeicao');
const efetivosRoutes = require('./efetivos');
const patrimoniosRoutes = require('./patrimonios');
const periodicidadeRoutes = require('./periodicidade');
const faturamentoRoutes = require('./faturamento');
const receitasRoutes = require('./receitas');
const necessidadesMerendaRoutes = require('./necessidades-merenda');
const planoAmostragemRoutes = require('./plano-amostragem/planoAmostragemRoute');
const relatorioInspecaoRoutes = require('./relatorio-inspecao/relatorioInspecaoRoute');
const openaiRoutes = require('./openai/openaiRoute');
const cepRoutes = require('./shared/cepRoute');

// Definir todas as rotas com seus caminhos
const routes = [
  { path: '/auth', router: authRoutes },
  { path: '/usuarios', router: usuariosRoutes },
  { path: '/fornecedores', router: fornecedoresRoutes },
  { path: '/clientes', router: clientesRoutes },
  { path: '/filiais', router: filiaisRoutes },
  { path: '/rotas', router: rotasRoutes },
  { path: '/tipo-rota', router: tipoRotaRoutes },
  { path: '/unidades-escolares', router: unidadesEscolaresRoutes },
  { path: '/produtos', router: produtosRoutes },
  { path: '/grupos', router: gruposRoutes },
  { path: '/subgrupos', router: subgruposRoutes },
  { path: '/unidades', router: unidadesRoutes },
  { path: '/marcas', router: marcasRoutes },
  { path: '/classes', router: classesRoutes },
  { path: '/intolerancias', router: intoleranciasRoutes },
  { path: '/rotas-nutricionistas', router: rotasNutricionistasRoutes },
  { path: '/tipos-cardapio', router: tiposCardapioRoutes },
  { path: '/periodos-refeicao', router: periodosRefeicaoRoutes },
  { path: '/permissoes', router: permissoesRoutes },
  { path: '/dashboard', router: dashboardRoutes },
  { path: '/auditoria', router: auditoriaRoutes },
  { path: '/veiculos', router: veiculosRoutes },
  { path: '/motoristas', router: motoristasRoutes },
  { path: '/ajudantes', router: ajudantesRoutes },
  { path: '/produto-origem', router: produtoOrigemRoutes },
  { path: '/produto-generico', router: produtoGenericoRoutes },
  { path: '/efetivos', router: efetivosRoutes },
  { path: '/patrimonios', router: patrimoniosRoutes },
  { path: '/periodicidade', router: periodicidadeRoutes },
  { path: '/faturamento', router: faturamentoRoutes.faturamentoRoutes },
  { path: '/receitas', router: receitasRoutes },
  { path: '/necessidades-merenda', router: necessidadesMerendaRoutes },
  { path: '/plano-amostragem', router: planoAmostragemRoutes },
  { path: '/relatorio-inspecao', router: relatorioInspecaoRoutes },
  { path: '/openai', router: openaiRoutes },
  { path: '/shared', router: cepRoutes }
];

module.exports = routes;
