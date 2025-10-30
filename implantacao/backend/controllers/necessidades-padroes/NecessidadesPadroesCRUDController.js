const { executeQuery, pool } = require('../../config/database');
const { successResponse, errorResponse } = require('../../middleware/responseHandler');

class NecessidadesPadroesCRUDController {
  /**
   * Buscar padrão por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          np.id,
          np.escola_id,
          np.grupo_id,
          np.produto_id,
          np.quantidade,
          np.data_criacao,
          np.data_atualizacao,
          np.usuario_id,
          e.nome as escola_nome,
          g.nome as grupo_nome,
          po.nome as produto_nome,
          po.codigo as produto_codigo,
          um.sigla as unidade_medida,
          u.nome as usuario_nome
        FROM necessidades_padroes np
        LEFT JOIN foods_db.unidades_escolares e ON np.escola_id = e.id
        LEFT JOIN foods_db.grupos g ON np.grupo_id = g.id
        LEFT JOIN foods_db.produto_origem po ON np.produto_id = po.id
        LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
        LEFT JOIN usuarios u ON np.usuario_id = u.id
        WHERE np.id = ? AND np.ativo = 1
      `;

      const resultados = await executeQuery(query, [id]);

      if (resultados.length === 0) {
        return errorResponse(res, 'Padrão não encontrado', 404);
      }

      return successResponse(res, resultados[0], 'Padrão encontrado com sucesso');
    } catch (error) {
      console.error('Erro ao buscar padrão:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  /**
   * Criar novo padrão
   */
  static async criar(req, res) {
    try {
      const { escola_id, grupo_id, produto_id, quantidade } = req.body;
      const usuario_id = req.user?.id;

      // Verificar se já existe padrão para esta combinação
      const existeQuery = `
        SELECT id FROM necessidades_padroes 
        WHERE escola_id = ? AND grupo_id = ? AND produto_id = ? AND ativo = 1
      `;
      const existe = await executeQuery(existeQuery, [escola_id, grupo_id, produto_id]);

      if (existe.length > 0) {
        return errorResponse(res, 'Já existe um padrão para esta escola, grupo e produto', 409);
      }

      const insertQuery = `
        INSERT INTO necessidades_padroes (escola_id, grupo_id, produto_id, quantidade, usuario_id)
        VALUES (?, ?, ?, ?, ?)
      `;

      const resultado = await executeQuery(insertQuery, [escola_id, grupo_id, produto_id, quantidade, usuario_id]);

      return successResponse(res, { id: resultado.insertId }, 'Padrão criado com sucesso', 201);
    } catch (error) {
      console.error('Erro ao criar padrão:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  /**
   * Atualizar padrão
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;

      const updateQuery = `
        UPDATE necessidades_padroes 
        SET quantidade = ?, data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ? AND ativo = 1
      `;

      const resultado = await executeQuery(updateQuery, [quantidade, id]);

      if (resultado.affectedRows === 0) {
        return errorResponse(res, 'Padrão não encontrado', 404);
      }

      return successResponse(res, { id }, 'Padrão atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar padrão:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  /**
   * Excluir padrão (soft delete)
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      const updateQuery = `
        UPDATE necessidades_padroes 
        SET ativo = 0, data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ? AND ativo = 1
      `;

      const resultado = await executeQuery(updateQuery, [id]);

      if (resultado.affectedRows === 0) {
        return errorResponse(res, 'Padrão não encontrado', 404);
      }

      return successResponse(res, { id }, 'Padrão excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir padrão:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }

  /**
   * Salvar padrão completo (múltiplos produtos)
   */
  static async salvarPadrao(req, res) {
    const connection = await pool.getConnection();
    
    try {
      const { escola_id, grupo_id, produtos } = req.body;
      const usuario_id = req.user?.id;

      // Iniciar transação
      await connection.beginTransaction();

      try {
        // Buscar dados para preencher os nomes
        const [escolaData] = await connection.execute(
          'SELECT nome_escola FROM foods_db.unidades_escolares WHERE id = ?',
          [escola_id]
        );
        const [grupoData] = await connection.execute(
          'SELECT nome FROM foods_db.grupos WHERE id = ?',
          [grupo_id]
        );

        // Inserir/atualizar padrões com nomes
        for (const produto of produtos) {
          // Buscar dados do produto
          const [produtoData] = await connection.execute(
            `SELECT po.nome, um.sigla 
             FROM foods_db.produto_origem po 
             LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id 
             WHERE po.id = ?`,
            [produto.produto_id]
          );

          const insertQuery = `
            INSERT INTO necessidades_padroes 
            (escola_id, grupo_id, produto_id, quantidade, usuario_id, escola_nome, grupo_nome, produto_nome, unidade_medida_sigla, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
              quantidade = VALUES(quantidade),
              usuario_id = VALUES(usuario_id),
              escola_nome = VALUES(escola_nome),
              grupo_nome = VALUES(grupo_nome),
              produto_nome = VALUES(produto_nome),
              unidade_medida_sigla = VALUES(unidade_medida_sigla),
              ativo = 1,
              updated_at = NOW()
          `;
          
          await connection.execute(insertQuery, [
            escola_id, 
            grupo_id, 
            produto.produto_id, 
            produto.quantidade, 
            usuario_id,
            escolaData[0]?.nome_escola || '',
            grupoData[0]?.nome || '',
            produtoData[0]?.nome || '',
            produtoData[0]?.sigla || ''
          ]);
        }

        // Confirmar transação
        await connection.commit();

        return successResponse(res, { escola_id, grupo_id, produtos_salvos: produtos.length }, 'Padrão salvo com sucesso');
      } catch (error) {
        // Reverter transação em caso de erro
        await connection.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar padrão:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    } finally {
      connection.release();
    }
  }
}

module.exports = NecessidadesPadroesCRUDController;
