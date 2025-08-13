/**
 * Controller CRUD de Cotações
 * Responsável por operações de Create, Read, Update e Delete
 */

const { executeQuery, executeTransaction } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class CotacoesCRUDController {
  
  /**
   * Criar nova cotação
   */
  static criarCotacao = asyncHandler(async (req, res) => {
    const {
      comprador, local_entrega, tipo_compra, motivo_emergencial, 
      justificativa, motivo_final, produtos, fornecedores
    } = req.body;

    // Verificar se o comprador existe
    const compradorExiste = await executeQuery(
      'SELECT id FROM users WHERE id = ? AND status = 1',
      [comprador]
    );

    if (compradorExiste.length === 0) {
      return errorResponse(res, 'Comprador não encontrado ou inativo', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se há produtos
    if (!produtos || produtos.length === 0) {
      return errorResponse(res, 'É necessário pelo menos um produto', STATUS_CODES.BAD_REQUEST);
    }

    // Criar cotação com transação
    const cotacaoQueries = [
      {
        sql: `
          INSERT INTO cotacoes (
            comprador, local_entrega, tipo_compra, motivo_emergencial,
            justificativa, motivo_final, status, data_criacao
          ) VALUES (?, ?, ?, ?, ?, ?, 'pendente', NOW())
        `,
        params: [comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa, motivo_final]
      }
    ];

    const [cotacaoResult] = await executeTransaction(cotacaoQueries);
    const cotacaoId = cotacaoResult.insertId;

    // Inserir produtos da cotação
    const produtosQueries = produtos.map(produto => ({
      sql: `
        INSERT INTO cotacao_produtos (
          cotacao_id, nome, qtde, un, prazo_entrega, ult_valor_aprovado,
          ult_fornecedor_aprovado, valor_anterior, valor_unitario, difal, ipi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        cotacaoId, produto.nome, produto.qtde, produto.un, produto.prazoEntrega,
        produto.ultValorAprovado, produto.ultFornecedorAprovado, produto.valorAnterior,
        produto.valorUnitario, produto.difal || 0, produto.ipi || 0
      ]
    }));

    await executeTransaction(produtosQueries);

    // Inserir fornecedores se fornecidos
    if (fornecedores && fornecedores.length > 0) {
      const fornecedoresQueries = fornecedores.map(fornecedor => ({
        sql: `
          INSERT INTO cotacao_fornecedores (
            cotacao_id, fornecedor_id, nome, cnpj, telefone, email
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        params: [
          cotacaoId, fornecedor.id, fornecedor.nome, fornecedor.cnpj,
          fornecedor.telefone, fornecedor.email
        ]
      }));

      await executeTransaction(fornecedoresQueries);
    }

    return successResponse(
      res, 
      { id: cotacaoId }, 
      'Cotação criada com sucesso', 
      STATUS_CODES.CREATED
    );
  });

  /**
   * Buscar cotação por ID
   */
  static buscarCotacao = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const cotacao = await executeQuery(`
      SELECT 
        c.*,
        u.name as comprador_nome,
        u.role as comprador_role
      FROM cotacoes c
      LEFT JOIN users u ON c.comprador = u.id
      WHERE c.id = ?
    `, [id]);

    if (cotacao.length === 0) {
      return notFoundResponse(res, 'Cotação não encontrada');
    }

    // Buscar produtos da cotação
    const produtos = await executeQuery(`
      SELECT * FROM cotacao_produtos 
      WHERE cotacao_id = ?
      ORDER BY id
    `, [id]);

    // Buscar fornecedores da cotação
    const fornecedores = await executeQuery(`
      SELECT * FROM cotacao_fornecedores 
      WHERE cotacao_id = ?
      ORDER BY id
    `, [id]);

    const cotacaoCompleta = {
      ...cotacao[0],
      produtos,
      fornecedores
    };

    return successResponse(res, cotacaoCompleta);
  });

  /**
   * Atualizar cotação
   */
  static atualizarCotacao = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      comprador, local_entrega, tipo_compra, motivo_emergencial,
      justificativa, motivo_final, status, produtos, fornecedores
    } = req.body;

    // Verificar se a cotação existe
    const cotacaoExiste = await executeQuery(
      'SELECT id FROM cotacoes WHERE id = ?',
      [id]
    );

    if (cotacaoExiste.length === 0) {
      return notFoundResponse(res, 'Cotação não encontrada');
    }

    // Verificar se o comprador existe (se fornecido)
    if (comprador) {
      const compradorExiste = await executeQuery(
        'SELECT id FROM users WHERE id = ? AND status = 1',
        [comprador]
      );

      if (compradorExiste.length === 0) {
        return errorResponse(res, 'Comprador não encontrado ou inativo', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Atualizar cotação
    const updateQueries = [
      {
        sql: `
          UPDATE cotacoes SET
            comprador = COALESCE(?, comprador),
            local_entrega = COALESCE(?, local_entrega),
            tipo_compra = COALESCE(?, tipo_compra),
            motivo_emergencial = COALESCE(?, motivo_emergencial),
            justificativa = COALESCE(?, justificativa),
            motivo_final = COALESCE(?, motivo_final),
            status = COALESCE(?, status),
            data_atualizacao = NOW()
          WHERE id = ?
        `,
        params: [comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa, motivo_final, status, id]
      }
    ];

    await executeTransaction(updateQueries);

    // Atualizar produtos se fornecidos
    if (produtos) {
      // Remover produtos existentes
      await executeQuery('DELETE FROM cotacao_produtos WHERE cotacao_id = ?', [id]);

      // Inserir novos produtos
      const produtosQueries = produtos.map(produto => ({
        sql: `
          INSERT INTO cotacao_produtos (
            cotacao_id, nome, qtde, un, prazo_entrega, ult_valor_aprovado,
            ult_fornecedor_aprovado, valor_anterior, valor_unitario, difal, ipi
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          id, produto.nome, produto.qtde, produto.un, produto.prazoEntrega,
          produto.ultValorAprovado, produto.ultFornecedorAprovado, produto.valorAnterior,
          produto.valorUnitario, produto.difal || 0, produto.ipi || 0
        ]
      }));

      await executeTransaction(produtosQueries);
    }

    // Atualizar fornecedores se fornecidos
    if (fornecedores) {
      // Remover fornecedores existentes
      await executeQuery('DELETE FROM cotacao_fornecedores WHERE cotacao_id = ?', [id]);

      // Inserir novos fornecedores
      const fornecedoresQueries = fornecedores.map(fornecedor => ({
        sql: `
          INSERT INTO cotacao_fornecedores (
            cotacao_id, fornecedor_id, nome, cnpj, telefone, email
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        params: [
          id, fornecedor.id, fornecedor.nome, fornecedor.cnpj,
          fornecedor.telefone, fornecedor.email
        ]
      }));

      await executeTransaction(fornecedoresQueries);
    }

    return successResponse(res, null, 'Cotação atualizada com sucesso');
  });

  /**
   * Excluir cotação
   */
  static excluirCotacao = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se a cotação existe
    const cotacao = await executeQuery(
      'SELECT id FROM cotacoes WHERE id = ?',
      [id]
    );

    if (cotacao.length === 0) {
      return notFoundResponse(res, 'Cotação não encontrada');
    }

    // Verificar se pode ser excluída (não pode estar em análise ou aprovada)
    const cotacaoStatus = await executeQuery(
      'SELECT status FROM cotacoes WHERE id = ?',
      [id]
    );

    if (['em_analise', 'aprovada', 'rejeitada'].includes(cotacaoStatus[0].status)) {
      return errorResponse(res, 'Não é possível excluir uma cotação em análise, aprovada ou rejeitada', STATUS_CODES.BAD_REQUEST);
    }

    // Excluir em transação
    const deleteQueries = [
      { sql: 'DELETE FROM cotacao_produtos WHERE cotacao_id = ?', params: [id] },
      { sql: 'DELETE FROM cotacao_fornecedores WHERE cotacao_id = ?', params: [id] },
      { sql: 'DELETE FROM cotacoes WHERE id = ?', params: [id] }
    ];

    await executeTransaction(deleteQueries);

    return successResponse(res, null, 'Cotação excluída com sucesso', STATUS_CODES.NO_CONTENT);
  });
}

module.exports = CotacoesCRUDController;
