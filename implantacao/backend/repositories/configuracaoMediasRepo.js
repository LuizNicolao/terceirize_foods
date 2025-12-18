const { executeQuery } = require('../config/database');

class ConfiguracaoMediasRepository {
  static async obterPorAno(ano) {
    const query = `
      SELECT id, ano, mes, ativo
      FROM configuracao_medias_meses
      WHERE ano = ?
      ORDER BY mes ASC
    `;
    return executeQuery(query, [ano]);
  }

  static async salvarConfiguracao(ano, mesesAtivos) {
    const { pool } = require('../config/database');
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Desativar todos os meses do ano
      await connection.execute(
        'UPDATE configuracao_medias_meses SET ativo = 0 WHERE ano = ?',
        [ano]
      );

      // Ativar meses selecionados
      if (mesesAtivos.length > 0) {
        const query = `
          INSERT INTO configuracao_medias_meses (ano, mes, ativo)
          VALUES ${mesesAtivos.map(() => '(?, ?, 1)').join(', ')}
          ON DUPLICATE KEY UPDATE ativo = 1
        `;
        const params = mesesAtivos.flatMap(mes => [ano, mes]);
        await connection.execute(query, params);
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async obterMesesAtivos(ano) {
    const query = `
      SELECT mes
      FROM configuracao_medias_meses
      WHERE ano = ? AND ativo = 1
      ORDER BY mes ASC
    `;
    const resultados = await executeQuery(query, [ano]);
    return resultados.map(r => r.mes);
  }

  static async recalcularMedias(escolaId = null) {
    const { pool } = require('../config/database');
    const connection = await pool.getConnection();
    
    try {
      let escolasIds = [];
      
      if (escolaId) {
        // Recalcular apenas para uma escola específica
        escolasIds = [escolaId];
      } else {
        // Buscar todas as escolas que têm registros ativos usando a mesma conexão
        const [escolasComRegistros] = await connection.execute(`
          SELECT DISTINCT escola_id
          FROM registros_diarios
          WHERE ativo = 1
        `);
        escolasIds = escolasComRegistros.map(e => e.escola_id);
      }

      const resultados = [];
      
      for (const id of escolasIds) {
        try {
          await connection.execute('CALL recalcular_media_escola(?)', [id]);
          resultados.push({ escola_id: id, sucesso: true });
        } catch (error) {
          console.error(`Erro ao recalcular média para escola ${id}:`, error);
          resultados.push({ escola_id: id, sucesso: false, erro: error.message });
        }
      }

      return {
        total: escolasIds.length,
        sucesso: resultados.filter(r => r.sucesso).length,
        falhas: resultados.filter(r => !r.sucesso).length,
        detalhes: resultados
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = ConfiguracaoMediasRepository;

