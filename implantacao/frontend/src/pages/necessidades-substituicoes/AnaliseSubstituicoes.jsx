import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useSubstituicoesNutricionista } from '../../hooks/useSubstituicoesNutricionista';
import { useSubstituicoesCoordenacao } from '../../hooks/useSubstituicoesCoordenacao';
import { useExportSubstituicoes } from '../../hooks/useExportSubstituicoes';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import { useGruposConsulta } from '../../hooks/useGruposConsulta';
import { substituicoesNecessidadesService } from '../../services/substituicoesNecessidades';
import toast from 'react-hot-toast';

// Componentes
import SubstituicoesFilters from './components/SubstituicoesFilters';
import SubstituicoesTableNutricionista from './components/SubstituicoesTableNutricionista';
import SubstituicoesTableCoordenacao from './components/SubstituicoesTableCoordenacao';
import SubstituicoesActions from './components/SubstituicoesActions';

const AnaliseSubstituicoes = () => {
  const { user } = useAuth();
  const { canView } = usePermissions();
  
  // Estados das abas
  const [activeTab, setActiveTab] = useState('nutricionista');
  
  // Hooks específicos por aba
  const nutricionista = useSubstituicoesNutricionista();
  const coordenacao = useSubstituicoesCoordenacao();
  const exportacao = useExportSubstituicoes();
  
  // Hooks para filtros
  const { grupos } = useGruposConsulta();
  const { semanasAbastecimento } = useSemanasAbastecimento();
  const { buscarPorSemanaAbastecimento } = useSemanasConsumo();
  
  // Estados para produtos genéricos
  const [produtosGenericos, setProdutosGenericos] = useState({});
  const [loadingGenericos, setLoadingGenericos] = useState({});

  // Verificar permissões
  const canViewNutricionista = canView('necessidades_substituicoes_nutricionista');
  const canViewCoordenacao = canView('necessidades_substituicoes_coordenacao');

  // Determinar aba inicial baseada nas permissões
  useEffect(() => {
    if (canViewCoordenacao && !canViewNutricionista) {
      setActiveTab('coordenacao');
    } else if (canViewNutricionista && !canViewCoordenacao) {
      setActiveTab('nutricionista');
    }
  }, [canViewNutricionista, canViewCoordenacao]);

  // Carregar produtos genéricos quando necessidades mudarem
  useEffect(() => {
    const carregarProdutosGenericos = async () => {
      const necessidades = activeTab === 'nutricionista' ? nutricionista.necessidades : coordenacao.necessidades;
      
      for (const necessidade of necessidades) {
        if (!produtosGenericos[necessidade.codigo_origem] && !loadingGenericos[necessidade.codigo_origem]) {
          setLoadingGenericos(prev => ({ ...prev, [necessidade.codigo_origem]: true }));
          
          try {
            const response = await substituicoesNecessidadesService.buscarProdutosGenericos({
              produto_origem_id: necessidade.codigo_origem
            });
            
            if (response.success) {
              setProdutosGenericos(prev => ({
                ...prev,
                [necessidade.codigo_origem]: response.data
              }));
            }
          } catch (error) {
            console.error(`Erro ao carregar produtos genéricos para ${necessidade.codigo_origem}:`, error);
          } finally {
            setLoadingGenericos(prev => ({ ...prev, [necessidade.codigo_origem]: false }));
          }
        }
      }
    };

    carregarProdutosGenericos();
  }, [activeTab, nutricionista.necessidades, coordenacao.necessidades, produtosGenericos, loadingGenericos]);

  // Handlers para filtros
  const handleFiltrosChange = (novosFiltros) => {
    if (activeTab === 'nutricionista') {
      nutricionista.atualizarFiltros(novosFiltros);
    } else {
      coordenacao.atualizarFiltros(novosFiltros);
    }
  };

  const handleBuscar = () => {
    if (activeTab === 'nutricionista') {
      nutricionista.carregarNecessidades();
    } else {
      coordenacao.carregarNecessidades();
    }
  };

  const handleLimpar = () => {
    if (activeTab === 'nutricionista') {
      nutricionista.atualizarFiltros({
        grupo: '',
        semana_abastecimento: '',
        semana_consumo: ''
      });
    } else {
      coordenacao.atualizarFiltros({
        grupo: '',
        semana_abastecimento: '',
        semana_consumo: ''
      });
    }
  };

  // Handlers para ações
  const handleIniciarAjustes = async () => {
    try {
      const response = await nutricionista.iniciarAjustes();
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLiberarCoordenacao = async () => {
    try {
      const response = await nutricionista.liberarParaCoordenacao();
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAprovarTodas = async () => {
    try {
      const response = await coordenacao.aprovarTodas();
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handlers para salvamento
  const handleSaveConsolidated = async (dados, chaveUnica) => {
    try {
      if (activeTab === 'nutricionista') {
        await nutricionista.salvarAjusteConsolidado(dados);
      } else {
        await coordenacao.salvarAjusteConsolidado(dados);
      }
      toast.success('Ajuste salvo com sucesso!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSaveIndividual = async (dados, escolaId) => {
    try {
      if (activeTab === 'nutricionista') {
        await nutricionista.salvarAjusteIndividual(dados);
      } else {
        await coordenacao.salvarAjusteIndividual(dados);
      }
      toast.success('Ajuste individual salvo com sucesso!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handlers para aprovação/rejeição
  const handleAprovar = async (substituicaoId) => {
    try {
      await coordenacao.aprovarSubstituicao(substituicaoId);
      toast.success('Substituição aprovada!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRejeitar = async (substituicaoId) => {
    try {
      await coordenacao.rejeitarSubstituicao(substituicaoId);
      toast.success('Substituição rejeitada!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handlers para exportação
  const handleExportarPDF = async (necessidades, tipo) => {
    try {
      await exportacao.exportarPDF(necessidades, tipo);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleExportarXLSX = async (necessidades, tipo) => {
    try {
      await exportacao.exportarXLSX(necessidades, tipo);
      toast.success('XLSX exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar XLSX');
    }
  };

  // Dados atuais baseados na aba ativa
  const dadosAtuais = activeTab === 'nutricionista' ? nutricionista : coordenacao;
  const necessidades = dadosAtuais.necessidades;
  const loading = dadosAtuais.loading;
  const error = dadosAtuais.error;
  const filtros = dadosAtuais.filtros;

  // Verificar se ajustes estão ativados
  const ajustesAtivados = necessidades.some(nec => 
    nec.escolas.some(escola => escola.substituicao)
  );

  if (!canViewNutricionista && !canViewCoordenacao) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta funcionalidade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Análise de Necessidades</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as substituições de produtos genéricos por nutricionistas e coordenação.
          </p>
        </div>

        {/* Filtros */}
        <SubstituicoesFilters
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          onBuscar={handleBuscar}
          onLimpar={handleLimpar}
          loading={loading}
        />

        {/* Abas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {canViewNutricionista && (
                <button
                  onClick={() => setActiveTab('nutricionista')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'nutricionista'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  👩‍⚕️ Ajuste Nutricionista
                </button>
              )}
              
              {canViewCoordenacao && (
                <button
                  onClick={() => setActiveTab('coordenacao')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'coordenacao'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  👨‍💼 Ajuste Coordenação
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Ações */}
            <SubstituicoesActions
              necessidades={necessidades}
              ajustesAtivados={ajustesAtivados}
              onIniciarAjustes={handleIniciarAjustes}
              onLiberarCoordenacao={handleLiberarCoordenacao}
              onAprovarTodas={handleAprovarTodas}
              onExportarPDF={handleExportarPDF}
              onExportarXLSX={handleExportarXLSX}
              loading={loading}
              exportando={exportacao.exportando}
              tipo={activeTab}
            />

            {/* Tabela */}
            {activeTab === 'nutricionista' ? (
              <SubstituicoesTableNutricionista
                necessidades={necessidades}
                produtosGenericos={produtosGenericos}
                loadingGenericos={loadingGenericos}
                ajustesAtivados={ajustesAtivados}
                onSaveConsolidated={handleSaveConsolidated}
                onSaveIndividual={handleSaveIndividual}
                onLiberarCoordenacao={handleLiberarCoordenacao}
                loading={loading}
              />
            ) : (
              <SubstituicoesTableCoordenacao
                necessidades={necessidades}
                produtosGenericos={produtosGenericos}
                loadingGenericos={loadingGenericos}
                onSaveConsolidated={handleSaveConsolidated}
                onSaveIndividual={handleSaveIndividual}
                onAprovar={handleAprovar}
                onRejeitar={handleRejeitar}
                onAprovarTodas={handleAprovarTodas}
                loading={loading}
              />
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnaliseSubstituicoes;