import React, { useState, useRef, useMemo } from 'react';
import { FaPrint } from 'react-icons/fa';
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
  const [tipoAgrupamento, setTipoAgrupamento] = useState('grupo'); // 'grupo' ou 'escola'
  const printRef = useRef(null);

  // Validar se os filtros obrigatórios estão preenchidos
  const filtrosValidos = filtros.tipo_rota_id && filtros.rota_id && filtros.semana_abastecimento;

  // Agrupar produtos por grupo ou escola
  const gruposRomaneio = useMemo(() => {
    if (!dadosImpressao || !Array.isArray(dadosImpressao.produtos)) {
      return [];
    }

    // Se um grupo específico foi selecionado e o agrupamento é por grupo, não agrupar
    // (mostrará apenas o grupo selecionado)
    if (filtros.grupo && tipoAgrupamento === 'grupo') {
      return [];
    }
    
    // Se um grupo específico foi selecionado mas o agrupamento é por escola,
    // filtrar apenas produtos do grupo selecionado antes de agrupar por escola
    const produtosParaAgrupar = filtros.grupo && tipoAgrupamento === 'escola'
      ? dadosImpressao.produtos.filter(p => p.grupo === filtros.grupo)
      : dadosImpressao.produtos;

    const agrupados = produtosParaAgrupar.reduce((acc, produto) => {
      let chave;
      let nome;
      
      if (tipoAgrupamento === 'escola') {
        chave = produto.escola_id || `escola_${produto.escola_nome}`;
        nome = produto.escola_nome || 'Sem Escola';
        
        // Quando agrupar por escola, consolidar produtos (somar quantidades do mesmo produto)
        if (!acc.has(chave)) {
          acc.set(chave, {
            nome,
            tipo: tipoAgrupamento,
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
          // Somar quantidade se o produto já existe
          produtoExistente.quantidade = (parseFloat(produtoExistente.quantidade) || 0) + (parseFloat(produto.quantidade) || 0);
        } else {
          // Adicionar novo produto
          produtosEscola.push({ ...produto });
        }
      } else {
        chave = produto.grupo || 'Sem Grupo';
        nome = produto.grupo || 'Sem Grupo';
        
        if (!acc.has(chave)) {
          acc.set(chave, {
            nome,
            tipo: tipoAgrupamento,
            produtos: []
          });
        }
        acc.get(chave).produtos.push(produto);
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
  }, [dadosImpressao, filtros.grupo, tipoAgrupamento]);

  const handleLimparFiltros = () => {
    limparFiltros();
    setDadosImpressao(null);
    setError(null);
    setTipoAgrupamento('grupo');
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
                  <span className="text-sm font-medium text-gray-700">Agrupar por:</span>
                  <div className="flex gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="tipoAgrupamento"
                        value="grupo"
                        checked={tipoAgrupamento === 'grupo'}
                        onChange={(e) => setTipoAgrupamento(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Grupo</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="tipoAgrupamento"
                        value="escola"
                        checked={tipoAgrupamento === 'escola'}
                        onChange={(e) => setTipoAgrupamento(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Escola</span>
                    </label>
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
          {filtros.grupo && tipoAgrupamento === 'grupo' ? (
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
                  grupo={tipo === 'escola' ? null : nome || 'Sem Grupo'}
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
              <strong>Agrupamento:</strong> Após carregar os dados, você pode escolher entre agrupar por "Grupo" ou por "Escola". O romaneio será impresso separado conforme a opção escolhida.
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

