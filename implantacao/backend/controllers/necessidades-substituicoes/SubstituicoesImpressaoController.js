const { executeQuery } = require('../../config/database');

/**
 * Controller para impressão de romaneio de substituições
 * Busca necessidades com status conf log para impressão
 */
class SubstituicoesImpressaoController {
  /**
   * Buscar dados para impressão de romaneio
   * Filtros obrigatórios: tipo_rota_id, rota_id, semana_abastecimento
   * Status: apenas 'conf log' (só pode imprimir necessidades que ainda não foram impressas)
   */
  static async buscarDadosImpressao(req, res) {
    try {
      const { grupo, semana_abastecimento, semana_consumo, tipo_rota_id, rota_id } = req.query;

      // Validar filtros obrigatórios
      if (!tipo_rota_id || !rota_id || !semana_abastecimento) {
        return res.status(400).json({
          success: false,
          message: 'Filtros obrigatórios: tipo_rota_id, rota_id e semana_abastecimento'
        });
      }

      // Buscar informações do tipo de rota e rota
      const tipoRotaInfo = await executeQuery(`
        SELECT tr.nome as tipo_rota_nome
        FROM foods_db.tipo_rota tr
        WHERE tr.id = ? AND tr.status = 'ativo'
      `, [tipo_rota_id]);

      if (tipoRotaInfo.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de rota não encontrado'
        });
      }

      const rotaInfo = await executeQuery(`
        SELECT r.nome as rota_nome, r.filial_id
        FROM foods_db.rotas r
        WHERE r.id = ? AND r.status = 'ativo'
      `, [rota_id]);

      if (rotaInfo.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rota não encontrada'
        });
      }

      // Buscar filial
      let filial = null;
      if (rotaInfo[0].filial_id) {
        const filialInfo = await executeQuery(`
          SELECT f.nome as filial_nome
          FROM foods_db.filiais f
          WHERE f.id = ?
        `, [rotaInfo[0].filial_id]);
        
        if (filialInfo.length > 0) {
          filial = filialInfo[0].filial_nome;
        }
      }

      // Construir condições WHERE - APENAS status 'conf log'
      let whereConditions = [
        'ns.ativo = 1',
        `ns.status = 'conf log'`,
        'ns.semana_abastecimento = ?',
        'ns.escola_id IN (SELECT DISTINCT ue.id FROM foods_db.unidades_escolares ue INNER JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0 WHERE r.id = ? AND r.tipo_rota_id = ? AND ue.status = \'ativo\' AND ue.rota_id IS NOT NULL AND ue.rota_id != \'\')'
      ];
      let params = [semana_abastecimento, rota_id, tipo_rota_id];

      if (grupo) {
        whereConditions.push('ns.grupo = ?');
        params.push(grupo);
      }

      if (semana_consumo) {
        whereConditions.push('ns.semana_consumo = ?');
        params.push(semana_consumo);
      }

      // Buscar produtos agrupados por produto origem
      const produtos = await executeQuery(`
        SELECT 
          ns.produto_generico_id as codigo,
          ns.produto_generico_codigo,
          ns.produto_generico_nome as descricao,
          ns.produto_generico_unidade as unidade,
          SUM(ns.quantidade_generico) as quantidade,
          ns.grupo
        FROM necessidades_substituicoes ns
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY ns.produto_generico_id, ns.produto_generico_codigo, 
                 ns.produto_generico_nome, ns.produto_generico_unidade, ns.grupo
        ORDER BY ns.produto_generico_nome ASC
      `, params);

      // Formatar resposta
      const response = {
        success: true,
        data: {
          // Informações do cabeçalho
          tipo_rota: tipoRotaInfo[0].tipo_rota_nome,
          rota: rotaInfo[0].rota_nome,
          filial: filial || '',
          semana_abastecimento: semana_abastecimento,
          semana_consumo: semana_consumo || null,
          
          // Produtos
          produtos: produtos.map(p => ({
            codigo: p.codigo || p.produto_generico_codigo || '',
            descricao: p.descricao || '',
            unidade: p.unidade || '',
            quantidade: parseFloat(p.quantidade) || 0,
            grupo: p.grupo || ''
          })),
          
          // Total de produtos
          total_produtos: produtos.length
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao buscar dados para impressão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar dados para impressão'
      });
    }
  }

  /**
   * Marcar como impresso (conf log → impressao)
   * Atualiza o status das necessidades_substituicoes para 'impressao'
   */
  static async marcarComoImpresso(req, res) {
    try {
      const { tipo_rota_id, rota_id, semana_abastecimento, semana_consumo, grupo } = req.body;
      const usuario_id = req.user.id;

      // Validar filtros obrigatórios
      if (!tipo_rota_id || !rota_id || !semana_abastecimento) {
        return res.status(400).json({
          success: false,
          message: 'Filtros obrigatórios: tipo_rota_id, rota_id e semana_abastecimento'
        });
      }

      // Construir condições WHERE
      let whereConditions = [
        'ativo = 1',
        `status = 'conf log'`,
        'semana_abastecimento = ?',
        'escola_id IN (SELECT DISTINCT ue.id FROM foods_db.unidades_escolares ue INNER JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0 WHERE r.id = ? AND r.tipo_rota_id = ? AND ue.status = \'ativo\' AND ue.rota_id IS NOT NULL AND ue.rota_id != \'\')'
      ];
      let params = [semana_abastecimento, rota_id, tipo_rota_id];

      if (grupo) {
        whereConditions.push('grupo = ?');
        params.push(grupo);
      }

      if (semana_consumo) {
        whereConditions.push('semana_consumo = ?');
        params.push(semana_consumo);
      }

      // Atualizar status para 'impressao'
      const result = await executeQuery(`
        UPDATE necessidades_substituicoes 
        SET 
          status = 'impressao',
          data_atualizacao = NOW()
        WHERE ${whereConditions.join(' AND ')}
      `, params);

      res.json({
        success: true,
        message: 'Status atualizado para impressão com sucesso',
        affectedRows: result.affectedRows
      });

    } catch (error) {
      console.error('Erro ao marcar como impresso:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao marcar como impresso'
      });
    }
  }
}

module.exports = SubstituicoesImpressaoController;

