const { query } = require('../../config/database');

/**
 * Função auxiliar para extrair total de forma segura
 */
const getTotal = (result) => {
  try {
    return result?.[0]?.total || 0;
  } catch (error) {
    console.error('Erro ao extrair total:', error);
    return 0;
  }
};

/**
 * Obter estatísticas gerais do sistema
 */
const obterEstatisticas = async (req, res) => {
  try {
    // Consultas para obter estatísticas principais
    const [
      escolasCount,
      produtosCount,
      necessidadesCount,
      recebimentosCount,
      registrosDiariosCount,
      usuariosCount,
      tiposEntregaCount,
      produtosPerCapitaCount,
      mediasEscolasCount
    ] = await Promise.all([
      query('SELECT COUNT(*) as total FROM escolas WHERE ativo = 1'),
      query('SELECT COUNT(*) as total FROM produtos WHERE ativo = 1'),
      query('SELECT COUNT(*) as total FROM necessidades'),
      query('SELECT COUNT(*) as total FROM recebimentos_escolas WHERE ativo = 1'),
      query('SELECT COUNT(*) as total FROM registros_diarios WHERE ativo = 1'),
      query('SELECT COUNT(*) as total FROM usuarios WHERE ativo = 1'),
      query('SELECT COUNT(*) as total FROM tipos_entrega WHERE ativo = 1'),
      query('SELECT COUNT(*) as total FROM produtos_per_capita WHERE ativo = 1'),
      query('SELECT COUNT(*) as total FROM medias_escolas WHERE ativo = 1')
    ]);

    // Consultas para pendências e alertas
    const [
      necessidadesPendentes,
      recebimentosPendentes,
      registrosPendentes
    ] = await Promise.all([
      query('SELECT COUNT(*) as total FROM necessidades WHERE DATE(data_preenchimento) = CURDATE()'),
      query('SELECT COUNT(*) as total FROM recebimentos_escolas WHERE status_entrega = "Atrasado" AND ativo = 1'),
      query('SELECT COUNT(*) as total FROM registros_diarios WHERE DATE(data) = CURDATE() AND ativo = 1')
    ]);

    const stats = {
      escolas: getTotal(escolasCount),
      produtos: getTotal(produtosCount),
      necessidades: getTotal(necessidadesCount),
      recebimentos: getTotal(recebimentosCount),
      registros_diarios: getTotal(registrosDiariosCount),
      usuarios: getTotal(usuariosCount),
      tipos_entrega: getTotal(tiposEntregaCount),
      produtos_per_capita: getTotal(produtosPerCapitaCount),
      medias_escolas: getTotal(mediasEscolasCount),
      necessidades_pendentes: getTotal(necessidadesPendentes),
      recebimentos_pendentes: getTotal(recebimentosPendentes),
      registros_pendentes: getTotal(registrosPendentes),
      alertas_urgentes: getTotal(necessidadesPendentes) + getTotal(recebimentosPendentes) + getTotal(registrosPendentes)
    };

    res.json({
      success: true,
      message: 'Estatísticas carregadas com sucesso',
      data: { stats }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const obterMetricas = async (req, res) => {
  try {
    // Por enquanto, retornar métricas de exemplo
    const metricas = {
      uptime: '99.9',
      response_time: '120',
      active_sessions: '45',
      total_requests: '1.2k'
    };

    res.json({
      success: true,
      message: 'Métricas carregadas com sucesso',
      data: metricas
    });
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const obterGraficos = async (req, res) => {
  try {
    // Por enquanto, retornar dados de exemplo
    const graficos = {
      necessidades_por_mes: [],
      recebimentos_por_escola: [],
      produtos_mais_solicitados: []
    };

    res.json({
      success: true,
      message: 'Dados de gráficos carregados com sucesso',
      data: graficos
    });
  } catch (error) {
    console.error('Erro ao obter gráficos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  obterEstatisticas,
  obterMetricas,
  obterGraficos
};
