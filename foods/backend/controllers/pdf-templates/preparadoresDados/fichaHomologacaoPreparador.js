/**
 * Preparador de dados para templates de Ficha de Homologação
 */

class FichaHomologacaoPreparador {
  /**
   * Preparar dados para template de ficha de homologação
   * @param {Object} ficha - Dados da ficha de homologação
   * @param {Array} itens - Array de itens (não usado para ficha de homologação)
   * @param {Array} dadosAdicionais - Dados adicionais
   */
  static preparar(ficha, itens = [], dadosAdicionais = []) {
    // Função auxiliar para formatar data
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('pt-BR');
    };

    // Função auxiliar para formatar número
    const formatNumber = (num) => {
      if (num === null || num === undefined) return '';
      const valor = parseFloat(num);
      if (isNaN(valor)) return '';
      return valor % 1 === 0 ? valor.toString() : valor.toFixed(3).replace(/\.?0+$/, '');
    };

    const retorno = {
      // Identificação
      id: ficha.id || '',
      tipo: ficha.tipo === 'NOVO_PRODUTO' ? 'Novo Produto' : 'Reavaliação',
      status: ficha.status || '',
      
      // Datas
      data_analise: formatDate(ficha.data_analise),
      fabricacao: formatDate(ficha.fabricacao),
      validade: formatDate(ficha.validade),
      
      // Produto
      produto_generico_id: ficha.produto_generico_id || '',
      nome_generico_nome: ficha.nome_generico_nome || '',
      nome_generico_codigo: ficha.nome_generico_codigo || '',
      marca: ficha.marca || '',
      fabricante: ficha.fabricante || '',
      composicao: ficha.composicao || '',
      lote: ficha.lote || '',
      
      // Fornecedor
      fornecedor_id: ficha.fornecedor_id || '',
      fornecedor_nome: ficha.fornecedor_nome || ficha.fornecedor_nome_fantasia || '',
      fornecedor_nome_fantasia: ficha.fornecedor_nome_fantasia || '',
      
      // Unidade de Medida
      unidade_medida_id: ficha.unidade_medida_id || '',
      unidade_medida_nome: ficha.unidade_medida_nome || '',
      unidade_medida_sigla: ficha.unidade_medida_sigla || '',
      
      // Avaliações de Peso
      peso: ficha.peso || '',
      peso_valor: formatNumber(ficha.peso_valor),
      peso_cru: ficha.peso_cru || '',
      peso_cru_valor: formatNumber(ficha.peso_cru_valor),
      peso_cozido: ficha.peso_cozido || '',
      peso_cozido_valor: formatNumber(ficha.peso_cozido_valor),
      fator_coccao: ficha.fator_coccao || '',
      fator_coccao_valor: formatNumber(ficha.fator_coccao_valor),
      
      // Avaliações Sensoriais
      cor: ficha.cor || '',
      cor_observacao: ficha.cor_observacao || '',
      odor: ficha.odor || '',
      odor_observacao: ficha.odor_observacao || '',
      sabor: ficha.sabor || '',
      sabor_observacao: ficha.sabor_observacao || '',
      aparencia: ficha.aparencia || '',
      aparencia_observacao: ficha.aparencia_observacao || '',
      
      // Conclusão
      conclusao: ficha.conclusao || '',
      resultado_final: ficha.resultado_final === 'APROVADO' ? 'Aprovado' :
                       ficha.resultado_final === 'APROVADO_COM_RESSALVAS' ? 'Aprovado com Ressalvas' :
                       ficha.resultado_final === 'REPROVADO' ? 'Reprovado' : ficha.resultado_final || '',
      
      // Usuários
      avaliador_id: ficha.avaliador_id || '',
      avaliador_nome: ficha.avaliador_nome || '',
      avaliador_email: ficha.avaliador_email || '',
      aprovador_id: ficha.aprovador_id || '',
      aprovador_nome: ficha.aprovador_nome || '',
      aprovador_email: ficha.aprovador_email || '',
      
      // Documentação
      foto_embalagem: ficha.foto_embalagem || '',
      foto_produto_cru: ficha.foto_produto_cru || '',
      foto_produto_cozido: ficha.foto_produto_cozido || '',
      pdf_avaliacao_antiga: ficha.pdf_avaliacao_antiga || ''
    };
    
    return retorno;
  }
}

module.exports = FichaHomologacaoPreparador;

