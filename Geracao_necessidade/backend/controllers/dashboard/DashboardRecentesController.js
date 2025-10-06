const { query } = require('../../config/database');

/**
 * Obter dados recentes do sistema
 */
const obterDadosRecentes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Consultas para obter dados recentes
    const [
      escolasRecentes,
      produtosRecentes,
      necessidadesRecentes,
      recebimentosRecentes,
      usuariosRecentes
    ] = await Promise.all([
      query(`
        SELECT id, nome_escola, cidade, rota, data_cadastro 
        FROM escolas 
        WHERE ativo = 1 
        ORDER BY data_cadastro DESC 
        LIMIT ${limit}
      `),
      
      query(`
        SELECT id, nome, unidade_medida, tipo, data_cadastro 
        FROM produtos 
        WHERE ativo = 1 
        ORDER BY data_cadastro DESC 
        LIMIT ${limit}
      `),
      
      query(`
        SELECT n.id, n.escola, n.data_preenchimento, e.nome_escola
        FROM necessidades n
        LEFT JOIN escolas e ON n.escola = e.nome_escola
        ORDER BY n.data_preenchimento DESC 
        LIMIT ${limit}
      `),
      
      query(`
        SELECT r.id, r.data_recebimento, r.tipo_recebimento, e.nome_escola
        FROM recebimentos_escolas r
        LEFT JOIN escolas e ON r.escola_id = e.id
        WHERE r.ativo = 1
        ORDER BY r.data_recebimento DESC 
        LIMIT ${limit}
      `),
      
      query(`
        SELECT id, nome, email, tipo_usuario, data_cadastro 
        FROM usuarios 
        WHERE ativo = 1 
        ORDER BY data_cadastro DESC 
        LIMIT ${limit}
      `)
    ]);

    const recentes = {
      escolas: escolasRecentes,
      produtos: produtosRecentes,
      necessidades: necessidadesRecentes,
      recebimentos: recebimentosRecentes,
      usuarios: usuariosRecentes
    };

    res.json({
      success: true,
      message: 'Dados recentes carregados com sucesso',
      data: { recentes }
    });
  } catch (error) {
    console.error('Erro ao obter dados recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Obter alertas do sistema
 */
const obterAlertas = async (req, res) => {
  try {
    const alertas = [];

    // Verificar necessidades pendentes
    const necessidadesPendentes = await query(`
      SELECT COUNT(*) as total 
      FROM necessidades 
      WHERE DATE(data_preenchimento) = CURDATE()
    `);
    
    if (necessidadesPendentes[0].total > 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Necessidades do Dia',
        descricao: `${necessidadesPendentes[0].total} necessidade(s) gerada(s) hoje`,
        route: '/necessidades',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar recebimentos atrasados
    const recebimentosAtrasados = await query(`
      SELECT COUNT(*) as total 
      FROM recebimentos_escolas 
      WHERE status_entrega = "Atrasado" AND ativo = 1
    `);
    
    if (recebimentosAtrasados[0].total > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Recebimentos Atrasados',
        descricao: `${recebimentosAtrasados[0].total} recebimento(s) com atraso`,
        route: '/recebimentos-escolas?status=atrasado',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar registros diários pendentes
    const registrosPendentes = await query(`
      SELECT COUNT(*) as total 
      FROM registros_diarios 
      WHERE DATE(data) = CURDATE() AND ativo = 1
    `);
    
    if (registrosPendentes[0].total > 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Registros Diários',
        descricao: `${registrosPendentes[0].total} registro(s) do dia`,
        route: '/registros-diarios',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar usuários inativos (baseado na data de cadastro - últimos 30 dias sem atividade)
    const usuariosInativos = await query(`
      SELECT COUNT(*) as total 
      FROM usuarios 
      WHERE ativo = 1 AND data_cadastro < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    if (usuariosInativos[0].total > 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Usuários Antigos',
        descricao: `${usuariosInativos[0].total} usuário(s) cadastrado(s) há mais de 30 dias`,
        route: '/usuarios',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Alertas carregados com sucesso',
      data: { items: alertas }
    });
  } catch (error) {
    console.error('Erro ao obter alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  obterDadosRecentes,
  obterAlertas
};
