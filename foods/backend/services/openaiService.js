/**
 * OpenAI Service - Processamento de Ingredientes com IA
 * 
 * Este serviço utiliza a API da OpenAI para extrair ingredientes
 * de textos de receitas de forma inteligente e precisa.
 */

const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.initializeClient();
  }

  /**
   * Inicializa o cliente OpenAI
   */
  initializeClient() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️  OPENAI_API_KEY não configurada. Serviço OpenAI desabilitado.');
        return;
      }

      this.client = new OpenAI({
        apiKey: apiKey,
        timeout: 10000, // 10 segundos
        maxRetries: 2
      });

      this.isConfigured = true;
      console.log('✅ OpenAI Service configurado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao configurar OpenAI Service:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Verifica se o serviço está configurado
   */
  isReady() {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Extrai ingredientes de um texto de receita usando IA
   * @param {string} textoReceita - Texto da receita extraído do PDF
   * @returns {Promise<Object>} - Resultado da extração
   */
  async extrairIngredientes(textoReceita) {
    if (!this.isReady()) {
      throw new Error('OpenAI Service não está configurado');
    }

    if (!textoReceita || textoReceita.trim().length === 0) {
      throw new Error('Texto da receita não pode estar vazio');
    }

    try {
      const prompt = this.criarPrompt(textoReceita);
      
      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Baixa temperatura para consistência
        max_tokens: 500,
        timeout: 10000
      });

      const resultado = this.processarResposta(response);
      
      console.log(`✅ OpenAI processou receita: ${resultado.ingredientes.length} ingredientes extraídos`);
      
      return resultado;

    } catch (error) {
      console.error('❌ Erro ao processar com OpenAI:', error.message);
      
      // Retorna erro estruturado
      return {
        sucesso: false,
        erro: error.message,
        ingredientes: [],
        textoOriginal: textoReceita,
        processadoPor: 'openai',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cria o prompt para a IA
   * @param {string} textoReceita - Texto da receita
   * @returns {string} - Prompt formatado
   */
  criarPrompt(textoReceita) {
    return `
Analise o seguinte texto de receita e extraia APENAS os ingredientes individuais:

TEXTO DA RECEITA:
"${textoReceita}"

INSTRUÇÕES:
1. Identifique todos os ingredientes mencionados no texto
2. Separe ingredientes compostos em ingredientes individuais quando apropriado
3. Ignore palavras de preparo (assado, refogado, temperado, etc.)
4. Ignore quantidades e medidas
5. Retorne APENAS uma lista JSON com os ingredientes em maiúsculas
6. Use nomes genéricos (ex: "carne" em vez de "carne bovina moída")

FORMATO DE RESPOSTA:
{
  "ingredientes": ["INGREDIENTE1", "INGREDIENTE2", "INGREDIENTE3"]
}

EXEMPLO:
Se o texto for: "Filé de tilápia assado (temperado com limão, alho, cebola e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana"

Resposta esperada:
{
  "ingredientes": ["TILÁPIA", "LIMÃO", "ALHO", "CEBOLA", "TEMPERO VERDE", "ARROZ", "FEIJÃO", "BATATA", "CENOURA", "BANANA"]
}
`;
  }

  /**
   * Retorna o prompt do sistema
   * @returns {string} - Prompt do sistema
   */
  getSystemPrompt() {
    return `Você é um especialista em análise de receitas culinárias brasileiras. 
Sua tarefa é extrair ingredientes de textos de receitas de forma precisa e consistente.

REGRAS IMPORTANTES:
- Retorne APENAS ingredientes, não métodos de preparo
- Use nomes genéricos de ingredientes
- Mantenha ingredientes compostos juntos quando fazem sentido (ex: "tempero verde")
- Converta tudo para MAIÚSCULAS
- Retorne APENAS o JSON solicitado, sem explicações adicionais
- Se não conseguir identificar ingredientes claros, retorne array vazio

INGREDIENTES COMUNS NO BRASIL:
arroz, feijão, carne, frango, peixe, tilápia, batata, cenoura, cebola, alho, tomate, 
abobrinha, milho, banana, laranja, mamão, tempero verde, ervilha, couve, repolho, 
alface, macarrão, pão, leite, queijo, ovo, aveia, iogurte, mel, biscoito, etc.`;
  }

  /**
   * Processa a resposta da IA
   * @param {Object} response - Resposta da API OpenAI
   * @returns {Object} - Resultado processado
   */
  processarResposta(response) {
    try {
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      // Tenta extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido da IA');
      }

      const resultado = JSON.parse(jsonMatch[0]);
      
      if (!resultado.ingredientes || !Array.isArray(resultado.ingredientes)) {
        throw new Error('Formato de ingredientes inválido');
      }

      // Valida e limpa os ingredientes
      const ingredientesLimpos = resultado.ingredientes
        .filter(ingrediente => ingrediente && typeof ingrediente === 'string')
        .map(ingrediente => ingrediente.trim().toUpperCase())
        .filter(ingrediente => ingrediente.length > 0);

      return {
        sucesso: true,
        ingredientes: ingredientesLimpos,
        textoOriginal: response.choices[0]?.message?.content || '',
        processadoPor: 'openai',
        timestamp: new Date().toISOString(),
        tokensUsados: response.usage?.total_tokens || 0,
        custoEstimado: this.calcularCusto(response.usage)
      };

    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error.message);
      throw new Error(`Erro ao processar resposta: ${error.message}`);
    }
  }

  /**
   * Calcula o custo estimado da requisição
   * @param {Object} usage - Dados de uso da API
   * @returns {number} - Custo estimado em USD
   */
  calcularCusto(usage) {
    if (!usage) return 0;

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    // Preços do GPT-4o mini (USD por 1M tokens)
    const precos = {
      'gpt-4o-mini': {
        input: 0.15,
        output: 0.60
      }
    };

    const preco = precos[model] || precos['gpt-4o-mini'];
    
    const custoInput = (usage.prompt_tokens / 1000000) * preco.input;
    const custoOutput = (usage.completion_tokens / 1000000) * preco.output;
    
    return custoInput + custoOutput;
  }

  /**
   * Testa a conexão com a API
   * @returns {Promise<Object>} - Resultado do teste
   */
  async testarConexao() {
    if (!this.isReady()) {
      return {
        sucesso: false,
        erro: 'OpenAI Service não está configurado',
        configurado: false
      };
    }

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Responda apenas: "Conexão OK"'
          }
        ],
        max_tokens: 10,
        timeout: 5000
      });

      return {
        sucesso: true,
        configurado: true,
        modelo: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        resposta: response.choices[0]?.message?.content || '',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        sucesso: false,
        erro: error.message,
        configurado: true,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
const openaiService = new OpenAIService();

module.exports = openaiService;
