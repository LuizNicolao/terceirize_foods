/**
 * Controller CRUD de Produto Comercial
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
const { gerarCodigoProdutoComercial } = require('../../utils/codigoGenerator');

class ProdutoComercialCRUDController {
  
  /**
   * Criar novo produto comercial
   */
  static criarProdutoComercial = asyncHandler(async (req, res) => {
    const {
      nome_comercial, unidade_medida_id, grupo_id, subgrupo_id, 
      classe_id, status
    } = req.body;

    // Verificar se unidade de medida existe
    const unidade = await executeQuery(
      'SELECT id FROM unidades_medida WHERE id = ?',
      [unidade_medida_id]
    );

    if (unidade.length === 0) {
      return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se grupo existe (se fornecido) e é do tipo venda
    if (grupo_id) {
      const grupo = await executeQuery(
        'SELECT id, tipo FROM grupos WHERE id = ?',
        [grupo_id]
      );

      if (grupo.length === 0) {
        return errorResponse(res, 'Grupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }

      // Verificar se o grupo é do tipo venda
      if (grupo[0].tipo && grupo[0].tipo.toLowerCase() !== 'venda') {
        return errorResponse(res, 'Grupo deve ser do tipo "Venda"', STATUS_CODES.BAD_REQUEST);
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

    // Gerar código temporário primeiro
    const codigoTemporario = `TEMP-${Date.now()}`;

    // Inserir produto comercial com código temporário
    const result = await executeQuery(
      `INSERT INTO produto_comercial (
        codigo, nome_comercial, unidade_medida_id, grupo_id, subgrupo_id, 
        classe_id, status, usuario_criador_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigoTemporario, nome_comercial, unidade_medida_id, grupo_id, subgrupo_id,
        classe_id, status !== undefined ? status : 1, req.user.id
      ]
    );

    // Gerar código de vitrine baseado no ID inserido
    const codigoVitrine = gerarCodigoProdutoComercial(result.insertId);

    // Atualizar o registro com o código de vitrine
    await executeQuery(
      'UPDATE produto_comercial SET codigo = ? WHERE id = ?',
      [codigoVitrine, result.insertId]
    );

    const novoProdutoComercial = await executeQuery(
      `SELECT 
        pc.*,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_comercial pc
      LEFT JOIN unidades_medida um ON pc.unidade_medida_id = um.id
      LEFT JOIN grupos g ON pc.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pc.subgrupo_id = sg.id
      LEFT JOIN classes c ON pc.classe_id = c.id
      LEFT JOIN usuarios uc ON pc.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON pc.usuario_atualizador_id = ua.id
      WHERE pc.id = ?`,
      [result.insertId]
    );

    successResponse(res, novoProdutoComercial[0], 'Produto comercial criado com sucesso');
  });

  /**
   * Atualizar produto comercial
   */
  static atualizarProdutoComercial = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      codigo, nome_comercial, unidade_medida_id, grupo_id, subgrupo_id, 
      classe_id, status
    } = req.body;

    // Verificar se produto comercial existe
    const produtoComercial = await executeQuery(
      'SELECT id FROM produto_comercial WHERE id = ?',
      [id]
    );

    if (produtoComercial.length === 0) {
      return notFoundResponse(res, 'Produto comercial não encontrado');
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

    // Verificar se grupo existe (se fornecido) e é do tipo venda
    if (grupo_id) {
      const grupo = await executeQuery(
        'SELECT id, tipo FROM grupos WHERE id = ?',
        [grupo_id]
      );

      if (grupo.length === 0) {
        return errorResponse(res, 'Grupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }

      // Verificar se o grupo é do tipo venda
      if (grupo[0].tipo && grupo[0].tipo.toLowerCase() !== 'venda') {
        return errorResponse(res, 'Grupo deve ser do tipo "Venda"', STATUS_CODES.BAD_REQUEST);
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

    // Atualizar produto comercial
    await executeQuery(
      `UPDATE produto_comercial SET 
        codigo = ?, nome_comercial = ?, unidade_medida_id = ?, 
        grupo_id = ?, subgrupo_id = ?, classe_id = ?, status = ?, 
        usuario_atualizador_id = ?
      WHERE id = ?`,
      [
        codigo, nome_comercial, unidade_medida_id, grupo_id, subgrupo_id,
        classe_id, status, req.user.id, id
      ]
    );

    // Buscar produto comercial atualizado
    const produtoComercialAtualizado = await executeQuery(
      `SELECT 
        pc.*,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_comercial pc
      LEFT JOIN unidades_medida um ON pc.unidade_medida_id = um.id
      LEFT JOIN grupos g ON pc.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pc.subgrupo_id = sg.id
      LEFT JOIN classes c ON pc.classe_id = c.id
      LEFT JOIN usuarios uc ON pc.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON pc.usuario_atualizador_id = ua.id
      WHERE pc.id = ?`,
      [id]
    );

    successResponse(res, produtoComercialAtualizado[0], 'Produto comercial atualizado com sucesso');
  });

  /**
   * Obter próximo código disponível
   */
  static obterProximoCodigo = asyncHandler(async (req, res) => {
    // Buscar o maior ID atual e adicionar 1
    const maxIdResult = await executeQuery(
      'SELECT MAX(id) as maxId FROM produto_comercial'
    );
    
    const maxId = maxIdResult[0]?.maxId || 0;
    const proximoId = maxId + 1;
    const proximoCodigo = gerarCodigoProdutoComercial(proximoId);

    return successResponse(res, {
      proximoId,
      proximoCodigo
    }, 'Próximo código obtido com sucesso', STATUS_CODES.OK);
  });

  /**
   * Excluir produto comercial (soft delete)
   */
  static excluirProdutoComercial = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se produto comercial existe
    const produtoComercial = await executeQuery(
      'SELECT id, nome_comercial FROM produto_comercial WHERE id = ?',
      [id]
    );

    if (produtoComercial.length === 0) {
      return notFoundResponse(res, 'Produto comercial não encontrado');
    }

    // Soft delete - apenas desativar
    await executeQuery(
      'UPDATE produto_comercial SET status = 0, usuario_atualizador_id = ? WHERE id = ?',
      [req.user.id, id]
    );

    successResponse(res, { id, nome_comercial: produtoComercial[0].nome_comercial }, 'Produto comercial excluído com sucesso');
  });
}

module.exports = ProdutoComercialCRUDController;

