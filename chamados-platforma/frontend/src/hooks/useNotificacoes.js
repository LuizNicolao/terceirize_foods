import { useState, useEffect, useCallback, useRef } from 'react';
import NotificacoesService from '../services/notificacoes';
import toast from 'react-hot-toast';
import { playNotificationSound, isNotificationSoundEnabled } from '../utils/notificationSound';

export const useNotificacoes = (autoRefresh = true, refreshInterval = 30000) => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const previousNaoLidasRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  const carregarNotificacoes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const result = await NotificacoesService.listar({ ...params, limit: 20 });
      if (result.success) {
        const novaQuantidadeNaoLidas = result.naoLidas || 0;
        const quantidadeAnterior = previousNaoLidasRef.current;
        
        setNotificacoes(result.data || []);
        setNaoLidas(novaQuantidadeNaoLidas);
        
        // Tocar som apenas se houver novas notificações (aumento no número de não lidas)
        // E não for o carregamento inicial
        if (!isInitialLoadRef.current && 
            novaQuantidadeNaoLidas > quantidadeAnterior && 
            isNotificationSoundEnabled()) {
          playNotificationSound();
        }
        
        previousNaoLidasRef.current = novaQuantidadeNaoLidas;
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, []);

  const atualizarContador = useCallback(async () => {
    try {
      const result = await NotificacoesService.contarNaoLidas();
      if (result.success) {
        const novaQuantidade = result.total || 0;
        const quantidadeAnterior = previousNaoLidasRef.current;
        
        // Tocar som apenas se houver novas notificações (aumento no número de não lidas)
        if (novaQuantidade > quantidadeAnterior && isNotificationSoundEnabled()) {
          playNotificationSound();
        }
        
        setNaoLidas(novaQuantidade);
        previousNaoLidasRef.current = novaQuantidade;
      }
    } catch (error) {
      console.error('Erro ao atualizar contador:', error);
    }
  }, []);

  const marcarComoLida = useCallback(async (id) => {
    try {
      const result = await NotificacoesService.marcarComoLida(id);
      if (result.success) {
        setNotificacoes(prev => 
          prev.map(n => n.id === id ? { ...n, lida: true, data_leitura: new Date().toISOString() } : n)
        );
        setNaoLidas(prev => Math.max(0, prev - 1));
      } else {
        toast.error(result.error || 'Erro ao marcar notificação como lida');
      }
    } catch (error) {
      toast.error('Erro ao marcar notificação como lida');
      console.error(error);
    }
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    try {
      const result = await NotificacoesService.marcarTodasComoLidas();
      if (result.success) {
        setNotificacoes(prev => prev.map(n => ({ ...n, lida: true, data_leitura: new Date().toISOString() })));
        setNaoLidas(0);
        toast.success('Todas as notificações foram marcadas como lidas');
      } else {
        toast.error(result.error || 'Erro ao marcar notificações como lidas');
      }
    } catch (error) {
      toast.error('Erro ao marcar notificações como lidas');
      console.error(error);
    }
  }, []);

  const excluir = useCallback(async (id) => {
    try {
      const result = await NotificacoesService.excluir(id);
      if (result.success) {
        setNotificacoes(prev => prev.filter(n => n.id !== id));
        toast.success('Notificação excluída');
      } else {
        toast.error(result.error || 'Erro ao excluir notificação');
      }
    } catch (error) {
      toast.error('Erro ao excluir notificação');
      console.error(error);
    }
  }, []);

  // Carregar notificações na montagem
  useEffect(() => {
    carregarNotificacoes();
  }, [carregarNotificacoes]);

  // Auto-refresh se habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      atualizarContador();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, atualizarContador]);

  return {
    notificacoes,
    naoLidas,
    loading,
    carregarNotificacoes,
    atualizarContador,
    marcarComoLida,
    marcarTodasComoLidas,
    excluir
  };
};

