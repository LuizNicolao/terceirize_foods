/**
 * Calcula os melhores preços entre todos os fornecedores
 * @param {Array} fornecedores - Array de fornecedores com seus produtos
 * @returns {Object} - Objeto com os melhores preços por produto
 */
export const calcularMelhoresPrecos = (fornecedores) => {
  const melhoresPrecos = {};

  // Percorrer todos os fornecedores
  fornecedores.forEach(fornecedor => {
    fornecedor.produtos.forEach(produto => {
      const produtoKey = produto.nome; // Usar nome do produto como chave
      const valorUnitario = parseFloat(produto.valorUnitario) || 0;

      // Se não existe registro para este produto ou se o preço atual é menor
      if (!melhoresPrecos[produtoKey] || valorUnitario < melhoresPrecos[produtoKey].valor) {
        melhoresPrecos[produtoKey] = {
          valor: valorUnitario,
          fornecedorId: fornecedor.id,
          produtoId: produto.id
        };
      }
    });
  });

  return melhoresPrecos;
};

/**
 * Verifica se um produto tem o melhor preço
 * @param {Object} produto - Produto a ser verificado
 * @param {Object} fornecedor - Fornecedor do produto
 * @param {Object} melhoresPrecos - Objeto com os melhores preços
 * @returns {boolean} - True se tem o melhor preço
 */
export const temMelhorPreco = (produto, fornecedor, melhoresPrecos) => {
  const produtoKey = produto.nome;
  const valorUnitario = parseFloat(produto.valorUnitario) || 0;
  
  const melhorPreco = melhoresPrecos[produtoKey];
  
  if (!melhorPreco) return false;
  
  // Verifica se este produto tem o melhor preço
  return valorUnitario === melhorPreco.valor && 
         fornecedor.id === melhorPreco.fornecedorId && 
         produto.id === melhorPreco.produtoId;
};

/**
 * Verifica se um produto tem o mesmo preço do melhor preço (empate)
 * @param {Object} produto - Produto a ser verificado
 * @param {Object} fornecedor - Fornecedor do produto
 * @param {Object} melhoresPrecos - Objeto com os melhores preços
 * @returns {boolean} - True se tem o mesmo preço do melhor
 */
export const temMesmoPrecoDoMelhor = (produto, fornecedor, melhoresPrecos) => {
  const produtoKey = produto.nome;
  const valorUnitario = parseFloat(produto.valorUnitario) || 0;
  
  const melhorPreco = melhoresPrecos[produtoKey];
  
  if (!melhorPreco) return false;
  
  // Verifica se tem o mesmo preço do melhor (empate)
  return valorUnitario === melhorPreco.valor;
}; 