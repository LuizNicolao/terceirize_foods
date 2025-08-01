const { executeQuery } = require('../config/database');

class DashboardController {
  // Obter estatísticas gerais da dashboard
  async obterEstatisticas(req, res) {
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
        nome_generico_produto: 0,
        valorEstoque: 0,
        produtosEstoqueBaixo: 0,
        produtosSemEstoque: 0,
        produtosVencendo: 0,
        veiculosDocumentacaoVencendo: 0,
        motoristasCnhVencendo: 0
      };

      const recentes = {
        produtos: [],
        fornecedores: [],
        clientes: [],
        grupos: [],
        usuarios: [],
        filiais: [],
        rotas: [],
        unidades_escolares: [],
        motoristas: [],
        ajudantes: [],
        veiculos: []
      };

      const atividades = [];

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
          'SELECT COUNT(*) as total FROM rotas WHERE status = "ativo"'
        );
        stats.rotas = rotasAtivas[0].total;
      } catch (error) {
        console.error('Erro ao contar rotas:', error.message);
      }

      try {
        // Unidades escolares ativas
        const unidadesEscolaresAtivas = await executeQuery(
          'SELECT COUNT(*) as total FROM unidades_escolares WHERE status = "ativo"'
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
          'SELECT COUNT(*) as total FROM ajudantes WHERE status = "ativo"'
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
        // Nomes genéricos ativos
        const nomesGenericosAtivos = await executeQuery(
          'SELECT COUNT(*) as total FROM nome_generico_produto WHERE status = 1'
        );
        stats.nome_generico_produto = nomesGenericosAtivos[0].total;
      } catch (error) {
        console.error('Erro ao contar nomes genéricos:', error.message);
      }

      // ===== ESTATÍSTICAS DE ESTOQUE =====

      try {
        // Calcular valor total do estoque
        const valorEstoque = await executeQuery(
          'SELECT COALESCE(SUM(preco_custo * estoque_atual), 0) as total FROM produtos WHERE status = 1'
        );
        stats.valorEstoque = valorEstoque[0].total;
      } catch (error) {
        console.error('Erro ao calcular valor estoque:', error.message);
      }

      try {
        // Produtos com estoque baixo
        const produtosEstoqueBaixo = await executeQuery(
          `SELECT COUNT(*) as total FROM produtos 
           WHERE status = 1 AND estoque_atual <= estoque_minimo AND estoque_minimo > 0`
        );
        stats.produtosEstoqueBaixo = produtosEstoqueBaixo[0].total;
      } catch (error) {
        console.error('Erro ao contar produtos estoque baixo:', error.message);
      }

      try {
        // Produtos sem estoque
        const produtosSemEstoque = await executeQuery(
          'SELECT COUNT(*) as total FROM produtos WHERE status = 1 AND estoque_atual = 0'
        );
        stats.produtosSemEstoque = produtosSemEstoque[0].total;
      } catch (error) {
        console.error('Erro ao contar produtos sem estoque:', error.message);
      }

      // ===== ESTATÍSTICAS DE VENCIMENTO =====

      try {
        // Produtos vencendo (se houver campo de validade)
        const produtosVencendo = await executeQuery(
          `SELECT COUNT(*) as total FROM produtos 
           WHERE status = 1 AND data_validade IS NOT NULL 
           AND data_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
        );
        stats.produtosVencendo = produtosVencendo[0].total;
      } catch (error) {
        console.error('Erro ao contar produtos vencendo:', error.message);
      }

      try {
        // Veículos com documentação vencendo
        const veiculosDocumentacaoVencendo = await executeQuery(
          `SELECT COUNT(*) as total FROM veiculos 
           WHERE status = "ativo" AND (
             (data_vencimento_licenciamento IS NOT NULL AND data_vencimento_licenciamento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)) OR
             (data_vencimento_inspecao IS NOT NULL AND data_vencimento_inspecao <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)) OR
             (data_vencimento_documentacao IS NOT NULL AND data_vencimento_documentacao <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))
           )`
        );
        stats.veiculosDocumentacaoVencendo = veiculosDocumentacaoVencendo[0].total;
      } catch (error) {
        console.error('Erro ao contar veículos com documentação vencendo:', error.message);
      }

      try {
        // Motoristas com CNH vencendo
        const motoristasCnhVencendo = await executeQuery(
          `SELECT COUNT(*) as total FROM motoristas 
           WHERE status = "ativo" AND cnh_validade IS NOT NULL 
           AND cnh_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
        );
        stats.motoristasCnhVencendo = motoristasCnhVencendo[0].total;
      } catch (error) {
        console.error('Erro ao contar motoristas com CNH vencendo:', error.message);
      }

      // ===== REGISTROS RECENTES =====

      try {
        // Últimos produtos criados
        const ultimosProdutos = await executeQuery(
          `SELECT p.id, p.nome, p.criado_em, f.razao_social as fornecedor
           FROM produtos p
           LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
           WHERE p.status = 1
           ORDER BY p.criado_em DESC
           LIMIT 5`
        );
        recentes.produtos = ultimosProdutos;
      } catch (error) {
        console.error('Erro ao buscar últimos produtos:', error.message);
      }

      try {
        // Últimos fornecedores criados
        const ultimosFornecedores = await executeQuery(
          `SELECT id, razao_social, criado_em
           FROM fornecedores
           WHERE status = 1
           ORDER BY criado_em DESC
           LIMIT 5`
        );
        recentes.fornecedores = ultimosFornecedores;
      } catch (error) {
        console.error('Erro ao buscar últimos fornecedores:', error.message);
      }

      try {
        // Últimos clientes criados
        const ultimosClientes = await executeQuery(
          `SELECT id, razao_social, criado_em
           FROM clientes
           WHERE status = 1
           ORDER BY criado_em DESC
           LIMIT 5`
        );
        recentes.clientes = ultimosClientes;
      } catch (error) {
        console.error('Erro ao buscar últimos clientes:', error.message);
      }

      try {
        // Últimos grupos criados
        const ultimosGrupos = await executeQuery(
          `SELECT id, nome, criado_em
           FROM grupos
           WHERE status = 1
           ORDER BY criado_em DESC
           LIMIT 5`
        );
        recentes.grupos = ultimosGrupos;
      } catch (error) {
        console.error('Erro ao buscar últimos grupos:', error.message);
      }

      try {
        // Últimos usuários criados
        const ultimosUsuarios = await executeQuery(
          `SELECT id, nome, criado_em
           FROM usuarios
           WHERE status = "ativo"
           ORDER BY criado_em DESC
           LIMIT 5`
        );
        recentes.usuarios = ultimosUsuarios;
      } catch (error) {
        console.error('Erro ao buscar últimos usuários:', error.message);
      }

      try {
        // Últimas filiais criadas
        const ultimasFiliais = await executeQuery(
          `SELECT id, filial, criado_em
           FROM filiais
           WHERE status = 1
           ORDER BY criado_em DESC
           LIMIT 5`
        );
        recentes.filiais = ultimasFiliais;
      } catch (error) {
        console.error('Erro ao buscar últimas filiais:', error.message);
      }

      try {
        // Últimas rotas criadas
        const ultimasRotas = await executeQuery(
          `SELECT id, codigo, nome, criado_em
           FROM rotas
           WHERE status = "ativo"
           ORDER BY created_at DESC
           LIMIT 5`
        );
        recentes.rotas = ultimasRotas;
      } catch (error) {
        console.error('Erro ao buscar últimas rotas:', error.message);
      }

      try {
        // Últimas unidades escolares criadas
        const ultimasUnidadesEscolares = await executeQuery(
          `SELECT id, nome_escola, criado_em
           FROM unidades_escolares
           WHERE status = "ativo"
           ORDER BY criado_em DESC
           LIMIT 5`
        );
        recentes.unidades_escolares = ultimasUnidadesEscolares;
      } catch (error) {
        console.error('Erro ao buscar últimas unidades escolares:', error.message);
      }

      try {
        // Últimos motoristas criados
        const ultimosMotoristas = await executeQuery(
          `SELECT id, nome, criado_em
           FROM motoristas
           WHERE status = "ativo"
           ORDER BY criado_em DESC
           LIMIT 5`
        );
        recentes.motoristas = ultimosMotoristas;
      } catch (error) {
        console.error('Erro ao buscar últimos motoristas:', error.message);
      }

      try {
        // Últimos ajudantes criados
        const ultimosAjudantes = await executeQuery(
          `SELECT id, nome, criado_em
           FROM ajudantes
           WHERE status = "ativo"
           ORDER BY criado_em DESC
           LIMIT 5`
        );
        recentes.ajudantes = ultimosAjudantes;
      } catch (error) {
        console.error('Erro ao buscar últimos ajudantes:', error.message);
      }

      try {
        // Últimos veículos criados
        const ultimosVeiculos = await executeQuery(
          `SELECT id, placa, modelo, criado_em
           FROM veiculos
           WHERE status = "ativo"
           ORDER BY criado_em DESC
           LIMIT 5`
        );
        recentes.veiculos = ultimosVeiculos;
      } catch (error) {
        console.error('Erro ao buscar últimos veículos:', error.message);
      }

      // ===== ATIVIDADES RECENTES =====

      try {
        // Atividades recentes (combinação de diferentes entidades)
        const atividadesRecentes = await executeQuery(
          `(SELECT 'produto' as tipo, id, nome COLLATE utf8mb4_general_ci as titulo, criado_em as data, 'Produto criado' as acao
           FROM produtos 
           WHERE status = 1)
           UNION ALL
           (SELECT 'fornecedor' as tipo, id, razao_social COLLATE utf8mb4_general_ci as titulo, criado_em as data, 'Fornecedor criado' as acao
           FROM fornecedores 
           WHERE status = 1)
           UNION ALL
           (SELECT 'cliente' as tipo, id, razao_social COLLATE utf8mb4_general_ci as titulo, criado_em as data, 'Cliente criado' as acao
           FROM clientes 
           WHERE status = 1)
           UNION ALL
           (SELECT 'usuario' as tipo, id, nome COLLATE utf8mb4_general_ci as titulo, criado_em as data, 'Usuário criado' as acao
           FROM usuarios 
           WHERE status = "ativo")
           ORDER BY data DESC 
           LIMIT 10`
        );
        
        // Formatar as atividades
        atividades = atividadesRecentes.map(item => ({
          tipo: item.tipo,
          id: item.id,
          titulo: item.titulo,
          data: item.data,
          acao: item.acao
        }));
      } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error.message);
      }

      res.json({
        success: true,
        data: {
          stats,
          recentes,
          atividades
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas da dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as estatísticas da dashboard'
      });
    }
  }

  // Obter estatísticas por filial
  async obterEstatisticasPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const stats = {
        rotas: 0,
        unidades_escolares: 0,
        motoristas: 0,
        ajudantes: 0,
        veiculos: 0,
        veiculosDocumentacaoVencendo: 0,
        motoristasCnhVencendo: 0
      };

      try {
        // Rotas da filial
        const rotasFilial = await executeQuery(
          'SELECT COUNT(*) as total FROM rotas WHERE filial_id = ? AND status = "ativo"',
          [filialId]
        );
        stats.rotas = rotasFilial[0].total;
      } catch (error) {
        console.error('Erro ao contar rotas da filial:', error.message);
      }

      try {
        // Unidades escolares da filial
        const unidadesEscolaresFilial = await executeQuery(
          'SELECT COUNT(*) as total FROM unidades_escolares WHERE filial_id = ? AND status = "ativo"',
          [filialId]
        );
        stats.unidades_escolares = unidadesEscolaresFilial[0].total;
      } catch (error) {
        console.error('Erro ao contar unidades escolares da filial:', error.message);
      }

      try {
        // Motoristas da filial
        const motoristasFilial = await executeQuery(
          'SELECT COUNT(*) as total FROM motoristas WHERE filial_id = ? AND status = "ativo"',
          [filialId]
        );
        stats.motoristas = motoristasFilial[0].total;
      } catch (error) {
        console.error('Erro ao contar motoristas da filial:', error.message);
      }

      try {
        // Ajudantes da filial
        const ajudantesFilial = await executeQuery(
          'SELECT COUNT(*) as total FROM ajudantes WHERE filial_id = ? AND status = "ativo"',
          [filialId]
        );
        stats.ajudantes = ajudantesFilial[0].total;
      } catch (error) {
        console.error('Erro ao contar ajudantes da filial:', error.message);
      }

      try {
        // Veículos da filial
        const veiculosFilial = await executeQuery(
          'SELECT COUNT(*) as total FROM veiculos WHERE filial_id = ? AND status = "ativo"',
          [filialId]
        );
        stats.veiculos = veiculosFilial[0].total;
      } catch (error) {
        console.error('Erro ao contar veículos da filial:', error.message);
      }

      try {
        // Veículos da filial com documentação vencendo
        const veiculosDocumentacaoVencendo = await executeQuery(
          `SELECT COUNT(*) as total FROM veiculos 
           WHERE filial_id = ? AND status = "ativo" AND (
             (data_vencimento_licenciamento IS NOT NULL AND data_vencimento_licenciamento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)) OR
             (data_vencimento_inspecao IS NOT NULL AND data_vencimento_inspecao <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)) OR
             (data_vencimento_documentacao IS NOT NULL AND data_vencimento_documentacao <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))
           )`,
          [filialId]
        );
        stats.veiculosDocumentacaoVencendo = veiculosDocumentacaoVencendo[0].total;
      } catch (error) {
        console.error('Erro ao contar veículos com documentação vencendo da filial:', error.message);
      }

      try {
        // Motoristas da filial com CNH vencendo
        const motoristasCnhVencendo = await executeQuery(
          `SELECT COUNT(*) as total FROM motoristas 
           WHERE filial_id = ? AND status = "ativo" AND cnh_validade IS NOT NULL 
           AND cnh_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`,
          [filialId]
        );
        stats.motoristasCnhVencendo = motoristasCnhVencendo[0].total;
      } catch (error) {
        console.error('Erro ao contar motoristas com CNH vencendo da filial:', error.message);
      }

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas da filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as estatísticas da filial'
      });
    }
  }

  // Obter alertas do sistema
  async obterAlertas(req, res) {
    try {
      const alertas = {
        produtosEstoqueBaixo: [],
        produtosSemEstoque: [],
        produtosVencendo: [],
        veiculosDocumentacaoVencendo: [],
        motoristasCnhVencendo: [],
        veiculosManutencao: []
      };

      try {
        // Produtos com estoque baixo
        const produtosEstoqueBaixo = await executeQuery(
          `SELECT p.id, p.nome, p.estoque_atual, p.estoque_minimo, f.razao_social as fornecedor
           FROM produtos p
           LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
           WHERE p.status = 1 AND p.estoque_atual <= p.estoque_minimo AND p.estoque_minimo > 0
           ORDER BY p.estoque_atual ASC
           LIMIT 10`
        );
        alertas.produtosEstoqueBaixo = produtosEstoqueBaixo;
      } catch (error) {
        console.error('Erro ao buscar produtos com estoque baixo:', error.message);
      }

      try {
        // Produtos sem estoque
        const produtosSemEstoque = await executeQuery(
          `SELECT p.id, p.nome, f.razao_social as fornecedor
           FROM produtos p
           LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
           WHERE p.status = 1 AND p.estoque_atual = 0
           ORDER BY p.nome ASC
           LIMIT 10`
        );
        alertas.produtosSemEstoque = produtosSemEstoque;
      } catch (error) {
        console.error('Erro ao buscar produtos sem estoque:', error.message);
      }

      try {
        // Produtos vencendo
        const produtosVencendo = await executeQuery(
          `SELECT p.id, p.nome, p.data_validade, f.razao_social as fornecedor
           FROM produtos p
           LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
           WHERE p.status = 1 AND p.data_validade IS NOT NULL 
           AND p.data_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
           ORDER BY p.data_validade ASC
           LIMIT 10`
        );
        alertas.produtosVencendo = produtosVencendo;
      } catch (error) {
        console.error('Erro ao buscar produtos vencendo:', error.message);
      }

      try {
        // Veículos com documentação vencendo
        const veiculosDocumentacaoVencendo = await executeQuery(
          `SELECT v.id, v.placa, v.modelo, v.data_vencimento_licenciamento, 
                  v.data_vencimento_inspecao, v.data_vencimento_documentacao,
                  f.filial as filial_nome
           FROM veiculos v
           LEFT JOIN filiais f ON v.filial_id = f.id
           WHERE v.status = "ativo" AND (
             (v.data_vencimento_licenciamento IS NOT NULL AND v.data_vencimento_licenciamento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)) OR
             (v.data_vencimento_inspecao IS NOT NULL AND v.data_vencimento_inspecao <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)) OR
             (v.data_vencimento_documentacao IS NOT NULL AND v.data_vencimento_documentacao <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))
           )
           ORDER BY v.data_vencimento_licenciamento ASC, v.data_vencimento_inspecao ASC, v.data_vencimento_documentacao ASC
           LIMIT 10`
        );
        alertas.veiculosDocumentacaoVencendo = veiculosDocumentacaoVencendo;
      } catch (error) {
        console.error('Erro ao buscar veículos com documentação vencendo:', error.message);
      }

      try {
        // Motoristas com CNH vencendo
        const motoristasCnhVencendo = await executeQuery(
          `SELECT m.id, m.nome, m.cnh, m.cnh_validade, f.filial as filial_nome
           FROM motoristas m
           LEFT JOIN filiais f ON m.filial_id = f.id
           WHERE m.status = "ativo" AND m.cnh_validade IS NOT NULL 
           AND m.cnh_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
           ORDER BY m.cnh_validade ASC
           LIMIT 10`
        );
        alertas.motoristasCnhVencendo = motoristasCnhVencendo;
      } catch (error) {
        console.error('Erro ao buscar motoristas com CNH vencendo:', error.message);
      }

      try {
        // Veículos em manutenção
        const veiculosManutencao = await executeQuery(
          `SELECT v.id, v.placa, v.modelo, v.status_detalhado, f.filial as filial_nome
           FROM veiculos v
           LEFT JOIN filiais f ON v.filial_id = f.id
           WHERE v.status = "manutencao"
           ORDER BY v.placa ASC
           LIMIT 10`
        );
        alertas.veiculosManutencao = veiculosManutencao;
      } catch (error) {
        console.error('Erro ao buscar veículos em manutenção:', error.message);
      }

      res.json({
        success: true,
        data: alertas
      });

    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os alertas'
      });
    }
  }
}

module.exports = new DashboardController(); 