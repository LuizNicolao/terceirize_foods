import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import permissoesService from '../services/permissoesService';

export const usePermissoes = (usuarioId = null) => {
  const { user } = useAuth();
  const [permissoes, setPermissoes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Se não foi passado usuarioId, usar o usuário atual
  const targetUserId = usuarioId || user?.id;

  const carregarPermissoes = async (id = targetUserId) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Se for o usuário atual, usar a rota /me (sem restrições)
      // Se for outro usuário, usar a rota com ID (apenas coordenação)
      const response = await permissoesService.listar(id === user?.id ? null : id);
      
      const permissoesMap = {};
      
      response.data.forEach(permissao => {
        permissoesMap[permissao.tela] = {
          visualizar: permissao.pode_visualizar === 1,
          criar: permissao.pode_criar === 1,
          editar: permissao.pode_editar === 1,
          excluir: permissao.pode_excluir === 1
        };
      });
      
      setPermissoes(permissoesMap);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const atualizarPermissoes = async (id, novasPermissoes) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await permissoesService.atualizar(id, novasPermissoes);
      await carregarPermissoes(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar permissões';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetarPermissoes = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await permissoesService.resetarPadrao(id);
      await carregarPermissoes(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao resetar permissões';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se o usuário atual tem permissão
  const temPermissao = (tela, acao) => {
    if (!user) return false;
    
    // Se não temos permissões carregadas, assumir que não tem permissão
    if (Object.keys(permissoes).length === 0) return false;
    
    const permissaoTela = permissoes[tela];
    if (!permissaoTela) return false;
    
    return permissaoTela[acao] === true;
  };

  // Função para verificar permissão de outro usuário
  const verificarPermissaoUsuario = async (id, tela, acao) => {
    try {
      const response = await permissoesService.verificarPermissao(id, tela, acao);
      return response.data.temPermissao;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    if (targetUserId) {
      carregarPermissoes(targetUserId);
    }
  }, [targetUserId, user?.id]); // Adicionar user?.id como dependência

  return {
    permissoes,
    loading,
    error,
    carregarPermissoes,
    atualizarPermissoes,
    resetarPermissoes,
    temPermissao,
    verificarPermissaoUsuario
  };
};
