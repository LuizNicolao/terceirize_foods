/**
 * Controller de CRUD para Produto Genérico
 * Responsável por operações de criação, atualização e exclusão
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutoGenericoCRUDController {
  
  /**
   * Criar novo produto genérico
   */
  static criarProdutoGenerico = asyncHandler(async (req, res) => {
    const {
      codigo, nome, produto_origem_id, fator_conversao, grupo_id, subgrupo_id, classe_id,
      unidade_medida_id, referencia_mercado, produto_padrao, peso_liquido, peso_bruto,
      regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
      registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
      integracao_senior, status
    } = req.body;

    // Verificar se código já existe
    const codigoExistente = await executeQuery(
      'SELECT id FROM produto_generico WHERE codigo = ?',
      [codigo]
    );

    if (codigoExistente.length > 0) {
      return conflictResponse(res, 'Código já existe');
    }

    // Verificar se produto origem existe (se fornecido)
    if (produto_origem_id) {
      const produtoOrigem = await executeQuery(
        'SELECT id FROM produto_origem WHERE id = ?',
        [produto_origem_id]
      );

      if (produtoOrigem.length === 0) {
        return errorResponse(res, 'Produto origem não encontrado', STATUS_CODES.BAD_REQUEST);
      }

      // Verificar se o produto origem já está vinculado a outro produto genérico padrão ativo
      const produtoOrigemVinculado = await executeQuery(
        `SELECT 
          po.id, 
          po.nome, 
          pg.codigo as produto_generico_codigo, 
          pg.nome as produto_generico_nome 
        FROM produto_origem po 
        LEFT JOIN produto_generico pg ON po.produto_generico_padrao_id = pg.id 
        WHERE po.id = ? 
        AND po.produto_generico_padrao_id IS NOT NULL 
        AND pg.produto_padrao = 'Sim' 
        AND pg.status = 1`,
        [produto_origem_id]
      );

      if (produtoOrigemVinculado.length > 0 && produtoOrigemVinculado[0].produto_generico_padrao_id) {
        return conflictResponse(res, `Produto origem já está vinculado ao produto genérico padrão: ${produtoOrigemVinculado[0].produto_generico_codigo} - ${produtoOrigemVinculado[0].produto_generico_nome}`);
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

    // Verificar se unidade de medida existe (se fornecida)
    if (unidade_medida_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [unidade_medida_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Inserir novo produto genérico
    try {
      const novoProdutoGenerico = await executeQuery(
        `INSERT INTO produto_generico (
          codigo, nome, produto_origem_id, fator_conversao, grupo_id, subgrupo_id, classe_id,
          unidade_medida_id, referencia_mercado, produto_padrao, peso_liquido, peso_bruto,
          regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
          registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
          integracao_senior, status, usuario_criador_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigo, nome, produto_origem_id, fator_conversao || 1.000, grupo_id, subgrupo_id, classe_id,
          unidade_medida_id, referencia_mercado, produto_padrao || 'Não', peso_liquido, peso_bruto,
          regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
          registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
          integracao_senior, status !== undefined ? status : 1, req.user.id
        ]
      );

      // Buscar produto genérico criado
      const produtoGenericoCriado = await executeQuery(
        `SELECT 
          pg.*,
          po.nome as produto_origem_nome,
          po.codigo as produto_origem_codigo,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          um.nome as unidade_medida_nome,
          uc.nome as usuario_criador_nome,
          ua.nome as usuario_atualizador_nome
        FROM produto_generico pg
        LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
        LEFT JOIN grupos g ON pg.grupo_id = g.id
        LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
        LEFT JOIN classes c ON pg.classe_id = c.id
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        LEFT JOIN usuarios uc ON pg.usuario_criador_id = uc.id
        LEFT JOIN usuarios ua ON pg.usuario_atualizador_id = ua.id
        WHERE pg.id = ?`,
        [novoProdutoGenerico.insertId]
      );

      successResponse(res, produtoGenericoCriado[0], 'Produto genérico criado com sucesso');
    } catch (error) {
      // Capturar erro específico do trigger de validação de vínculo único
      if (error.code === 'ER_SIGNAL_EXCEPTION' && error.sqlState === '45000') {
        if (error.sqlMessage.includes('Produto origem já está vinculado')) {
          return conflictResponse(res, error.sqlMessage);
        }
      }
      // Re-throw outros erros para serem tratados pelo middleware de erro
      throw error;
    }
  });

  /**
   * Atualizar produto genérico
   */
  static atualizarProdutoGenerico = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      codigo, nome, produto_origem_id, fator_conversao, grupo_id, subgrupo_id, classe_id,
      unidade_medida_id, referencia_mercado, produto_padrao, peso_liquido, peso_bruto,
      regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
      registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
      integracao_senior, status
    } = req.body;

    // Verificar se produto genérico existe
    const produtoGenerico = await executeQuery(
      'SELECT id, nome, produto_padrao, produto_origem_id FROM produto_generico WHERE id = ?',
      [id]
    );

    if (produtoGenerico.length === 0) {
      return notFoundResponse(res, 'Produto genérico não encontrado');
    }

    const produtoGenericoAtual = produtoGenerico[0];

    // Verificar se código já existe (se foi alterado)
    if (codigo) {
      const codigoExistente = await executeQuery(
        'SELECT id FROM produto_generico WHERE codigo = ? AND id != ?',
        [codigo, id]
      );

      if (codigoExistente.length > 0) {
        return conflictResponse(res, 'Código já existe');
      }
    }

    // Verificar se produto origem existe (se fornecido)
    if (produto_origem_id) {
      const produtoOrigem = await executeQuery(
        'SELECT id FROM produto_origem WHERE id = ?',
        [produto_origem_id]
      );

      if (produtoOrigem.length === 0) {
        return errorResponse(res, 'Produto origem não encontrado', STATUS_CODES.BAD_REQUEST);
      }

      // Verificar se o produto origem já está vinculado a outro produto genérico padrão ativo
      const produtoOrigemVinculado = await executeQuery(
        `SELECT 
          po.id, 
          po.nome, 
          pg.codigo as produto_generico_codigo, 
          pg.nome as produto_generico_nome 
        FROM produto_origem po 
        LEFT JOIN produto_generico pg ON po.produto_generico_padrao_id = pg.id 
        WHERE po.id = ? 
        AND po.produto_generico_padrao_id IS NOT NULL 
        AND pg.produto_padrao = 'Sim' 
        AND pg.status = 1 
        AND pg.id != ?`, // Exclui o produto genérico atual
        [produto_origem_id, id]
      );

      if (produtoOrigemVinculado.length > 0 && produtoOrigemVinculado[0].produto_generico_padrao_id) {
        return conflictResponse(res, `Produto origem já está vinculado ao produto genérico padrão: ${produtoOrigemVinculado[0].produto_generico_codigo} - ${produtoOrigemVinculado[0].produto_generico_nome}`);
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

    // Verificar se unidade de medida existe (se fornecida)
    if (unidade_medida_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [unidade_medida_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Atualizar produto genérico (os vínculos serão gerenciados automaticamente pelos triggers)
    try {
      await executeQuery(
        `UPDATE produto_generico SET 
          codigo = ?, nome = ?, produto_origem_id = ?, fator_conversao = ?, 
          grupo_id = ?, subgrupo_id = ?, classe_id = ?, unidade_medida_id = ?, 
          referencia_mercado = ?, produto_padrao = ?, peso_liquido = ?, peso_bruto = ?,
          regra_palet = ?, informacoes_adicionais = ?, referencia_interna = ?, 
          referencia_externa = ?, registro_especifico = ?, tipo_registro = ?,
          prazo_validade_padrao = ?, unidade_validade = ?, integracao_senior = ?, 
          status = ?, usuario_atualizador_id = ?
        WHERE id = ?`,
        [
          codigo, nome, produto_origem_id, fator_conversao, grupo_id, subgrupo_id, classe_id,
          unidade_medida_id, referencia_mercado, produto_padrao, peso_liquido, peso_bruto,
          regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
          registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
          integracao_senior, status, req.user.id, id
        ]
      );

      // Buscar produto genérico atualizado
      const produtoGenericoAtualizado = await executeQuery(
        `SELECT 
          pg.*,
          po.nome as produto_origem_nome,
          po.codigo as produto_origem_codigo,
          g.nome as grupo_nome,
          sg.nome as subgrupo_nome,
          c.nome as classe_nome,
          um.nome as unidade_medida_nome,
          uc.nome as usuario_criador_nome,
          ua.nome as usuario_atualizador_nome
        FROM produto_generico pg
        LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
        LEFT JOIN grupos g ON pg.grupo_id = g.id
        LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
        LEFT JOIN classes c ON pg.classe_id = c.id
        LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
        LEFT JOIN usuarios uc ON pg.usuario_criador_id = uc.id
        LEFT JOIN usuarios ua ON pg.usuario_atualizador_id = ua.id
        WHERE pg.id = ?`,
        [id]
      );

      successResponse(res, produtoGenericoAtualizado[0], 'Produto genérico atualizado com sucesso');
    } catch (error) {
      // Capturar erro específico do trigger de validação de vínculo único
      if (error.code === 'ER_SIGNAL_EXCEPTION' && error.sqlState === '45000') {
        if (error.sqlMessage.includes('Produto origem já está vinculado')) {
          return conflictResponse(res, error.sqlMessage);
        }
      }
      // Re-throw outros erros para serem tratados pelo middleware de erro
      throw error;
    }
  });

  /**
   * Excluir produto genérico (soft delete)
   */
  static excluirProdutoGenerico = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se produto genérico existe
    const produtoGenerico = await executeQuery(
      'SELECT id, nome FROM produto_generico WHERE id = ?',
      [id]
    );

    if (produtoGenerico.length === 0) {
      return notFoundResponse(res, 'Produto genérico não encontrado');
    }

    // Soft delete - apenas desativar
    await executeQuery(
      'UPDATE produto_generico SET status = 0, usuario_atualizador_id = ? WHERE id = ?',
      [req.user.id, id]
    );

    successResponse(res, { id, nome: produtoGenerico[0].nome }, 'Produto genérico excluído com sucesso');
  });
}

module.exports = ProdutoGenericoCRUDController;
