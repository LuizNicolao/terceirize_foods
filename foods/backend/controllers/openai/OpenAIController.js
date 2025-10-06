/**
 * OpenAI Controller - Controlador para processamento de ingredientes com IA
 */

const openaiService = require('../../services/openaiService');

class OpenAIController {
  /**
   * Extrai ingredientes de um texto usando IA
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async extrairIngredientes(req, res) {
    try {
      const { texto } = req.body;

      // Validação
      if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Texto da receita é obrigatório e não pode estar vazio',
          codigo: 'TEXTO_OBRIGATORIO'
        });
      }

      if (texto.length > 2000) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Texto muito longo. Máximo 2000 caracteres.',
          codigo: 'TEXTO_MUITO_LONGO'
        });
      }

      // Verifica se o serviço está configurado
      if (!openaiService.isReady()) {
        return res.status(503).json({
          sucesso: false,
          erro: 'Serviço OpenAI não está configurado. Verifique a chave da API.',
          codigo: 'SERVICO_NAO_CONFIGURADO'
        });
      }

      // Processa com IA
      const resultado = await openaiService.extrairIngredientes(texto);

      if (!resultado.sucesso) {
        return res.status(500).json({
          sucesso: false,
          erro: resultado.erro,
          codigo: 'ERRO_PROCESSAMENTO_IA'
        });
      }

      // Resposta de sucesso
      res.json({
        sucesso: true,
        dados: {
          ingredientes: resultado.ingredientes,
          quantidade: resultado.ingredientes.length,
          processadoPor: 'openai',
          timestamp: resultado.timestamp,
          tokensUsados: resultado.tokensUsados || 0,
          custoEstimado: resultado.custoEstimado || 0
        },
        textoOriginal: texto
      });

    } catch (error) {
      console.error('❌ Erro no OpenAIController.extrairIngredientes:', error);
      
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_INTERNO',
        detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Testa a conexão com a API OpenAI
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async testarConexao(req, res) {
    try {
      const resultado = await openaiService.testarConexao();

      if (resultado.sucesso) {
        res.json({
          sucesso: true,
          mensagem: 'Conexão com OpenAI estabelecida com sucesso',
          dados: {
            configurado: resultado.configurado,
            modelo: resultado.modelo,
            resposta: resultado.resposta,
            timestamp: resultado.timestamp
          }
        });
      } else {
        res.status(503).json({
          sucesso: false,
          erro: resultado.erro,
          codigo: 'ERRO_CONEXAO_OPENAI',
          configurado: resultado.configurado
        });
      }

    } catch (error) {
      console.error('❌ Erro no OpenAIController.testarConexao:', error);
      
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_INTERNO',
        detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Retorna informações sobre o serviço OpenAI
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obterInfo(req, res) {
    try {
      const configurado = openaiService.isReady();
      const modelo = process.env.OPENAI_MODEL || 'gpt-4o-mini';

      res.json({
        sucesso: true,
        dados: {
          configurado,
          modelo,
          versao: '1.0.0',
          descricao: 'Serviço de extração de ingredientes usando OpenAI GPT-4o mini',
          custoEstimadoPorRequisicao: '~$0.0001 USD',
          limiteTexto: '2000 caracteres',
          timeout: '10 segundos'
        }
      });

    } catch (error) {
      console.error('❌ Erro no OpenAIController.obterInfo:', error);
      
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_INTERNO'
      });
    }
  }
}

module.exports = new OpenAIController();
