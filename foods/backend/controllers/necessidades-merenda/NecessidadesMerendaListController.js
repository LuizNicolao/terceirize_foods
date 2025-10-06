/**
 * Controller de Listagem de Necessidades da Merenda
 * Responsável por listar e buscar necessidades
 */

const { executeQuery } = require('../../config/database');

class NecessidadesMerendaListController {
  // Listar necessidades com paginação, busca e filtros
  static async listarNecessidades(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        filial_id,
        unidade_escolar_id,
        data_inicio,
        data_fim,
        status
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search && search.trim()) {
        whereConditions.push('(nm.nome LIKE ? OR nm.descricao LIKE ?)');
        const searchParam = `%${search.trim()}%`;
        params.push(searchParam, searchParam);
      }

      // Filtro por filial
      if (filial_id && filial_id.trim()) {
        whereConditions.push('nm.filial_id = ?');
        params.push(filial_id);
      }

      // Filtro por unidade escolar
      if (unidade_escolar_id && unidade_escolar_id.trim()) {
        whereConditions.push('nm.unidade_escolar_id = ?');
        params.push(unidade_escolar_id);
      }

      // Filtro por período
      if (data_inicio && data_inicio.trim()) {
        whereConditions.push('nm.data_inicio >= ?');
        params.push(data_inicio);
      }

      if (data_fim && data_fim.trim()) {
        whereConditions.push('nm.data_fim <= ?');
        params.push(data_fim);
      }

      // Filtro por status
      if (status && status.trim()) {
        whereConditions.push('nm.status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.join(' AND ');

      // Query principal muito simplificada
      const query = `
        SELECT 
          nm.id,
          nm.codigo_interno,
          nm.nome,
          nm.descricao,
          nm.unidade_escolar_id,
          nm.filial_id,
          nm.status,
          nm.criado_em
        FROM necessidades_cardapio nm
        WHERE ${whereClause}
        ORDER BY nm.criado_em DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const necessidades = await executeQuery(query, params);

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM necessidades_cardapio nm
        WHERE ${whereClause}
      `;

      const [countResult] = await executeQuery(countQuery, params);
      const total = countResult.total;

      res.json({
        success: true,
        data: necessidades,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('❌ Erro ao listar necessidades:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar necessidade por ID
  static async buscarNecessidadePorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          nm.id,
          nm.cardapio_id,
          nm.receita_id,
          nm.data,
          nm.produto_id,
          nm.quantidade_padrao,
          nm.quantidade_nae,
          nm.quantidade_total,
          nm.unidade,
          nm.status,
          nm.criado_em,
          ue.nome_escola as unidade_escolar_nome,
          ue.filial_id,
          f.nome as filial_nome,
          p.nome as produto_nome,
          p.unidade as produto_unidade,
          rp.nome as receita_nome,
          rp.codigo_interno as receita_codigo_interno,
          rp.codigo_referencia as receita_codigo_referencia
        FROM necessidades_cardapio nm
        LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        LEFT JOIN produtos p ON nm.produto_id = p.id
        LEFT JOIN receitas_processadas rp ON nm.receita_id = rp.id
        WHERE nm.id = ?
      `;

      const [necessidade] = await executeQuery(query, [id]);

      if (!necessidade) {
        return res.status(404).json({
          success: false,
          message: 'Necessidade não encontrada'
        });
      }

      res.json({
        success: true,
        data: necessidade
      });
    } catch (error) {
      console.error('Erro ao buscar necessidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar necessidades agrupadas por data
  static async listarNecessidadesAgrupadasPorData(req, res) {
    try {
      const { 
        filial_id,
        unidade_escolar_id,
        data_inicio,
        data_fim
      } = req.query;

      let whereConditions = ['1=1'];
      let params = [];

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('ue.filial_id = ?');
        params.push(filial_id);
      }

      // Filtro por unidade escolar
      if (unidade_escolar_id) {
        whereConditions.push('nm.unidade_escolar_id = ?');
        params.push(unidade_escolar_id);
      }

      // Filtro por período
      if (data_inicio) {
        whereConditions.push('nm.data >= ?');
        params.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('nm.data <= ?');
        params.push(data_fim);
      }

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      if (isNutricionista) {
        whereConditions.push(`
          ue.filial_id IN (
            SELECT uf.filial_id 
            FROM usuarios_filiais uf 
            WHERE uf.usuario_id = ?
          )
        `);
        params.push(req.user.id);
      }

      const whereClause = whereConditions.join(' AND ');

      const query = `
        SELECT 
          nm.data,
          COUNT(DISTINCT nm.unidade_escolar_id) as total_unidades,
          COUNT(DISTINCT nm.produto_id) as total_produtos,
          SUM(nm.quantidade_total) as quantidade_total,
          SUM(nm.quantidade_padrao) as quantidade_padrao,
          SUM(nm.quantidade_nae) as quantidade_nae
        FROM necessidades_cardapio nm
        LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
        WHERE ${whereClause}
        GROUP BY nm.data
        ORDER BY nm.data DESC
      `;

      const necessidades = await executeQuery(query, params);

      res.json({
        success: true,
        data: necessidades
      });
    } catch (error) {
      console.error('Erro ao listar necessidades agrupadas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar necessidades agrupadas por produto
  static async listarNecessidadesAgrupadasPorProduto(req, res) {
    try {
      const { 
        filial_id,
        unidade_escolar_id,
        data_inicio,
        data_fim
      } = req.query;

      let whereConditions = ['1=1'];
      let params = [];

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('ue.filial_id = ?');
        params.push(filial_id);
      }

      // Filtro por unidade escolar
      if (unidade_escolar_id) {
        whereConditions.push('nm.unidade_escolar_id = ?');
        params.push(unidade_escolar_id);
      }

      // Filtro por período
      if (data_inicio) {
        whereConditions.push('nm.data >= ?');
        params.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('nm.data <= ?');
        params.push(data_fim);
      }

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      if (isNutricionista) {
        whereConditions.push(`
          ue.filial_id IN (
            SELECT uf.filial_id 
            FROM usuarios_filiais uf 
            WHERE uf.usuario_id = ?
          )
        `);
        params.push(req.user.id);
      }

      const whereClause = whereConditions.join(' AND ');

      const query = `
        SELECT 
          nm.produto_id,
          p.nome as produto_nome,
          p.unidade as produto_unidade,
          COUNT(DISTINCT nm.unidade_escolar_id) as total_unidades,
          COUNT(DISTINCT nm.data) as total_dias,
          SUM(nm.quantidade_total) as quantidade_total,
          SUM(nm.quantidade_padrao) as quantidade_padrao,
          SUM(nm.quantidade_nae) as quantidade_nae
        FROM necessidades_cardapio nm
        LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
        LEFT JOIN produtos p ON nm.produto_id = p.id
        WHERE ${whereClause}
        GROUP BY nm.produto_id, p.nome, p.unidade
        ORDER BY quantidade_total DESC
      `;

      const necessidades = await executeQuery(query, params);

      res.json({
        success: true,
        data: necessidades
      });
    } catch (error) {
      console.error('Erro ao listar necessidades agrupadas por produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = NecessidadesMerendaListController;
