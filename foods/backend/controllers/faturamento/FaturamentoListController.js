/**
 * Controller de Listagem para Faturamento
 * Implementa operações de busca e listagem
 */

const { executeQuery } = require('../../config/database');

class FaturamentoListController {
  /**
   * Listar faturamentos com paginação, busca e filtros
   */
  static async listarFaturamentos(req, res) {
    try {
      
      const { search, mes, ano, unidade_escolar_id } = req.query;
      const pagination = req.pagination;

      // Construir query base
      let query = `
        SELECT 
          f.id,
          f.unidade_escolar_id,
          f.mes,
          f.ano,
          f.observacoes,
          f.criado_em,
          f.atualizado_em,
          ue.nome_escola,
          ue.codigo_teknisa,
          ue.cidade,
          ue.estado,
          fil.filial as filial_nome
        FROM faturamento f
        INNER JOIN unidades_escolares ue ON f.unidade_escolar_id = ue.id
        LEFT JOIN filiais fil ON ue.filial_id = fil.id
        WHERE 1=1
      `;

      const queryParams = [];

      // Aplicar filtros
      if (search) {
        query += ` AND (ue.nome_escola LIKE ? OR ue.codigo_teknisa LIKE ?)`;
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      if (mes) {
        query += ` AND f.mes = ?`;
        queryParams.push(parseInt(mes));
      }

      if (ano) {
        query += ` AND f.ano = ?`;
        queryParams.push(parseInt(ano));
      }

      if (unidade_escolar_id) {
        query += ` AND f.unidade_escolar_id = ?`;
        queryParams.push(parseInt(unidade_escolar_id));
      }

      // Ordenação
      query += ` ORDER BY f.ano DESC, f.mes DESC, ue.nome_escola ASC`;

      // Aplicar paginação (usar template literal como outras telas)
      const limitNum = parseInt(pagination.limit) || 20;
      const offsetNum = parseInt(pagination.offset) || 0;
      query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

      const faturamentos = await executeQuery(query, queryParams);

      // Buscar total de registros para paginação
      let countQuery = `
        SELECT COUNT(*) as total
        FROM faturamento f
        INNER JOIN unidades_escolares ue ON f.unidade_escolar_id = ue.id
        WHERE 1=1
      `;

      const countParams = [];

      if (search) {
        countQuery += ` AND (ue.nome_escola LIKE ? OR ue.codigo_teknisa LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`);
      }

      if (mes) {
        countQuery += ` AND f.mes = ?`;
        countParams.push(parseInt(mes));
      }

      if (ano) {
        countQuery += ` AND f.ano = ?`;
        countParams.push(parseInt(ano));
      }

      if (unidade_escolar_id) {
        countQuery += ` AND f.unidade_escolar_id = ?`;
        countParams.push(parseInt(unidade_escolar_id));
      }

      const totalResult = await executeQuery(countQuery, countParams);
      const totalItems = totalResult[0].total;

      // Gerar metadados de paginação
      const queryParamsForMeta = { ...req.query };
      delete queryParamsForMeta.page;
      delete queryParamsForMeta.limit;

      const meta = pagination.generateMeta(totalItems, '/api/faturamento', queryParamsForMeta);

      // Buscar totais de refeições para cada faturamento
      const faturamentosComTotais = await Promise.all(
        faturamentos.map(async (faturamento) => {
          const [totalResult] = await executeQuery(
            `SELECT 
               SUM(desjejum + lanche_matutino + almoco + lanche_vespertino + noturno) as total_refeicoes
             FROM faturamento_detalhes 
             WHERE faturamento_id = ?`,
            [faturamento.id]
          );
          
          return {
            ...faturamento,
            total_refeicoes: totalResult.total_refeicoes || 0
          };
        })
      );

      // Adicionar links HATEOAS
      const faturamentosComLinks = faturamentosComTotais.map(faturamento => ({
        ...faturamento,
        links: [
          { rel: 'self', href: `/faturamento/${faturamento.id}`, method: 'GET' },
          { rel: 'update', href: `/faturamento/${faturamento.id}`, method: 'PUT' },
          { rel: 'delete', href: `/faturamento/${faturamento.id}`, method: 'DELETE' }
        ]
      }));

      res.json({
        success: true,
        data: faturamentosComLinks,
        pagination: meta
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Buscar faturamento por ID
   */
  static async buscarFaturamentoPorId(req, res) {
    try {
      const { id } = req.params;

      const [faturamento] = await executeQuery(
        `SELECT 
           f.id,
           f.unidade_escolar_id,
           f.mes,
           f.ano,
           f.observacoes,
           f.criado_em,
           f.atualizado_em,
           ue.nome_escola,
           ue.codigo_teknisa,
           ue.cidade,
           ue.estado,
           fil.filial as filial_nome
         FROM faturamento f
         INNER JOIN unidades_escolares ue ON f.unidade_escolar_id = ue.id
         LEFT JOIN filiais fil ON ue.filial_id = fil.id
         WHERE f.id = ?`,
        [id]
      );

      if (!faturamento) {
        return res.status(404).json({
          success: false,
          message: 'Faturamento não encontrado'
        });
      }

      // Buscar detalhes do faturamento
      const detalhes = await executeQuery(
        'SELECT * FROM faturamento_detalhes WHERE faturamento_id = ? ORDER BY dia',
        [id]
      );

      faturamento.dados_faturamento = detalhes;

      // Adicionar links HATEOAS
      faturamento.links = [
        { rel: 'self', href: `/faturamento/${faturamento.id}`, method: 'GET' },
        { rel: 'update', href: `/faturamento/${faturamento.id}`, method: 'PUT' },
        { rel: 'delete', href: `/faturamento/${faturamento.id}`, method: 'DELETE' }
      ];

      res.json({
        success: true,
        data: faturamento
      });

    } catch (error) {
      console.error('Erro ao buscar faturamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar faturamento por unidade escolar
   */
  static async buscarFaturamentoPorUnidade(req, res) {
    try {
      const { unidade_escolar_id } = req.params;
      const { mes, ano } = req.query;

      let query = `
        SELECT 
          f.id,
          f.unidade_escolar_id,
          f.mes,
          f.ano,
          f.observacoes,
          f.criado_em,
          f.atualizado_em,
          ue.nome_escola,
          ue.codigo_teknisa
        FROM faturamento f
        INNER JOIN unidades_escolares ue ON f.unidade_escolar_id = ue.id
        WHERE f.unidade_escolar_id = ?
      `;

      const queryParams = [unidade_escolar_id];

      if (mes) {
        query += ` AND f.mes = ?`;
        queryParams.push(mes);
      }

      if (ano) {
        query += ` AND f.ano = ?`;
        queryParams.push(ano);
      }

      query += ` ORDER BY f.ano DESC, f.mes DESC`;

      const faturamentos = await executeQuery(query, queryParams);

      // Buscar detalhes para cada faturamento
      for (const faturamento of faturamentos) {
        const detalhes = await executeQuery(
          'SELECT * FROM faturamento_detalhes WHERE faturamento_id = ? ORDER BY dia',
          [faturamento.id]
        );
        faturamento.dados_faturamento = detalhes;
      }

      res.json({
        success: true,
        data: faturamentos
      });

    } catch (error) {
      console.error('Erro ao buscar faturamento por unidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar períodos de refeição disponíveis para faturamento
   */
  static async buscarPeriodosDisponiveis(req, res) {
    try {
      const periodos = [
        { codigo: 'DESJEJUM', nome: 'Desjejum' },
        { codigo: 'LANCHE_MATUTINO', nome: 'Lanche Matutino' },
        { codigo: 'ALMOCO', nome: 'Almoço' },
        { codigo: 'LANCHE_VESPERTINO', nome: 'Lanche Vespertino' },
        { codigo: 'NOTURNO', nome: 'Noturno' }
      ];

      res.json({
        success: true,
        data: periodos
      });

    } catch (error) {
      console.error('Erro ao buscar períodos disponíveis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = FaturamentoListController;
