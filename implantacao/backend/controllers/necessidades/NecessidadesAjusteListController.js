const { executeQuery } = require('../../config/database');
const { aplicarFiltroNutricionista } = require('./utils/ajusteUtils');

/**
 * Controller para listagem de necessidades para ajuste
 */

// Listar necessidades para ajuste (status = 'NEC')
const listarParaAjuste = async (req, res) => {
  try {
    const { escola_id, grupo, semana_consumo, semana_abastecimento } = req.query;
    const tipo_usuario = req.user.tipo_de_acesso;

    // Construir query baseada no tipo de usuário
    let query = `
      SELECT 
        n.id,
        n.produto_id,
        n.codigo_teknisa,
        n.produto,
        n.produto_unidade,
        n.ajuste,
        n.ajuste_nutricionista,
        n.ajuste_coordenacao,
        n.ajuste_logistica,
        n.ajuste_conf_nutri,
        n.ajuste_conf_coord,
        n.ajuste_anterior,
        n.necessidade_id,
        n.escola_id,
        n.escola,
        n.semana_consumo,
        n.semana_abastecimento,
        n.status,
        n.data_preenchimento,
        COALESCE(ppc.produto_codigo, po.codigo, '') as produto_codigo
      FROM necessidades n
      LEFT JOIN produtos_per_capita ppc ON ppc.produto_id = n.produto_id 
        AND ppc.grupo COLLATE utf8mb4_unicode_ci = n.grupo COLLATE utf8mb4_unicode_ci
        AND ppc.ativo = true
      LEFT JOIN foods_db.produto_origem po ON po.id = n.produto_id
      WHERE n.status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
    `;

    let params = [];

    // Se for nutricionista, filtrar apenas pelas escolas da rota dela
    if (tipo_usuario === 'nutricionista') {
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      const result = await aplicarFiltroNutricionista(
        tipo_usuario,
        req.user.email,
        authToken,
        query,
        params
      );
      query = result.query;
      params = result.params;
    }

    // Aplicar filtros opcionais se fornecidos
    if (escola_id) {
      query += ` AND n.escola_id = ?`;
      params.push(escola_id);
    }

    if (grupo) {
      // Usar filtro direto por grupo ou grupo_id (já salvos na tabela necessidades)
      // Tenta primeiro por grupo (nome) e depois por grupo_id (caso seja um ID)
      const grupoId = parseInt(grupo);
      if (!isNaN(grupoId)) {
        // Se grupo for um número, filtrar por grupo_id
        query += ` AND n.grupo_id = ?`;
        params.push(grupoId);
      } else {
        // Se grupo for texto, filtrar por grupo (nome)
        query += ` AND n.grupo = ?`;
        params.push(grupo);
      }
    }

    // Filtros opcionais por período
    if (semana_consumo) {
      query += ` AND n.semana_consumo = ?`;
      params.push(semana_consumo);
    }

    if (semana_abastecimento) {
      // Usar LIKE para comparação flexível, pois a formatação pode ter pequenas variações
      query += ` AND (n.semana_abastecimento = ? OR n.semana_abastecimento LIKE ?)`;
      params.push(semana_abastecimento, `%${semana_abastecimento.replace(/[()]/g, '')}%`);
    }

    query += ` ORDER BY n.produto ASC`;

    const necessidades = await executeQuery(query, params);

    res.json({
      success: true,
      data: necessidades
    });
  } catch (error) {
    console.error('Erro ao listar necessidades para ajuste:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao listar necessidades para ajuste'
    });
  }
};

module.exports = {
  listarParaAjuste
};

