# 🤖 Integração OpenAI - Processamento de Ingredientes

Este documento explica como configurar e usar a integração com a API da OpenAI para processamento inteligente de ingredientes.

## 📋 Pré-requisitos

1. **Conta na OpenAI** - Crie uma conta em [platform.openai.com](https://platform.openai.com)
2. **Chave da API** - Obtenha sua chave em [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. **Créditos** - Adicione créditos à sua conta (mínimo $5)

## ⚙️ Configuração

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `env.example` para `.env`:

```bash
cp env.example .env
```

Edite o arquivo `.env` e adicione sua chave da API:

```bash
# Configurações do OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 2. Instalar Dependências

As dependências já foram instaladas automaticamente:

- `openai` - SDK oficial da OpenAI
- `express-rate-limit` - Rate limiting para evitar abuso

### 3. Reiniciar o Servidor

```bash
npm start
# ou
node server.js
```

## 🚀 Como Usar

### 1. Testar Conexão

```bash
curl http://localhost:3001/api/openai/testar-conexao
```

### 2. Extrair Ingredientes

```bash
curl -X POST http://localhost:3001/api/openai/extrair-ingredientes \
  -H "Content-Type: application/json" \
  -d '{"texto": "Filé de tilápia assado (temperado com limão, alho, cebola e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana"}'
```

### 3. Obter Informações do Serviço

```bash
curl http://localhost:3001/api/openai/info
```

## 📊 Estratégia Híbrida

O sistema usa uma estratégia híbrida inteligente:

1. **Agente Local** - Tenta processar com o agente atual
2. **IA Fallback** - Se o agente falhar, usa a OpenAI
3. **Fallback Local** - Se a IA falhar, volta para o agente

### Fluxo de Processamento

```
Texto da Receita
       ↓
Agente Local (agenteCorrecaoIngredientes)
       ↓
   Sucesso?
   ↙      ↘
  SIM      NÃO
   ↓        ↓
Retorna   OpenAI API
          ↓
      Sucesso?
      ↙      ↘
     SIM      NÃO
      ↓        ↓
   Retorna   Fallback Local
```

## 💰 Custos

### GPT-4o Mini (Recomendado)
- **Input**: $0.15 por 1M tokens
- **Output**: $0.60 por 1M tokens
- **Custo por receita**: ~$0.0001 USD

### Exemplo de Custo
- **1.000 receitas**: ~$0.10 USD
- **10.000 receitas**: ~$1.00 USD
- **100.000 receitas**: ~$10.00 USD

## 🔒 Segurança

### ✅ Implementado
- **Chave no backend** - Nunca exposta no frontend
- **Rate limiting** - 100 requisições por 15 minutos
- **Validação de entrada** - Texto limitado a 2000 caracteres
- **Timeout** - 10 segundos por requisição
- **Error handling** - Tratamento robusto de erros

### 🛡️ Boas Práticas
- **Nunca commitar** o arquivo `.env`
- **Usar HTTPS** em produção
- **Monitorar custos** regularmente
- **Backup da chave** em local seguro

## 📈 Monitoramento

### Logs do Servidor
```bash
# Sucesso
✅ OpenAI processou receita: 8 ingredientes extraídos

# Erro
❌ Erro ao processar com OpenAI: API key invalid
```

### Métricas Disponíveis
- **Tokens usados** por requisição
- **Custo estimado** por processamento
- **Tempo de resposta** da API
- **Taxa de sucesso** vs falha

## 🚨 Troubleshooting

### Erro: "Serviço OpenAI não está configurado"
- Verifique se `OPENAI_API_KEY` está no `.env`
- Reinicie o servidor após adicionar a chave

### Erro: "API key invalid"
- Verifique se a chave está correta
- Confirme se a conta tem créditos

### Erro: "Rate limit exceeded"
- Aguarde 15 minutos
- Verifique se não há muitas requisições simultâneas

### Erro: "Timeout"
- Verifique sua conexão com a internet
- A API pode estar lenta, tente novamente

## 🔧 Desenvolvimento

### Estrutura de Arquivos
```
foods/backend/
├── services/
│   └── openaiService.js      # Lógica principal
├── controllers/
│   └── openai/
│       └── OpenAIController.js  # Controlador
├── routes/
│   └── openai/
│       └── openaiRoute.js    # Rotas da API
└── env.example               # Template de configuração
```

### Endpoints Disponíveis
- `POST /api/openai/extrair-ingredientes` - Extrair ingredientes
- `GET /api/openai/testar-conexao` - Testar conexão
- `GET /api/openai/info` - Informações do serviço

## 📝 Exemplos de Uso

### Frontend (React)
```javascript
import openaiService from '../services/openaiService';

// Extrair ingredientes
const resultado = await openaiService.extrairIngredientes(textoReceita);

// Estratégia híbrida
const resultado = await openaiService.processarComEstrategiaHibrida(
  textoReceita, 
  ingredientesAtuais
);
```

### Backend (Node.js)
```javascript
const openaiService = require('./services/openaiService');

// Extrair ingredientes
const resultado = await openaiService.extrairIngredientes(textoReceita);
```

## 🎯 Próximos Passos

1. **Testar** com receitas reais
2. **Monitorar** custos e performance
3. **Ajustar** prompts se necessário
4. **Implementar** cache de resultados
5. **Adicionar** métricas de qualidade

---

**💡 Dica**: Comece com poucas receitas para testar e depois escale conforme necessário!
