import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaClipboardList } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNecessidadesAjuste } from '../../hooks/useNecessidadesAjuste';
import { useNecessidadesCoordenacao } from '../../hooks/useNecessidadesCoordenacao';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import {
  NecessidadesLayout,
  NecessidadesLoading,
  StatusBadge,
  AjusteNecessidadesStats,
  AjusteNecessidadesFilters,
  AjusteNecessidadesTable,
  AjusteNecessidadesActions,
  AjusteNecessidadesModal
} from '../../components/necessidades';
import toast from 'react-hot-toast';

const AjusteNecessidades = () => {
  const { user } = useAuth();
  const { canView, canEdit, loading: permissionsLoading } = usePermissions();
  
  // Detectar modo baseado no status das necessidades
  const [modoCoordenacao, setModoCoordenacao] = useState(false);

  // Hook para gerenciar ajuste de necessidades (nutricionista)
  const hookNutricionista = useNecessidadesAjuste();
  
  // Hook para gerenciar coordenação
  const hookCoordenacao = useNecessidadesCoordenacao();

  // Usar hook baseado no modo
  const {
    necessidades,
    escolas,
    grupos,
    nutricionistas,
    filtros,
    loading,
    error,
    carregarNecessidades,
    salvarAjustes,
    incluirProdutoExtra,
    liberarCoordenacao,
    buscarProdutosParaModal,
    handleFiltroChange,
    handleAjusteChange,
    handleSalvarAjustes,
    handleLiberarCoordenacao,
    handleAbrirModalProdutoExtra,
    handleIncluirProdutoExtra,
    handleSearchProduto,
    handleToggleProduto,
    handleSelecionarTodos,
    handleDesmarcarTodos,
    handleIncluirProdutosExtra,
    ajustesLocais,
    produtosDisponiveis,
    produtosSelecionados,
    searchProduto,
    modalProdutoExtraAberto,
    setModalProdutoExtraAberto,
    setSearchProduto,
    setProdutosSelecionados
  } = modoCoordenacao ? hookCoordenacao : hookNutricionista;

  // Hook para semanas de abastecimento
  const { opcoes: opcoesSemanasAbastecimento } = useSemanasAbastecimento();
  
  // Hook para semanas de consumo do calendário
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo();

  // Estados locais para edição
  const [necessidadeAtual, setNecessidadeAtual] = useState(null);
  const [buscaProduto, setBuscaProduto] = useState('');

  // Detectar modo baseado no status das necessidades
  useEffect(() => {
    if (necessidades && necessidades.length > 0) {
      const status = necessidades[0].status;
      setModoCoordenacao(status === 'NEC COORD');
    }
  }, [necessidades]);

  // Filtrar necessidades por busca
  const [necessidadesFiltradas, setNecessidadesFiltradas] = useState([]);
  const [buscaProdutoFiltro, setBuscaProdutoFiltro] = useState('');

  useEffect(() => {
    if (buscaProdutoFiltro) {
      const filtradas = necessidades.filter(nec =>
        nec.produto.toLowerCase().includes(buscaProdutoFiltro.toLowerCase()) ||
        (nec.codigo_teknisa && nec.codigo_teknisa.toLowerCase().includes(buscaProdutoFiltro.toLowerCase()))
      );
      setNecessidadesFiltradas(filtradas);
    } else {
      setNecessidadesFiltradas(necessidades);
    }
  }, [necessidades, buscaProdutoFiltro]);

  // Verificar permissões específicas
  const tiposComAcesso = ['nutricionista', 'coordenador', 'supervisor', 'administrador'];
  const canViewAjuste = canView('analise_necessidades') || tiposComAcesso.includes(user.tipo_de_acesso);
  const canEditAjuste = canEdit('analise_necessidades') || tiposComAcesso.includes(user.tipo_de_acesso);

  // Funções de exportação
  const handleExportarExcel = useCallback(() => {
    try {
      const dados = necessidadesFiltradas.map(nec => ({
        'Código': nec.codigo_teknisa || 'N/A',
        'Produto': nec.produto,
        'Unidade': nec.produto_unidade,
        'Quantidade': nec.ajuste || 0,
        'Ajuste': ajustesLocais[nec.id] || '',
        'Status': nec.status
      }));

      const csv = [
        Object.keys(dados[0]).join(','),
        ...dados.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `necessidades_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    }
  }, [necessidadesFiltradas, ajustesLocais]);

  const handleExportarPDF = useCallback(() => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Necessidades - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Necessidades</h1>
              <p>Gerado em: ${new Date().toLocaleDateString()}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Unidade</th>
                  <th>Quantidade</th>
                  <th>Ajuste</th>
                </tr>
              </thead>
              <tbody>
                ${necessidadesFiltradas.map(nec => `
                  <tr>
                    <td>${nec.codigo_teknisa || 'N/A'}</td>
                    <td>${nec.produto}</td>
                    <td>${nec.produto_unidade}</td>
                    <td>${nec.ajuste || 0}</td>
                    <td>${ajustesLocais[nec.id] || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Abrir nova janela para impressão
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();

      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    }
  }, [necessidadesFiltradas, ajustesLocais]);

  // Verificar se pode visualizar
  if (permissionsLoading) {
    return <NecessidadesLoading />;
  }

  if (!canViewAjuste) {
    return (
      <NecessidadesLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o ajuste de necessidades.
          </p>
        </div>
      </NecessidadesLayout>
    );
  }

  // Determinar status atual do conjunto
  const statusAtual = necessidades.length > 0 ? necessidades[0].status : 'NEC';

  return (
    <>
      <NecessidadesLayout hideHeader={true}>
        {/* Header com Status */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <FaEdit className="mr-2 sm:mr-3 text-blue-600" />
              {modoCoordenacao ? 'Liberação para Coordenação' : 'Ajuste de Necessidade por Nutricionista'}
            </h1>
            <p className="text-gray-600 mt-1">
              {modoCoordenacao 
                ? 'Visualize, edite e libere necessidades para logística'
                : 'Visualize, edite e ajuste necessidades geradas'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={statusAtual} />
          </div>
        </div>

        {/* Estatísticas */}
        <AjusteNecessidadesStats 
          necessidades={necessidades}
          modoCoordenacao={modoCoordenacao}
        />

        {/* Filtros */}
        <AjusteNecessidadesFilters
          filtros={filtros}
          escolas={escolas}
          grupos={grupos}
          nutricionistas={nutricionistas}
          semanasConsumo={opcoesSemanasConsumo}
          semanasAbastecimento={opcoesSemanasAbastecimento}
          onFiltroChange={handleFiltroChange}
          onCarregarNecessidades={carregarNecessidades}
          loading={loading}
          modoCoordenacao={modoCoordenacao}
        />

        {/* Conteúdo Principal */}
        {necessidadesFiltradas.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Busca de Produtos */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar produto por nome ou código..."
                    value={buscaProdutoFiltro}
                    onChange={(e) => setBuscaProdutoFiltro(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {necessidadesFiltradas.length} produto{necessidadesFiltradas.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Ações e Exportação */}
            <div className="p-6 border-b border-gray-200">
              <AjusteNecessidadesActions
                necessidadesFiltradas={necessidadesFiltradas}
                statusAtual={statusAtual}
                modoCoordenacao={modoCoordenacao}
                canEditAjuste={canEditAjuste}
                onExportarExcel={handleExportarExcel}
                onExportarPDF={handleExportarPDF}
                onAbrirModalProdutoExtra={handleAbrirModalProdutoExtra}
                onSalvarAjustes={handleSalvarAjustes}
                onLiberarCoordenacao={handleLiberarCoordenacao}
              />
            </div>
            
            {/* Tabela de Produtos */}
            <AjusteNecessidadesTable
              necessidadesFiltradas={necessidadesFiltradas}
              ajustesLocais={ajustesLocais}
              onAjusteChange={handleAjusteChange}
              modoCoordenacao={modoCoordenacao}
              statusAtual={statusAtual}
              canEditAjuste={canEditAjuste}
            />
          </div>
        ) : !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma necessidade encontrada
            </h2>
            <p className="text-gray-600">
              Não há necessidades disponíveis para ajuste no momento.
            </p>
          </div>
        )}
      </NecessidadesLayout>

      {/* Modal de Produto Extra */}
      <AjusteNecessidadesModal
        isOpen={modalProdutoExtraAberto}
        onClose={() => setModalProdutoExtraAberto(false)}
        produtosDisponiveis={produtosDisponiveis}
        produtosSelecionados={produtosSelecionados}
        searchProduto={searchProduto}
        loadingProdutos={loading}
        onSearchChange={setSearchProduto}
        onToggleProduto={handleToggleProduto}
        onSelecionarTodos={handleSelecionarTodos}
        onDesmarcarTodos={handleDesmarcarTodos}
        onIncluirProdutos={handleIncluirProdutosExtra}
        onSearchProduto={handleSearchProduto}
      />
    </>
  );
};

export default AjusteNecessidades;