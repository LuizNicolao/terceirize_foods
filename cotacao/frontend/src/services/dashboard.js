import api from './api';

export const dashboardService = {
  // Buscar estatísticas do dashboard
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/dashboard/stats', { params });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // Buscar cotações recentes
  getRecent: async (params = {}) => {
    try {
      const response = await api.get('/dashboard/recent', { params });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // Buscar alertas
  getAlerts: async (params = {}) => {
    try {
      const response = await api.get('/dashboard/alerts', { params });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  },

  // Buscar atividades recentes
  getActivity: async (params = {}) => {
    try {
      const response = await api.get('/dashboard/activity', { params });
      
      if (response.data.success) {
        return response.data.data.activities;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  }
};
