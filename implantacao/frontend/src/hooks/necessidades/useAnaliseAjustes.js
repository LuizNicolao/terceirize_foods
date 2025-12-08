import { useState } from 'react';
import toast from 'react-hot-toast';

const useAnaliseAjustes = ({
  necessidades,
  produtosGenericos,
  salvarSubstituicao,
  carregarNecessidades,
  setProgressoModal
}) => {
  const [salvandoAjustes, setSalvandoAjustes] = useState(false);

  const handleIniciarAjustes = async () => {
    if (!necessidades.length) {
      toast.error('Nenhuma necessidade encontrada');
      return;
    }

    setSalvandoAjustes(true);
    const totalProcessos = necessidades.length;
    const resultadosAjustes = [];
    
    try {
      // Passo 1: Salvar todos os ajustes
      setProgressoModal({
        isOpen: true,
        progresso: 0,
        total: totalProcessos,
        mensagem: 'Salvando ajustes...',
        title: 'Realizando Ajustes'
      });

      const delayEntreRequisicoes = 200; // 200ms entre cada requisição
      
      for (let i = 0; i < necessidades.length; i++) {
        const necessidade = necessidades[i];
        
        try {
          const produtoPadrao = produtosGenericos[necessidade.codigo_origem]?.find(
            p => p.produto_padrao === 'Sim'
          );

          if (!produtoPadrao) {
            resultadosAjustes.push({ 
              success: false, 
              message: `Produto padrão não encontrado para ${necessidade.codigo_origem}` 
            });
          } else {
            const unidade = produtoPadrao.unidade_medida_sigla || produtoPadrao.unidade || '';
            const fatorConversao = produtoPadrao.fator_conversao || 1;

            // Garantir que quantidade_total_origem tenha um valor válido
            const quantidadeTotalOrigem = parseFloat(necessidade.quantidade_total_origem) || 0;
            const quantidadeGenericoTotal = Math.ceil(quantidadeTotalOrigem / fatorConversao) || 0;

            const dados = {
              produto_origem_id: necessidade.codigo_origem,
              produto_origem_nome: necessidade.produto_origem_nome,
              produto_origem_unidade: necessidade.produto_origem_unidade,
              produto_generico_id: produtoPadrao.id || produtoPadrao.codigo,
              produto_generico_codigo: produtoPadrao.id || produtoPadrao.codigo,
              produto_generico_nome: produtoPadrao.nome,
              produto_generico_unidade: unidade,
              necessidade_id_grupo: necessidade.necessidade_id_grupo,
              semana_abastecimento: necessidade.semana_abastecimento,
              semana_consumo: necessidade.semana_consumo,
              quantidade_origem: quantidadeTotalOrigem,
              quantidade_generico: quantidadeGenericoTotal,
              escola_ids: necessidade.escolas.map(escola => {
                // Garantir que quantidade_origem da escola tenha um valor válido
                const quantidadeOrigemEscola = parseFloat(escola.quantidade_origem) || 0;
                const quantidadeGenericoEscola = Math.ceil(quantidadeOrigemEscola / fatorConversao) || 0;
                
                return {
                  necessidade_id: escola.necessidade_id,
                  escola_id: escola.escola_id,
                  escola_nome: escola.escola_nome,
                  quantidade_origem: quantidadeOrigemEscola,
                  quantidade_generico: quantidadeGenericoEscola
                };
              })
            };

            // Desabilitar toast individual quando salvando em lote
            const response = await salvarSubstituicao(dados, false);
            resultadosAjustes.push(response);
          }
        } catch (error) {
          resultadosAjustes.push({ success: false, error: error.message });
        }
        
        // Atualizar progresso
        setProgressoModal(prev => ({
          ...prev,
          progresso: i + 1
        }));

        // Delay entre requisições (exceto na última)
        if (i < necessidades.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayEntreRequisicoes));
        }
      }

      // Contar sucessos e erros dos ajustes
      const sucessosAjustes = resultadosAjustes.filter(r => r.success).length;
      const errosAjustes = resultadosAjustes.filter(r => !r.success).length;

      // Fechar modal de progresso
      setProgressoModal(prev => ({ ...prev, isOpen: false }));
      
      // Recarregar necessidades para mostrar os ajustes salvos
      if (necessidades.length > 0) {
        await carregarNecessidades();
      }
      
      // Exibir mensagem de sucesso dos ajustes
      if (sucessosAjustes > 0) {
        let mensagem = `${sucessosAjustes} ajuste(s) salvo(s) com sucesso`;
        if (errosAjustes > 0) {
          mensagem += `, ${errosAjustes} erro(s)`;
        }
        toast.success(mensagem);
        return { success: true, ajustesAtivados: true };
      } else {
        toast.error('Nenhuma substituição foi salva.');
        return { success: false, ajustesAtivados: false };
      }
    } catch (error) {
      setProgressoModal(prev => ({ ...prev, isOpen: false }));
      toast.error(`Erro ao iniciar ajustes: ${error.message}`);
      return { success: false, ajustesAtivados: false };
    } finally {
      setSalvandoAjustes(false);
    }
  };

  return {
    salvandoAjustes,
    handleIniciarAjustes
  };
};

export default useAnaliseAjustes;

