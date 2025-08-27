import api from './api';

class SavingService {
    /**
     * Listar registros de saving com filtros e paginação
     */
    static async listarSaving(params = {}) {
        try {
            const response = await api.get('/saving', { params });
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao listar saving:', error);
            throw error;
        }
    }

    /**
     * Obter detalhes de um registro de saving
     */
    static async obterSaving(id) {
        try {
            const response = await api.get(`/saving/${id}`);
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao obter saving:', error);
            throw error;
        }
    }

    /**
     * Obter itens de um saving específico
     */
    static async obterSavingItens(savingId) {
        try {
            const response = await api.get(`/saving/${savingId}/itens`);
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao obter itens do saving:', error);
            throw error;
        }
    }

    /**
     * Criar novo registro de saving
     */
    static async criarSaving(data) {
        try {
            const response = await api.post('/saving', data);
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao criar saving:', error);
            throw error;
        }
    }

    /**
     * Atualizar registro de saving
     */
    static async atualizarSaving(id, data) {
        try {
            const response = await api.put(`/saving/${id}`, data);
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao atualizar saving:', error);
            throw error;
        }
    }

    /**
     * Excluir registro de saving
     */
    static async excluirSaving(id) {
        try {
            const response = await api.delete(`/saving/${id}`);
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao excluir saving:', error);
            throw error;
        }
    }

    /**
     * Obter resumo de um registro de saving
     */
    static async obterResumoSaving(id) {
        try {
            const response = await api.get(`/saving/${id}/resumo`);
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao obter resumo do saving:', error);
            throw error;
        }
    }

    /**
     * Aprovar registro de saving
     */
    static async aprovarSaving(id, data) {
        try {
            const response = await api.post(`/saving/${id}/aprovar`, data);
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao aprovar saving:', error);
            throw error;
        }
    }

    /**
     * Rejeitar registro de saving
     */
    static async rejeitarSaving(id, data) {
        try {
            const response = await api.post(`/saving/${id}/rejeitar`, data);
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao rejeitar saving:', error);
            throw error;
        }
    }

    /**
     * Exportar dados de saving
     */
    static async exportarSaving(filtros = {}) {
        try {
            const response = await api.get('/saving/export', { 
                params: filtros,
                responseType: 'blob'
            });
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao exportar saving:', error);
            throw error;
        }
    }

    /**
     * Obter estatísticas de saving
     */
    static async obterEstatisticas(filtros = {}) {
        try {
            const response = await api.get('/saving/estatisticas', { params: filtros });
            return response.data.data || response.data; // Extrair dados da estrutura padronizada
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            throw error;
        }
    }
}

export default SavingService;
