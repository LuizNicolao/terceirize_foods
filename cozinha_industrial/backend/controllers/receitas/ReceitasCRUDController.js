const { executeQuery, executeTransaction } = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse, STATUS_CODES } = require('../../middleware/responseHandler');

/**
 * Controller CRUD para Receitas
 * Segue padrão de excelência do sistema
 */
class ReceitasCRUDController {
  /**
   * Criar nova receita
   */
  static async criar(req, res) {
    try {
      const {
        nome,
        descricao = null,
        filial_id = null,
        filial_nome = null,
        centro_custo_id = null,
        centro_custo_nome = null,
        tipo_receita = null,
        produtos = []
      } = req.body;

      const userId = req.user.id;

      // Validar campos obrigatórios
      if (!nome || nome.trim() === '') {
        return errorResponse(res, 'Nome da receita é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      // Gerar código da receita automaticamente
      const ultimaReceita = await executeQuery(
        'SELECT codigo FROM receitas ORDER BY id DESC LIMIT 1'
      );

      let proximoNumero = 1;
      if (ultimaReceita.length > 0) {
        const ultimoCodigo = ultimaReceita[0].codigo;
        if (ultimoCodigo && ultimoCodigo.startsWith('R')) {
          const numero = parseInt(ultimoCodigo.substring(1));
          if (!isNaN(numero)) {
            proximoNumero = numero + 1;
          }
        }
      }

      const codigo = `R${proximoNumero.toString().padStart(3, '0')}`;

      // Inserir receita
      const result = await executeQuery(
        `INSERT INTO receitas (
          codigo, nome, descricao, filial_id, filial_nome, centro_custo_id, centro_custo_nome, tipo_receita
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [codigo, nome, descricao, filial_id, filial_nome, centro_custo_id, centro_custo_nome, tipo_receita]
      );

      const receitaId = result.insertId;

      // Inserir produtos da receita
      if (produtos && produtos.length > 0) {
        const produtosQueries = produtos.map(produto => ({
          sql: `INSERT INTO receitas_produtos (
            receita_id, 
            produto_origem, 
            produto_origem_id,
            grupo_id,
            grupo_nome,
            subgrupo_id,
            subgrupo_nome,
            classe_id,
            classe_nome,
            percapta_sugerida
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            receitaId,
            produto.produto_origem || null, // Manter para compatibilidade
            produto.produto_origem_id || null,
            produto.grupo_id || null,
            produto.grupo_nome || null,
            produto.subgrupo_id || null,
            produto.subgrupo_nome || null,
            produto.classe_id || null,
            produto.classe_nome || null,
            produto.percapta_sugerida || null
          ]
        }));

        await executeTransaction(produtosQueries);
      }

      // Buscar receita completa criada
      const receitaCompleta = await ReceitasCRUDController.buscarReceitaCompleta(receitaId);

      return successResponse(
        res,
        receitaCompleta,
        'Receita criada com sucesso',
        STATUS_CODES.CREATED
      );

    } catch (error) {
      console.error('Erro ao criar receita:', error);
      return errorResponse(res, 'Erro ao criar receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar receita por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const receita = await ReceitasCRUDController.buscarReceitaCompleta(id);

      if (!receita) {
        return notFoundResponse(res, 'Receita não encontrada');
      }

      return successResponse(res, receita, 'Receita encontrada com sucesso', STATUS_CODES.OK);

    } catch (error) {
      console.error('Erro ao buscar receita:', error);
      return errorResponse(res, 'Erro ao buscar receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Atualizar receita
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        descricao,
        filial_id,
        filial_nome,
        centro_custo_id,
        centro_custo_nome,
        tipo_receita,
        produtos
      } = req.body;

      // Verificar se a receita existe
      const receitaExiste = await executeQuery(
        'SELECT id, codigo FROM receitas WHERE id = ?',
        [id]
      );

      if (receitaExiste.length === 0) {
        return notFoundResponse(res, 'Receita não encontrada');
      }

      // Atualizar receita
      const updateFields = [];
      const updateValues = [];

      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateValues.push(nome);
      }
      if (descricao !== undefined) {
        updateFields.push('descricao = ?');
        updateValues.push(descricao);
      }
      if (filial_id !== undefined) {
        updateFields.push('filial_id = ?');
        updateValues.push(filial_id);
      }
      if (filial_nome !== undefined) {
        updateFields.push('filial_nome = ?');
        updateValues.push(filial_nome);
      }
      if (centro_custo_id !== undefined) {
        updateFields.push('centro_custo_id = ?');
        updateValues.push(centro_custo_id);
      }
      if (centro_custo_nome !== undefined) {
        updateFields.push('centro_custo_nome = ?');
        updateValues.push(centro_custo_nome);
      }
      if (tipo_receita !== undefined) {
        updateFields.push('tipo_receita = ?');
        updateValues.push(tipo_receita);
      }

      if (updateFields.length > 0) {
        updateFields.push('data_atualizacao = NOW()');
        updateValues.push(id);

        await executeQuery(
          `UPDATE receitas SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Atualizar produtos da receita
      if (produtos !== undefined) {
        // Remover produtos existentes
        await executeQuery(
          'DELETE FROM receitas_produtos WHERE receita_id = ?',
          [id]
        );

        // Inserir novos produtos
        if (produtos && produtos.length > 0) {
          const produtosQueries = produtos.map(produto => ({
            sql: `INSERT INTO receitas_produtos (
              receita_id, 
              produto_origem, 
              produto_origem_id,
              grupo_id,
              grupo_nome,
              subgrupo_id,
              subgrupo_nome,
              classe_id,
              classe_nome,
              percapta_sugerida
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
              id,
              produto.produto_origem || null, // Manter para compatibilidade
              produto.produto_origem_id || null,
              produto.grupo_id || null,
              produto.grupo_nome || null,
              produto.subgrupo_id || null,
              produto.subgrupo_nome || null,
              produto.classe_id || null,
              produto.classe_nome || null,
              produto.percapta_sugerida || null
            ]
          }));

          await executeTransaction(produtosQueries);
        }
      }

      // Buscar receita atualizada
      const receitaAtualizada = await ReceitasCRUDController.buscarReceitaCompleta(id);

      return successResponse(
        res,
        receitaAtualizada,
        'Receita atualizada com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      return errorResponse(res, 'Erro ao atualizar receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Excluir receita
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a receita existe
      const receitaExiste = await executeQuery(
        'SELECT id FROM receitas WHERE id = ?',
        [id]
      );

      if (receitaExiste.length === 0) {
        return notFoundResponse(res, 'Receita não encontrada');
      }

      // Excluir produtos da receita primeiro
      await executeQuery(
        'DELETE FROM receitas_produtos WHERE receita_id = ?',
        [id]
      );

      // Excluir receita
      await executeQuery('DELETE FROM receitas WHERE id = ?', [id]);

      return successResponse(
        res,
        null,
        'Receita excluída com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      return errorResponse(res, 'Erro ao excluir receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Método auxiliar para buscar receita completa com produtos
   */
  static async buscarReceitaCompleta(id) {
    // Buscar receita - usar nomes salvos diretamente (sem JOIN necessário)
    const receitas = await executeQuery(
      `SELECT 
        id,
        codigo,
        nome,
        descricao,
        filial_id,
        filial_nome,
        centro_custo_id,
        centro_custo_nome,
        tipo_receita,
        data_cadastro,
        data_atualizacao
      FROM receitas
      WHERE id = ?`,
      [id]
    );

    if (receitas.length === 0) {
      return null;
    }

    const receita = receitas[0];

    // Buscar produtos da receita
    const produtos = await executeQuery(
      `SELECT 
        id,
        produto_origem,
        produto_origem_id,
        grupo_id,
        grupo_nome,
        subgrupo_id,
        subgrupo_nome,
        classe_id,
        classe_nome,
        percapta_sugerida
      FROM receitas_produtos
      WHERE receita_id = ?
      ORDER BY id`,
      [id]
    );

    receita.produtos = produtos;

    return receita;
  }
}

module.exports = ReceitasCRUDController;

