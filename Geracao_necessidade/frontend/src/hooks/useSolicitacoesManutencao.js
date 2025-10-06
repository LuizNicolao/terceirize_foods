import { useState, useEffect, useCallback } from 'react';
import solicitacoesManutencaoService from '../services/solicitacoesManutencaoService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const useSolicitacoesManutencao = () => {
  const { user } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  // Estados para estatísticas
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Estados para o formulário (removidos - usando useEscolas separado)

  // Carregar solicitações
  const carregarSolicitacoes = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await solicitacoesManutencaoService.listar(filtros);
      
      if (response.success) {
        setSolicitacoes(response.data);
        setPagination(response.pagination || {});
        return response; // Retornar a resposta para uso em outros componentes
      } else {
        setError(response.message || 'Erro ao carregar solicitações');
        return response;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar solicitações');
      console.error('Erro ao carregar solicitações:', err);
      return { success: false, message: err.response?.data?.message || 'Erro ao carregar solicitações' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar estatísticas
  const carregarStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await solicitacoesManutencaoService.obterEstatisticas();
      
      if (response.success) {
        setStats(response.data);
      } else {
        console.error('Erro ao carregar estatísticas:', response.message);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Função removida - usando useEscolas separado

  // Criar solicitação
  const criarSolicitacao = useCallback(async (dados) => {
    try {
      const response = await solicitacoesManutencaoService.criar(dados);
      
      if (response.success) {
        toast.success('Solicitação criada com sucesso!');
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao criar solicitação');
        return null;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar solicitação';
      toast.error(errorMessage);
      console.error('Erro ao criar solicitação:', err);
      return null;
    }
  }, []);

  // Atualizar solicitação
  const atualizarSolicitacao = useCallback(async (id, dados) => {
    try {
      console.log('🔵 Hook: Atualizando solicitação ID:', id);
      console.log('🔵 Hook: Dados sendo enviados:', dados);
      const response = await solicitacoesManutencaoService.atualizar(id, dados);
      console.log('🔵 Hook: Resposta recebida:', response);
      
      if (response.success) {
        toast.success('Solicitação atualizada com sucesso!');
        return true; // Retornar true para indicar sucesso
      } else {
        console.log('🔵 Hook: Erro na resposta:', response);
        toast.error(response.message || 'Erro ao atualizar solicitação');
        return false;
      }
    } catch (err) {
      console.log('🔵 Hook: Erro na requisição:', err);
      console.log('🔵 Hook: Detalhes do erro:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar solicitação';
      toast.error(errorMessage);
      console.error('Erro ao atualizar solicitação:', err);
      return null;
    }
  }, []);

  // Deletar solicitação
  const deletarSolicitacao = useCallback(async (id) => {
    try {
      const response = await solicitacoesManutencaoService.deletar(id);
      
      if (response.success) {
        toast.success('Solicitação deletada com sucesso!');
        return true;
      } else {
        toast.error(response.message || 'Erro ao deletar solicitação');
        return false;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao deletar solicitação';
      toast.error(errorMessage);
      console.error('Erro ao deletar solicitação:', err);
      return false;
    }
  }, []);

  // Buscar solicitação por ID
  const buscarSolicitacaoPorId = useCallback(async (id) => {
    try {
      const response = await solicitacoesManutencaoService.buscarPorId(id);
      
      if (response.success) {
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao buscar solicitação');
        return null;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar solicitação';
      toast.error(errorMessage);
      console.error('Erro ao buscar solicitação:', err);
      return null;
    }
  }, []);

  // Upload de foto
  const uploadFoto = useCallback(async (file) => {
    try {
      const response = await solicitacoesManutencaoService.uploadFoto(file);
      
      if (response.success) {
        return response.data.url;
      } else {
        toast.error(response.message || 'Erro ao fazer upload da foto');
        return null;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer upload da foto';
      toast.error(errorMessage);
      console.error('Erro ao fazer upload:', err);
      return null;
    }
  }, []);

  // Exportar para XLSX
  const exportarXLSX = useCallback(() => {
    if (!solicitacoes || solicitacoes.length === 0) {
      toast.error('Nenhuma solicitação encontrada para exportar');
      return;
    }

    try {
      const dadosExportacao = solicitacoes.map(solicitacao => ({
        'Data Solicitação': new Date(solicitacao.data_solicitacao).toLocaleDateString('pt-BR'),
        'Escola': solicitacao.nome_escola,
        'Cidade': solicitacao.cidade,
        'Nutricionista': solicitacao.nutricionista_nome,
        'Manutenção': solicitacao.manutencao_descricao,
        'Fornecedor': solicitacao.fornecedor || '',
        'Valor': solicitacao.valor || '',
        'Status': solicitacao.status,
        'Observações': solicitacao.observacoes || ''
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);

      const colWidths = [
        { wch: 15 }, // Data Solicitação
        { wch: 30 }, // Escola
        { wch: 20 }, // Cidade
        { wch: 25 }, // Nutricionista
        { wch: 40 }, // Manutenção
        { wch: 20 }, // Fornecedor
        { wch: 12 }, // Valor
        { wch: 15 }, // Status
        { wch: 30 }  // Observações
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Solicitações');

      const dataAtual = new Date().toISOString().split('T')[0];
      const nomeArquivo = `solicitacoes_manutencao_${dataAtual}.xlsx`;

      XLSX.writeFile(wb, nomeArquivo);
      toast.success('Arquivo XLSX exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar arquivo XLSX');
    }
  }, [solicitacoes]);

  // Exportar para PDF
  const exportarPDF = useCallback(() => {
    if (!solicitacoes || solicitacoes.length === 0) {
      toast.error('Nenhuma solicitação encontrada para exportar');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      
      // Cabeçalho
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Solicitações de Manutenção', pageWidth / 2, 15, { align: 'center' });
      
      // Data de geração
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dataGeracao = new Date().toLocaleDateString('pt-BR');
      doc.text(`Gerado em: ${dataGeracao}`, pageWidth / 2, 22, { align: 'center' });

      // Cabeçalho da tabela
      const colWidths = [25, 35, 20, 25, 40, 20, 15, 15, 25];
      const headers = [
        'Data Solicitação',
        'Escola',
        'Cidade',
        'Nutricionista',
        'Manutenção',
        'Fornecedor',
        'Valor',
        'Status',
        'Observações'
      ];

      let yPos = 35;
      
      // Desenhar cabeçalho da tabela
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      let xPos = margin;
      
      headers.forEach((header, index) => {
        doc.rect(xPos, yPos - 5, colWidths[index], 8);
        doc.text(header, xPos + 2, yPos, { maxWidth: colWidths[index] - 4 });
        xPos += colWidths[index];
      });

      yPos += 8;

      // Dados da tabela
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      solicitacoes.forEach((solicitacao, index) => {
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
          new Date(solicitacao.data_solicitacao).toLocaleDateString('pt-BR'),
          solicitacao.nome_escola,
          solicitacao.cidade,
          solicitacao.nutricionista_nome,
          solicitacao.manutencao_descricao,
          solicitacao.fornecedor || '',
          solicitacao.valor ? `R$ ${solicitacao.valor}` : '',
          solicitacao.status,
          solicitacao.observacoes || ''
        ];

        // Alternar cor de fundo
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
        }

        // Desenhar dados da linha
        xPos = margin;
        let maxLines = 1;
        rowData.forEach((data, colIndex) => {
          const lines = doc.splitTextToSize(data, colWidths[colIndex] - 4);
          maxLines = Math.max(maxLines, lines.length);
          lines.forEach((line, lineIndex) => {
            doc.text(line, xPos + 2, yPos + (lineIndex * 3), { maxWidth: colWidths[colIndex] - 4 });
          });
          xPos += colWidths[colIndex];
        });

        yPos += Math.max(8, maxLines * 3 + 2);
      });

      // Salvar arquivo
      const dataArquivo = new Date().toISOString().split('T')[0];
      const nomeArquivo = `solicitacoes_manutencao_${dataArquivo}.pdf`;
      doc.save(nomeArquivo);
      
      toast.success('Arquivo PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    }
  }, []);

  // useEffect removido - usando useEscolas separado

  return {
    // Estados
    solicitacoes,
    stats,
    loading,
    loadingStats,
    error,
    pagination,

    // Funções
    carregarSolicitacoes,
    carregarStats,
    criarSolicitacao,
    atualizarSolicitacao,
    deletarSolicitacao,
    buscarSolicitacaoPorId,
    uploadFoto,
    exportarXLSX,
    exportarPDF
  };
};
