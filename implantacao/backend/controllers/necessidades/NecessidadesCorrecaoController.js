/**
 * Controller para correção de necessidades
 * Permite corrigir informações como semana de consumo, semana de abastecimento, etc.
 */

const { executeQuery } = require('../../config/database');

/**
 * Corrigir necessidade por necessidade_id
 * Permite atualizar semana_consumo, semana_abastecimento e outras informações
 */
const corrigirNecessidade = async (req, res) => {
  try {
    const { necessidade_id } = req.params;
    const { 
      semana_consumo, 
      semana_abastecimento,
      escola_id,
      escola_nome,
      escola_rota,
      grupos_selecionados // Array de grupos a serem corrigidos (null/undefined = todos)
    } = req.body;

    // Verificar se a necessidade existe
    const existing = await executeQuery(`
      SELECT DISTINCT necessidade_id, escola_id, escola, semana_consumo, semana_abastecimento
      FROM necessidades 
      WHERE necessidade_id = ?
      LIMIT 1
    `, [necessidade_id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Necessidade não encontrada',
        message: 'Necessidade não encontrada'
      });
    }

    // Verificar permissões - apenas coordenador/supervisor/admin podem corrigir
    const userType = req.user.tipo_de_acesso;
    const canEdit = ['coordenador', 'supervisor', 'administrador'].includes(userType);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
        message: 'Apenas coordenadores, supervisores ou administradores podem corrigir necessidades'
      });
    }

    // Construir query de atualização dinamicamente
    let updateFields = [];
    let updateValues = [];

    if (semana_consumo !== undefined && semana_consumo !== null) {
      updateFields.push('semana_consumo = ?');
      updateValues.push(semana_consumo);
    }

    if (semana_abastecimento !== undefined && semana_abastecimento !== null) {
      updateFields.push('semana_abastecimento = ?');
      updateValues.push(semana_abastecimento);
    }

    if (escola_id !== undefined && escola_id !== null) {
      updateFields.push('escola_id = ?');
      updateValues.push(escola_id);
    }

    if (escola_nome !== undefined && escola_nome !== null) {
      updateFields.push('escola = ?');
      updateValues.push(escola_nome);
    }

    if (escola_rota !== undefined && escola_rota !== null) {
      updateFields.push('escola_rota = ?');
      updateValues.push(escola_rota);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo para atualizar',
        message: 'Nenhum campo válido foi fornecido para atualização'
      });
    }

    // Sempre atualizar data_atualizacao
    updateFields.push('data_atualizacao = NOW()');

    // Construir WHERE clause
    let whereClause = 'necessidade_id = ?';
    updateValues.push(necessidade_id);

    // Se grupos_selecionados foi fornecido (array), filtrar apenas esses grupos
    if (grupos_selecionados && Array.isArray(grupos_selecionados) && grupos_selecionados.length > 0) {
      const placeholders = grupos_selecionados.map(() => '?').join(',');
      whereClause += ` AND grupo IN (${placeholders})`;
      updateValues.push(...grupos_selecionados);
    }

    // Atualizar necessidades (todos ou apenas grupos selecionados)
    const resultado = await executeQuery(`
      UPDATE necessidades 
      SET ${updateFields.join(', ')}
      WHERE ${whereClause}
    `, updateValues);

    res.json({
      success: true,
      message: 'Necessidade corrigida com sucesso',
      data: {
        necessidade_id,
        registros_atualizados: resultado.affectedRows
      }
    });
  } catch (error) {
    console.error('Erro ao corrigir necessidade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao corrigir necessidade'
    });
  }
};

/**
 * Buscar necessidade agrupada por necessidade_id para correção
 * Retorna todos os grupos dessa necessidade
 */
const buscarNecessidadeParaCorrecao = async (req, res) => {
  try {
    const { necessidade_id } = req.params;

    // Buscar uma necessidade representativa (todos os registros de uma necessidade_id têm os mesmos dados de cabeçalho)
    const necessidades = await executeQuery(`
      SELECT 
        necessidade_id,
        escola_id,
        escola,
        escola_rota,
        semana_consumo,
        semana_abastecimento,
        status,
        data_preenchimento,
        data_atualizacao,
        observacoes
      FROM necessidades
      WHERE necessidade_id = ?
      LIMIT 1
    `, [necessidade_id]);

    if (necessidades.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Necessidade não encontrada',
        message: 'Necessidade não encontrada'
      });
    }

    // Buscar todos os grupos distintos desta necessidade
    const grupos = await executeQuery(`
      SELECT DISTINCT 
        grupo,
        grupo_id
      FROM necessidades
      WHERE necessidade_id = ?
      AND grupo IS NOT NULL
      ORDER BY grupo ASC
    `, [necessidade_id]);

    // Buscar produtos relacionados agrupados por grupo
    const produtos = await executeQuery(`
      SELECT 
        id,
        produto_id,
        produto,
        produto_unidade,
        grupo,
        grupo_id,
        ajuste,
        total,
        status
      FROM necessidades
      WHERE necessidade_id = ?
      ORDER BY grupo ASC, produto ASC
    `, [necessidade_id]);

    res.json({
      success: true,
      data: {
        ...necessidades[0],
        total_produtos: produtos.length,
        grupos: grupos.map(g => ({ grupo: g.grupo, grupo_id: g.grupo_id })),
        produtos
      }
    });
  } catch (error) {
    console.error('Erro ao buscar necessidade para correção:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar necessidade'
    });
  }
};

/**
 * Excluir necessidade por necessidade_id (todos os produtos dessa necessidade)
 * Apenas administradores podem excluir
 */
const excluirNecessidade = async (req, res) => {
  try {
    const { necessidade_id } = req.params;

    // Verificar permissões - apenas administrador pode excluir
    const userType = req.user.tipo_de_acesso;
    if (userType !== 'administrador') {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
        message: 'Apenas administradores podem excluir necessidades'
      });
    }

    // Verificar se a necessidade existe
    const existing = await executeQuery(`
      SELECT COUNT(*) as total FROM necessidades 
      WHERE necessidade_id = ?
    `, [necessidade_id]);

    if (!existing || existing.length === 0 || existing[0].total === 0) {
      return res.status(404).json({
        success: false,
        error: 'Necessidade não encontrada',
        message: 'Necessidade não encontrada'
      });
    }

    // Excluir todos os produtos dessa necessidade_id
    const resultado = await executeQuery(`
      DELETE FROM necessidades 
      WHERE necessidade_id = ?
    `, [necessidade_id]);

    res.json({
      success: true,
      message: 'Necessidade excluída com sucesso',
      data: {
        necessidade_id,
        registros_excluidos: resultado.affectedRows
      }
    });
  } catch (error) {
    console.error('Erro ao excluir necessidade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir necessidade'
    });
  }
};

module.exports = {
  corrigirNecessidade,
  buscarNecessidadeParaCorrecao,
  excluirNecessidade
};
