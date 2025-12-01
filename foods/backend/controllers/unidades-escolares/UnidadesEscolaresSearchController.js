/**
 * Controller de Busca de Unidades Escolares
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

/**
 * Formata CEP para exibição (00000-000)
 * Aceita CEP com ou sem hífen e retorna formatado
 */
const formatarCEP = (cep) => {
  if (!cep) return null;
  const cepLimpo = String(cep).replace(/-/g, '').trim();
  if (cepLimpo.length === 8) {
    return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
  }
  return cep; // Retorna como está se não tiver 8 dígitos
};

/**
 * Formata CEP em um array de unidades escolares
 */
const formatarCEPs = (unidades) => {
  return unidades.map(unidade => ({
    ...unidade,
    cep: formatarCEP(unidade.cep)
  }));
};

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
            SELECT rne.unidade_escolar_id
            FROM rotas_nutricionistas_escolas rne
            INNER JOIN rotas_nutricionistas rn ON rne.rota_nutricionista_id = rn.id
            WHERE rn.usuario_id = ? 
              AND rn.status = 'ativo'
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

      // Formatar CEPs para exibição
      const unidadesFormatadas = formatarCEPs(unidades);

      res.json({
        success: true,
        data: unidadesFormatadas
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
          ue.centro_distribuicao, 
          GROUP_CONCAT(DISTINCT uer.rota_id ORDER BY uer.rota_id SEPARATOR ',') as rota_id,
          ue.ordem_entrega, ue.status,
          ue.filial_id,
          r.nome as rota_nome,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo
        FROM unidades_escolares ue
        INNER JOIN unidades_escolares_rotas uer ON ue.id = uer.unidade_escolar_id
        INNER JOIN rotas r ON uer.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        WHERE uer.rota_id = ? AND ue.status = 'ativo'
        GROUP BY ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.endereco, ue.numero, ue.bairro, ue.cep, ue.centro_distribuicao, 
          ue.ordem_entrega, ue.status, ue.filial_id, r.nome, f.filial, f.codigo_filial
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

      // Formatar CEPs para exibição
      const unidadesFormatadas = formatarCEPs(unidades);

      res.json({
        success: true,
        data: unidadesFormatadas
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
            SELECT rne.unidade_escolar_id
            FROM rotas_nutricionistas_escolas rne
            INNER JOIN rotas_nutricionistas rn ON rne.rota_nutricionista_id = rn.id
            WHERE rn.usuario_id = ? 
              AND rn.status = 'ativo'
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

      // Formatar CEPs para exibição
      const unidadesFormatadas = formatarCEPs(unidades);

      res.json({
        success: true,
        data: unidadesFormatadas
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
            SELECT rne.unidade_escolar_id
            FROM rotas_nutricionistas_escolas rne
            INNER JOIN rotas_nutricionistas rn ON rne.rota_nutricionista_id = rn.id
            WHERE rn.usuario_id = ? 
              AND rn.status = 'ativo'
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

      // Formatar CEPs para exibição
      const unidadesFormatadas = formatarCEPs(unidades);

      res.json({
        success: true,
        data: unidadesFormatadas
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
