import React, { useState } from 'react';
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
  const [error, setError] = useState(null);

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

  const handleImprimir = () => {
    if (!dadosImpressao) {
      toast.error('Carregue os dados antes de imprimir');
      return;
    }

    window.print();
  };

  return (
    <>
      {/* Filtros */}
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

      {/* Botões de Ação */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
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
                className="flex items-center gap-2"
              >
                <FaPrint className="w-4 h-4" />
                Imprimir
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Dados para Impressão */}
      {dadosImpressao && (
        <RomaneioPrint dados={dadosImpressao} grupo={filtros.grupo || dadosImpressao.produtos[0]?.grupo} />
      )}

      {/* Mensagem quando não há dados */}
      {!dadosImpressao && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaPrint className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Impressão de Romaneio
          </h3>
          <p className="text-gray-600">
            Preencha os filtros obrigatórios (Tipo de Rota, Rota e Semana de Abastecimento) e clique em "Carregar Dados" para visualizar o romaneio.
          </p>
        </div>
      )}
    </>
  );
};

export default AnaliseImpressao;

