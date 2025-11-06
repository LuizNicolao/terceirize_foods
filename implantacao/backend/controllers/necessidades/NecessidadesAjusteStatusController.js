const { executeQuery } = require('../../config/database');

/**
 * Controller para transições de status de necessidades em ajuste
 */

// Liberar para coordenação
const liberarCoordenacao = async (req, res) => {
  try {
    const { escola_id, grupo, periodo } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !grupo) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios',
        message: 'escola_id e grupo são obrigatórios'
      });
    }

    // Atualizar status conforme fluxo:
    // NEC > NEC NUTRI > NEC COORD > NEC LOG > CONF NUTRI > CONF COORD > CONF
    // - De NEC -> NEC COORD: copiar ajuste para ajuste_nutricionista
    // - De NEC NUTRI -> NEC COORD: manter ajuste_nutricionista (já existe)
    // - De CONF NUTRI -> CONF COORD: manter ajuste_conf_nutri (já existe)
    // IMPORTANTE: Fazer em duas etapas para garantir que ajuste_nutricionista seja copiado ANTES de mudar o status
    // Primeiro: copiar ajuste para ajuste_nutricionista quando status = 'NEC' (só se ajuste_nutricionista estiver NULL)
    await executeQuery(`
      UPDATE necessidades 
      SET ajuste_nutricionista = ajuste
      WHERE escola_id = ? 
        AND status = 'NEC'
        AND (ajuste_nutricionista IS NULL OR ajuste_nutricionista = 0)
        AND produto_id IN (
          SELECT DISTINCT ppc.produto_id 
          FROM produtos_per_capita ppc
          WHERE ppc.grupo = ?
        )
    `, [escola_id, grupo]);

    // Segundo: copiar ajuste_logistica para ajuste_conf_nutri quando status = 'CONF NUTRI'
    // Isso preserva o valor da logística antes de liberar para coordenação
    await executeQuery(`
      UPDATE necessidades 
      SET ajuste_conf_nutri = COALESCE(ajuste_logistica, ajuste_coordenacao, ajuste_nutricionista, ajuste)
      WHERE escola_id = ? 
        AND status = 'CONF NUTRI'
        AND (ajuste_conf_nutri IS NULL OR ajuste_conf_nutri = 0)
        AND grupo = ?
    `, [escola_id, grupo]);

    // Terceiro: atualizar status
    let query = `
      UPDATE necessidades 
      SET status = CASE 
          WHEN status = 'NEC' THEN 'NEC COORD'
          WHEN status = 'NEC NUTRI' THEN 'NEC COORD'
          WHEN status = 'CONF NUTRI' THEN 'CONF COORD'
          ELSE status
        END,
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE escola_id = ? 
        AND status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
        AND grupo = ?
    `;

    const params = [escola_id, grupo];

    // Aplicar filtros de período se fornecidos
    if (periodo && periodo.consumo_de && periodo.consumo_ate) {
      query += ` AND semana_consumo BETWEEN ? AND ?`;
      params.push(periodo.consumo_de, periodo.consumo_ate);
    }

    const result = await executeQuery(query, params);

    res.json({
      success: true,
      message: 'Necessidades liberadas para coordenação',
      data: {
        affectedRows: result.affectedRows,
        status: 'NEC COORD'
      }
    });
  } catch (error) {
    console.error('Erro ao liberar para coordenação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao liberar para coordenação'
    });
  }
};

module.exports = {
  liberarCoordenacao
};

