/**
 * Serviço para gerenciar vínculos entre Produto Origem e Produto Genérico Padrão
 * Implementa a regra: Um Produto Origem só pode estar vinculado a um Produto Genérico Padrão por vez
 */

const { executeQuery } = require('../config/database');

class VinculoProdutoService {
  
  /**
   * Verificar se um produto origem já está vinculado a um produto genérico padrão
   * @param {number} produtoOrigemId - ID do produto origem
   * @returns {Object|null} - Dados do vínculo existente ou null
   */
  static async verificarVinculoExistente(produtoOrigemId) {
    const vinculo = await executeQuery(
      `SELECT 
        po.id, 
        po.nome, 
        po.codigo as produto_origem_codigo,
        pg.id as produto_generico_id,
        pg.codigo as produto_generico_codigo, 
        pg.nome as produto_generico_nome,
        pg.produto_padrao,
        pg.status as produto_generico_status
      FROM produto_origem po 
      LEFT JOIN produto_generico pg ON po.produto_generico_padrao_id = pg.id 
      WHERE po.id = ? 
      AND po.produto_generico_padrao_id IS NOT NULL 
      AND pg.produto_padrao = 'Sim' 
      AND pg.status = 1`,
      [produtoOrigemId]
    );

    return vinculo.length > 0 ? vinculo[0] : null;
  }

  /**
   * Validar vínculo único (para validação apenas, não cria vínculo)
   * @param {number} produtoOrigemId - ID do produto origem
   * @param {number} produtoGenericoId - ID do produto genérico (opcional, para excluir da validação)
   * @returns {Object|null} - Dados do vínculo existente ou null
   */
  static async validarVinculoUnico(produtoOrigemId, produtoGenericoId = null) {
    const vinculo = await executeQuery(
      `SELECT 
        po.id, 
        po.nome, 
        po.codigo as produto_origem_codigo,
        pg.id as produto_generico_id,
        pg.codigo as produto_generico_codigo, 
        pg.nome as produto_generico_nome,
        pg.produto_padrao,
        pg.status as produto_generico_status
      FROM produto_origem po 
      LEFT JOIN produto_generico pg ON po.produto_generico_padrao_id = pg.id 
      WHERE po.id = ? 
      AND po.produto_generico_padrao_id IS NOT NULL 
      AND pg.produto_padrao = 'Sim' 
      AND pg.status = 1
      ${produtoGenericoId ? 'AND pg.id != ?' : ''}`,
      produtoGenericoId ? [produtoOrigemId, produtoGenericoId] : [produtoOrigemId]
    );

    return vinculo.length > 0 ? vinculo[0] : null;
  }

  /**
   * Criar vínculo entre produto origem e produto genérico padrão
   * @param {number} produtoOrigemId - ID do produto origem
   * @param {number} produtoGenericoId - ID do produto genérico padrão
   * @returns {boolean} - true se o vínculo foi criado com sucesso
   */
  static async criarVinculo(produtoOrigemId, produtoGenericoId) {
    // Verificar se o produto genérico é realmente padrão e ativo
    const produtoGenerico = await executeQuery(
      'SELECT id, produto_padrao, status FROM produto_generico WHERE id = ?',
      [produtoGenericoId]
    );

    if (produtoGenerico.length === 0) {
      throw new Error('Produto genérico não encontrado');
    }

    if (produtoGenerico[0].produto_padrao !== 'Sim' || produtoGenerico[0].status !== 1) {
      throw new Error('Produto genérico deve ser padrão e estar ativo para criar vínculo');
    }

    // Verificar se já existe vínculo
    const vinculoExistente = await this.verificarVinculoExistente(produtoOrigemId);
    if (vinculoExistente) {
      // Se já existe vínculo, verificar se é com o mesmo produto genérico
      if (vinculoExistente.produto_generico_id === produtoGenericoId) {
        // Já está vinculado ao produto correto, não fazer nada
        return true;
      } else {
        // Está vinculado a outro produto genérico, remover o vínculo anterior
        await this.removerVinculo(produtoOrigemId);
      }
    }

    // Criar o vínculo
    await executeQuery(
      'UPDATE produto_origem SET produto_generico_padrao_id = ? WHERE id = ?',
      [produtoGenericoId, produtoOrigemId]
    );

    return true;
  }

  /**
   * Remover vínculo de um produto origem
   * @param {number} produtoOrigemId - ID do produto origem
   * @returns {boolean} - true se o vínculo foi removido com sucesso
   */
  static async removerVinculo(produtoOrigemId) {
    await executeQuery(
      'UPDATE produto_origem SET produto_generico_padrao_id = NULL WHERE id = ?',
      [produtoOrigemId]
    );

    return true;
  }

  /**
   * Atualizar vínculo (remover antigo e criar novo)
   * @param {number} produtoOrigemId - ID do produto origem
   * @param {number} novoProdutoGenericoId - ID do novo produto genérico padrão
   * @returns {boolean} - true se o vínculo foi atualizado com sucesso
   */
  static async atualizarVinculo(produtoOrigemId, novoProdutoGenericoId) {
    // Se não há novo produto genérico, apenas remover vínculo
    if (!novoProdutoGenericoId) {
      return await this.removerVinculo(produtoOrigemId);
    }

    // Verificar se o novo produto genérico é válido
    const produtoGenerico = await executeQuery(
      'SELECT id, produto_padrao, status FROM produto_generico WHERE id = ?',
      [novoProdutoGenericoId]
    );

    if (produtoGenerico.length === 0) {
      throw new Error('Produto genérico não encontrado');
    }

    if (produtoGenerico[0].produto_padrao !== 'Sim' || produtoGenerico[0].status !== 1) {
      throw new Error('Produto genérico deve ser padrão e estar ativo para criar vínculo');
    }

    // Verificar se o produto origem já está vinculado a outro produto genérico
    const vinculoExistente = await this.verificarVinculoExistente(produtoOrigemId);
    if (vinculoExistente && vinculoExistente.produto_generico_id !== novoProdutoGenericoId) {
      throw new Error(
        `Produto origem "${vinculoExistente.produto_origem_codigo} - ${vinculoExistente.nome}" já está vinculado ao produto genérico padrão: "${vinculoExistente.produto_generico_codigo} - ${vinculoExistente.produto_generico_nome}". Um Produto Origem só pode estar vinculado a um Produto Genérico Padrão por vez.`
      );
    }

    // Atualizar o vínculo
    await executeQuery(
      'UPDATE produto_origem SET produto_generico_padrao_id = ? WHERE id = ?',
      [novoProdutoGenericoId, produtoOrigemId]
    );

    return true;
  }

  /**
   * Gerenciar vínculo automaticamente baseado no produto_origem_id do produto genérico
   * @param {number} produtoGenericoId - ID do produto genérico
   * @param {string} produtoPadrao - 'Sim' ou 'Não'
   * @param {number} status - 1 (ativo) ou 0 (inativo)
   * @param {number} produtoOrigemId - ID do produto origem (pode ser null)
   * @param {number} produtoOrigemIdAnterior - ID do produto origem anterior (para updates)
   * @returns {boolean} - true se o vínculo foi gerenciado com sucesso
   */
  static async gerenciarVinculoAutomatico(produtoGenericoId, produtoPadrao, status, produtoOrigemId, produtoOrigemIdAnterior = null) {
    // Se o produto não é padrão ou está inativo, remover vínculos
    if (produtoPadrao !== 'Sim' || status !== 1) {
      // Remover vínculo anterior se existia
      if (produtoOrigemIdAnterior) {
        await this.removerVinculo(produtoOrigemIdAnterior);
      }
      return true;
    }

    // Se o produto é padrão e ativo, mas não tem produto_origem_id, não fazer nada
    if (!produtoOrigemId) {
      // Remover vínculo anterior se existia
      if (produtoOrigemIdAnterior) {
        await this.removerVinculo(produtoOrigemIdAnterior);
      }
      return true;
    }

    // Se o produto_origem_id mudou, remover vínculo anterior
    if (produtoOrigemIdAnterior && produtoOrigemIdAnterior !== produtoOrigemId) {
      await this.removerVinculo(produtoOrigemIdAnterior);
    }

    // Verificar se já existe vínculo para este produto origem
    const vinculoExistente = await this.verificarVinculoExistente(produtoOrigemId);
    
    if (vinculoExistente) {
      // Se já existe vínculo, verificar se é com o mesmo produto genérico
      if (vinculoExistente.produto_generico_id === produtoGenericoId) {
        // Já está vinculado ao produto correto, não fazer nada
        return true;
      } else {
        // Está vinculado a outro produto genérico, remover o vínculo anterior
        await this.removerVinculo(produtoOrigemId);
      }
    }

    // Criar novo vínculo
    await executeQuery(
      'UPDATE produto_origem SET produto_generico_padrao_id = ? WHERE id = ?',
      [produtoGenericoId, produtoOrigemId]
    );

    return true;
  }

  /**
   * Limpar vínculos duplicados no banco de dados
   * @returns {number} - Número de vínculos corrigidos
   */
  static async limparVinculosDuplicados() {
    // Buscar produtos origem com vínculos duplicados
    const vinculosDuplicados = await executeQuery(
      `SELECT 
        po.id,
        po.codigo,
        po.nome,
        COUNT(pg.id) as total_vinculos
      FROM produto_origem po
      LEFT JOIN produto_generico pg ON po.produto_generico_padrao_id = pg.id 
        AND pg.produto_padrao = 'Sim' 
        AND pg.status = 1
      WHERE po.produto_generico_padrao_id IS NOT NULL
      GROUP BY po.id, po.codigo, po.nome
      HAVING COUNT(pg.id) > 1`
    );

    let corrigidos = 0;

    for (const vinculo of vinculosDuplicados) {
      // Para cada produto origem com vínculo duplicado, manter apenas o primeiro produto genérico padrão
      const primeiroProdutoGenerico = await executeQuery(
        `SELECT pg.id 
         FROM produto_generico pg 
         WHERE pg.produto_padrao = 'Sim' 
         AND pg.status = 1 
         AND pg.produto_origem_id = ?
         ORDER BY pg.id 
         LIMIT 1`,
        [vinculo.id]
      );

      if (primeiroProdutoGenerico.length > 0) {
        await executeQuery(
          'UPDATE produto_origem SET produto_generico_padrao_id = ? WHERE id = ?',
          [primeiroProdutoGenerico[0].id, vinculo.id]
        );
        corrigidos++;
      }
    }

    return corrigidos;
  }
}

module.exports = VinculoProdutoService;
