/**
 * OpenAI Service - Frontend
 * 
 * Este serviço faz a comunicação com o backend para processar
 * ingredientes usando a API da OpenAI.
 */

class OpenAIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

  /**
   * Extrai ingredientes de um texto usando IA
   * @param {string} texto - Texto da receita
   * @returns {Promise<Object>} - Resultado da extração
   */
  async extrairIngredientes(texto) {
    try {
      const response = await fetch(`${this.baseURL}/api/openai/extrair-ingredientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texto })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao processar com IA');
      }

      return {
        sucesso: true,
        ingredientes: data.dados.ingredientes,
        quantidade: data.dados.quantidade,
        processadoPor: data.dados.processadoPor,
        timestamp: data.dados.timestamp,
        tokensUsados: data.dados.tokensUsados,
        custoEstimado: data.dados.custoEstimado
      };

    } catch (error) {
      console.error('❌ Erro no OpenAIService.extrairIngredientes:', error);
      
      return {
        sucesso: false,
        erro: error.message,
        ingredientes: [],
        processadoPor: 'openai'
      };
    }
  }

  /**
   * Testa a conexão com a API OpenAI
   * @returns {Promise<Object>} - Resultado do teste
   */
  async testarConexao() {
    try {
      const response = await fetch(`${this.baseURL}/api/openai/testar-conexao`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao testar conexão');
      }

      return {
        sucesso: true,
        configurado: data.dados.configurado,
        modelo: data.dados.modelo,
        resposta: data.dados.resposta,
        timestamp: data.dados.timestamp
      };

    } catch (error) {
      console.error('❌ Erro no OpenAIService.testarConexao:', error);
      
      return {
        sucesso: false,
        erro: error.message,
        configurado: false
      };
    }
  }

  /**
   * Obtém informações sobre o serviço OpenAI
   * @returns {Promise<Object>} - Informações do serviço
   */
  async obterInfo() {
    try {
      const response = await fetch(`${this.baseURL}/api/openai/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao obter informações');
      }

      return {
        sucesso: true,
        configurado: data.dados.configurado,
        modelo: data.dados.modelo,
        versao: data.dados.versao,
        descricao: data.dados.descricao,
        custoEstimadoPorRequisicao: data.dados.custoEstimadoPorRequisicao,
        limiteTexto: data.dados.limiteTexto,
        timeout: data.dados.timeout
      };

    } catch (error) {
      console.error('❌ Erro no OpenAIService.obterInfo:', error);
      
      return {
        sucesso: false,
        erro: error.message,
        configurado: false
      };
    }
  }

  /**
   * Processa ingredientes usando estratégia híbrida
   * @param {string} texto - Texto da receita
   * @param {string} ingredientesAtuais - Ingredientes extraídos pelo agente atual
   * @returns {Promise<Object>} - Resultado do processamento
   */
  async processarComEstrategiaHibrida(texto, ingredientesAtuais) {
    try {
      // Primeiro tenta com o agente atual
      if (ingredientesAtuais && ingredientesAtuais.trim().length > 0) {
        const ingredientesArray = ingredientesAtuais.split(',').map(i => i.trim());
        
        // Se o agente atual extraiu ingredientes válidos, usa ele
        if (ingredientesArray.length > 0 && ingredientesArray.some(i => i.length > 2)) {
          return {
            sucesso: true,
            ingredientes: ingredientesArray,
            processadoPor: 'agente-atual',
            estrategia: 'agente-local'
          };
        }
      }

      // Se o agente atual não conseguiu, usa a IA
      console.log('🤖 Agente atual não conseguiu processar, usando IA...');
      const resultadoIA = await this.extrairIngredientes(texto);
      
      if (resultadoIA.sucesso) {
        return {
          ...resultadoIA,
          estrategia: 'ia-fallback'
        };
      }

      // Se a IA também falhou, retorna o que o agente atual conseguiu
      return {
        sucesso: true,
        ingredientes: ingredientesAtuais ? ingredientesAtuais.split(',').map(i => i.trim()) : [],
        processadoPor: 'agente-atual',
        estrategia: 'fallback-local',
        aviso: 'IA não disponível, usando agente local'
      };

    } catch (error) {
      console.error('❌ Erro no processamento híbrido:', error);
      
      return {
        sucesso: false,
        erro: error.message,
        ingredientes: [],
        processadoPor: 'erro'
      };
    }
  }
}

// Singleton instance
const openaiService = new OpenAIService();

export default openaiService;
