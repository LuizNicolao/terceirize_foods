/**
 * Utilitários para construção de filtros SQL
 * Funções compartilhadas para construção de condições WHERE
 */

/**
 * Construir filtro de tipo de rota
 */
const construirFiltroTipoRota = (tipo_rota_id) => {
  if (!tipo_rota_id) return { condition: '', params: [] };

  const condition = `escola_id IN (
    SELECT DISTINCT ue.id
    FROM foods_db.unidades_escolares ue
    INNER JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0
    WHERE r.tipo_rota_id = ?
      AND ue.status = 'ativo'
      AND ue.rota_id IS NOT NULL
      AND ue.rota_id != ''
  )`;

  return { condition, params: [tipo_rota_id] };
};

/**
 * Construir filtro de rota específica
 */
const construirFiltroRota = (rota_id) => {
  if (!rota_id) return { condition: '', params: [] };

  const condition = `escola_id IN (
    SELECT DISTINCT ue.id
    FROM foods_db.unidades_escolares ue
    WHERE FIND_IN_SET(?, ue.rota_id) > 0
      AND ue.status = 'ativo'
      AND ue.rota_id IS NOT NULL
      AND ue.rota_id != ''
  )`;

  return { condition, params: [rota_id] };
};

/**
 * Construir condições WHERE para subqueries
 */
const construirCondicoesSubquery = (filtros) => {
  const { grupo, semana_abastecimento, semana_consumo, tipo_rota_id, rota_id } = filtros;
  
  const conditionsNS = [];
  const conditionsN = [];
  const params = [];

  if (grupo) {
    conditionsNS.push('ns.grupo = ?');
    conditionsN.push('n.grupo = ?');
    params.push(grupo);
  }

  if (semana_abastecimento) {
    conditionsNS.push('ns.semana_abastecimento = ?');
    conditionsN.push('n.semana_abastecimento = ?');
    params.push(semana_abastecimento);
  }

  if (semana_consumo) {
    conditionsNS.push('ns.semana_consumo = ?');
    conditionsN.push('n.semana_consumo = ?');
    params.push(semana_consumo);
  }

  if (tipo_rota_id) {
    const condition = `escola_id IN (
      SELECT DISTINCT ue.id
      FROM foods_db.unidades_escolares ue
      INNER JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0
      WHERE r.tipo_rota_id = ?
        AND ue.status = 'ativo'
        AND ue.rota_id IS NOT NULL
        AND ue.rota_id != ''
    )`;
    conditionsNS.push(`ns.${condition}`);
    conditionsN.push(`n.${condition}`);
    params.push(tipo_rota_id);
  }

  if (rota_id) {
    const condition = `escola_id IN (
      SELECT DISTINCT ue.id
      FROM foods_db.unidades_escolares ue
      WHERE FIND_IN_SET(?, ue.rota_id) > 0
        AND ue.status = 'ativo'
        AND ue.rota_id IS NOT NULL
        AND ue.rota_id != ''
    )`;
    conditionsNS.push(`ns.${condition}`);
    conditionsN.push(`n.${condition}`);
    params.push(rota_id);
  }

  const whereNS = conditionsNS.length > 0 ? ` AND ${conditionsNS.join(' AND ')}` : '';
  const whereN = conditionsN.length > 0 ? ` AND ${conditionsN.join(' AND ')}` : '';

  return { whereNS, whereN, params };
};

module.exports = {
  construirFiltroTipoRota,
  construirFiltroRota,
  construirCondicoesSubquery
};

