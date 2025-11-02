import React, { useState, useRef } from 'react';
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
  const printRef = useRef(null);

  // Validar se os filtros obrigatórios estão preenchidos
  const filtrosValidos = filtros.tipo_rota_id && filtros.rota_id && filtros.semana_abastecimento;

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
          onLimparFiltros={limparFiltros}
        />
      </div>

      {/* Botões de Ação - não devem aparecer na impressão */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 no-print">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
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
          <RomaneioPrint dados={dadosImpressao} grupo={filtros.grupo || dadosImpressao.produtos[0]?.grupo} />
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
              Apenas necessidades com status "conf log" podem ser impressas. Ao imprimir, o status será atualizado para "impressao".
            </span>
          </p>
        </div>
      )}
    </>
  );
};

export default AnaliseImpressao;

