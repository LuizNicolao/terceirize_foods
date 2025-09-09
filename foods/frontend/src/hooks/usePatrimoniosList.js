import { useState, useEffect, useCallback } from 'react';
import PatrimoniosService from '../services/patrimonios';

export const usePatrimoniosList = () => {
  // Estados locais (não compartilhados)
  const [patrimonios, setPatrimonios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Carregar patrimônios
  const loadPatrimonios = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...params
      };

      // Remover filtros vazios
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === 'todos' || queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      // Se tiver localId, usar como filtro
      if (params.localId) {
        queryParams.local_atual_id = params.localId;
      }

      // Se tiver tipoLocal, usar como filtro
      if (params.tipoLocal) {
        queryParams.tipo_local = params.tipoLocal;
      }

      const result = await PatrimoniosService.listarPatrimonios(queryParams);
      
      if (result.success) {
        setPatrimonios(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || 0,
          pages: result.pagination?.pages || 0
        }));
      } else {
        console.error(result.error || 'Erro ao carregar patrimônios');
        setPatrimonios([]);
      }
    } catch (error) {
      console.error('Erro ao carregar patrimônios:', error);
      setPatrimonios([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  return {
    patrimonios,
    loading,
    totalItems: pagination.total,
    totalPages: pagination.pages,
    loadPatrimonios
  };
};
