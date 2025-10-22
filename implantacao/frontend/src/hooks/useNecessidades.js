import { useState, useEffect, useCallback } from 'react';
import necessidadesService from '../services/necessidadesService';
import escolasService from '../services/escolasService';
import produtosService from '../services/produtosService';
import { calcularSemanaAbastecimento } from '../utils/semanasAbastecimentoUtils';
import { formatarDataParaExibicao } from '../utils/recebimentos/recebimentosUtils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const useNecessidades = () => {
  const { user } = useAuth();
  const [necessidades, setNecessidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para gerar necessidade
  const [escolas, setEscolas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [percapitas, setPercapitas] = useState({});
  const [mediasPeriodo, setMediasPeriodo] = useState({});
  
  // Filtros selecionados
  const [filtros, setFiltros] = useState({
    escola: null,
    grupo: null,
    data: new Date().toISOString().split('T')[0]
  });

  // Dados da tabela de produtos
  const [produtosTabela, setProdutosTabela] = useState([]);

  // Carregar necessidades existentes
  const carregarNecessidades = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await necessidadesService.listar(filtros);
      
      if (response.success) {
        setNecessidades(response.data);
      } else {
        setError(response.message || 'Erro ao carregar necessidades');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar necessidades');
      console.error('Erro ao carregar necessidades:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar escolas disponíveis (filtradas por nutricionista se aplicável)
  const carregarEscolas = useCallback(async () => {
    try {
      const response = await escolasService.listar({}, user);
      if (response.success) {
        setEscolas(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar escolas:', err);
    }
  }, [user]);

  // Carregar grupos de produtos
  const carregarGrupos = useCallback(async () => {
    try {
      const response = await necessidadesService.buscarGrupos();
      if (response.success) {
        setGrupos(response.data);
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
    }
  }, []);

  // Carregar produtos por grupo
  const carregarProdutosPorGrupo = useCallback(async (grupoId) => {
    if (!grupoId) return;
    
    setLoading(true);
    try {
      const response = await necessidadesService.buscarProdutosPorGrupo(grupoId);
      if (response.success) {
        setProdutos(response.data);
        
        // Carregar percapitas dos produtos
        const produtoIds = response.data.map(p => p.id);
        const percapitaResponse = await necessidadesService.buscarPercapitaProdutos(produtoIds);
        
        if (percapitaResponse.success) {
          const percapitaMap = {};
          percapitaResponse.data.forEach(p => {
            // Usar estrutura igual ao Geracao_necessidade
            percapitaMap[p.produto_id] = {
              lanche_manha: p.per_capita_lanche_manha || 0,
              almoco: p.per_capita_almoco || 0,
              lanche_tarde: p.per_capita_lanche_tarde || 0,
              parcial: p.per_capita_parcial || 0,
              eja: p.per_capita_eja || 0
            };
          });
          setPercapitas(percapitaMap);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      toast.error('Erro ao carregar produtos do grupo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular médias por período
  const calcularMediasPorPeriodo = useCallback(async (escolaId, data) => {
    if (!escolaId || !data) return;
    
    try {
      let dataFormatada;
      
      // Se a data for uma string da semana (ex: "20/10 a 24/10"), converter para data
      if (typeof data === 'string' && data.includes(' a ')) {
        // Extrair a primeira data da string (ex: "20/10" de "20/10 a 24/10")
        const primeiraData = data.split(' a ')[0];
        const [dia, mes] = primeiraData.split('/');
        const ano = new Date().getFullYear();
        dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      } else if (data instanceof Date) {
        dataFormatada = data.toISOString().split('T')[0];
      } else {
        dataFormatada = data;
      }
      
      const response = await necessidadesService.calcularMediasPorPeriodo(escolaId, dataFormatada);
      
      if (response.success) {
        setMediasPeriodo(response.data);
        return response.data; // Retornar os dados para uso externo
      }
    } catch (err) {
      console.error('Erro ao calcular médias por período:', err);
      throw err; // Re-throw para que o erro seja capturado no componente
    }
  }, []);

  // Atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  // Inicializar tabela de produtos
  const inicializarTabelaProdutos = useCallback(() => {
    if (produtos.length === 0) {
      setProdutosTabela([]);
      return;
    }

    const tabela = produtos.map(produto => {
      const percapita = parseFloat(percapitas[produto.id]) || 0;
      
      // As médias vêm organizadas por tipo, não por produto
      // Vamos usar a média do almoço como padrão para exibição
      const mediaAlmoco = mediasPeriodo.almoco?.media || 0;
      
      return {
        id: produto.id,
        nome: produto.nome,
        unidade_medida: produto.unidade_medida,
        per_capita: percapita,
        media_periodo: mediaAlmoco,
        frequencia: 0, // Valor padrão
        ajuste: 0, // Valor padrão
        quantidade_final: 0, // Calculado automaticamente
        medias: {
          almoco: mediasPeriodo.almoco?.media || 0,
          parcial: mediasPeriodo.parcial?.media || 0,
          lanche: mediasPeriodo.lanche?.media || 0,
          eja: mediasPeriodo.eja?.media || 0
        }
      };
    });

    setProdutosTabela(tabela);
  }, [produtos, percapitas, mediasPeriodo]);

  // Atualizar frequência de um produto
  const atualizarFrequencia = useCallback((produtoId, frequencia) => {
    setProdutosTabela(prev => prev.map(produto => {
      if (produto.id === produtoId) {
        return {
          ...produto,
          frequencia
        };
      }
      return produto;
    }));
  }, []);

  // Atualizar ajuste de um produto
  const atualizarAjuste = useCallback((produtoId, ajuste) => {
    setProdutosTabela(prev => prev.map(produto => {
      if (produto.id === produtoId) {
        return { 
          ...produto, 
          ajuste
        };
      }
      return produto;
    }));
  }, []);

  // Gerar necessidade
  const gerarNecessidade = useCallback(async (dadosExternos = null) => {
    // Se dados externos foram fornecidos, usar eles; senão usar filtros internos
    const semanaCalculada = calcularSemanaAbastecimento(filtros.data);
    
    // Converter string da semana para data válida
    let dataConsumoFormatada = filtros.data;
    if (typeof filtros.data === 'string' && filtros.data.includes(' a ')) {
      const primeiraData = filtros.data.split(' a ')[0];
      const [dia, mes] = primeiraData.split('/');
      const ano = new Date().getFullYear();
      dataConsumoFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    const dadosParaEnviar = dadosExternos || {
      escola_id: filtros.escola?.id,
      escola_nome: filtros.escola?.nome_escola || filtros.escola?.nome,
      escola_rota: filtros.escola?.rota || '',
      escola_codigo_teknisa: filtros.escola?.codigo_teknisa || '',
      semana_consumo: dataConsumoFormatada,
      semana_abastecimento: semanaCalculada,
      produtos: produtosTabela.map(produto => ({
        produto_id: produto.id,
        produto_nome: produto.nome,
        produto_unidade: produto.unidade_medida,
        ajuste: produto.ajuste
      }))
    };

    // Debug: mostrar dados que serão enviados
    console.log('Dados para enviar:', dadosParaEnviar);
    console.log('Escola selecionada:', filtros.escola);

    // Validação baseada nos dados que serão enviados
    if (!dadosParaEnviar.escola_id || !dadosParaEnviar.semana_consumo) {
      console.log('Validação falhou - escola_id:', dadosParaEnviar.escola_id, 'semana_consumo:', dadosParaEnviar.semana_consumo);
      toast.error('Selecione escola e data antes de gerar a necessidade');
      return { success: false };
    }

    if (!dadosParaEnviar.produtos || dadosParaEnviar.produtos.length === 0) {
      console.log('Validação falhou - produtos:', dadosParaEnviar.produtos);
      toast.error('Nenhum produto selecionado');
      return { success: false };
    }

    setLoading(true);
    try {
      console.log('Enviando requisição para backend...');
      const response = await necessidadesService.gerarNecessidade(dadosParaEnviar);
      console.log('Resposta do backend:', response);
      
      if (response.success) {
        toast.success('Necessidade gerada com sucesso!');
        await carregarNecessidades();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Erro ao gerar necessidade');
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('Erro ao gerar necessidade:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao gerar necessidade';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [filtros, produtosTabela, carregarNecessidades]);

  // Criar necessidade individual
  const criarNecessidade = useCallback(async (dados, showToast = true) => {
    try {
      const response = await necessidadesService.criar(dados);
      if (response.success) {
        if (showToast) toast.success('Necessidade criada com sucesso!');
        await carregarNecessidades();
        return { success: true, data: response.data };
      } else {
        if (showToast) toast.error(response.message || 'Erro ao criar necessidade');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar necessidade';
      if (showToast) toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [carregarNecessidades]);

  // Atualizar necessidade
  const atualizarNecessidade = useCallback(async (id, dados, showToast = true) => {
    try {
      const response = await necessidadesService.atualizar(id, dados);
      if (response.success) {
        if (showToast) toast.success('Necessidade atualizada com sucesso!');
        await carregarNecessidades();
        return { success: true, data: response.data };
      } else {
        if (showToast) toast.error(response.message || 'Erro ao atualizar necessidade');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar necessidade';
      if (showToast) toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [carregarNecessidades]);

  // Deletar necessidade
  const deletarNecessidade = useCallback(async (id, showToast = true) => {
    try {
      const response = await necessidadesService.deletar(id);
      if (response.success) {
        if (showToast) toast.success('Necessidade deletada com sucesso!');
        await carregarNecessidades();
        return { success: true };
      } else {
        if (showToast) toast.error(response.message || 'Erro ao deletar necessidade');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao deletar necessidade';
      if (showToast) toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [carregarNecessidades]);

  // Efeitos
  useEffect(() => {
    carregarEscolas();
    carregarGrupos();
  }, [carregarEscolas, carregarGrupos]);

  useEffect(() => {
    if (filtros.grupo) {
      carregarProdutosPorGrupo(filtros.grupo.id);
    }
  }, [filtros.grupo, carregarProdutosPorGrupo]);

  useEffect(() => {
    if (filtros.escola && filtros.data) {
      calcularMediasPorPeriodo(filtros.escola.id, filtros.data);
    }
  }, [filtros.escola, filtros.data, calcularMediasPorPeriodo]);

  useEffect(() => {
    inicializarTabelaProdutos();
  }, [inicializarTabelaProdutos]);

  // Função para exportar necessidades para XLSX
  const exportarXLSX = useCallback(() => {
    if (!necessidades || necessidades.length === 0) {
      toast.error('Nenhuma necessidade encontrada para exportar');
      return;
    }

    try {
      // Preparar dados para exportação
      const dadosExportacao = necessidades.map(necessidade => ({
        'Código e nome da Escola': `${necessidade.codigo_teknisa || ''} - ${necessidade.escola}`,
        'ID Necessidade': necessidade.id,
        'Semana Abastecimento': necessidade.semana_abastecimento || '',
        'Semana de Consumo': formatarDataParaExibicao(necessidade.data_consumo),
        'Código Produto': necessidade.produto_id || '',
        'Produto': necessidade.produto,
        'UN': necessidade.unidade_medida || '',
        'Quantidade': necessidade.ajuste
      }));

      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);

      // Ajustar largura das colunas
      const colWidths = [
        { wch: 30 }, // Código e nome da Escola
        { wch: 15 }, // ID Necessidade
        { wch: 20 }, // Semana Abastecimento
        { wch: 15 }, // Semana de Consumo
        { wch: 15 }, // Código Produto
        { wch: 30 }, // Produto
        { wch: 8 },  // UN
        { wch: 12 }  // Quantidade
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Necessidades');

      // Gerar nome do arquivo com data atual
      const dataAtual = new Date().toISOString().split('T')[0];
      const nomeArquivo = `necessidades_${dataAtual}.xlsx`;

      // Salvar arquivo
      XLSX.writeFile(wb, nomeArquivo);
      toast.success('Arquivo XLSX exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar arquivo XLSX');
    }
  }, [necessidades]);

  // Função para exportar necessidades para PDF
  const exportarPDF = useCallback(() => {
    if (!necessidades || necessidades.length === 0) {
      toast.error('Nenhuma necessidade encontrada para exportar');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const tableWidth = pageWidth - (margin * 2);
      
      // Cabeçalho
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Necessidades', pageWidth / 2, 15, { align: 'center' });
      
      // Data de geração
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, 22, { align: 'center' });
      
      // Filtros aplicados (se houver)
      if (filtros.escola || filtros.data || filtros.grupo) {
        doc.setFontSize(8);
        doc.text('Filtros aplicados:', margin, 30);
        
        let yPos = 35;
        if (filtros.escola) {
          doc.text(`• Escola: ${filtros.escola.nome_escola || filtros.escola}`, margin + 5, yPos);
          yPos += 5;
        }
        if (filtros.data) {
          doc.text(`• Data: ${filtros.data}`, margin + 5, yPos);
          yPos += 5;
        }
        if (filtros.grupo) {
          doc.text(`• Grupo: ${filtros.grupo.nome || filtros.grupo}`, margin + 5, yPos);
          yPos += 5;
        }
      }

      // Cabeçalho da tabela - colunas equilibradas
      const colWidths = [55, 28, 32, 28, 28, 70, 15, 30];
      const headers = [
        'Código e nome da Escola',
        'ID Necessidade',
        'Semana Abastecimento',
        'Semana de Consumo',
        'Código Produto',
        'Produto',
        'UN',
        'Quantidade'
      ];

      let yPos = filtros.escola || filtros.data || filtros.grupo ? 50 : 35;
      
      // Desenhar cabeçalho da tabela
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      let xPos = margin;
      
      headers.forEach((header, index) => {
        doc.rect(xPos, yPos - 5, colWidths[index], 8);
        doc.text(header, xPos + 2, yPos, { maxWidth: colWidths[index] - 4 });
        xPos += colWidths[index];
      });

      yPos += 8;

      // Dados da tabela
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      necessidades.forEach((necessidade, index) => {
        // Verificar se precisa de nova página
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
          
          // Redesenhar cabeçalho
          xPos = margin;
          headers.forEach((header, colIndex) => {
            doc.rect(xPos, yPos - 5, colWidths[colIndex], 8);
            doc.text(header, xPos + 2, yPos, { maxWidth: colWidths[colIndex] - 4 });
            xPos += colWidths[colIndex];
          });
          yPos += 8;
        }

        const rowData = [
          `${necessidade.codigo_teknisa || ''} - ${necessidade.escola}`,
          necessidade.id.toString(),
          necessidade.semana_abastecimento || '',
          formatarDataParaExibicao(necessidade.data_consumo),
          necessidade.produto_id?.toString() || '',
          necessidade.produto,
          necessidade.unidade_medida || '',
          necessidade.ajuste.toString()
        ];

        xPos = margin;
        rowData.forEach((data, colIndex) => {
          doc.rect(xPos, yPos - 5, colWidths[colIndex], 8);
          doc.text(data, xPos + 2, yPos, { maxWidth: colWidths[colIndex] - 4 });
          xPos += colWidths[colIndex];
        });

        yPos += 8;
      });

      // Rodapé
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(6);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }

      // Salvar arquivo
      const nomeArquivo = `necessidades_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nomeArquivo);
      toast.success('Arquivo PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    }
  }, [necessidades, filtros]);

  return {
    // Estados
    necessidades,
    loading,
    error,
    escolas,
    grupos,
    produtos,
    percapitas,
    mediasPeriodo,
    filtros,
    produtosTabela,

    // Ações
    carregarNecessidades,
    carregarEscolas,
    carregarGrupos,
    carregarProdutosPorGrupo,
    calcularMediasPorPeriodo,
    atualizarFiltros,
    inicializarTabelaProdutos,
    atualizarFrequencia,
    atualizarAjuste,
    gerarNecessidade,
    criarNecessidade,
    atualizarNecessidade,
    deletarNecessidade,
    exportarXLSX,
    exportarPDF
  };
};
