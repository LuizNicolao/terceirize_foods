const { executeQuery } = require('../../config/database');

class ConsultaStatusController {
  /**
   * Listar status das necessidades com filtros
   */
  static async listarStatusNecessidades(req, res) {
    try {
      const {
        status,
        grupo,
        semana_abastecimento,
        semana_consumo,
        escola_id,
        produto_id,
        data_inicio,
        data_fim,
        page = 1,
        limit = 50
      } = req.query;

      // Construir query base
      let whereConditions = [];
      let queryParams = [];

      // Filtros opcionais
      if (status) {
        whereConditions.push('n.status = ?');
        queryParams.push(status);
      }

      if (grupo) {
        whereConditions.push('n.grupo = ?');
        queryParams.push(grupo);
      }

      if (semana_abastecimento) {
        whereConditions.push('n.semana_abastecimento = ?');
        queryParams.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('n.semana_consumo = ?');
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
        whereConditions.push('DATE(n.data_criacao) >= ?');
        queryParams.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('DATE(n.data_criacao) <= ?');
        queryParams.push(data_fim);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Query principal para buscar necessidades
      const necessidadesQuery = `
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
          n.grupo,
          n.grupo_id,
          n.substituicao_processada,
          n.data_criacao,
          n.data_atualizacao,
          n.usuario_id,
          n.usuario_email,
          n.observacoes,
          -- Status da substituição
          ns.status as status_substituicao,
          ns.produto_generico_id,
          ns.produto_generico_nome,
          ns.quantidade_generico,
          ns.data_criacao as data_substituicao,
          ns.data_atualizacao as data_atualizacao_substituicao
        FROM necessidades n
        LEFT JOIN necessidades_substituicoes ns ON (
          n.produto_id = ns.produto_origem_id 
          AND n.semana_abastecimento = ns.semana_abastecimento
          AND n.semana_consumo = ns.semana_consumo
          AND n.escola_id = ns.escola_id
          AND ns.ativo = 1
        )
        ${whereClause}
        ORDER BY n.data_criacao DESC, n.escola ASC, n.produto ASC
        LIMIT ? OFFSET ?
      `;

      const offset = (page - 1) * limit;
      queryParams.push(parseInt(limit), offset);

      const necessidades = await executeQuery(necessidadesQuery, queryParams);

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total
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

      const countParams = queryParams.slice(0, -2); // Remove limit e offset
      const countResult = await executeQuery(countQuery, countParams);
      const total = countResult[0].total;

      // Agrupar necessidades por status para estatísticas
      const statsQuery = `
        SELECT 
          n.status,
          n.grupo,
          COUNT(*) as quantidade,
          SUM(n.ajuste) as total_quantidade
        FROM necessidades n
        ${whereClause}
        GROUP BY n.status, n.grupo
        ORDER BY n.status, n.grupo
      `;

      const stats = await executeQuery(statsQuery, countParams);

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

      const substituicaoStats = await executeQuery(substituicaoStatsQuery, countParams);

      res.json({
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
          self: { href: `/api/consulta-status-necessidade?page=${page}&limit=${limit}` },
          first: { href: `/api/consulta-status-necessidade?page=1&limit=${limit}` },
          last: { href: `/api/consulta-status-necessidade?page=${Math.ceil(total / limit)}&limit=${limit}` },
          next: page < Math.ceil(total / limit) ? { href: `/api/consulta-status-necessidade?page=${parseInt(page) + 1}&limit=${limit}` } : null,
          prev: page > 1 ? { href: `/api/consulta-status-necessidade?page=${parseInt(page) - 1}&limit=${limit}` } : null
        }
      });

    } catch (error) {
      console.error('Erro ao listar status das necessidades:', error);
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
        whereConditions.push('n.semana_abastecimento = ?');
        queryParams.push(semana_abastecimento);
      }

      if (data_inicio) {
        whereConditions.push('DATE(n.data_criacao) >= ?');
        queryParams.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('DATE(n.data_criacao) <= ?');
        queryParams.push(data_fim);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Estatísticas gerais
      const statsQuery = `
        SELECT 
          COUNT(*) as total_necessidades,
          COUNT(DISTINCT n.escola_id) as total_escolas,
          COUNT(DISTINCT n.produto_id) as total_produtos,
          COUNT(DISTINCT n.grupo) as total_grupos,
          SUM(n.ajuste) as total_quantidade,
          AVG(n.ajuste) as media_quantidade
        FROM necessidades n
        ${whereClause}
      `;

      const stats = await executeQuery(statsQuery, queryParams);

      // Status das necessidades
      const statusQuery = `
        SELECT 
          n.status,
          COUNT(*) as quantidade,
          SUM(n.ajuste) as total_quantidade
        FROM necessidades n
        ${whereClause}
        GROUP BY n.status
        ORDER BY n.status
      `;

      const statusStats = await executeQuery(statusQuery, queryParams);

      // Status das substituições
      const substituicaoQuery = `
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

      const substituicaoStats = await executeQuery(substituicaoQuery, queryParams);

      // Grupos de produtos
      const gruposQuery = `
        SELECT 
          n.grupo,
          COUNT(*) as quantidade,
          SUM(n.ajuste) as total_quantidade
        FROM necessidades n
        ${whereClause}
        GROUP BY n.grupo
        ORDER BY n.grupo
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
      console.error('Erro ao obter estatísticas:', error);
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
        whereConditions.push('n.semana_abastecimento = ?');
        queryParams.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('n.semana_consumo = ?');
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
        whereConditions.push('DATE(n.data_criacao) >= ?');
        queryParams.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('DATE(n.data_criacao) <= ?');
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
          n.grupo,
          n.substituicao_processada,
          n.data_criacao,
          n.usuario_email,
          n.observacoes,
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
        ORDER BY n.data_criacao DESC, n.escola ASC, n.produto ASC
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
      console.error('Erro ao exportar XLSX:', error);
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
        whereConditions.push('n.semana_abastecimento = ?');
        queryParams.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('n.semana_consumo = ?');
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
        whereConditions.push('DATE(n.data_criacao) >= ?');
        queryParams.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('DATE(n.data_criacao) <= ?');
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
          n.grupo,
          n.substituicao_processada,
          n.data_criacao,
          n.usuario_email,
          n.observacoes,
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
        ORDER BY n.data_criacao DESC, n.escola ASC, n.produto ASC
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
      console.error('Erro ao exportar PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

module.exports = ConsultaStatusController;
