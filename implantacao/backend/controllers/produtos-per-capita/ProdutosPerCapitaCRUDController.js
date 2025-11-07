const { executeQuery } = require('../../config/database');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

/**
 * Controller CRUD para Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
class ProdutosPerCapitaCRUDController {
  /**
   * Criar novo produto per capita
   */
  static async criar(req, res) {
    try {
      const {
        produto_id,
        produto_origem_id,
        produto_nome,
        produto_codigo,
        unidade_medida,
        grupo,
        subgrupo,
        classe,
        per_capita_parcial_manha = 0,
        per_capita_parcial_tarde = 0,
        per_capita_lanche_manha = 0,
        per_capita_lanche_tarde = 0,
        per_capita_almoco = 0,
        per_capita_eja = 0,
        descricao,
        ativo = 1
      } = req.body;

      const userId = req.user.id;

      // Validar campos obrigatórios
      if (!produto_id) {
        return res.status(400).json({
          error: 'Campos obrigatórios',
          message: 'Produto é obrigatório'
        });
      }

      // Nota: Validação de produto removida - agora produtos vêm do sistema Foods
      // A validação é feita no frontend através do FoodsApiService

      // Verificar se já existe per capita ativo para este produto
      const perCapitaExistente = await executeQuery(
        'SELECT id FROM produtos_per_capita WHERE produto_id = ? AND ativo = 1',
        [produto_id]
      );

      if (perCapitaExistente.length > 0) {
        return res.status(400).json({
          error: 'Per capita já existe',
          message: 'Já existe per capita ativo para este produto'
        });
      }

      // Converter undefined para null para evitar erro de bind parameters
      const insertParams = [
        produto_id,
        produto_origem_id !== undefined ? produto_origem_id : null,
        produto_nome !== undefined ? produto_nome : null,
        produto_codigo !== undefined ? produto_codigo : null,
        unidade_medida !== undefined ? unidade_medida : null,
        grupo !== undefined ? grupo : null,
        subgrupo !== undefined ? subgrupo : null,
        classe !== undefined ? classe : null,
        per_capita_parcial_manha !== undefined ? per_capita_parcial_manha : 0,
        per_capita_parcial_tarde !== undefined ? per_capita_parcial_tarde : 0,
        per_capita_lanche_manha !== undefined ? per_capita_lanche_manha : 0,
        per_capita_lanche_tarde !== undefined ? per_capita_lanche_tarde : 0,
        per_capita_almoco !== undefined ? per_capita_almoco : 0,
        per_capita_eja !== undefined ? per_capita_eja : 0,
        descricao !== undefined ? descricao : null,
        ativo !== undefined ? ativo : 1
      ];

      // Inserir novo produto per capita
      const result = await executeQuery(
        `INSERT INTO produtos_per_capita (
          produto_id, produto_origem_id, produto_nome, produto_codigo, 
          unidade_medida, grupo, subgrupo, classe,
          per_capita_parcial_manha, per_capita_parcial_tarde, per_capita_lanche_manha, 
          per_capita_lanche_tarde, per_capita_almoco, per_capita_eja, 
          descricao, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        insertParams
      );

      // Buscar dados completos do produto criado
      const novoProduto = await executeQuery(
        `SELECT 
          ppc.id,
          ppc.produto_id,
          ppc.produto_origem_id,
          ppc.produto_nome,
          ppc.produto_codigo,
          ppc.unidade_medida,
          ppc.grupo,
          ppc.subgrupo,
          ppc.classe,
          ppc.per_capita_parcial_manha,
          ppc.per_capita_parcial_tarde,
          ppc.per_capita_lanche_manha,
          ppc.per_capita_lanche_tarde,
          ppc.per_capita_almoco,
          ppc.per_capita_eja,
          ppc.descricao,
          ppc.ativo,
          ppc.data_cadastro,
          ppc.data_atualizacao
        FROM produtos_per_capita ppc
        WHERE ppc.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Produto per capita criado com sucesso',
        data: novoProduto[0]
      });

    } catch (error) {
      console.error('Erro ao criar produto per capita:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao criar produto per capita'
      });
    }
  }

  /**
   * Buscar produto per capita por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const produto = await executeQuery(
        `SELECT 
          ppc.id,
          ppc.produto_id,
          ppc.produto_origem_id,
          ppc.produto_nome,
          ppc.produto_codigo,
          ppc.unidade_medida,
          ppc.grupo,
          ppc.subgrupo,
          ppc.classe,
          ppc.per_capita_parcial_manha,
          ppc.per_capita_parcial_tarde,
          ppc.per_capita_lanche_manha,
          ppc.per_capita_lanche_tarde,
          ppc.per_capita_almoco,
          ppc.per_capita_eja,
          ppc.descricao,
          ppc.ativo,
          ppc.data_cadastro,
          ppc.data_atualizacao
        FROM produtos_per_capita ppc
        WHERE ppc.id = ?`,
        [id]
      );

      if (produto.length === 0) {
        return res.status(404).json({
          error: 'Produto não encontrado',
          message: 'Produto per capita não encontrado'
        });
      }

      res.json({
        success: true,
        data: produto[0]
      });

    } catch (error) {
      console.error('Erro ao buscar produto per capita:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar produto per capita'
      });
    }
  }

  /**
   * Atualizar produto per capita
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        produto_id,
        per_capita_parcial_manha,
        per_capita_parcial_tarde,
        per_capita_lanche_manha,
        per_capita_lanche_tarde,
        per_capita_almoco,
        per_capita_eja,
        descricao,
        ativo
      } = req.body;

      const userId = req.user.id;

      // Verificar se o produto existe
      const produtoExiste = await executeQuery(
        'SELECT id, produto_id FROM produtos_per_capita WHERE id = ?',
        [id]
      );

      if (produtoExiste.length === 0) {
        return res.status(404).json({
          error: 'Produto não encontrado',
          message: 'Produto per capita não encontrado'
        });
      }

      // Se mudou o produto, verificar se já existe per capita ativo para o novo produto
      if (produto_id && produto_id !== produtoExiste[0].produto_id) {
        const perCapitaExistente = await executeQuery(
          'SELECT id FROM produtos_per_capita WHERE produto_id = ? AND ativo = 1 AND id != ?',
          [produto_id, id]
        );

        if (perCapitaExistente.length > 0) {
          return res.status(400).json({
            error: 'Per capita já existe',
            message: 'Já existe per capita ativo para este produto'
          });
        }
      }

      // Converter undefined para null para evitar erro de bind parameters
      const params = [
        produto_id !== undefined ? produto_id : null,
        per_capita_parcial_manha !== undefined ? per_capita_parcial_manha : null,
        per_capita_parcial_tarde !== undefined ? per_capita_parcial_tarde : null,
        per_capita_lanche_manha !== undefined ? per_capita_lanche_manha : null,
        per_capita_lanche_tarde !== undefined ? per_capita_lanche_tarde : null,
        per_capita_almoco !== undefined ? per_capita_almoco : null,
        per_capita_eja !== undefined ? per_capita_eja : null,
        descricao !== undefined ? descricao : null,
        ativo !== undefined ? ativo : null,
        id
      ];

      // Atualizar produto per capita
      await executeQuery(
        `UPDATE produtos_per_capita SET 
          produto_id = COALESCE(?, produto_id),
          per_capita_parcial_manha = COALESCE(?, per_capita_parcial_manha),
          per_capita_parcial_tarde = COALESCE(?, per_capita_parcial_tarde),
          per_capita_lanche_manha = COALESCE(?, per_capita_lanche_manha),
          per_capita_lanche_tarde = COALESCE(?, per_capita_lanche_tarde),
          per_capita_almoco = COALESCE(?, per_capita_almoco),
          per_capita_eja = COALESCE(?, per_capita_eja),
          descricao = COALESCE(?, descricao),
          ativo = COALESCE(?, ativo),
          data_atualizacao = NOW()
        WHERE id = ?`,
        params
      );

      // Buscar dados atualizados
      const produtoAtualizado = await executeQuery(
        `SELECT 
          ppc.id,
          ppc.produto_id,
          ppc.per_capita_parcial_manha,
          ppc.per_capita_parcial_tarde,
          ppc.per_capita_lanche_manha,
          ppc.per_capita_lanche_tarde,
          ppc.per_capita_almoco,
          ppc.per_capita_eja,
          ppc.descricao,
          ppc.ativo,
          ppc.data_cadastro,
          ppc.data_atualizacao
        FROM produtos_per_capita ppc
        WHERE ppc.id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: 'Produto per capita atualizado com sucesso',
        data: produtoAtualizado[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar produto per capita:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao atualizar produto per capita'
      });
    }
  }

  /**
   * Excluir produto per capita
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o produto existe
      const produtoExiste = await executeQuery(
        `SELECT 
          ppc.id,
          ppc.produto_id
        FROM produtos_per_capita ppc
        WHERE ppc.id = ?`,
        [id]
      );

      if (produtoExiste.length === 0) {
        return res.status(404).json({
          error: 'Produto não encontrado',
          message: 'Produto per capita não encontrado'
        });
      }

      // Excluir produto per capita
      await executeQuery('DELETE FROM produtos_per_capita WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Produto per capita excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir produto per capita:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao excluir produto per capita'
      });
    }
  }
}

module.exports = ProdutosPerCapitaCRUDController;
