import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import SubstituicoesNecessidadesService from '../../services/substituicoesNecessidades';
import necessidadesLogisticaService from '../../services/necessidadesLogisticaService';

/**
 * Hook para gerenciar ações principais: salvar ajustes e liberar necessidades
 */
export const useAcoesNecessidades = ({
  activeTab,
  necessidadeAtual,
  necessidades,
  ajustesLocais,
  filtros,
  salvarAjustesNutricionista,
  salvarAjustesCoordenacao,
  salvarAjustesLogistica,
  liberarCoordenacao,
  liberarParaLogistica,
  confirmarFinal,
  enviarParaNutricionista,
  handleCarregarNecessidades,
  limparAjustesLocais,
  atualizarFiltrosNutricionista,
  atualizarFiltrosCoordenacao,
  atualizarFiltrosLogistica,
  limparFiltrosLogistica,
  selectedProdutosOrigemLogistica
}) => {
  // Estado para modal de progresso (logística)
  const [progressoModal, setProgressoModal] = useState({
    isOpen: false,
    progresso: 0,
    total: 0,
    mensagem: 'Aguarde, processando registros...'
  });

  const handleSalvarAjustes = useCallback(async () => {
    if (!necessidadeAtual) {
      toast.error('Nenhuma necessidade selecionada');
      return;
    }

    try {
      // Mostrar feedback visual de processamento
      const loadingToast = toast.loading('Salvando ajustes...');

      // Validar produtos extras zerados
      const produtosExtrasZerados = necessidades.filter(nec => {
        const chave = `${nec.escola_id}_${nec.produto_id}`;
        const ajusteLocal = ajustesLocais[chave];
        const isExtra = nec.observacoes && nec.observacoes.includes('Produto extra');
        
        // Produto extra com valor zerado ou sem ajuste
        if (isExtra) {
          if (ajusteLocal === undefined || ajusteLocal === '' || parseFloat(ajusteLocal) === 0) {
            return true;
          }
        }
        return false;
      });

      if (produtosExtrasZerados.length > 0) {
        toast.dismiss(loadingToast);
        const nomesProdutos = produtosExtrasZerados.map(p => p.produto).join(', ');
        toast.error(`Produtos extra devem ter quantidade maior que zero: ${nomesProdutos}`);
        return;
      }

      // Filtrar apenas itens que têm ajuste local (usuário digitou)
      // Isso evita processar itens desnecessários e melhora performance
      const itensComAjuste = necessidades.filter(nec => {
        const chave = `${nec.escola_id}_${nec.produto_id}`;
        const ajusteLocal = ajustesLocais[chave];
        return ajusteLocal !== undefined && ajusteLocal !== '';
      });

      // Verificar se há trocas de produto origem (apenas para logística)
      let temTrocasProdutoOrigem = false;
      if (activeTab === 'logistica' && selectedProdutosOrigemLogistica) {
        // Verificar se há alguma troca selecionada
        temTrocasProdutoOrigem = Object.keys(selectedProdutosOrigemLogistica).some(chave => {
          const selecionado = selectedProdutosOrigemLogistica[chave];
          if (!selecionado || !selecionado.trim()) return false;
          
          // Verificar se é troca consolidada
          if (chave.includes('_')) {
            const [produtoId, grupo] = chave.split('_');
            const necessidadeRef = necessidades.find(n => 
              String(n.produto_id) === produtoId && 
              String(n.grupo_id || n.grupo || '') === grupo
            );
            if (necessidadeRef) {
              const [novoProdutoId] = selecionado.split('|');
              return novoProdutoId && String(novoProdutoId) !== String(necessidadeRef.produto_id);
            }
          } else {
            // Troca individual (por ID)
            const necId = parseInt(chave);
            const necessidadeRef = necessidades.find(n => n.id === necId);
            if (necessidadeRef) {
              const [novoProdutoId] = selecionado.split('|');
              return novoProdutoId && String(novoProdutoId) !== String(necessidadeRef.produto_id);
            }
          }
          return false;
        });
      }

      // Validar se há algo para salvar: ajustes OU trocas de produto origem
      if (itensComAjuste.length === 0 && !temTrocasProdutoOrigem) {
        toast.dismiss(loadingToast);
        toast.error('Nenhum ajuste foi feito. Digite um valor ou troque um produto origem antes de salvar.');
        return;
      }

      // Processar trocas de produto origem antes de salvar (apenas para logística)
      let trocasExecutadasComSucesso = false;
      
      if (activeTab === 'logistica' && selectedProdutosOrigemLogistica) {
        const trocas = [];
        
        // Agrupar necessidades por produto_id + grupo_id para trocas consolidadas
        const necessidadesPorChave = {};
        necessidades.forEach(nec => {
          const chave = `${nec.produto_id}_${nec.grupo_id || nec.grupo || ''}`;
          if (!necessidadesPorChave[chave]) {
            necessidadesPorChave[chave] = [];
          }
          necessidadesPorChave[chave].push(nec);
        });
        
        // Processar trocas consolidadas
        Object.keys(necessidadesPorChave).forEach(chave => {
          const selecionado = selectedProdutosOrigemLogistica[chave];
          if (selecionado && selecionado.trim()) {
            const [novoProdutoId] = selecionado.split('|');
            const necessidadesGrupo = necessidadesPorChave[chave];
            const primeiraNec = necessidadesGrupo[0];
            
            if (novoProdutoId && String(novoProdutoId) !== String(primeiraNec.produto_id)) {
              trocas.push({
                necessidade_ids: necessidadesGrupo.map(n => n.id),
                novo_produto_id: novoProdutoId
              });
            }
          }
        });
        
        // Processar trocas individuais
        necessidades.forEach(nec => {
          const chaveIndividual = `${nec.id}`;
          const selecionadoIndividual = selectedProdutosOrigemLogistica[chaveIndividual];
          
          if (selecionadoIndividual && selecionadoIndividual.trim()) {
            const [novoProdutoId] = selecionadoIndividual.split('|');
            if (novoProdutoId && String(novoProdutoId) !== String(nec.produto_id)) {
              // Verificar se não foi incluída em uma troca consolidada
              const jaIncluida = trocas.some(t => t.necessidade_ids.includes(nec.id));
              if (!jaIncluida) {
                trocas.push({
                  necessidade_ids: [nec.id],
                  novo_produto_id: novoProdutoId
                });
              }
            }
          }
        });
        
        // Executar todas as trocas em paralelo para melhorar performance
        // Para logística, usar serviço específico que atualiza diretamente na tabela necessidades
        // Para outras abas, usar o serviço de substituições que trabalha com necessidades_substituicoes
        const trocarService = activeTab === 'logistica' 
          ? necessidadesLogisticaService.trocarProdutoOrigem 
          : SubstituicoesNecessidadesService.trocarProdutoOrigem;
        
        // Processar todas as trocas em paralelo usando Promise.allSettled para não bloquear se alguma falhar
        if (trocas.length > 0) {
          const trocasPromises = trocas.map(troca => 
            trocarService({
              necessidade_ids: troca.necessidade_ids,
              novo_produto_id: troca.novo_produto_id
            }).catch(error => {
              console.error(`Erro ao trocar produto origem para necessidades ${troca.necessidade_ids.join(', ')}:`, error);
              return { success: false, error };
            })
          );
          
          const resultados = await Promise.allSettled(trocasPromises);
          
          // Verificar se houve sucesso em pelo menos uma troca
          trocasExecutadasComSucesso = resultados.some(result => 
            result.status === 'fulfilled' && result.value?.success
          );
          
          // Se houve trocas bem-sucedidas, recarregar as necessidades
          if (trocasExecutadasComSucesso) {
            await handleCarregarNecessidades();
          }
        }
      }

      // Mapear apenas os itens que têm ajuste local (se houver)
      const itens = itensComAjuste.map(nec => {
        const chave = `${nec.escola_id}_${nec.produto_id}`;
        const ajusteLocal = ajustesLocais[chave];
        
        // Tem ajuste local (foi digitado), normalizar vírgula para ponto antes de converter
        const ajusteNormalizado = String(ajusteLocal).replace(',', '.');
        const valorFinal = parseFloat(ajusteNormalizado) || 0;

        if (activeTab === 'coordenacao' || activeTab === 'logistica') {
          return {
            id: parseInt(nec.id),
            ajuste: valorFinal
          };
        } else {
          return {
            necessidade_id: parseInt(nec.id),
            ajuste_nutricionista: valorFinal
          };
        }
      });

      // Se houver itens com ajuste, salvar os ajustes
      let resultado = { success: true };
      
      if (itens.length > 0) {
      const dadosParaSalvar = {
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        periodo: {
          consumo_de: filtros.consumo_de,
          consumo_ate: filtros.consumo_ate
        },
        itens
      };

      if (activeTab === 'nutricionista') {
        resultado = await salvarAjustesNutricionista(dadosParaSalvar);
      } else if (activeTab === 'coordenacao') {
        resultado = await salvarAjustesCoordenacao(itens);
      } else if (activeTab === 'logistica') {
        resultado = await salvarAjustesLogistica(itens);
      }
      } else if (temTrocasProdutoOrigem && !trocasExecutadasComSucesso) {
        // Se houver apenas trocas mas não foram executadas com sucesso, marcar como erro
        resultado = { success: false, message: 'Erro ao trocar produto origem' };
      }
      
      // Remover toast de loading
      toast.dismiss(loadingToast);
      
      if (resultado.success || (itens.length === 0 && trocasExecutadasComSucesso)) {
        // Se houve apenas trocas de produto origem (sem ajustes), mostrar mensagem específica
        if (itens.length === 0 && trocasExecutadasComSucesso) {
          toast.success('Produto origem trocado com sucesso!');
        } else {
          // Usar a mensagem do backend se disponível, caso contrário usar mensagem padrão
          toast.success(resultado.message || 'Ajustes salvos com sucesso!');
        }
        
        if (itens.length > 0) {
        limparAjustesLocais();
        }
        
        // Aguardar recarregar as necessidades para atualizar a interface imediatamente
        await handleCarregarNecessidades();
      } else {
        toast.error(resultado.message || 'Erro ao salvar ajustes');
      }
    } catch (error) {
      console.error('Erro ao salvar ajustes:', error);
      toast.dismiss(loadingToast);
      toast.error('Erro ao salvar ajustes');
    }
  }, [activeTab, ajustesLocais, filtros, necessidadeAtual, necessidades, salvarAjustesNutricionista, salvarAjustesCoordenacao, salvarAjustesLogistica, handleCarregarNecessidades, limparAjustesLocais, selectedProdutosOrigemLogistica]);

  const handleLiberarCoordenacao = useCallback(async () => {
    try {
      const dadosParaLiberar = {
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        periodo: {
          consumo_de: filtros.consumo_de,
          consumo_ate: filtros.consumo_ate
        }
      };

      let resultado;
      if (activeTab === 'nutricionista') {
        // Nutri: NEC/NEC NUTRI -> NEC COORD
        if (!filtros.escola_id || !filtros.grupo) {
          toast.error('Selecione Escola e Grupo para liberar');
          return;
        }
        resultado = await liberarCoordenacao(dadosParaLiberar);
      } else if (activeTab === 'logistica') {
        // Logística: NEC LOG -> CONF NUTRI
        const possuiFiltroLogistica = Boolean(
          filtros.escola_id ||
          filtros.grupo ||
          filtros.semana_consumo ||
          filtros.semana_abastecimento
        );

        if (!possuiFiltroLogistica) {
          toast.error('Selecione ao menos um filtro para enviar');
          return;
        }
        
        // Coletar todos os necessidade_id únicos dos registros filtrados
        const necessidadesComEscola = necessidades
          .filter(n => n && n.necessidade_id)
          .map(n => ({ necessidade_id: n.necessidade_id, escola_id: n.escola_id, grupo: n.grupo, grupo_id: n.grupo_id }));

        if (necessidadesComEscola.length === 0) {
          toast.error('Nenhuma necessidade encontrada para enviar');
          return;
        }

        const registrosPorNecessidade = new Map();
        necessidadesComEscola.forEach(item => {
          if (!registrosPorNecessidade.has(item.necessidade_id)) {
            registrosPorNecessidade.set(item.necessidade_id, item);
          }
        });
        
        const todosRegistros = Array.from(registrosPorNecessidade.values());
        
        // Se houver grupo, enviar apenas os IDs desse grupo
        // Se não houver grupo, enviar todos os IDs retornados
        let registrosSelecionados = todosRegistros;
        if (filtros.grupo) {
          const normalizarGrupo = (valor) => {
            if (valor === null || valor === undefined) return null;
            if (typeof valor === 'object') {
              return (
                valor.nome ??
                valor.label ??
                valor.value ??
                valor.id ??
                valor.nome_grupo ??
                null
              );
            }
            return valor;
          };

          const grupoFiltroBruto = normalizarGrupo(filtros.grupo);
          const grupoFiltroTexto = grupoFiltroBruto
            ? String(grupoFiltroBruto).trim().toLowerCase()
            : null;
          const grupoFiltroNumero = !Number.isNaN(Number(grupoFiltroBruto))
            ? Number(grupoFiltroBruto)
            : null;

          registrosSelecionados = todosRegistros.filter((item) => {
            const grupoItemTexto = item.grupo ? String(item.grupo).trim().toLowerCase() : null;
            const grupoItemNumero =
              item.grupo_id !== undefined && item.grupo_id !== null
                ? Number(item.grupo_id)
                : null;

            const matchTexto =
              grupoFiltroTexto && grupoItemTexto
                ? grupoItemTexto === grupoFiltroTexto
                : false;
            const matchNumero =
              grupoFiltroNumero !== null && grupoItemNumero !== null
                ? grupoItemNumero === grupoFiltroNumero
                : false;

            return matchTexto || matchNumero;
          });

          if (registrosSelecionados.length === 0 && todosRegistros.length > 0) {
            // Fallback: se o backend já aplicou o filtro, reaproveita todos os registros retornados
            registrosSelecionados = todosRegistros;
          }

          if (registrosSelecionados.length === 0) {
            toast.error('Nenhuma necessidade encontrada para o grupo selecionado');
            return;
          }
        }

        // Abrir modal de progresso
        setProgressoModal({
          isOpen: true,
          progresso: 0,
          total: registrosSelecionados.length,
          mensagem: 'Enviando registros para Confirmação Nutri (CONF NUTRI)...'
        });

        // Processar em blocos para melhor performance
        // Aumentar tamanho do bloco para grandes volumes (4k+ linhas)
        const totalRegistros = registrosSelecionados.length;
        const TAMANHO_BLOCO = totalRegistros > 2000 ? 100 : 50; // Blocos maiores para grandes volumes
        const necessidadeIds = registrosSelecionados.map(r => r.necessidade_id);
        let totalSucessos = 0;
        let totalErros = 0;
        let processados = 0;
        const totalBlocos = Math.ceil(necessidadeIds.length / TAMANHO_BLOCO);
        
        // Processar em blocos com delay entre eles para não sobrecarregar
        for (let i = 0; i < necessidadeIds.length; i += TAMANHO_BLOCO) {
          const bloco = necessidadeIds.slice(i, i + TAMANHO_BLOCO);
          const blocoAtual = Math.floor(i / TAMANHO_BLOCO) + 1;
          
          try {
            // Atualizar mensagem de progresso com informações do bloco
            setProgressoModal(prev => ({
              ...prev,
              mensagem: `Processando bloco ${blocoAtual} de ${totalBlocos} (${processados}/${totalRegistros} registros)...`
            }));
            
            // Enviar bloco inteiro de uma vez
            const resultado = await enviarParaNutricionista({
              necessidade_ids: bloco
            }, true); // skipLoading = true para não piscar o filtro
            
            totalSucessos += (resultado.sucessos || 0);
            totalErros += (resultado.erros || 0);
            processados += bloco.length;
          } catch (error) {
            console.error(`Erro ao processar bloco ${blocoAtual}:`, error);
            totalErros += bloco.length;
            processados += bloco.length;
          }
          
          // Atualizar progresso
          setProgressoModal(prev => ({
            ...prev,
            progresso: processados
          }));
          
          // Pequeno delay entre blocos para não sobrecarregar o servidor (exceto no último bloco)
          if (i + TAMANHO_BLOCO < necessidadeIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms entre blocos
          }
        }
        
        // Fechar modal de progresso
        setProgressoModal(prev => ({ ...prev, isOpen: false }));
        
        resultado = {
          success: totalSucessos > 0,
          data: { sucessos: totalSucessos, erros: totalErros },
          sucessos: totalSucessos,
          erros: totalErros
        };
      } else {
        // Coordenação: NEC COORD -> NEC LOG; CONF COORD -> CONF
        const status = necessidades[0]?.status;
        const possuiFiltroCoordenacao = Boolean(
          filtros.escola_id ||
          filtros.nutricionista_id ||
          filtros.grupo ||
          filtros.semana_consumo ||
          filtros.semana_abastecimento
        );

        if (!possuiFiltroCoordenacao) {
          toast.error('Selecione ao menos um filtro para liberar na coordenação');
          return;
        }
        
        // Coletar todos os necessidade_id únicos dos registros filtrados
        const necessidadeIdsUnicos = [...new Set(necessidades.map(n => n.necessidade_id).filter(Boolean))];
        
        if (necessidadeIdsUnicos.length === 0) {
          toast.error('Nenhuma necessidade encontrada para enviar');
          return;
        }
        
        // Se houver grupo, filtrar por grupo também (aceitando variações de formato)
        let idsParaEnviar = necessidadeIdsUnicos;
        if (filtros.grupo) {
          const normalizarGrupo = (valor) => {
            if (valor === null || valor === undefined) return null;
            if (typeof valor === 'object') {
              return (
                valor.nome ??
                valor.label ??
                valor.value ??
                valor.id ??
                valor.nome_grupo ??
                null
              );
            }
            return valor;
          };

          const grupoFiltroBruto = normalizarGrupo(filtros.grupo);
          const grupoFiltroTexto = grupoFiltroBruto
            ? String(grupoFiltroBruto).trim().toLowerCase()
            : null;
          const grupoFiltroNumero = !Number.isNaN(Number(grupoFiltroBruto))
            ? Number(grupoFiltroBruto)
            : null;

          idsParaEnviar = necessidades
            .filter((n) => {
              const grupoNecTexto = n.grupo ? String(n.grupo).trim().toLowerCase() : null;
              const grupoNecNumero =
                n.grupo_id !== undefined && n.grupo_id !== null
                  ? Number(n.grupo_id)
                  : null;

              const matchTexto =
                grupoFiltroTexto && grupoNecTexto
                  ? grupoNecTexto === grupoFiltroTexto
                  : false;
              const matchNumero =
                grupoFiltroNumero !== null && grupoNecNumero !== null
                  ? grupoNecNumero === grupoFiltroNumero
                  : false;

              return matchTexto || matchNumero;
            })
            .map((n) => n.necessidade_id)
            .filter(Boolean);

          idsParaEnviar = [...new Set(idsParaEnviar)];

          if (idsParaEnviar.length === 0 && necessidades.length > 0) {
            // Fallback: se a API já retornou apenas o grupo filtrado, usa todos os IDs carregados
            idsParaEnviar = necessidadeIdsUnicos;
          }

          if (idsParaEnviar.length === 0) {
            toast.error('Nenhuma necessidade encontrada para o grupo selecionado');
            return;
          }
        }
        
        // Sempre usar modal de progresso para mostrar o andamento
        // Processar em blocos para melhor performance
        const usarModalProgresso = idsParaEnviar.length > 0;
        
        if (usarModalProgresso) {
          // Abrir modal de progresso
          setProgressoModal({
            isOpen: true,
            progresso: 0,
            total: idsParaEnviar.length,
            mensagem: status === 'NEC COORD' 
              ? 'Enviando registros para Logística (NEC LOG)...'
              : 'Confirmando registros (CONF)...'
          });

          // Processar em blocos para melhor performance
          // Aumentar tamanho do bloco para grandes volumes (4k+ linhas)
          const totalRegistros = idsParaEnviar.length;
          const TAMANHO_BLOCO = totalRegistros > 2000 ? 100 : 50; // Blocos maiores para grandes volumes
          let totalSucessos = 0;
          let totalErros = 0;
          let processados = 0;
          const totalBlocos = Math.ceil(idsParaEnviar.length / TAMANHO_BLOCO);
          
          // Processar em blocos com delay entre eles para não sobrecarregar
          for (let i = 0; i < idsParaEnviar.length; i += TAMANHO_BLOCO) {
            const bloco = idsParaEnviar.slice(i, i + TAMANHO_BLOCO);
            const blocoAtual = Math.floor(i / TAMANHO_BLOCO) + 1;
            
            try {
              // Atualizar mensagem de progresso com informações do bloco
              setProgressoModal(prev => ({
                ...prev,
                mensagem: status === 'NEC COORD' 
                  ? `Processando bloco ${blocoAtual} de ${totalBlocos} (${processados}/${totalRegistros} registros)...`
                  : `Confirmando bloco ${blocoAtual} de ${totalBlocos} (${processados}/${totalRegistros} registros)...`
              }));
              
              let resultadoBloco;
              if (status === 'NEC COORD') {
                resultadoBloco = await liberarParaLogistica(bloco);
              } else if (status === 'CONF COORD') {
                resultadoBloco = await confirmarFinal(bloco);
              }
              
              totalSucessos += (resultadoBloco?.sucessos || resultadoBloco?.data?.sucessos || 0);
              totalErros += (resultadoBloco?.erros || resultadoBloco?.data?.erros || 0);
              processados += bloco.length;
            } catch (error) {
              console.error(`Erro ao processar bloco ${blocoAtual}:`, error);
              totalErros += bloco.length;
              processados += bloco.length;
            }
            
            // Atualizar progresso
            setProgressoModal(prev => ({
              ...prev,
              progresso: processados
            }));
            
            // Pequeno delay entre blocos para não sobrecarregar o servidor (exceto no último bloco)
            if (i + TAMANHO_BLOCO < idsParaEnviar.length) {
              await new Promise(resolve => setTimeout(resolve, 100)); // 100ms entre blocos
            }
          }
          
          // Fechar modal de progresso
          setProgressoModal(prev => ({ ...prev, isOpen: false }));
          
          resultado = {
            success: totalSucessos > 0,
            data: { sucessos: totalSucessos, erros: totalErros },
            sucessos: totalSucessos,
            erros: totalErros
          };
        } else {
          // Se não houver registros, retornar erro
          resultado = {
            success: false,
            message: 'Nenhum registro para processar'
          };
        }
      }
      
      if (resultado.success) {
        // Na aba de coordenação, os hooks já formatam e mostram o toast corretamente
        // Então não precisamos mostrar toast novamente aqui
        if (activeTab !== 'coordenacao') {
          let mensagem;
          const quantidade = resultado.data?.affectedRows || resultado.data?.sucessos || resultado.sucessos || necessidades.length;
          const erros = resultado.data?.erros || resultado.erros || 0;
          
          if (activeTab === 'nutricionista') {
            mensagem = `${quantidade} necessidade(s) liberada(s) para coordenação (NEC COORD)!`;
          } else if (activeTab === 'logistica') {
            mensagem = `${quantidade} necessidade(s) enviada(s) para Confirmação Nutri (CONF NUTRI)!`;
          } else {
            const status = necessidades[0]?.status;
            if (status === 'NEC COORD') {
              mensagem = `${quantidade} necessidade(s) enviada(s) para Logística (NEC LOG)!`;
            } else if (status === 'CONF COORD') {
              mensagem = `${quantidade} necessidade(s) confirmada(s) (CONF)!`;
            } else {
              mensagem = `${quantidade} necessidade(s) liberada(s)!`;
            }
          }
          
          // Se houver erros, incluir na mensagem
          if (erros > 0) {
            mensagem += ` (${erros} erro(s))`;
          }
          
          toast.success(mensagem);
        }
        
        // Limpar filtros da aba atual após avançar
        if (activeTab === 'nutricionista') {
          atualizarFiltrosNutricionista({
            escola_id: null,
            grupo: null,
            semana_consumo: null,
            semana_abastecimento: null
          });
        } else if (activeTab === 'coordenacao') {
          atualizarFiltrosCoordenacao({
            escola_id: null,
            grupo: null,
            semana_consumo: null,
            semana_abastecimento: null,
            nutricionista_id: null
          });
        } else if (activeTab === 'logistica') {
          // Para logística, limpar os filtros e necessidades sem recarregar a página
          // O reload causava múltiplas requisições desnecessárias
          // Usar limparFiltrosLogistica para limpar também as necessidades carregadas
          limparFiltrosLogistica();
          // Não fazer reload da página, apenas limpar o estado
          return; // Retornar aqui para evitar o reload abaixo
        }
        
        // Recarregar a página para consultar registros atualizados (apenas para outras abas)
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Aguardar 1 segundo para o toast aparecer
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro ao liberar:', error);
      // Fechar modal de progresso em caso de erro
      if (activeTab === 'logistica' || activeTab === 'coordenacao') {
        setProgressoModal(prev => ({ ...prev, isOpen: false }));
      }
      toast.error('Erro ao liberar');
      return { success: false };
    }
  }, [activeTab, filtros, liberarCoordenacao, confirmarFinal, liberarParaLogistica, enviarParaNutricionista, necessidades, atualizarFiltrosNutricionista, atualizarFiltrosCoordenacao, atualizarFiltrosLogistica, limparFiltrosLogistica, setProgressoModal]);

  return {
    handleSalvarAjustes,
    handleLiberarCoordenacao,
    progressoModal
  };
};

