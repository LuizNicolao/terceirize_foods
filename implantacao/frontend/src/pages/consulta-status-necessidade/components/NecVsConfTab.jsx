import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchableSelect, Pagination } from '../../../components/ui';
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import consultaStatusNecessidadeService from '../../../services/consultaStatusNecessidade';
import toast from 'react-hot-toast';

const NecVsConfTab = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    grupo: '',
    semana_abastecimento: '',
    produto_id: '',
    filial: ''
  });

  // Opções de filtros
  const [grupos, setGrupos] = useState([]);
  const [semanasAbastecimento, setSemanasAbastecimento] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);

  // Paginação
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  // Busca local e ordenação
  const [busca, setBusca] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Carregar opções de filtros
  const carregarOpcoesFiltros = async () => {
    try {
      setLoadingOpcoes(true);
      const opcoesResponse = await consultaStatusNecessidadeService.obterOpcoesFiltros();
      
      if (opcoesResponse.success && opcoesResponse.data) {
        const { data } = opcoesResponse;
        
        // Grupos
        const gruposOptions = [
          { value: '', label: 'Todos os grupos' },
          ...data.grupos.map(grupo => ({
            value: grupo,
            label: grupo
          }))
        ];
        setGrupos(gruposOptions);
        
        // Semanas de abastecimento
        const semanasAbastecimentoOptions = data.semanas_abastecimento.map(semana => ({
          value: semana,
          label: semana
        }));
        setSemanasAbastecimento(semanasAbastecimentoOptions);
        
        // Produtos
        const produtosOptions = [
          { value: '', label: 'Todos os produtos' },
          ...data.produtos.map(produto => ({
            value: produto.id.toString(),
            label: `${produto.nome} (${produto.unidade})`
          }))
        ];
        setProdutos(produtosOptions);
        
        // Filiais
        const filiaisOptions = [
          { value: '', label: 'Todas as filiais' },
          ...data.filiais.map(filial => ({
            value: filial.id.toString(),
            label: filial.nome
          }))
        ];
        setFiliais(filiaisOptions);
      }
    } catch (error) {
      toast.error('Erro ao carregar opções de filtros');
    } finally {
      setLoadingOpcoes(false);
    }
  };

  useEffect(() => {
    carregarOpcoesFiltros();
  }, []);

  // Carregar dados
  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (filtros.grupo) {
        params.grupo = filtros.grupo;
      }
      if (filtros.semana_abastecimento) {
        params.semana_abastecimento = filtros.semana_abastecimento;
      }
      if (filtros.produto_id) {
        params.produto_id = filtros.produto_id;
      }
      if (filtros.filial) {
        params.filial_id = filtros.filial;
      }

      params.page = page;
      params.limit = itemsPerPage;

      const response = await consultaStatusNecessidadeService.listarNecVsConf(params);
      
      if (response.success) {
        setDados(response.data || []);
        setTotal(response.pagination?.total || 0);
        setDadosCarregados(true);
      } else {
        toast.error('Erro ao carregar dados');
      }
    } catch (error) {
      toast.error('Erro ao carregar comparação NEC x CONF');
    } finally {
      setLoading(false);
    }
  }, [filtros, page, itemsPerPage]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPage(1);
  };

  const limparFiltros = () => {
    setFiltros({
      grupo: '',
      semana_abastecimento: '',
      produto_id: '',
      filial: ''
    });
    setDados([]);
    setTotal(0);
    setPage(1);
    setDadosCarregados(false);
  };

  const aplicarFiltros = () => {
    if (!temFiltrosAtivos) {
      toast.error('Selecione pelo menos um filtro para visualizar os dados');
      return;
    }
    setPage(1);
    carregarDados();
  };

  const temFiltrosAtivos = Object.values(filtros).some(valor => valor !== '');
  const [dadosCarregados, setDadosCarregados] = useState(false);

  // Recarregar dados quando mudar página ou itemsPerPage
  useEffect(() => {
    if (dadosCarregados && temFiltrosAtivos) {
      carregarDados();
    }
  }, [page, itemsPerPage, dadosCarregados, temFiltrosAtivos, carregarDados]);

  // Formatar número
  const formatarNumero = (valor) => {
    if (valor === null || valor === undefined) return '0';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(valor));
  };

  // Formatar porcentagem
  const formatarPorcentagem = (valor) => {
    if (valor === null || valor === undefined) return '0,00%';
    return `${parseFloat(valor).toFixed(2).replace('.', ',')}%`;
  };

  // Função de ordenação
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Função para obter ícone de ordenação
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-blue-600" />
      : <FaSortDown className="text-blue-600" />;
  };

  // Filtrar e ordenar dados localmente
  const dadosFiltradosEOrdenados = useMemo(() => {
    // Criar uma cópia do array para não modificar o original
    let filtered = [...dados];

    // Aplicar busca local
    if (busca) {
      const searchTerm = busca.toLowerCase();
      filtered = filtered.filter(item => 
        item.produto?.toLowerCase().includes(searchTerm) ||
        item.grupo?.toLowerCase().includes(searchTerm) ||
        item.semana_abastecimento?.toLowerCase().includes(searchTerm) ||
        item.total_nec?.toString().includes(searchTerm) ||
        item.total_conf?.toString().includes(searchTerm) ||
        item.diferenca_numero?.toString().includes(searchTerm) ||
        item.diferenca_percentual?.toString().includes(searchTerm)
      );
    }

    // Aplicar ordenação
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Tratar valores nulos/undefined
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
        
        // Tratar valores numéricos
        if (sortConfig.key === 'total_nec' || sortConfig.key === 'total_conf' || 
            sortConfig.key === 'diferenca_numero' || sortConfig.key === 'diferenca_percentual') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        } else if (typeof aVal === 'string' || typeof aVal === 'number') {
          // Converter para string e normalizar
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [dados, busca, sortConfig]);

  // Calcular dados paginados (paginados localmente após filtro e ordenação)
  const dadosPaginados = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return dadosFiltradosEOrdenados.slice(start, end);
  }, [dadosFiltradosEOrdenados, page, itemsPerPage]);

  // Total de registros filtrados
  const totalFiltrado = dadosFiltradosEOrdenados.length;

  // Função para gerar PDF
  const gerarPDF = useCallback(() => {
    if (dadosFiltradosEOrdenados.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Comparação NEC x CONF', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Data e hora de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Resumo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${dadosFiltradosEOrdenados.length} registro(s)`, 20, yPosition);
    yPosition += 15;

    // Tabela
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    // Cabeçalho da tabela
    doc.text('Produto', 15, yPosition);
    doc.text('Grupo', 60, yPosition);
    doc.text('Semana AB', 90, yPosition);
    doc.text('NEC', 115, yPosition);
    doc.text('CONF', 135, yPosition);
    doc.text('Dif. Número', 155, yPosition);
    doc.text('Dif. %', 180, yPosition);
    yPosition += 8;

    // Linha separadora
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 5;

    // Dados
    doc.setFont('helvetica', 'normal');
    dadosFiltradosEOrdenados.forEach((item, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      const diferencaNumero = item.diferenca_numero || 0;
      const diferencaPercentual = item.diferenca_percentual || 0;

      doc.text((item.produto || 'N/A').substring(0, 25), 15, yPosition);
      doc.text((item.grupo || 'N/A').substring(0, 15), 60, yPosition);
      doc.text((item.semana_abastecimento || 'N/A').substring(0, 10), 90, yPosition);
      doc.text(formatarNumero(item.total_nec), 115, yPosition);
      doc.text(formatarNumero(item.total_conf), 135, yPosition);
      doc.text(formatarNumero(diferencaNumero), 155, yPosition);
      doc.text(formatarPorcentagem(diferencaPercentual), 180, yPosition);
      yPosition += 7;

      if (index < dadosFiltradosEOrdenados.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(15, yPosition, pageWidth - 15, yPosition);
        doc.setDrawColor(0, 0, 0);
        yPosition += 3;
      }
    });

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Salvar o PDF
    const nomeArquivo = `nec_vs_conf_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
    
    toast.success('PDF gerado com sucesso!');
  }, [dadosFiltradosEOrdenados]);

  // Função para exportar Excel
  const exportarExcel = useCallback(() => {
    if (dadosFiltradosEOrdenados.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    try {
      const dadosExportacao = dadosFiltradosEOrdenados.map(item => ({
        'Produto': item.produto || '',
        'Grupo': item.grupo || '',
        'Semana Abastecimento': item.semana_abastecimento || '',
        'NEC (Inicial)': parseFloat(item.total_nec || 0),
        'CONF (Final)': parseFloat(item.total_conf || 0),
        'Diferença (Número)': parseFloat(item.diferenca_numero || 0),
        'Diferença (%)': parseFloat(item.diferenca_percentual || 0),
        'Unidade': item.produto_unidade || '',
        'Total Necessidades': item.total_necessidades || 0
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);
      
      // Ajustar largura das colunas
      ws['!cols'] = [
        { wch: 30 }, // Produto
        { wch: 20 }, // Grupo
        { wch: 18 }, // Semana Abastecimento
        { wch: 15 }, // NEC (Inicial)
        { wch: 15 }, // CONF (Final)
        { wch: 18 }, // Diferença (Número)
        { wch: 15 }, // Diferença (%)
        { wch: 10 }, // Unidade
        { wch: 18 }  // Total Necessidades
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'NEC x CONF');

      const nomeArquivo = `nec_vs_conf_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);
      
      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    }
  }, [dadosFiltradosEOrdenados]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">🔍 Filtros</h3>
          <div className="flex gap-2">
            <button
              onClick={aplicarFiltros}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={limparFiltros}
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por Grupo */}
          <div>
            <SearchableSelect
              label="Grupo de Produtos"
              value={filtros.grupo}
              onChange={(value) => handleFiltroChange('grupo', value)}
              options={grupos}
              placeholder="Selecione o grupo..."
              disabled={loading || loadingOpcoes}
              usePortal={false}
            />
          </div>

          {/* Filtro por Semana Abastecimento */}
          <div>
            <SearchableSelect
              label="Semana Abastecimento"
              value={filtros.semana_abastecimento}
              onChange={(value) => handleFiltroChange('semana_abastecimento', value)}
              options={semanasAbastecimento}
              placeholder="Selecione uma semana..."
              disabled={loading || loadingOpcoes}
              usePortal={false}
            />
          </div>

          {/* Filtro por Produto */}
          <div>
            <SearchableSelect
              label="Produto"
              value={filtros.produto_id}
              onChange={(value) => handleFiltroChange('produto_id', value)}
              options={produtos}
              placeholder="Selecione um produto..."
              disabled={loading || loadingOpcoes}
              usePortal={false}
            />
          </div>

          {/* Filtro por Filial */}
          <div>
            <SearchableSelect
              label="Filial"
              value={filtros.filial}
              onChange={(value) => handleFiltroChange('filial', value)}
              options={filiais}
              placeholder="Selecione uma filial..."
              disabled={loading || loadingOpcoes}
              usePortal={false}
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-blue-50 border-b border-gray-200 p-4 rounded-t-lg">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">
                Comparação NEC x CONF ({totalFiltrado} de {total} registro{total !== 1 ? 's' : ''})
              </h3>
              <p className="text-blue-600 text-sm mt-1">
                Comparação entre o pedido inicial (NEC) e o ajuste final confirmado (CONF)
              </p>
            </div>
            
            {dadosFiltradosEOrdenados.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={gerarPDF}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  title="Exportar comparação NEC x CONF em PDF"
                >
                  <FaFilePdf className="mr-2" />
                  PDF
                </button>
                <button
                  onClick={exportarExcel}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  title="Exportar comparação NEC x CONF em Excel"
                >
                  <FaFileExcel className="mr-2" />
                  Excel
                </button>
              </div>
            )}
          </div>
          
          {/* Busca local */}
          <div className="mt-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por produto, grupo, semana..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando...</span>
            </div>
          ) : dadosPaginados.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('produto')}
                    >
                      <div className="flex items-center gap-2">
                        Produto
                        {getSortIcon('produto')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('grupo')}
                    >
                      <div className="flex items-center gap-2">
                        Grupo
                        {getSortIcon('grupo')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('semana_abastecimento')}
                    >
                      <div className="flex items-center gap-2">
                        Semana Abastecimento
                        {getSortIcon('semana_abastecimento')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_nec')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        NEC (Inicial)
                        {getSortIcon('total_nec')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_conf')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        CONF (Final)
                        {getSortIcon('total_conf')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('diferenca_numero')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Diferença (Número)
                        {getSortIcon('diferenca_numero')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('diferenca_percentual')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Diferença (%)
                        {getSortIcon('diferenca_percentual')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dadosPaginados.map((item, index) => {
                    const diferencaNumero = item.diferenca_numero || 0;
                    const diferencaPercentual = item.diferenca_percentual || 0;
                    const isPositivo = diferencaNumero > 0;
                    const isNegativo = diferencaNumero < 0;
                    
                    return (
                      <tr key={`${item.produto_id}-${item.grupo}-${item.semana_abastecimento}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.produto}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {item.grupo || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.semana_abastecimento || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                          {formatarNumero(item.total_nec)} {item.produto_unidade || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                          {formatarNumero(item.total_conf)} {item.produto_unidade || ''}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          isPositivo ? 'text-green-600' : isNegativo ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {isPositivo ? '+' : ''}{formatarNumero(diferencaNumero)} {item.produto_unidade || ''}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          isPositivo ? 'text-green-600' : isNegativo ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {isPositivo ? '+' : ''}{formatarPorcentagem(diferencaPercentual)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Paginação */}
              {totalFiltrado > itemsPerPage && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(totalFiltrado / itemsPerPage)}
                    totalItems={totalFiltrado}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                    onItemsPerPageChange={(value) => {
                      setItemsPerPage(value);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhum dado encontrado</p>
              {!temFiltrosAtivos && (
                <p className="text-sm mt-1">Preencha os filtros e clique em "Aplicar Filtros" para visualizar os dados.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NecVsConfTab;

