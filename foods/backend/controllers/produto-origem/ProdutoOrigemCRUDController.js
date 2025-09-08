/**
 * Controller CRUD de Produto Origem
 * Responsável por operações de Create, Update e Delete
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { gerarCodigoProdutoOrigem } = require('../../utils/codigoGenerator');

class ProdutoOrigemCRUDController {
  
  /**
   * Criar novo produto origem
   */
  static criarProdutoOrigem = asyncHandler(async (req, res) => {
    const {
      nome, unidade_medida_id, fator_conversao, grupo_id, subgrupo_id, 
      classe_id, peso_liquido, referencia_mercado, produto_generico_padrao_id, status
    } = req.body;

    // Verificar se unidade de medida existe
    const unidade = await executeQuery(
      'SELECT id FROM unidades_medida WHERE id = ?',
      [unidade_medida_id]
    );

    if (unidade.length === 0) {
      return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se grupo existe (se fornecido)
    if (grupo_id) {
      const grupo = await executeQuery(
        'SELECT id FROM grupos WHERE id = ?',
        [grupo_id]
      );

      if (grupo.length === 0) {
        return errorResponse(res, 'Grupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se subgrupo existe (se fornecido)
    if (subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id FROM subgrupos WHERE id = ?',
        [subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return errorResponse(res, 'Subgrupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se classe existe (se fornecida)
    if (classe_id) {
      const classe = await executeQuery(
        'SELECT id FROM classes WHERE id = ?',
        [classe_id]
      );

      if (classe.length === 0) {
        return errorResponse(res, 'Classe não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se produto genérico padrão existe (se fornecido)
    if (produto_generico_padrao_id) {
      const produtoGenerico = await executeQuery(
        'SELECT id FROM produto_generico WHERE id = ?',
        [produto_generico_padrao_id]
      );

      if (produtoGenerico.length === 0) {
        return errorResponse(res, 'Produto genérico padrão não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Gerar código temporário primeiro
    const codigoTemporario = `TEMP-${Date.now()}`;

    // Inserir produto origem com código temporário
    const result = await executeQuery(
      `INSERT INTO produto_origem (
        codigo, nome, unidade_medida_id, fator_conversao, grupo_id, subgrupo_id, 
        classe_id, peso_liquido, referencia_mercado, produto_generico_padrao_id, 
        status, usuario_criador_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigoTemporario, nome, unidade_medida_id, fator_conversao || 1.000, grupo_id, subgrupo_id,
        classe_id, peso_liquido, referencia_mercado, produto_generico_padrao_id,
        status !== undefined ? status : 1, req.user.id
      ]
    );

    // Gerar código de vitrine baseado no ID inserido
    const codigoVitrine = gerarCodigoProdutoOrigem(result.insertId);

    // Atualizar o registro com o código de vitrine
    await executeQuery(
      'UPDATE produto_origem SET codigo = ? WHERE id = ?',
      [codigoVitrine, result.insertId]
    );

    const novoProdutoOrigem = await executeQuery(
      `SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        pg.nome as produto_generico_padrao_nome,
        pg.codigo as produto_generico_padrao_codigo,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN produto_generico pg ON po.produto_generico_padrao_id = pg.id
      LEFT JOIN usuarios uc ON po.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON po.usuario_atualizador_id = ua.id
      WHERE po.id = ?`,
      [result.insertId]
    );

    successResponse(res, novoProdutoOrigem[0], 'Produto origem criado com sucesso');
  });

  /**
   * Atualizar produto origem
   */
  static atualizarProdutoOrigem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      codigo, nome, unidade_medida_id, fator_conversao, grupo_id, subgrupo_id, 
      classe_id, peso_liquido, referencia_mercado, produto_generico_padrao_id, status
    } = req.body;

    // Verificar se produto origem existe
    const produtoOrigem = await executeQuery(
      'SELECT id FROM produto_origem WHERE id = ?',
      [id]
    );

    if (produtoOrigem.length === 0) {
      return notFoundResponse(res, 'Produto origem não encontrado');
    }



    // Verificar se unidade de medida existe
    if (unidade_medida_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [unidade_medida_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se grupo existe (se fornecido)
    if (grupo_id) {
      const grupo = await executeQuery(
        'SELECT id FROM grupos WHERE id = ?',
        [grupo_id]
      );

      if (grupo.length === 0) {
        return errorResponse(res, 'Grupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se subgrupo existe (se fornecido)
    if (subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id FROM subgrupos WHERE id = ?',
        [subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return errorResponse(res, 'Subgrupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se classe existe (se fornecida)
    if (classe_id) {
      const classe = await executeQuery(
        'SELECT id FROM classes WHERE id = ?',
        [classe_id]
      );

      if (classe.length === 0) {
        return errorResponse(res, 'Classe não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se produto genérico padrão existe (se fornecido)
    if (produto_generico_padrao_id) {
      const produtoGenerico = await executeQuery(
        'SELECT id FROM produto_generico WHERE id = ?',
        [produto_generico_padrao_id]
      );

      if (produtoGenerico.length === 0) {
        return errorResponse(res, 'Produto genérico padrão não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Atualizar produto origem
    await executeQuery(
      `UPDATE produto_origem SET 
        codigo = ?, nome = ?, unidade_medida_id = ?, fator_conversao = ?, 
        grupo_id = ?, subgrupo_id = ?, classe_id = ?, peso_liquido = ?, 
        referencia_mercado = ?, produto_generico_padrao_id = ?, status = ?, 
        usuario_atualizador_id = ?
      WHERE id = ?`,
      [
        codigo, nome, unidade_medida_id, fator_conversao, grupo_id, subgrupo_id,
        classe_id, peso_liquido, referencia_mercado, produto_generico_padrao_id,
        status, req.user.id, id
      ]
    );

    // Buscar produto origem atualizado
    const produtoOrigemAtualizado = await executeQuery(
      `SELECT 
        po.*,
        um.nome as unidade_medida_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        pg.nome as produto_generico_padrao_nome,
        pg.codigo as produto_generico_padrao_codigo,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_origem po
      LEFT JOIN unidades_medida um ON po.unidade_medida_id = um.id
      LEFT JOIN grupos g ON po.grupo_id = g.id
      LEFT JOIN subgrupos sg ON po.subgrupo_id = sg.id
      LEFT JOIN classes c ON po.classe_id = c.id
      LEFT JOIN produto_generico pg ON po.produto_generico_padrao_id = pg.id
      LEFT JOIN usuarios uc ON po.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON po.usuario_atualizador_id = ua.id
      WHERE po.id = ?`,
      [id]
    );

    successResponse(res, produtoOrigemAtualizado[0], 'Produto origem atualizado com sucesso');
  });

  /**
   * Excluir produto origem (soft delete)
   */
  static excluirProdutoOrigem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se produto origem existe
    const produtoOrigem = await executeQuery(
      'SELECT id, nome FROM produto_origem WHERE id = ?',
      [id]
    );

    if (produtoOrigem.length === 0) {
      return notFoundResponse(res, 'Produto origem não encontrado');
    }

    // Soft delete - apenas desativar
    await executeQuery(
      'UPDATE produto_origem SET status = 0, usuario_atualizador_id = ? WHERE id = ?',
      [req.user.id, id]
    );

    successResponse(res, { id, nome: produtoOrigem[0].nome }, 'Produto origem excluído com sucesso');
  });
}

module.exports = ProdutoOrigemCRUDController;
