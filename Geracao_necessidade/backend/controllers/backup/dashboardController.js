const db = require('../config/database');

class DashboardController {
  /**
   * Obter estatísticas gerais do sistema
   */
  static async obterEstatisticas(req, res, next) {
    try {
      // Função auxiliar para extrair total de forma segura
      const getTotal = (result) => {
        try {
          return result?.[0]?.[0]?.total || 0;
        } catch (error) {
          console.error('Erro ao extrair total:', error);
          return 0;
        }
      };

      // Consultas para obter estatísticas
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
        db.query('SELECT COUNT(*) as total FROM escolas WHERE ativo = 1'),
        db.query('SELECT COUNT(*) as total FROM produtos WHERE ativo = 1'),
        db.query('SELECT COUNT(*) as total FROM necessidades'), // necessidades não tem coluna ativo
        db.query('SELECT COUNT(*) as total FROM recebimentos_escolas WHERE ativo = 1'),
        db.query('SELECT COUNT(*) as total FROM registros_diarios WHERE ativo = 1'),
        db.query('SELECT COUNT(*) as total FROM usuarios WHERE ativo = 1'),
        db.query('SELECT COUNT(*) as total FROM tipos_entrega WHERE ativo = 1'),
        db.query('SELECT COUNT(*) as total FROM produtos_per_capita WHERE ativo = 1'),
        db.query('SELECT COUNT(*) as total FROM medias_escolas WHERE ativo = 1')
      ]);

      // Consultas para pendências e alertas
      const [
        necessidadesPendentes,
        recebimentosPendentes,
        registrosPendentes
      ] = await Promise.all([
        // Necessidades não têm coluna status, usar data_preenchimento recente como "pendente"
        db.query('SELECT COUNT(*) as total FROM necessidades WHERE DATE(data_preenchimento) = CURDATE()'),
        // Recebimentos com status_entrega = "Atrasado" como pendente
        db.query('SELECT COUNT(*) as total FROM recebimentos_escolas WHERE status_entrega = "Atrasado" AND ativo = 1'),
        // Registros diários não têm status, usar data recente
        db.query('SELECT COUNT(*) as total FROM registros_diarios WHERE DATE(data) = CURDATE() AND ativo = 1')
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
  }

  /**
   * Obter dados recentes do sistema
   */
  static async obterDadosRecentes(req, res, next) {
    try {
      const [
        escolasRecentes,
        produtosRecentes,
        necessidadesRecentes,
        recebimentosRecentes
      ] = await Promise.all([
        db.query(`
          SELECT id, nome_escola as nome, data_cadastro as created_at 
          FROM escolas 
          WHERE ativo = 1 
          ORDER BY data_cadastro DESC 
          LIMIT 5
        `),
        db.query(`
          SELECT id, nome, data_cadastro as created_at 
          FROM produtos 
          WHERE ativo = 1 
          ORDER BY data_cadastro DESC 
          LIMIT 5
        `),
        db.query(`
          SELECT id, produto as descricao, data_preenchimento as created_at 
          FROM necessidades 
          ORDER BY data_preenchimento DESC 
          LIMIT 5
        `),
        db.query(`
          SELECT id, observacoes, data_cadastro as created_at 
          FROM recebimentos_escolas 
          WHERE ativo = 1 
          ORDER BY data_cadastro DESC 
          LIMIT 5
        `)
      ]);

      const recentes = {
        escolas: escolasRecentes?.[0] || [],
        produtos: produtosRecentes?.[0] || [],
        necessidades: necessidadesRecentes?.[0] || [],
        recebimentos: recebimentosRecentes?.[0] || []
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
  }

  /**
   * Obter atividades recentes do sistema
   */
  static async obterAtividadesRecentes(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      // Por enquanto, retornar atividades de exemplo
      // Em uma implementação real, você teria uma tabela de auditoria
      const atividades = [
        {
          id: 1,
          tipo: 'escola',
          descricao: 'Nova escola cadastrada: Escola Municipal ABC',
          usuario: 'Admin',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          tipo: 'produto',
          descricao: 'Produto atualizado: Arroz Integral',
          usuario: 'Nutricionista',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          tipo: 'necessidade',
          descricao: 'Nova necessidade registrada',
          usuario: 'Coordenador',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      res.json({
        success: true,
        message: 'Atividades recentes carregadas com sucesso',
        data: { items: atividades.slice(0, limit) }
      });
    } catch (error) {
      console.error('Erro ao obter atividades recentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter alertas do sistema
   */
  static async obterAlertas(req, res, next) {
    try {
      // Função auxiliar para extrair total de forma segura
      const getTotal = (result) => {
        try {
          return result?.[0]?.[0]?.total || 0;
        } catch (error) {
          console.error('Erro ao extrair total:', error);
          return 0;
        }
      };

      // Consultar necessidades pendentes (necessidades de hoje)
      const [necessidadesPendentes] = await db.query(`
        SELECT COUNT(*) as total 
        FROM necessidades 
        WHERE DATE(data_preenchimento) = CURDATE()
      `);

      // Consultar recebimentos pendentes (atrasados)
      const [recebimentosPendentes] = await db.query(`
        SELECT COUNT(*) as total 
        FROM recebimentos_escolas 
        WHERE status_entrega = 'Atrasado' AND ativo = 1
      `);

      const alertas = [];
      const necessidadesTotal = getTotal(necessidadesPendentes);
      const recebimentosTotal = getTotal(recebimentosPendentes);

      if (necessidadesTotal > 0) {
        alertas.push({
          id: 1,
          tipo: 'warning',
          titulo: 'Necessidades Pendentes',
          descricao: `${necessidadesTotal} necessidades aguardando processamento`,
          route: '/necessidades?status=pendente',
          timestamp: new Date().toISOString()
        });
      }

      if (recebimentosTotal > 0) {
        alertas.push({
          id: 2,
          tipo: 'info',
          titulo: 'Recebimentos Pendentes',
          descricao: `${recebimentosTotal} recebimentos aguardando confirmação`,
          route: '/recebimentos-escolas?status=pendente',
          timestamp: new Date().toISOString()
        });
      }

      // Se não há alertas, adicionar um alerta de sucesso
      if (alertas.length === 0) {
        alertas.push({
          id: 3,
          tipo: 'success',
          titulo: 'Sistema Funcionando',
          descricao: 'Todos os processos estão em dia',
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
  }

  /**
   * Obter métricas de performance
   */
  static async obterMetricas(req, res, next) {
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
  }

  /**
   * Obter dados para gráficos
   */
  static async obterGraficos(req, res, next) {
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
  }
}

module.exports = DashboardController;
