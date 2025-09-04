/**
 * Controller de Busca de Tipos de Cardápio
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

class TiposCardapioSearchController {
  // Buscar tipos de cardápio ativos
  static async buscarAtivos(req, res) {
    try {
      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = ["tc.status = 'ativo'"];
      let params = [];

      if (isNutricionista) {
        // Filtro: Apenas tipos de cardápio das filiais que o nutricionista tem acesso
        whereConditions.push(`
          tc.id IN (
            SELECT tcf.tipo_cardapio_id 
            FROM tipos_cardapio_filiais tcf
            WHERE tcf.filial_id IN (
              SELECT uf.filial_id 
              FROM usuarios_filiais uf 
              WHERE uf.usuario_id = ?
            )
          )
        `);
        params.push(req.user.id);
      }

      const query = `
        SELECT 
          tc.id,
          tc.nome,
          tc.codigo,
          tc.descricao,
          tc.status
        FROM tipos_cardapio tc
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY tc.nome ASC
      `;

      const tipos = await executeQuery(query, params);

      res.json({
        success: true,
        data: tipos
      });

    } catch (error) {
      console.error('Erro ao buscar tipos de cardápio ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os tipos de cardápio ativos'
      });
    }
  }

  // Buscar tipos de cardápio por filial
  static async buscarPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = ['tcf.filial_id = ?', "tc.status = 'ativo'"];
      let params = [filialId];

      if (isNutricionista) {
        // Filtro: Verificar se o nutricionista tem acesso a esta filial
        whereConditions.push(`
          tcf.filial_id IN (
            SELECT uf.filial_id 
            FROM usuarios_filiais uf 
            WHERE uf.usuario_id = ?
          )
        `);
        params.push(req.user.id);
      }

      const query = `
        SELECT 
          tc.id,
          tc.nome,
          tc.codigo,
          tc.descricao,
          tc.status,
          tcf.data_vinculo
        FROM tipos_cardapio tc
        JOIN tipos_cardapio_filiais tcf ON tc.id = tcf.tipo_cardapio_id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY tc.nome ASC
      `;

      const tipos = await executeQuery(query, params);

      res.json({
        success: true,
        data: tipos
      });

    } catch (error) {
      console.error('Erro ao buscar tipos de cardápio por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os tipos de cardápio por filial'
      });
    }
  }

  // Buscar tipos de cardápio disponíveis para uma unidade escolar
  static async buscarDisponiveisParaUnidade(req, res) {
    try {
      const { unidadeEscolarId } = req.params;

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = [
        'ue.id = ?',
        "tc.status = 'ativo'",
        'tcf.filial_id = ue.filial_id'
      ];
      let params = [unidadeEscolarId];

      if (isNutricionista) {
        // Filtro 1: Apenas unidades escolares das filiais que o nutricionista tem acesso
        whereConditions.push(`
          ue.filial_id IN (
            SELECT uf.filial_id 
            FROM usuarios_filiais uf 
            WHERE uf.usuario_id = ?
          )
        `);
        params.push(req.user.id);

        // Filtro 2: Apenas unidades escolares vinculadas ao nutricionista nas rotas nutricionistas
        whereConditions.push(`
          ue.id IN (
            SELECT DISTINCT CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(rn.escolas_responsaveis, ',', numbers.n), ',', -1)) AS UNSIGNED) as escola_id
            FROM rotas_nutricionistas rn
            CROSS JOIN (
              SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION 
              SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
              SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
              SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
            ) numbers
            WHERE rn.usuario_id = ? 
              AND rn.status = 'ativo'
              AND rn.escolas_responsaveis IS NOT NULL 
              AND rn.escolas_responsaveis != ''
              AND CHAR_LENGTH(rn.escolas_responsaveis) - CHAR_LENGTH(REPLACE(rn.escolas_responsaveis, ',', '')) >= numbers.n - 1
              AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(rn.escolas_responsaveis, ',', numbers.n), ',', -1)) != ''
          )
        `);
        params.push(req.user.id);
      }

      const query = `
        SELECT 
          tc.id,
          tc.nome,
          tc.codigo,
          tc.descricao,
          tc.status,
          CASE 
            WHEN uetc.id IS NOT NULL THEN 'vinculado'
            ELSE 'disponivel'
          END as status_vinculo,
          uetc.data_vinculo,
          uetc.status as status_vinculo_detalhado
        FROM tipos_cardapio tc
        JOIN tipos_cardapio_filiais tcf ON tc.id = tcf.tipo_cardapio_id
        JOIN unidades_escolares ue ON tcf.filial_id = ue.filial_id
        LEFT JOIN unidades_escolares_tipos_cardapio uetc ON tc.id = uetc.tipo_cardapio_id AND ue.id = uetc.unidade_escolar_id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY tc.nome ASC
      `;

      const tipos = await executeQuery(query, params);

      res.json({
        success: true,
        data: tipos
      });

    } catch (error) {
      console.error('Erro ao buscar tipos de cardápio disponíveis para unidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os tipos de cardápio disponíveis'
      });
    }
  }

  // Buscar tipos de cardápio por IDs específicos
  static async buscarPorIds(req, res) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'IDs inválidos',
          message: 'É necessário fornecer uma lista de IDs válidos'
        });
      }

      // Validar se todos os IDs são números
      const idsValidos = ids.filter(id => !isNaN(parseInt(id)) && parseInt(id) > 0);
      
      if (idsValidos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'IDs inválidos',
          message: 'Nenhum ID válido foi fornecido'
        });
      }

      // Criar placeholders para a query IN
      const placeholders = idsValidos.map(() => '?').join(',');

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = [`tc.id IN (${placeholders})`, "tc.status = 'ativo'"];
      let params = [...idsValidos];

      if (isNutricionista) {
        // Filtro: Apenas tipos de cardápio das filiais que o nutricionista tem acesso
        whereConditions.push(`
          tc.id IN (
            SELECT tcf.tipo_cardapio_id 
            FROM tipos_cardapio_filiais tcf
            WHERE tcf.filial_id IN (
              SELECT uf.filial_id 
              FROM usuarios_filiais uf 
              WHERE uf.usuario_id = ?
            )
          )
        `);
        params.push(req.user.id);
      }

      const query = `
        SELECT 
          tc.id,
          tc.nome,
          tc.codigo,
          tc.descricao,
          tc.status
        FROM tipos_cardapio tc
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY tc.nome ASC
      `;

      const tipos = await executeQuery(query, params);

      res.json({
        success: true,
        data: tipos
      });

    } catch (error) {
      console.error('Erro ao buscar tipos de cardápio por IDs:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os tipos de cardápio'
      });
    }
  }
}

module.exports = TiposCardapioSearchController;
