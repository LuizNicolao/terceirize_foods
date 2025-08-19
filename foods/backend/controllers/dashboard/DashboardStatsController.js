/**
 * Controller de Estatísticas do Dashboard
 * Responsável por buscar estatísticas gerais do sistema
 */

const { executeQuery } = require('../../config/database');

class DashboardStatsController {
  // Obter estatísticas gerais da dashboard
  static async obterEstatisticas(req, res) {
    try {
      console.log('Iniciando busca de estatísticas da dashboard...');

      const stats = {
        usuarios: 0,
        fornecedores: 0,
        clientes: 0,
        produtos: 0,
        grupos: 0,
        subgrupos: 0,
        classes: 0,
        marcas: 0,
        unidades: 0,
        filiais: 0,
        rotas: 0,
        unidades_escolares: 0,
        motoristas: 0,
        ajudantes: 0,
        veiculos: 0,
        produto_generico: 0,
        produto_origem: 0,
        valorEstoque: 0,
        produtosEstoqueBaixo: 0,
        produtosSemEstoque: 0,
        produtosVencendo: 0,
        veiculosDocumentacaoVencendo: 0,
        motoristasCnhVencendo: 0
      };

      // ===== ESTATÍSTICAS GERAIS =====

      try {
        // Usuários ativos
        const usuariosAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM usuarios WHERE status = "ativo"'
        );
        stats.usuarios = usuariosAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar usuários:', error.message);
      }

      try {
        // Fornecedores ativos
        const fornecedoresAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM fornecedores WHERE status = 1'
        );
        stats.fornecedores = fornecedoresAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar fornecedores:', error.message);
      }

      try {
        // Clientes ativos
        const clientesAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM clientes WHERE status = 1'
        );
        stats.clientes = clientesAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar clientes:', error.message);
      }

      try {
        // Produtos ativos
        const produtosAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM produtos WHERE status = 1'
        );
        stats.produtos = produtosAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar produtos:', error.message);
      }

      try {
        // Grupos ativos
        const gruposAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM grupos WHERE status = 1'
        );
        stats.grupos = gruposAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar grupos:', error.message);
      }

      try {
        // Subgrupos ativos
        const subgruposAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM subgrupos WHERE status = 1'
        );
        stats.subgrupos = subgruposAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar subgrupos:', error.message);
      }

      try {
        // Classes ativas
        const classesAtivas = await executeQuery(
          'SELECT COUNT(*) as total FROM classes WHERE status = 1'
        );
        stats.classes = classesAtivas[0].total;
      } catch (error) {
        console.error('Erro ao contar classes:', error.message);
      }

      try {
        // Marcas ativas
        const marcasAtivas = await executeQuery(
          'SELECT COUNT(*) as total FROM marcas WHERE status = 1'
        );
        stats.marcas = marcasAtivas[0].total;
      } catch (error) {
        console.error('Erro ao contar marcas:', error.message);
      }

      try {
        // Unidades ativas
        const unidadesAtivas = await executeQuery(
          'SELECT COUNT(*) as total FROM unidades_medida WHERE status = 1'
        );
        stats.unidades = unidadesAtivas[0].total;
      } catch (error) {
        console.error('Erro ao contar unidades:', error.message);
      }

      try {
        // Filiais ativas
        const filiaisAtivas = await executeQuery(
          'SELECT COUNT(*) as total FROM filiais WHERE status = 1'
        );
        stats.filiais = filiaisAtivas[0].total;
      } catch (error) {
        console.error('Erro ao contar filiais:', error.message);
      }

      try {
        // Rotas ativas
        const rotasAtivas = await executeQuery(
          'SELECT COUNT(*) as total FROM rotas WHERE status = 1'
        );
        stats.rotas = rotasAtivas[0].total;
      } catch (error) {
        console.error('Erro ao contar rotas:', error.message);
      }

      try {
        // Unidades escolares ativas
        const unidadesEscolaresAtivas = await executeQuery(
          'SELECT COUNT(*) as total FROM unidades_escolares WHERE status = 1'
        );
        stats.unidades_escolares = unidadesEscolaresAtivas[0].total;
      } catch (error) {
        console.error('Erro ao contar unidades escolares:', error.message);
      }

      try {
        // Motoristas ativos
        const motoristasAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM motoristas WHERE status = "ativo"'
        );
        stats.motoristas = motoristasAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar motoristas:', error.message);
      }

      try {
        // Ajudantes ativos
        const ajudantesAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM ajudantes WHERE status = 1'
        );
        stats.ajudantes = ajudantesAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar ajudantes:', error.message);
      }

      try {
        // Veículos ativos
        const veiculosAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM veiculos WHERE status = "ativo"'
        );
        stats.veiculos = veiculosAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar veículos:', error.message);
      }

      try {
        // Produtos genéricos ativos
        const produtosGenericosAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM produto_generico WHERE status = 1'
        );
        stats.produto_generico = produtosGenericosAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar produtos genéricos:', error.message);
      }

      try {
        // Produtos origem ativos
        const produtosOrigemAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM produto_origem WHERE status = 1'
        );
        stats.produto_origem = produtosOrigemAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar produtos origem:', error.message);
      }

      // ===== ESTATÍSTICAS DE ESTOQUE (usando almoxarifado_itens) =====

      try {
        // Valor total do estoque (simulado - sem preço de custo)
        const valorEstoque = await executeQuery(`
          SELECT SUM(ai.quantidade) as valor_total
          FROM almoxarifado_itens ai
          INNER JOIN produtos p ON ai.produto_id = p.id
          WHERE p.status = 1 AND ai.quantidade > 0
        `);
        stats.valorEstoque = valorEstoque[0].valor_total || 0;
      } catch (error) {
        console.error('Erro ao calcular valor do estoque:', error.message);
      }

      try {
        // Produtos com estoque baixo (simulado - considerando quantidade < 10)
        const produtosEstoqueBaixo = await executeQuery(`
          SELECT COUNT(DISTINCT ai.produto_id) as total
          FROM almoxarifado_itens ai
          INNER JOIN produtos p ON ai.produto_id = p.id
          WHERE p.status = 1 
          AND ai.quantidade <= 10 
          AND ai.quantidade > 0
        `);
        stats.produtosEstoqueBaixo = produtosEstoqueBaixo[0].total;
      } catch (error) {
        console.error('Erro ao contar produtos com estoque baixo:', error.message);
      }

      try {
        // Produtos sem estoque
        const produtosSemEstoque = await executeQuery(`
          SELECT COUNT(DISTINCT p.id) as total
          FROM produtos p
          LEFT JOIN almoxarifado_itens ai ON p.id = ai.produto_id
          WHERE p.status = 1 
          AND (ai.produto_id IS NULL OR ai.quantidade = 0)
        `);
        stats.produtosSemEstoque = produtosSemEstoque[0].total;
      } catch (error) {
        console.error('Erro ao contar produtos sem estoque:', error.message);
      }

      // ===== ESTATÍSTICAS DE VENCIMENTO =====
      // Removendo consultas de vencimento de produtos pois não há coluna data_vencimento

      try {
        // Veículos com documentação vencendo
        const veiculosDocVencendo = await executeQuery(`
          SELECT COUNT(*) as total
          FROM veiculos 
          WHERE status = 'ativo' 
          AND (vencimento_licenciamento IS NOT NULL
               AND vencimento_licenciamento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))
        `);
        stats.veiculosDocumentacaoVencendo = veiculosDocVencendo[0].total;
      } catch (error) {
        console.error('Erro ao contar veículos com documentação vencendo:', error.message);
      }

      try {
        // Motoristas com CNH vencendo
        const motoristasCnhVencendo = await executeQuery(`
          SELECT COUNT(*) as total
          FROM motoristas 
          WHERE status = 'ativo' 
          AND (cnh_validade IS NOT NULL
               AND cnh_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))
        `);
        stats.motoristasCnhVencendo = motoristasCnhVencendo[0].total;
      } catch (error) {
        console.error('Erro ao contar motoristas com CNH vencendo:', error.message);
      }

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas da dashboard:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar as estatísticas da dashboard'
      });
    }
  }

  /**
   * Obter alertas do sistema
   */
  static async obterAlertas(req, res) {
    try {
      const alertas = [];

      // Verificar produtos com estoque baixo
      try {
        const produtosEstoqueBaixo = await executeQuery(`
          SELECT COUNT(DISTINCT ai.produto_id) as total
          FROM almoxarifado_itens ai
          INNER JOIN produtos p ON ai.produto_id = p.id
          WHERE p.status = 1 
          AND ai.quantidade <= 10 
          AND ai.quantidade > 0
        `);
        
        if (produtosEstoqueBaixo[0].total > 0) {
          alertas.push({
            id: 'estoque_baixo',
            titulo: 'Produtos com Estoque Baixo',
            descricao: `${produtosEstoqueBaixo[0].total} produtos estão com estoque baixo`,
            nivel: 'medio',
            data_hora: new Date().toISOString(),
            tipo: 'estoque'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar produtos com estoque baixo:', error.message);
      }

      // Verificar produtos sem estoque
      try {
        const produtosSemEstoque = await executeQuery(`
          SELECT COUNT(DISTINCT p.id) as total
          FROM produtos p
          LEFT JOIN almoxarifado_itens ai ON p.id = ai.produto_id
          WHERE p.status = 1 
          AND (ai.produto_id IS NULL OR ai.quantidade = 0)
        `);
        
        if (produtosSemEstoque[0].total > 0) {
          alertas.push({
            id: 'sem_estoque',
            titulo: 'Produtos Sem Estoque',
            descricao: `${produtosSemEstoque[0].total} produtos estão sem estoque`,
            nivel: 'alto',
            data_hora: new Date().toISOString(),
            tipo: 'estoque'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar produtos sem estoque:', error.message);
      }

      // Verificar veículos com documentação vencendo
      try {
        const veiculosDocVencendo = await executeQuery(`
          SELECT COUNT(*) as total
          FROM veiculos 
          WHERE status = 'ativo' 
          AND (vencimento_licenciamento IS NOT NULL
               AND vencimento_licenciamento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))
        `);
        
        if (veiculosDocVencendo[0].total > 0) {
          alertas.push({
            id: 'veiculos_doc_vencendo',
            titulo: 'Veículos com Documentação Vencendo',
            descricao: `${veiculosDocVencendo[0].total} veículos têm documentação vencendo`,
            nivel: 'medio',
            data_hora: new Date().toISOString(),
            tipo: 'documentacao'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar veículos com documentação vencendo:', error.message);
      }

      // Verificar motoristas com CNH vencendo
      try {
        const motoristasCnhVencendo = await executeQuery(`
          SELECT COUNT(*) as total
          FROM motoristas 
          WHERE status = 'ativo' 
          AND (cnh_validade IS NOT NULL
               AND cnh_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))
        `);
        
        if (motoristasCnhVencendo[0].total > 0) {
          alertas.push({
            id: 'motoristas_cnh_vencendo',
            titulo: 'Motoristas com CNH Vencendo',
            descricao: `${motoristasCnhVencendo[0].total} motoristas têm CNH vencendo`,
            nivel: 'alto',
            data_hora: new Date().toISOString(),
            tipo: 'documentacao'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar motoristas com CNH vencendo:', error.message);
      }

      res.json({
        success: true,
        data: {
          items: alertas,
          total: alertas.length
        }
      });

    } catch (error) {
      console.error('Erro ao obter alertas da dashboard:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar os alertas da dashboard'
      });
    }
  }
}

module.exports = DashboardStatsController;
