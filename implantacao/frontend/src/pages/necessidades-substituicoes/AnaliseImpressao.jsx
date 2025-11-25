import React, { useState, useRef, useMemo } from 'react';
import { FaPrint, FaList, FaLayerGroup } from 'react-icons/fa';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { SubstituicoesFilters } from './components';
import { Button } from '../../components/ui';
import SubstituicoesNecessidadesService from '../../services/substituicoesNecessidades';
import toast from 'react-hot-toast';
import RomaneioPrint from './components/RomaneioPrint';

const AnaliseImpressao = () => {
  const {
    grupos,
    semanasAbastecimento,
    semanasConsumo,
    tiposRota,
    rotas,
    filtros,
    atualizarFiltros,
    limparFiltros
  } = useSubstituicoesNecessidades('impressao');

  const [dadosImpressao, setDadosImpressao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [marcandoImpresso, setMarcandoImpresso] = useState(false);
  const [error, setError] = useState(null);
  const [tipoAgrupamento, setTipoAgrupamento] = useState('consolidado'); // 'individual' ou 'consolidado'
  const printRef = useRef(null);

  // Validar se os filtros obrigatórios estão preenchidos
  const filtrosValidos = filtros.tipo_rota_id && filtros.rota_id && filtros.semana_abastecimento;

  // Agrupar produtos por individual ou consolidado
  const gruposRomaneio = useMemo(() => {
    if (!dadosImpressao || !Array.isArray(dadosImpressao.produtos)) {
      return [];
    }

    // Se um grupo específico foi selecionado e o modo é consolidado, não agrupar
    // (mostrará apenas o grupo selecionado)
    if (filtros.grupo && tipoAgrupamento === 'consolidado') {
      return [];
    }
    
    // Filtrar produtos se um grupo específico foi selecionado
    const produtosParaAgrupar = filtros.grupo
      ? dadosImpressao.produtos.filter(p => p.grupo === filtros.grupo)
      : dadosImpressao.produtos;

    if (tipoAgrupamento === 'individual') {
      // Modo Individual: agrupar por escola (cada escola separada)
      const agrupados = produtosParaAgrupar.reduce((acc, produto) => {
        const chave = produto.escola_id || `escola_${produto.escola_nome}`;
        const nome = produto.escola_nome || 'Sem Escola';
        
        if (!acc.has(chave)) {
          acc.set(chave, {
            nome,
            tipo: 'escola',
            produtos: []
          });
        }
        
        // Verificar se o produto já existe na escola
        const produtosEscola = acc.get(chave).produtos;
        const produtoExistente = produtosEscola.find(p => 
          p.codigo === produto.codigo && 
          p.descricao === produto.descricao &&
          p.unidade === produto.unidade
        );
        
        if (produtoExistente) {
          // Somar quantidade se o produto já existe na escola
          produtoExistente.quantidade = (parseFloat(produtoExistente.quantidade) || 0) + (parseFloat(produto.quantidade) || 0);
        } else {
          // Adicionar novo produto
          produtosEscola.push({ ...produto });
        }
        
        return acc;
      }, new Map());
      
      return Array.from(agrupados.entries()).map(([chave, { nome, tipo, produtos }]) => {
        const produtosOrdenados = [...produtos].sort((a, b) => {
          const nomeA = (a.descricao || '').toLowerCase();
          const nomeB = (b.descricao || '').toLowerCase();
          return nomeA.localeCompare(nomeB);
        });
        
        return {
          chave,
          nome,
          tipo,
          dados: {
            ...dadosImpressao,
            produtos: produtosOrdenados,
            total_produtos: produtosOrdenados.length
          }
        };
      });
    } else {
      // Modo Consolidado: agrupar por grupo (consolidar produtos)
      const agrupados = produtosParaAgrupar.reduce((acc, produto) => {
        const chave = produto.grupo || 'Sem Grupo';
        const nome = produto.grupo || 'Sem Grupo';
        
        if (!acc.has(chave)) {
          acc.set(chave, {
            nome,
            tipo: 'grupo',
            produtos: []
          });
        }
        
        // Consolidar produtos por código (somar quantidades do mesmo produto dentro do grupo)
        const produtosGrupo = acc.get(chave).produtos;
        const produtoExistente = produtosGrupo.find(p => 
          p.codigo === produto.codigo && 
          p.descricao === produto.descricao &&
          p.unidade === produto.unidade
        );
        
        if (produtoExistente) {
          // Somar quantidade se o produto já existe no grupo
          produtoExistente.quantidade = (parseFloat(produtoExistente.quantidade) || 0) + (parseFloat(produto.quantidade) || 0);
        } else {
          // Adicionar novo produto
          produtosGrupo.push({ ...produto });
        }
        
        return acc;
      }, new Map());
      
      return Array.from(agrupados.entries()).map(([chave, { nome, tipo, produtos }]) => {
        // Ordenar produtos por nome após consolidação
        const produtosOrdenados = [...produtos].sort((a, b) => {
          const nomeA = (a.descricao || '').toLowerCase();
          const nomeB = (b.descricao || '').toLowerCase();
          return nomeA.localeCompare(nomeB);
        });
        
        return {
          chave,
          nome,
          tipo,
          dados: {
            ...dadosImpressao,
            produtos: produtosOrdenados,
            total_produtos: produtosOrdenados.length
          }
        };
      });
    }
  }, [dadosImpressao, filtros.grupo, tipoAgrupamento]);

  const handleLimparFiltros = () => {
    limparFiltros();
    setDadosImpressao(null);
    setError(null);
    setTipoAgrupamento('consolidado');
  };

  const handleBuscarDados = async () => {
    if (!filtrosValidos) {
      toast.error('Preencha todos os filtros obrigatórios: Tipo de Rota, Rota e Semana de Abastecimento');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await SubstituicoesNecessidadesService.buscarDadosImpressao(filtros);
      
      if (response.success) {
        setDadosImpressao(response.data);
        toast.success('Dados carregados com sucesso!');
      } else {
        setError(response.message || 'Erro ao carregar dados');
        toast.error(response.message || 'Erro ao carregar dados');
      }
    } catch (error) {
      console.error('Erro ao buscar dados para impressão:', error);
      setError('Erro ao buscar dados para impressão');
      toast.error('Erro ao buscar dados para impressão');
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = async () => {
    if (!dadosImpressao) {
      toast.error('Carregue os dados antes de imprimir');
      return;
    }

    if (!filtrosValidos) {
      toast.error('Filtros obrigatórios não estão preenchidos');
      return;
    }

    setMarcandoImpresso(true);

    try {
      // Marcar como impresso antes de imprimir
      const response = await SubstituicoesNecessidadesService.marcarComoImpresso(filtros);
      
      if (response.success) {
        toast.success(`Status atualizado para impressão (${response.affectedRows} registro(s) atualizado(s))`);
        
        // Aguardar um momento antes de imprimir para garantir que a atualização foi processada
        setTimeout(() => {
          handlePrint();
          setMarcandoImpresso(false);
        }, 500);
      } else {
        toast.error(response.message || 'Erro ao marcar como impresso');
        setMarcandoImpresso(false);
      }
    } catch (error) {
      console.error('Erro ao marcar como impresso:', error);
      toast.error('Erro ao marcar como impresso. Tentando imprimir mesmo assim...');
      setMarcandoImpresso(false);
      
      // Tenta imprimir mesmo se houver erro
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  };

  const handlePrint = () => {
    // Simplesmente chamar window.print() - os estilos CSS no componente já cuidam da ocultação
    window.print();
  };

  return (
    <>
      {/* Estilos para impressão */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content,
            .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .print-content .romaneio-group {
              page-break-after: always;
            }
            .print-content .romaneio-group:last-of-type {
              page-break-after: auto;
            }
            @page {
              size: A4 landscape;
              margin: 0.5cm;
            }
          }
        `
      }} />

      {/* Filtros - não devem aparecer na impressão */}
      <div className="no-print">
        <SubstituicoesFilters
          grupos={grupos}
          semanasAbastecimento={semanasAbastecimento}
          semanasConsumo={semanasConsumo}
          tiposRota={tiposRota}
          rotas={rotas}
          filtros={filtros}
          loading={loading}
          onFiltroChange={atualizarFiltros}
          onLimparFiltros={handleLimparFiltros}
        />
      </div>

      {/* Botões de Ação - não devem aparecer na impressão */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 no-print">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Button
              variant="primary"
              onClick={handleBuscarDados}
              disabled={!filtrosValidos || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Carregando...
                </>
              ) : (
                'Carregar Dados'
              )}
            </Button>
            
            {dadosImpressao && (
              <>
                {/* Seleção de tipo de agrupamento */}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
                  <span className="text-sm font-medium text-gray-700">Modelo de Impressão:</span>
                  <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setTipoAgrupamento('individual')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                        tipoAgrupamento === 'individual'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Individual - Agrupa por Escola"
                    >
                      <FaList className="w-4 h-4" />
                      Individual
                      <span className="text-xs text-gray-500 ml-1">(Escola)</span>
                    </button>
                    <button
                      onClick={() => setTipoAgrupamento('consolidado')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                        tipoAgrupamento === 'consolidado'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Consolidado - Agrupa por Grupo"
                    >
                      <FaLayerGroup className="w-4 h-4" />
                      Consolidado
                      <span className="text-xs text-gray-500 ml-1">(Grupo)</span>
                    </button>
                  </div>
                </div>

                <Button
                  variant="success"
                  onClick={handleImprimir}
                  disabled={marcandoImpresso}
                  className="flex items-center gap-2"
                >
                  {marcandoImpresso ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Marcando como impresso...
                    </>
                  ) : (
                    <>
                      <FaPrint className="w-4 h-4" />
                      Imprimir
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message - não deve aparecer na impressão */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 no-print">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Dados para Impressão - deve aparecer apenas na impressão */}
      {dadosImpressao && (
        <div ref={printRef} className="print-content">
          {filtros.grupo && tipoAgrupamento === 'consolidado' ? (
            <div className="romaneio-group">
              <RomaneioPrint
                dados={dadosImpressao}
                grupo={filtros.grupo || dadosImpressao.produtos[0]?.grupo || 'Sem Grupo'}
              />
            </div>
          ) : gruposRomaneio.length > 0 ? (
            gruposRomaneio.map(({ chave, nome, tipo, dados }) => (
              <div key={chave} className="romaneio-group">
                <RomaneioPrint 
                  dados={dados} 
                  grupo={tipo === 'escola' ? (filtros.grupo || dados.produtos[0]?.grupo || null) : nome || 'Sem Grupo'}
                  escola={tipo === 'escola' ? nome : null}
                />
              </div>
            ))
          ) : (
            <div className="romaneio-group">
              <RomaneioPrint
                dados={dadosImpressao}
                grupo={dadosImpressao.produtos[0]?.grupo || 'Sem Grupo'}
              />
            </div>
          )}
        </div>
      )}

      {/* Mensagem quando não há dados - não deve aparecer na impressão */}
      {!dadosImpressao && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center no-print">
          <FaPrint className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Impressão de Romaneio
          </h3>
          <p className="text-gray-600">
            Preencha os filtros obrigatórios (Tipo de Rota, Rota e Semana de Abastecimento) e clique em "Carregar Dados" para visualizar o romaneio.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              <strong>Filtro Grupo:</strong> Opcional. Se selecionado, o romaneio será impresso apenas para o grupo escolhido (quando agrupamento por grupo estiver selecionado).
            </span>
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              <strong>Modelo de Impressão:</strong> Após carregar os dados, você pode escolher entre "Individual" (agrupa por Escola) ou "Consolidado" (agrupa por Grupo). O romaneio será impresso separado conforme a opção escolhida.
            </span>
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Apenas necessidades com status "conf log" podem ser impressas. Ao imprimir, o status será atualizado para "impressao".
            </span>
          </p>
        </div>
      )}
    </>
  );
};

export default AnaliseImpressao;

