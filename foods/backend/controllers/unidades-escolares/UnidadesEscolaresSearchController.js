/**
 * Controller de Busca de Unidades Escolares
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

class UnidadesEscolaresSearchController {
  // Buscar unidades escolares ativas
  static async buscarUnidadesEscolaresAtivas(req, res) {
    try {
      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ue.status = 'ativo'
        ORDER BY ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query);

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
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ue.estado = ? AND ue.status = 'ativo'
        ORDER BY ue.nome_escola ASC
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
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ue.rota_id = ? AND ue.status = 'ativo'
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [rotaId]);

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

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ue.filial_id = ? AND ue.status = 'ativo'
        ORDER BY ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [filialId]);

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

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.centro_distribuicao, ue.rota_id, ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE ue.id IN (${placeholders}) AND ue.status = 'ativo'
        ORDER BY ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, idsValidos);

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
