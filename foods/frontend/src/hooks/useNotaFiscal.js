/**
 * Hook customizado para Notas Fiscais
 * Gerencia estado e operações relacionadas a notas fiscais
 */

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import toast from 'react-hot-toast';
import notaFiscalService from '../services/notaFiscalService';
import NotaFiscalPrint from '../components/notas-fiscais/NotaFiscalPrint';

export const useNotaFiscal = () => {
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [notaFiscalSelecionada, setNotaFiscalSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    tipo_nota: '',
    fornecedor_id: '',
    filial_id: '',
    data_inicio: '',
    data_fim: ''
  });

  /**
   * Carregar notas fiscais
   */
  const carregarNotasFiscais = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params
      };

      // Remover filtros vazios
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await notaFiscalService.listar(queryParams);

      if (response.success) {
        // Garantir que sempre seja um array
        const dados = Array.isArray(response.data) ? response.data : [];
        setNotasFiscais(dados);
        
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.pagination,
            page: response.pagination.currentPage || response.pagination.page || prev.page,
            total: response.pagination.total || prev.total,
            totalPages: response.pagination.totalPages || prev.totalPages
          }));
        }

        // Calcular estatísticas
        const stats = {
          total: dados.length,
          lancadas: dados.filter(nf => nf.status === 'LANCADA').length
        };
        setEstatisticas(stats);
      } else {
        toast.error(response.error || 'Erro ao carregar notas fiscais');
      }
    } catch (error) {
      toast.error('Erro ao carregar notas fiscais');
      console.error('Erro ao carregar notas fiscais:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /**
   * Carregar nota fiscal por ID
   */
  const carregarNotaFiscal = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await notaFiscalService.buscarPorId(id);

      if (response.success) {
        setNotaFiscalSelecionada(response.data);
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao carregar nota fiscal');
        return null;
      }
    } catch (error) {
      toast.error('Erro ao carregar nota fiscal');
      console.error('Erro ao carregar nota fiscal:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Criar nota fiscal
   */
  const criarNotaFiscal = useCallback(async (notaFiscal) => {
    setLoading(true);
    try {
      const response = await notaFiscalService.criar(notaFiscal);

      if (response.success) {
        toast.success(response.message || 'Nota fiscal criada com sucesso');
        await carregarNotasFiscais();
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao criar nota fiscal');
        return null;
      }
    } catch (error) {
      toast.error('Erro ao criar nota fiscal');
      console.error('Erro ao criar nota fiscal:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [carregarNotasFiscais]);

  /**
   * Atualizar nota fiscal
   */
  const atualizarNotaFiscal = useCallback(async (id, notaFiscal) => {
    setLoading(true);
    try {
      const response = await notaFiscalService.atualizar(id, notaFiscal);

      if (response.success) {
        toast.success(response.message || 'Nota fiscal atualizada com sucesso');
        await carregarNotasFiscais();
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao atualizar nota fiscal');
        return null;
      }
    } catch (error) {
      toast.error('Erro ao atualizar nota fiscal');
      console.error('Erro ao atualizar nota fiscal:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [carregarNotasFiscais]);

  /**
   * Excluir nota fiscal
   */
  const excluirNotaFiscal = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await notaFiscalService.excluir(id);

      if (response.success) {
        toast.success(response.message || 'Nota fiscal excluída com sucesso');
        await carregarNotasFiscais();
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir nota fiscal');
        return false;
      }
    } catch (error) {
      toast.error('Erro ao excluir nota fiscal');
      console.error('Erro ao excluir nota fiscal:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarNotasFiscais]);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFilters(prev => ({ ...prev, ...novosFiltros }));
    setPagination(prev => ({ ...prev, page: 1 })); // Resetar para primeira página
  }, []);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => ({ ...prev, ...novaPaginacao }));
  }, []);

  /**
   * Limpar seleção
   */
  const limparSelecao = useCallback(() => {
    setNotaFiscalSelecionada(null);
  }, []);

  /**
   * Imprimir nota fiscal - abre o diálogo de impressão do navegador em janela temporária
   */
  const handlePrintNotaFiscal = useCallback(async (item) => {
    try {
      const notaFiscalId = typeof item === 'object' ? item.id : item;
      const response = await carregarNotaFiscal(notaFiscalId);
      
      if (response) {
        const notaFiscal = response;
        
        // Criar container para impressão na mesma página
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container-nota-fiscal';
        printContainer.style.cssText = `
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 210mm;
          min-height: 297mm;
          background: white;
          z-index: 9999;
        `;
        document.body.appendChild(printContainer);
        
        // Criar estilo para esconder o resto da página durante impressão
        const printStyle = document.createElement('style');
        printStyle.id = 'print-style-nota-fiscal';
        printStyle.textContent = `
          @media print {
            @page {
              size: A4;
              margin: 0mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
            }
            body > *:not(#print-container-nota-fiscal) {
              display: none !important;
              visibility: hidden !important;
            }
            header, nav, footer, .navbar, .sidebar, .menu, button, .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            #print-container-nota-fiscal {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 210mm !important;
              margin: 0 !important;
              padding: 15mm !important;
              box-sizing: border-box !important;
              background: white !important;
            }
          }
        `;
        document.head.appendChild(printStyle);
        
        // Renderizar o componente de impressão
        const root = ReactDOM.createRoot(printContainer);
        root.render(React.createElement(NotaFiscalPrint, { notaFiscal }));
        
        // Aguardar um pouco para garantir que o conteúdo foi renderizado
        setTimeout(() => {
          window.print();
          
          // Limpar após impressão
          setTimeout(() => {
            root.unmount();
            document.body.removeChild(printContainer);
            if (document.getElementById('print-style-nota-fiscal')) {
              document.head.removeChild(printStyle);
            }
          }, 1000);
        }, 500);
      }
    } catch (error) {
      toast.error('Erro ao preparar impressão da nota fiscal');
      console.error('Erro ao imprimir nota fiscal:', error);
    }
  }, [carregarNotaFiscal]);

  // Carregar dados na montagem
  useEffect(() => {
    carregarNotasFiscais();
  }, [pagination.page, pagination.limit]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarNotasFiscais();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [filters]);

  return {
    // Estados
    notasFiscais,
    notaFiscalSelecionada,
    loading,
    estatisticas,
    pagination,
    filters,

    // Ações
    carregarNotasFiscais,
    carregarNotaFiscal,
    criarNotaFiscal,
    atualizarNotaFiscal,
    excluirNotaFiscal,
    atualizarFiltros,
    atualizarPaginacao,
    limparSelecao,
    setNotaFiscalSelecionada,
    handlePrintNotaFiscal
  };
};

