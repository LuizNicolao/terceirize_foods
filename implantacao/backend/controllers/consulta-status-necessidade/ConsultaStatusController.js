const { executeQuery } = require('../../config/database');

class ConsultaStatusController {
  /**
   * Listar status das necessidades com filtros
   */
  static async listarStatusNecessidades(req, res) {
    try {
      const {
        status,
        status_necessidade,
        status_substituicao,
        grupo,
        semana_abastecimento,
        semana_consumo,
        escola_id,
        produto_id,
        nutricionista_email,
        data_inicio,
        data_fim,
        page = 1,
        limit = 50
      } = req.query;

      // Garantir que page e limit sejam números
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;

      // Construir query base
      let whereConditions = [];
      let queryParams = [];

      // Filtros opcionais
      if (status || status_necessidade) {
        const statusFiltro = status || status_necessidade;
        whereConditions.push('n.status = ?');
        queryParams.push(statusFiltro);
      }

      if (status_substituicao) {
        if (status_substituicao === 'sem_substituicao') {
          whereConditions.push('ns.status IS NULL');
        } else {
          whereConditions.push('ns.status = ?');
          queryParams.push(status_substituicao);
        }
      }

      if (grupo) {
        whereConditions.push('n.grupo = ?');
        queryParams.push(grupo);
      }

      if (semana_abastecimento) {
        whereConditions.push('(n.semana_abastecimento = ? OR ns.semana_abastecimento = ?)');
        queryParams.push(semana_abastecimento);
        queryParams.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('(n.semana_consumo = ? OR ns.semana_consumo = ?)');
        queryParams.push(semana_consumo);
        queryParams.push(semana_consumo);
      }

      if (escola_id) {
        whereConditions.push('n.escola_id = ?');
        queryParams.push(escola_id);
      }

      if (produto_id) {
        whereConditions.push('n.produto_id = ?');
        queryParams.push(produto_id);
      }

      if (nutricionista_email) {
        whereConditions.push('n.usuario_email = ?');
        queryParams.push(nutricionista_email);
      }

      if (data_inicio) {
        whereConditions.push('DATE(n.data_preenchimento) >= ?');
        queryParams.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('DATE(n.data_preenchimento) <= ?');
        queryParams.push(data_fim);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Query principal para buscar necessidades
      // Usar DISTINCT para evitar duplicatas e remover JOIN desnecessário com calendario
      const necessidadesQuery = `
        SELECT DISTINCT
          n.id,
          n.produto_id,
          n.produto,
          n.produto_unidade,
          n.ajuste as quantidade,
          n.escola_id,
          n.escola as escola_nome,
          n.semana_abastecimento,
          n.semana_consumo,
          n.status,
          n.data_preenchimento as data_criacao,
          n.data_atualizacao,
          n.usuario_email,
          n.usuario_id,
          COALESCE(u.nome, n.usuario_email) as nutricionista_nome,
          n.grupo,
          n.grupo_id,
          ns.status as status_substituicao,
          ns.produto_generico_id,
          ns.produto_generico_nome,
          ns.quantidade_generico,
          ns.data_criacao as data_substituicao,
          ns.data_atualizacao as data_atualizacao_substituicao
        FROM necessidades n
        LEFT JOIN usuarios u ON n.usuario_id = u.id
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        ORDER BY n.data_preenchimento DESC, n.escola ASC, n.produto ASC
        LIMIT ? OFFSET ?
      `;

      const offset = (pageNum - 1) * limitNum;
      
      // Usar interpolação de string para LIMIT e OFFSET (como no recebimentos)
      const limitClause = `LIMIT ${limitNum} OFFSET ${offset}`;
      const necessidadesQueryFinal = necessidadesQuery.replace('LIMIT ? OFFSET ?', limitClause);

      const necessidades = await executeQuery(necessidadesQueryFinal, queryParams);

      // Query para contar total de registros (usar DISTINCT para evitar duplicatas)
      const countQuery = `
        SELECT COUNT(DISTINCT n.id) as total
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
      `;

      const countResult = await executeQuery(countQuery, queryParams);
      const total = countResult[0].total;

      // Agrupar necessidades por status para estatísticas
      const statsQuery = `
        SELECT 
          n.status,
          COUNT(*) as quantidade,
          SUM(n.ajuste) as total_quantidade
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        GROUP BY n.status
        ORDER BY n.status
      `;

      const stats = await executeQuery(statsQuery, queryParams);

      // Agrupar por status de substituição
      const substituicaoStatsQuery = `
        SELECT 
          COALESCE(ns.status, 'sem_substituicao') as status_substituicao,
          COUNT(*) as quantidade
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        GROUP BY COALESCE(ns.status, 'sem_substituicao')
        ORDER BY status_substituicao
      `;

      const substituicaoStats = await executeQuery(substituicaoStatsQuery, queryParams);

      const response = {
        success: true,
        data: necessidades,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        statistics: {
          necessidades: stats,
          substituicoes: substituicaoStats
        },
        _links: {
          self: { href: `/api/consulta-status-necessidade?page=${pageNum}&limit=${limitNum}` },
          first: { href: `/api/consulta-status-necessidade?page=1&limit=${limitNum}` },
          last: { href: `/api/consulta-status-necessidade?page=${Math.ceil(total / limitNum)}&limit=${limitNum}` },
          next: pageNum < Math.ceil(total / limitNum) ? { href: `/api/consulta-status-necessidade?page=${pageNum + 1}&limit=${limitNum}` } : null,
          prev: pageNum > 1 ? { href: `/api/consulta-status-necessidade?page=${pageNum - 1}&limit=${limitNum}` } : null
        }
      };

      res.json(response);

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter estatísticas gerais das necessidades
   */
  static async obterEstatisticas(req, res) {
    try {
      const { grupo, semana_abastecimento, data_inicio, data_fim } = req.query;

      let whereConditions = [];
      let queryParams = [];

      if (grupo) {
        whereConditions.push('n.grupo = ?');
        queryParams.push(grupo);
      }

      if (semana_abastecimento) {
        whereConditions.push('(n.semana_abastecimento = ? OR ns.semana_abastecimento = ?)');
        queryParams.push(semana_abastecimento);
        queryParams.push(semana_abastecimento);
      }

      if (data_inicio) {
        whereConditions.push('DATE(n.data_preenchimento) >= ?');
        queryParams.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('DATE(n.data_preenchimento) <= ?');
        queryParams.push(data_fim);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Estatísticas gerais (usar subquery para evitar duplicatas do JOIN)
      const statsQuery = `
        SELECT 
          COUNT(*) as total_necessidades,
          COUNT(DISTINCT escola_id) as total_escolas,
          COUNT(DISTINCT produto_id) as total_produtos,
          COUNT(DISTINCT grupo) as total_grupos,
          SUM(ajuste) as total_quantidade,
          AVG(ajuste) as media_quantidade
        FROM (
          SELECT DISTINCT
            n.id,
            n.escola_id,
            n.produto_id,
            n.grupo,
            n.ajuste
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        ) as necessidades_unicas
      `;

      const stats = await executeQuery(statsQuery, queryParams);

      // Status das necessidades (usar subquery para evitar duplicatas)
      const statusQuery = `
        SELECT 
          status,
          COUNT(*) as quantidade,
          SUM(ajuste) as total_quantidade
        FROM (
          SELECT DISTINCT
            n.id,
            n.status,
            n.ajuste
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        ) as necessidades_unicas
        GROUP BY status
        ORDER BY status
      `;

      const statusStats = await executeQuery(statusQuery, queryParams);

      // Status das substituições (usar subquery para evitar duplicatas)
      const substituicaoQuery = `
        SELECT 
          COALESCE(status_substituicao, 'sem_substituicao') as status_substituicao,
          COUNT(*) as quantidade
        FROM (
          SELECT DISTINCT
            n.id,
            ns.status as status_substituicao
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        ) as necessidades_unicas
        GROUP BY COALESCE(status_substituicao, 'sem_substituicao')
        ORDER BY status_substituicao
      `;

      const substituicaoStats = await executeQuery(substituicaoQuery, queryParams);

      // Grupos de produtos (usar subquery para evitar duplicatas)
      const gruposQuery = `
        SELECT 
          grupo,
          COUNT(*) as quantidade,
          SUM(ajuste) as total_quantidade
        FROM (
          SELECT DISTINCT
            n.id,
            n.grupo,
            n.ajuste
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        ) as necessidades_unicas
        GROUP BY grupo
        ORDER BY grupo
      `;

      const gruposStats = await executeQuery(gruposQuery, queryParams);

      res.json({
        success: true,
        data: {
          geral: stats[0],
          status: statusStats,
          substituicoes: substituicaoStats,
          grupos: gruposStats
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Exportar dados para XLSX
   */
  static async exportarXLSX(req, res) {
    try {
      const { status, grupo, semana_abastecimento, semana_consumo, escola_id, produto_id, data_inicio, data_fim } = req.query;

      // Reutilizar a mesma lógica de filtros da listagem
      let whereConditions = [];
      let queryParams = [];

      if (status) {
        whereConditions.push('n.status = ?');
        queryParams.push(status);
      }

      if (grupo) {
        whereConditions.push('n.grupo = ?');
        queryParams.push(grupo);
      }

      if (semana_abastecimento) {
        whereConditions.push('(n.semana_abastecimento = ? OR ns.semana_abastecimento = ?)');
        queryParams.push(semana_abastecimento);
        queryParams.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('(n.semana_consumo = ? OR ns.semana_consumo = ?)');
        queryParams.push(semana_consumo);
        queryParams.push(semana_consumo);
      }

      if (escola_id) {
        whereConditions.push('n.escola_id = ?');
        queryParams.push(escola_id);
      }

      if (produto_id) {
        whereConditions.push('n.produto_id = ?');
        queryParams.push(produto_id);
      }

      if (data_inicio) {
        whereConditions.push('DATE(n.data_preenchimento) >= ?');
        queryParams.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('DATE(n.data_preenchimento) <= ?');
        queryParams.push(data_fim);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          n.id,
          n.produto_id,
          n.produto,
          n.produto_unidade,
          n.ajuste as quantidade,
          n.escola_id,
          n.escola as escola_nome,
          n.semana_abastecimento,
          n.semana_consumo,
          n.status,
          n.data_preenchimento as data_criacao,
          n.usuario_email,
          ns.status as status_substituicao,
          ns.produto_generico_nome,
          ns.quantidade_generico
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        ORDER BY n.data_preenchimento DESC, n.escola ASC, n.produto ASC
      `;

      const dados = await executeQuery(query, queryParams);

      // Aqui você implementaria a lógica de exportação XLSX
      // Por enquanto, retornamos os dados para o frontend processar
      res.json({
        success: true,
        data: dados,
        message: 'Dados preparados para exportação XLSX'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Exportar dados para PDF
   */
  static async exportarPDF(req, res) {
    try {
      const { status, grupo, semana_abastecimento, semana_consumo, escola_id, produto_id, data_inicio, data_fim } = req.query;

      // Reutilizar a mesma lógica de filtros da listagem
      let whereConditions = [];
      let queryParams = [];

      if (status) {
        whereConditions.push('n.status = ?');
        queryParams.push(status);
      }

      if (grupo) {
        whereConditions.push('n.grupo = ?');
        queryParams.push(grupo);
      }

      if (semana_abastecimento) {
        whereConditions.push('(n.semana_abastecimento = ? OR ns.semana_abastecimento = ?)');
        queryParams.push(semana_abastecimento);
        queryParams.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('(n.semana_consumo = ? OR ns.semana_consumo = ?)');
        queryParams.push(semana_consumo);
        queryParams.push(semana_consumo);
      }

      if (escola_id) {
        whereConditions.push('n.escola_id = ?');
        queryParams.push(escola_id);
      }

      if (produto_id) {
        whereConditions.push('n.produto_id = ?');
        queryParams.push(produto_id);
      }

      if (data_inicio) {
        whereConditions.push('DATE(n.data_preenchimento) >= ?');
        queryParams.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('DATE(n.data_preenchimento) <= ?');
        queryParams.push(data_fim);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          n.id,
          n.produto_id,
          n.produto,
          n.produto_unidade,
          n.ajuste as quantidade,
          n.escola_id,
          n.escola as escola_nome,
          n.semana_abastecimento,
          n.semana_consumo,
          n.status,
          n.data_preenchimento as data_criacao,
          n.usuario_email,
          ns.status as status_substituicao,
          ns.produto_generico_nome,
          ns.quantidade_generico
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        ORDER BY n.data_preenchimento DESC, n.escola ASC, n.produto ASC
      `;

      const dados = await executeQuery(query, queryParams);

      // Aqui você implementaria a lógica de exportação PDF
      // Por enquanto, retornamos os dados para o frontend processar
      res.json({
        success: true,
        data: dados,
        message: 'Dados preparados para exportação PDF'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter opções de filtros disponíveis baseadas nos dados reais das tabelas
   */
  static async obterOpcoesFiltros(req, res) {
    try {
      const { executeQuery } = require('../../config/database');

      // Status de necessidades disponíveis
      const statusNecessidades = await executeQuery(`
        SELECT DISTINCT n.status
        FROM necessidades n
        WHERE n.status IS NOT NULL AND n.status != ''
        ORDER BY n.status
      `);

      // Status de substituições disponíveis
      const statusSubstituicoes = await executeQuery(`
        SELECT DISTINCT ns.status
        FROM necessidades_substituicoes ns
        WHERE ns.status IS NOT NULL AND ns.status != '' AND ns.ativo = 1
        ORDER BY ns.status
      `);

      // Grupos disponíveis
      const grupos = await executeQuery(`
        SELECT DISTINCT n.grupo
        FROM necessidades n
        WHERE n.grupo IS NOT NULL AND n.grupo != ''
        ORDER BY n.grupo
      `);

      // Semanas de abastecimento disponíveis
      const semanasAbastecimento = await executeQuery(`
        SELECT DISTINCT n.semana_abastecimento
        FROM necessidades n
        WHERE n.semana_abastecimento IS NOT NULL AND n.semana_abastecimento != ''
        ORDER BY n.semana_abastecimento DESC
      `);

      // Semanas de consumo disponíveis
      const semanasConsumo = await executeQuery(`
        SELECT DISTINCT n.semana_consumo
        FROM necessidades n
        WHERE n.semana_consumo IS NOT NULL AND n.semana_consumo != ''
        ORDER BY n.semana_consumo DESC
      `);

      // Escolas disponíveis
      const escolas = await executeQuery(`
        SELECT DISTINCT n.escola_id, n.escola as escola_nome
        FROM necessidades n
        WHERE n.escola_id IS NOT NULL AND n.escola IS NOT NULL
        ORDER BY n.escola
      `);

      // Produtos disponíveis
      const produtos = await executeQuery(`
        SELECT DISTINCT n.produto_id, n.produto as produto_nome, n.produto_unidade
        FROM necessidades n
        WHERE n.produto_id IS NOT NULL AND n.produto IS NOT NULL
        ORDER BY n.produto
      `);

      // Filiais disponíveis (através das escolas das necessidades)
      const filiais = await executeQuery(`
        SELECT DISTINCT ue.filial_id, f.filial, f.razao_social
        FROM necessidades n
        INNER JOIN foods_db.unidades_escolares ue ON n.escola_id = ue.id
        INNER JOIN foods_db.filiais f ON ue.filial_id = f.id
        WHERE ue.filial_id IS NOT NULL
        ORDER BY f.filial, f.razao_social
      `);

      // Nutricionistas disponíveis (buscar tanto das necessidades quanto da tabela usuarios)
      // Primeiro buscar das necessidades
      const nutricionistasNecessidades = await executeQuery(`
        SELECT DISTINCT 
          COALESCE(u.id, n.usuario_id) as usuario_id,
          COALESCE(u.email, n.usuario_email) as usuario_email,
          COALESCE(u.nome, n.usuario_email) as nome
        FROM necessidades n
        LEFT JOIN usuarios u ON n.usuario_id = u.id
        WHERE (n.usuario_email IS NOT NULL AND n.usuario_email != '') 
           OR (u.id IS NOT NULL AND u.tipo_de_acesso = 'nutricionista')
      `);
      
      // Depois buscar da tabela usuarios (nutricionistas ativos que não estão nas necessidades)
      const nutricionistasUsuarios = await executeQuery(`
        SELECT DISTINCT
          u.id as usuario_id,
          u.email as usuario_email,
          u.nome as nome
        FROM usuarios u
        WHERE u.tipo_de_acesso = 'nutricionista' 
          AND u.status = 'ativo'
          AND u.email COLLATE utf8mb4_general_ci NOT IN (
            SELECT DISTINCT COALESCE(u2.email, n2.usuario_email) COLLATE utf8mb4_general_ci
            FROM necessidades n2
            LEFT JOIN usuarios u2 ON n2.usuario_id = u2.id
            WHERE (n2.usuario_email IS NOT NULL AND n2.usuario_email != '') 
               OR u2.id IS NOT NULL
          )
      `);
      
      // Combinar e remover duplicatas por email
      const nutricionistasMap = new Map();
      
      // Adicionar das necessidades primeiro
      if (Array.isArray(nutricionistasNecessidades)) {
        nutricionistasNecessidades.forEach(n => {
          if (n && n.usuario_email) {
            nutricionistasMap.set(n.usuario_email, {
              usuario_id: n.usuario_id,
              usuario_email: n.usuario_email,
              nome: n.nome || n.usuario_email
            });
          }
        });
      }
      
      // Adicionar da tabela usuarios (sobrescreve se já existir, priorizando nome da tabela usuarios)
      if (Array.isArray(nutricionistasUsuarios)) {
        nutricionistasUsuarios.forEach(n => {
          if (n && n.usuario_email) {
            nutricionistasMap.set(n.usuario_email, {
              usuario_id: n.usuario_id,
              usuario_email: n.usuario_email,
              nome: n.nome || n.usuario_email
            });
          }
        });
      }
      
      // Converter para array e ordenar
      const nutricionistas = Array.from(nutricionistasMap.values()).sort((a, b) => {
        const nomeA = (a.nome || a.usuario_email || '').toLowerCase();
        const nomeB = (b.nome || b.usuario_email || '').toLowerCase();
        return nomeA.localeCompare(nomeB);
      });

      res.json({
        success: true,
        data: {
          status_necessidade: statusNecessidades.map(s => s.status),
          status_substituicao: statusSubstituicoes.map(s => s.status),
          grupos: grupos.map(g => g.grupo),
          semanas_abastecimento: semanasAbastecimento.map(s => s.semana_abastecimento),
          semanas_consumo: semanasConsumo.map(s => s.semana_consumo),
          escolas: escolas.map(e => ({
            id: e.escola_id,
            nome: e.escola_nome
          })),
          produtos: produtos.map(p => ({
            id: p.produto_id,
            nome: p.produto_nome,
            unidade: p.produto_unidade
          })),
          filiais: filiais.map(f => ({
            id: f.filial_id,
            nome: f.filial || f.razao_social || `Filial ${f.filial_id}`
          })),
          nutricionistas: nutricionistas.map(n => ({
            email: n.usuario_email,
            id: n.usuario_id,
            nome: n.nome || n.usuario_email
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Buscar produtos de um grupo específico com detalhes
   */
  static async buscarProdutosPorGrupo(req, res) {
    try {
      const { grupo, semana_abastecimento, semana_consumo, data_inicio, data_fim } = req.query;

      if (!grupo || grupo.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Grupo é obrigatório'
        });
      }

      const grupoValue = grupo.trim();
      let whereConditions = ['n.grupo = ?'];
      let queryParams = [grupoValue];

      if (semana_abastecimento) {
        whereConditions.push('(n.semana_abastecimento = ? OR ns.semana_abastecimento = ?)');
        queryParams.push(semana_abastecimento);
        queryParams.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('(n.semana_consumo = ? OR ns.semana_consumo = ?)');
        queryParams.push(semana_consumo);
        queryParams.push(semana_consumo);
      }

      if (data_inicio) {
        whereConditions.push('DATE(n.data_preenchimento) >= ?');
        queryParams.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('DATE(n.data_preenchimento) <= ?');
        queryParams.push(data_fim);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

      // Buscar produtos únicos do grupo com estatísticas
      const produtosQuery = `
        SELECT 
          n.produto_id,
          n.produto as produto_nome,
          n.produto_unidade,
          COUNT(DISTINCT n.id) as total_necessidades,
          COUNT(DISTINCT n.escola_id) as total_escolas,
          SUM(n.ajuste) as quantidade_total,
          AVG(n.ajuste) as quantidade_media,
          MIN(n.semana_abastecimento) as primeira_semana_abastecimento,
          MAX(n.semana_abastecimento) as ultima_semana_abastecimento
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        GROUP BY n.produto_id, n.produto, n.produto_unidade
        ORDER BY quantidade_total DESC, n.produto ASC
      `;

      const produtos = await executeQuery(produtosQuery, queryParams);

      // Buscar escolas que solicitam produtos deste grupo
      const escolasQuery = `
        SELECT DISTINCT
          n.escola_id,
          n.escola as escola_nome
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        ORDER BY n.escola ASC
      `;

      const escolas = await executeQuery(escolasQuery, queryParams);

      res.json({
        success: true,
        data: {
          grupo,
          produtos,
          escolas,
          total_produtos: produtos.length,
          total_escolas: escolas.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Listar comparação NEC x CONF (ajuste vs ajuste_conf_coord)
   * Apenas necessidades com status = 'CONF'
   */
  static async listarNecVsConf(req, res) {
    try {
      const {
        grupo,
        semana_abastecimento,
        produto_id,
        filial_id,
        page = 1,
        limit = 10000
      } = req.query;

      // Garantir que page e limit sejam números
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10000;

      // Construir query base
      let whereConditions = ['n.status = ?'];
      let queryParams = ['CONF'];
      let joinClause = '';

      // Filtros opcionais
      if (grupo) {
        whereConditions.push('n.grupo = ?');
        queryParams.push(String(grupo));
      }

      if (semana_abastecimento) {
        whereConditions.push('n.semana_abastecimento = ?');
        queryParams.push(String(semana_abastecimento));
      }

      if (produto_id) {
        whereConditions.push('n.produto_id = ?');
        queryParams.push(String(produto_id));
      }

      // Filtro por filial (através das escolas)
      if (filial_id) {
        joinClause = 'INNER JOIN foods_db.unidades_escolares ue ON n.escola_id = ue.id';
        whereConditions.push('ue.filial_id = ?');
        queryParams.push(String(filial_id));
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Query principal - agrupar por produto, grupo e semana_abastecimento
      const query = `
        SELECT 
          n.produto_id,
          n.produto,
          n.produto_unidade,
          n.grupo,
          n.semana_abastecimento,
          SUM(COALESCE(n.ajuste, 0)) as total_nec,
          SUM(COALESCE(n.ajuste_conf_coord, 0)) as total_conf,
          SUM(COALESCE(n.ajuste_conf_coord, 0)) - SUM(COALESCE(n.ajuste, 0)) as diferenca_numero,
          CASE 
            WHEN SUM(COALESCE(n.ajuste, 0)) > 0 THEN 
              ((SUM(COALESCE(n.ajuste_conf_coord, 0)) - SUM(COALESCE(n.ajuste, 0))) / SUM(COALESCE(n.ajuste, 0))) * 100
            ELSE 0
          END as diferenca_percentual,
          COUNT(DISTINCT n.id) as total_necessidades
        FROM necessidades n
        ${joinClause}
        ${whereClause}
        GROUP BY n.produto_id, n.produto, n.produto_unidade, n.grupo, n.semana_abastecimento
        ORDER BY n.grupo, n.produto, n.semana_abastecimento
        LIMIT ? OFFSET ?
      `;

      const offset = (pageNum - 1) * limitNum;
      
      // Usar interpolação de string para LIMIT e OFFSET (evita problemas com tipos)
      const limitClause = `LIMIT ${limitNum} OFFSET ${offset}`;
      const queryFinal = query.replace('LIMIT ? OFFSET ?', limitClause);

      const dados = await executeQuery(queryFinal, queryParams);

      // Query para contar total de registros (usar subquery para contar grupos únicos)
      const countQuery = `
        SELECT COUNT(*) as total
        FROM (
          SELECT DISTINCT
            n.produto_id,
            n.grupo,
            n.semana_abastecimento
          FROM necessidades n
          ${joinClause}
          ${whereClause}
        ) as grupos_unicos
      `;

      const countResult = await executeQuery(countQuery, queryParams);
      const total = countResult[0]?.total || 0;

      res.json({
        success: true,
        data: dados.map(item => ({
          produto_id: item.produto_id,
          produto: item.produto,
          produto_unidade: item.produto_unidade,
          grupo: item.grupo,
          semana_abastecimento: item.semana_abastecimento,
          total_nec: parseFloat(item.total_nec || 0),
          total_conf: parseFloat(item.total_conf || 0),
          diferenca_numero: parseFloat(item.diferenca_numero || 0),
          diferenca_percentual: parseFloat(item.diferenca_percentual || 0),
          total_necessidades: parseInt(item.total_necessidades || 0)
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: parseInt(total),
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

module.exports = ConsultaStatusController;
