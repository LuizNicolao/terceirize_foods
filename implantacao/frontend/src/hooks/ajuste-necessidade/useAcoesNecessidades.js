import { useCallback } from 'react';
import toast from 'react-hot-toast';

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
  atualizarFiltrosLogistica
}) => {
  const handleSalvarAjustes = useCallback(async () => {
    if (!necessidadeAtual) {
      toast.error('Nenhuma necessidade selecionada');
      return;
    }

    try {
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
        const nomesProdutos = produtosExtrasZerados.map(p => p.produto).join(', ');
        toast.error(`Produtos extra devem ter quantidade maior que zero: ${nomesProdutos}`);
        return;
      }

      // Mapear todos os produtos, incluindo os que têm e não têm ajuste local
      const itens = necessidades.map(nec => {
        const chave = `${nec.escola_id}_${nec.produto_id}`;
        const ajusteLocal = ajustesLocais[chave];
        
        let valorFinal;
        
        if (ajusteLocal !== undefined && ajusteLocal !== '') {
          // Tem ajuste local (foi digitado)
          // Normalizar vírgula para ponto antes de converter
          const ajusteNormalizado = String(ajusteLocal).replace(',', '.');
          valorFinal = parseFloat(ajusteNormalizado) || 0;
        } else {
          // Não tem ajuste local, preservar valor existente no banco
          if (activeTab === 'nutricionista') {
            // Para nutricionista, considerar status
            if (nec.status === 'CONF NUTRI') {
              // Se CONF NUTRI, manter ajuste_coordenacao ou ajuste_nutricionista
              valorFinal = nec.ajuste_coordenacao || nec.ajuste_nutricionista || nec.ajuste || 0;
            } else {
              // Para NEC ou NEC NUTRI, manter ajuste_nutricionista
              valorFinal = nec.ajuste_nutricionista || nec.ajuste || 0;
            }
          } else if (activeTab === 'logistica') {
            // Para logística, considerar ajuste_coordenacao primeiro
            valorFinal = nec.ajuste_coordenacao || nec.ajuste_nutricionista || nec.ajuste || 0;
          } else {
            // Para coordenação, considerar ajuste_conf_nutri primeiro (último valor da nutri)
            valorFinal = nec.ajuste_conf_nutri || nec.ajuste_coordenacao || nec.ajuste_nutricionista || nec.ajuste || 0;
          }
        }

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

      const dadosParaSalvar = {
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        periodo: {
          consumo_de: filtros.consumo_de,
          consumo_ate: filtros.consumo_ate
        },
        itens
      };

      let resultado;
      if (activeTab === 'nutricionista') {
        resultado = await salvarAjustesNutricionista(dadosParaSalvar);
      } else if (activeTab === 'coordenacao') {
        resultado = await salvarAjustesCoordenacao(itens);
      } else if (activeTab === 'logistica') {
        resultado = await salvarAjustesLogistica(itens);
      }
      
      if (resultado.success) {
        toast.success('Ajustes salvos com sucesso!');
        limparAjustesLocais();
        handleCarregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao salvar ajustes:', error);
      toast.error('Erro ao salvar ajustes');
    }
  }, [activeTab, ajustesLocais, filtros, necessidadeAtual, necessidades, salvarAjustesNutricionista, salvarAjustesCoordenacao, salvarAjustesLogistica, handleCarregarNecessidades, limparAjustesLocais]);

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

        const resultados = await Promise.all(
          registrosSelecionados.map(registro =>
            enviarParaNutricionista({
              necessidade_id: registro.necessidade_id,
              escola_id: registro.escola_id
            })
          )
        );
        
        const sucessos = resultados.filter(r => r.success).length;
        const erros = resultados.filter(r => !r.success).length;
        
        resultado = {
          success: sucessos > 0,
          data: { sucessos, erros },
          sucessos,
          erros
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
        
        if (status === 'NEC COORD') {
          // NEC COORD vai para NEC LOG (não mais para CONF NUTRI)
          resultado = await liberarParaLogistica(idsParaEnviar);
        } else if (status === 'CONF COORD') {
          resultado = await confirmarFinal(idsParaEnviar);
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
          atualizarFiltrosLogistica({
            escola_id: null,
            grupo: null,
            semana_consumo: null,
            semana_abastecimento: null
          });
        }
        
        // Recarregar a página para consultar registros atualizados
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Aguardar 1 segundo para o toast aparecer
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro ao liberar:', error);
      toast.error('Erro ao liberar');
      return { success: false };
    }
  }, [activeTab, filtros, liberarCoordenacao, confirmarFinal, liberarParaLogistica, enviarParaNutricionista, necessidades, atualizarFiltrosNutricionista, atualizarFiltrosCoordenacao, atualizarFiltrosLogistica]);

  return {
    handleSalvarAjustes,
    handleLiberarCoordenacao
  };
};

