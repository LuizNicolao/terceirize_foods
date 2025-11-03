const { executeQuery } = require('../../config/database');

/**
 * Controller para Dashboard Principal
 * Agrega estatísticas de todas as principais entidades do sistema
 */
class DashboardController {
  
  /**
   * Obter estatísticas gerais do dashboard
   */
  static async obterEstatisticas(req, res) {
    try {
      // Helper para executar queries com fallback
      const safeQuery = async (query, defaultValue = { total: 0, ativos: 0, escolas_unicas: 0 }) => {
        try {
          const result = await executeQuery(query);
          return result[0] || defaultValue;
        } catch (error) {
          console.error('Erro ao executar query:', error.message);
          return defaultValue;
        }
      };

      // Buscar estatísticas em paralelo para melhor performance
      const [
        unidadesEscolares,
        produtosPerCapita,
        necessidades,
        recebimentos,
        registrosDiarios,
        calendario,
        usuarios,
        necessidadesPadroes
      ] = await Promise.all([
        // Total de unidades escolares
        safeQuery(`SELECT COUNT(*) as total FROM unidades_escolares WHERE ativo = 1`),
        
        // Total de produtos per capita
        safeQuery(`SELECT COUNT(*) as total, SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as ativos FROM produtos_per_capita`),
        
        // Estatísticas de necessidades do mês atual
        safeQuery(`
          SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT escola) as escolas_unicas,
            SUM(quantidade) as quantidade_total
          FROM necessidades
          WHERE MONTH(data_preenchimento) = MONTH(CURRENT_DATE)
            AND YEAR(data_preenchimento) = YEAR(CURRENT_DATE)
        `),
        
        // Estatísticas de recebimentos do mês atual
        safeQuery(`
          SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT escola_id) as escolas_unicas,
            COUNT(CASE WHEN tipo_recebimento = 'Completo' THEN 1 END) as completos,
            COUNT(CASE WHEN tipo_recebimento = 'Parcial' THEN 1 END) as parciais
          FROM recebimentos_escolas
          WHERE MONTH(data_recebimento) = MONTH(CURRENT_DATE)
            AND YEAR(data_recebimento) = YEAR(CURRENT_DATE)
        `),
        
        // Estatísticas de registros diários do mês atual
        safeQuery(`
          SELECT 
            COUNT(*) as total,
            COUNT(DISTINCT escola_id) as escolas_unicas
          FROM registros_diarios
          WHERE MONTH(data) = MONTH(CURRENT_DATE)
            AND YEAR(data) = YEAR(CURRENT_DATE)
            AND ativo = 1
        `),
        
        // Estatísticas do calendário do ano atual
        safeQuery(`
          SELECT 
            COUNT(*) as total_dias,
            SUM(dia_util) as dias_uteis,
            SUM(dia_abastecimento) as dias_abastecimento,
            SUM(dia_consumo) as dias_consumo,
            SUM(feriado) as feriados
          FROM calendario
          WHERE ano = YEAR(CURRENT_DATE)
        `),
        
        // Total de usuários ativos
        safeQuery(`SELECT COUNT(*) as total FROM usuarios WHERE status = 'ativo'`),
        
        // Total de necessidades padrão
        safeQuery(`SELECT COUNT(*) as total FROM necessidades_padroes`)
      ]);

      // Estatísticas de alertas e pendências
      const necessidadesPendentes = await safeQuery(`
        SELECT COUNT(*) as total
        FROM necessidades
        WHERE status = 'pendente'
        AND data_preenchimento >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
      `);

      const recebimentosAtrasados = await safeQuery(`
        SELECT COUNT(*) as total
        FROM recebimentos_escolas
        WHERE status_entrega = 'Atrasado'
        AND data_recebimento >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      `);

      // Atividades recentes (últimas 10 necessidades)
      let atividadesRecentes = [];
      try {
        const result = await executeQuery(`
          SELECT 
            'necessidade' as tipo,
            escola as entidade,
            data_preenchimento as data,
            '' as detalhe
          FROM necessidades
          ORDER BY data_preenchimento DESC
          LIMIT 10
        `);
        atividadesRecentes = result || [];
      } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error.message);
        atividadesRecentes = [];
      }

      res.json({
        success: true,
        data: {
          estatisticas: {
            // Resumo geral
            totalEscolas: unidadesEscolares?.total || 0,
            totalProdutos: produtosPerCapita?.total || 0,
            produtosAtivos: produtosPerCapita?.ativos || 0,
            totalUsuarios: usuarios?.total || 0,
            totalNecessidadesPadroes: necessidadesPadroes?.total || 0,
            
            // Necessidades do mês
            necessidadesMes: {
              total: necessidades?.total || 0,
              escolasUnicas: necessidades?.escolas_unicas || 0,
              quantidadeTotal: necessidades?.quantidade_total || 0
            },
            
            // Recebimentos do mês
            recebimentosMes: {
              total: recebimentos?.total || 0,
              escolasUnicas: recebimentos?.escolas_unicas || 0,
              completos: recebimentos?.completos || 0,
              parciais: recebimentos?.parciais || 0
            },
            
            // Registros diários do mês
            registrosMes: {
              total: registrosDiarios?.total || 0,
              escolasUnicas: registrosDiarios?.escolas_unicas || 0
            },
            
            // Calendário do ano
            calendarioAno: {
              totalDias: calendario?.total_dias || 0,
              diasUteis: calendario?.dias_uteis || 0,
              diasAbastecimento: calendario?.dias_abastecimento || 0,
              diasConsumo: calendario?.dias_consumo || 0,
              feriados: calendario?.feriados || 0
            },
            
            // Alertas e pendências
            alertas: {
              necessidadesPendentes: necessidadesPendentes?.total || 0,
              recebimentosAtrasados: recebimentosAtrasados?.total || 0
            }
          },
          atividadesRecentes: atividadesRecentes
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao obter estatísticas'
      });
    }
  }

  /**
   * Obter resumo executivo
   */
  static async obterResumoExecutivo(req, res) {
    try {
      // KPIs principais para tomada de decisão
      const kpis = await Promise.all([
        // Taxa de necessidade vs recebimento
        executeQuery(`
          SELECT 
            (SELECT COUNT(*) FROM necessidades 
             WHERE MONTH(data_preenchimento) = MONTH(CURRENT_DATE)
               AND YEAR(data_preenchimento) = YEAR(CURRENT_DATE)) as necessidades_mes,
            (SELECT COUNT(*) FROM recebimentos_escolas 
             WHERE MONTH(data_recebimento) = MONTH(CURRENT_DATE)
               AND YEAR(data_recebimento) = YEAR(CURRENT_DATE)) as recebimentos_mes
        `),
        
        // Taxa de completude dos recebimentos
        executeQuery(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN tipo_recebimento = 'Completo' THEN 1 END) as completos,
            COUNT(CASE WHEN tipo_recebimento = 'Parcial' THEN 1 END) as parciais
          FROM recebimentos_escolas
          WHERE MONTH(data_recebimento) = MONTH(CURRENT_DATE)
            AND YEAR(data_recebimento) = YEAR(CURRENT_DATE)
        `),
        
        // Escolas mais ativas
        executeQuery(`
          SELECT 
            n.escola,
            COUNT(*) as total_necessidades,
            SUM(n.quantidade) as quantidade_total
          FROM necessidades n
          WHERE MONTH(n.data_preenchimento) = MONTH(CURRENT_DATE)
            AND YEAR(n.data_preenchimento) = YEAR(CURRENT_DATE)
          GROUP BY n.escola
          ORDER BY total_necessidades DESC
          LIMIT 5
        `)
      ]);

      const [necessidadesRecebimentos, completude, escolasAtivas] = kpis;

      const taxaNecessidadeRecebimento = necessidadesRecebimentos[0]?.necessidades_mes > 0
        ? ((necessidadesRecebimentos[0]?.recebimentos_mes / necessidadesRecebimentos[0]?.necessidades_mes) * 100).toFixed(1)
        : 0;

      const taxaCompletude = completude[0]?.total > 0
        ? ((completude[0]?.completos / completude[0]?.total) * 100).toFixed(1)
        : 0;

      res.json({
        success: true,
        data: {
          kpis: {
            taxaNecessidadeRecebimento: parseFloat(taxaNecessidadeRecebimento),
            taxaCompletude: parseFloat(taxaCompletude),
            escolasAtivas: escolasAtivas || []
          }
        }
      });

    } catch (error) {
      console.error('Erro ao obter resumo executivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao obter resumo executivo'
      });
    }
  }
}

module.exports = DashboardController;

