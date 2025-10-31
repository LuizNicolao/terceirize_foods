/**
 * Controller de Busca de Unidades Escolares
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

class UnidadesEscolaresSearchController {
  // Buscar unidades escolares ativas
  static async buscarUnidadesEscolaresAtivas(req, res) {
    try {
      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = ["ue.status = 'ativo'"];
      let params = [];

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
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, params);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares ativas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares ativas'
      });
    }
  }

  // Buscar unidades escolares por estado
  static async buscarUnidadesEscolaresPorEstado(req, res) {
    try {
      const { estado } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ue.estado = ? AND ue.status = 'ativo'
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [estado]);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares por estado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares por estado'
      });
    }
  }

  // Buscar unidades escolares por rota
  static async buscarUnidadesEscolaresPorRota(req, res) {
    try {
      const { rotaId } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          (SELECT nome FROM rotas WHERE id = ?) as rota_nome,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo
        FROM unidades_escolares ue
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ue.rota_id IS NOT NULL AND ue.rota_id != "" AND FIND_IN_SET(?, ue.rota_id) > 0 AND ue.status = 'ativo'
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [rotaId, rotaId]);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares por rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares por rota'
      });
    }
  }

  // Buscar unidades escolares por filial que não estão vinculadas a nenhuma rota
  static async buscarUnidadesEscolaresDisponiveisPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = [
        'ue.filial_id = ?', 
        "ue.status = 'ativo'",
        'ue.rota_id IS NULL'  // Apenas unidades não vinculadas a nenhuma rota
      ];
      let params = [filialId];

      if (isNutricionista) {
        // Filtro 1: Verificar se o nutricionista tem acesso a esta filial
        whereConditions.push(`
          ue.filial_id IN (
            SELECT uf.filial_id 
            FROM usuarios_filiais uf 
            WHERE uf.usuario_id = ?
          )
        `);
        params.push(req.user.id);
      }

      const query = `
        SELECT 
          ue.id,
          ue.codigo_teknisa,
          ue.nome_escola,
          ue.cidade,
          ue.estado,
          ue.endereco,
          ue.numero,
          ue.bairro,
          ue.centro_distribuicao
        FROM unidades_escolares ue
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, params);

      res.json({
        success: true,
        data: unidades
      });
    } catch (error) {
      console.error('Erro ao buscar unidades escolares disponíveis por filial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar estados disponíveis
  static async listarEstados(req, res) {
    try {
      const query = `
        SELECT DISTINCT estado 
        FROM unidades_escolares 
        WHERE estado IS NOT NULL AND estado != '' AND status = 'ativo'
        ORDER BY estado ASC
      `;

      const estados = await executeQuery(query);

      res.json({
        success: true,
        data: estados.map(item => item.estado)
      });

    } catch (error) {
      console.error('Erro ao listar estados:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os estados'
      });
    }
  }

  // Listar centros de distribuição disponíveis
  static async listarCentrosDistribuicao(req, res) {
    try {
      const query = `
        SELECT DISTINCT centro_distribuicao 
        FROM unidades_escolares 
        WHERE centro_distribuicao IS NOT NULL AND centro_distribucao != '' AND status = 'ativo'
        ORDER BY centro_distribuicao ASC
      `;

      const centros = await executeQuery(query);

      res.json({
        success: true,
        data: centros.map(item => item.centro_distribuicao)
      });

    } catch (error) {
      console.error('Erro ao listar centros de distribuição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os centros de distribuição'
      });
    }
  }

  // Buscar unidades escolares por filial
  static async buscarUnidadesEscolaresPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = ['ue.filial_id = ?', "ue.status = 'ativo'"];
      let params = [filialId];

      if (isNutricionista) {
        // Filtro 1: Verificar se o nutricionista tem acesso a esta filial
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
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, params);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares por filial'
      });
    }
  }

  // Buscar unidades escolares por IDs específicos
  static async buscarUnidadesEscolaresPorIds(req, res) {
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
      
      let whereConditions = [`ue.id IN (${placeholders})`, "ue.status = 'ativo'"];
      let params = [...idsValidos];

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
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, params);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares por IDs:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares por IDs'
      });
    }
  }
}

module.exports = UnidadesEscolaresSearchController;
