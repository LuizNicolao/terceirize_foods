/**
 * Utilitários para manipulação de produtos
 * Funções compartilhadas para busca e normalização de produtos
 */

const { executeQuery } = require('../../../config/database');
const axios = require('axios');

const produtosGrupoCache = {};

/**
 * Normalizar produtos origem para formato padrão
 */
const normalizarProdutosOrigem = (produtos) => {
  return produtos.map(produto => {
    const produtoOrigemId = produto.id || produto.produto_id || produto.codigo;

    let produtoGenericoPadrao = null;
    if (produto.produto_generico_padrao) {
      const padrao = produto.produto_generico_padrao;
      produtoGenericoPadrao = {
        id: padrao.id || padrao.codigo,
        codigo: padrao.codigo || padrao.id,
        nome: padrao.nome,
        unidade_medida: padrao.unidade_medida_sigla || padrao.unidade_medida || padrao.unidade || '',
        unidade_medida_sigla: padrao.unidade_medida_sigla || padrao.unidade_medida || padrao.unidade || '',
        fator_conversao: padrao.fator_conversao || 1
      };
    } else if (
      produto.produto_generico_padrao_id ||
      produto.produto_generico_padrao_nome ||
      produto.produto_generico_padrao_unidade
    ) {
      produtoGenericoPadrao = {
        id: produto.produto_generico_padrao_id || produto.produto_generico_padrao_codigo,
        codigo: produto.produto_generico_padrao_codigo || produto.produto_generico_padrao_id,
        nome: produto.produto_generico_padrao_nome,
        unidade_medida: produto.produto_generico_padrao_unidade || '',
        unidade_medida_sigla: produto.produto_generico_padrao_unidade || '',
        fator_conversao: produto.produto_generico_padrao_fator || 1
      };
    }

    return {
      produto_id: produtoOrigemId,
      produto_codigo: produto.codigo || produto.produto_codigo || produtoOrigemId,
      produto_nome: produto.nome || produto.produto_nome,
      unidade_medida: produto.unidade_medida_sigla || produto.unidade_medida || produto.unidade || '',
      grupo_id: produto.grupo_id,
      produto_generico_padrao: produtoGenericoPadrao
    };
  });
};

/**
 * Buscar produtos do grupo no Foods API
 */
const buscarProdutosDoGrupo = async (grupoId, grupoNome, authHeader) => {
  const cacheKey = grupoId || grupoNome;

  if (!cacheKey) {
    return [];
  }

  if (produtosGrupoCache[cacheKey]) {
    return produtosGrupoCache[cacheKey];
  }

  let resolvedGrupoId = grupoId;

  if (!resolvedGrupoId && grupoNome) {
    const grupoResult = await executeQuery(
      'SELECT id FROM foods_db.grupos WHERE nome = ? LIMIT 1',
      [grupoNome]
    );
    resolvedGrupoId = grupoResult[0]?.id || null;
  }

  if (!resolvedGrupoId) {
    return [];
  }

  const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';

  try {
    const response = await axios.get(
      `${foodsApiUrl}/produto-origem/grupo/${resolvedGrupoId}?limit=1000`,
      {
        headers: {
          Authorization: authHeader
        },
        timeout: 10000
      }
    );

    let produtos = [];

    if (response.data?.data) {
      produtos = Array.isArray(response.data.data)
        ? response.data.data
        : response.data.data.items || [];
    } else if (Array.isArray(response.data)) {
      produtos = response.data;
    }

    const mapped = normalizarProdutosOrigem(produtos);
    produtosGrupoCache[cacheKey] = mapped;
    return mapped;
  } catch (error) {
    console.error('[Substituições] Erro ao buscar produtos do grupo no Foods:', error.message);

    // Fallback para banco local caso a API do Foods esteja indisponível
    try {
      const produtosFallback = await executeQuery(
        `
          SELECT 
            po.id AS produto_id,
            po.codigo AS produto_codigo,
            po.nome AS produto_nome,
            COALESCE(um.sigla, um.nome, '') AS unidade_medida,
            po.grupo_id,
            po.produto_generico_padrao_id,
            pg.codigo AS produto_generico_padrao_codigo,
            pg.nome AS produto_generico_padrao_nome,
            COALESCE(um_pg.sigla, um_pg.nome, '') AS produto_generico_padrao_unidade,
            pg.fator_conversao AS produto_generico_padrao_fator
          FROM foods_db.produto_origem po
          LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
          LEFT JOIN foods_db.produto_generico pg ON po.produto_generico_padrao_id = pg.id
          LEFT JOIN foods_db.unidades_medida um_pg ON pg.unidade_medida_id = um_pg.id
          WHERE po.grupo_id = ? AND po.status = 1
          ORDER BY po.nome ASC
        `,
        [resolvedGrupoId]
      );

      const mappedFallback = normalizarProdutosOrigem(produtosFallback);
      produtosGrupoCache[cacheKey] = mappedFallback;
      return mappedFallback;
    } catch (fallbackError) {
      console.error('[Substituições] Erro no fallback local de produtos do grupo:', fallbackError.message);
      return [];
    }
  }
};

/**
 * Buscar produto padrão do produto origem no Foods
 */
const buscarProdutoPadrao = async (produtoOrigemId, authHeader) => {
  try {
    const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
    const produtoOrigemResponse = await axios.get(`${foodsApiUrl}/produto-origem/${produtoOrigemId}`, {
      headers: {
        'Authorization': authHeader
      },
      timeout: 5000
    });

    if (produtoOrigemResponse.data && produtoOrigemResponse.data.success) {
      return produtoOrigemResponse.data.data.produto_padrao_id;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar produto padrão para produto origem ${produtoOrigemId}:`, error.message);
    return null;
  }
};

module.exports = {
  normalizarProdutosOrigem,
  buscarProdutosDoGrupo,
  buscarProdutoPadrao
};

