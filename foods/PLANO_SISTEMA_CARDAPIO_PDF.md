# Sistema de Processamento de Cardápios PDF

## 📋 Visão Geral

Sistema inteligente para processar automaticamente PDFs de cardápios escolares, criar cardápios personalizados e gerar necessidades de compras, integrando com a base de dados existente de produtos, efetivos e períodos de refeição.

## 🎯 Objetivo

Processar PDFs de cardápios recebidos **45 dias antes** do serviço, criar cardápios personalizados e gerar necessidades de compras, considerando:
- Períodos de refeição cadastrados
- Efetivos padrão e NAE (por intolerância)
- Base de produtos existente
- Reutilização de receitas já processadas
- Validação e aprovação antes do serviço
- Geração automática de listas de compras

## 📊 Fluxo do Sistema

### Fluxo Principal
```
PDF Cardápio → Processamento → Validação → Aprovação → Geração de Necessidades → Agendamento
     ↓              ↓             ↓          ↓              ↓                    ↓
   Upload      Extração      Preview    Workflow      Lista Compras         Serviço
```

### Fluxo Inteligente (Tela de Geração de Necessidades)
```
PDF → Verificar Receitas Existentes → Processar Novas → Salvar Cardápio → Gerar Necessidades
  ↓              ↓                        ↓              ↓                ↓
Upload    Buscar no Sistema        Extrair Novas    Persistir        Lista Compras
```

### Fluxo de Criação Personalizada (Tela de Cardápios)
```
Novo Cardápio → Escolher Tipo → Adicionar Receitas → Salvar → Gerar Necessidades
     ↓              ↓                ↓                ↓           ↓
  Criar/        Duplicar/        Personalizar    Persistir   Lista Compras
  Personalizado  Personalizado
```

### Fluxo de Geração de Necessidades
```
Cardápio Aprovado → Calcular Quantidades → Gerar Lista Compras → Exportar
        ↓                    ↓                    ↓              ↓
   Buscar Receitas    Por Efetivo/NAE      Agrupar por Data   Excel/PDF
```

## 🗄️ Estrutura de Dados

### Tabelas do Banco

```sql
-- Receitas processadas (base do sistema)
CREATE TABLE receitas_processadas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo_interno VARCHAR(20) UNIQUE, -- REC-001, REC-002
  codigo_referencia VARCHAR(20),     -- R25.375, LL25.228
  nome VARCHAR(255),
  descricao TEXT,
  ingredientes JSON,
  turnos JSON,
  origem ENUM('pdf', 'duplicado', 'personalizado') NOT NULL,
  data_processamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  vezes_usada INT DEFAULT 1,
  status ENUM('ativo', 'inativo') DEFAULT 'ativo',
  criado_por INT,
  baseado_em INT NULL, -- Para receitas duplicadas
  FOREIGN KEY (criado_por) REFERENCES usuarios(id),
  FOREIGN KEY (baseado_em) REFERENCES receitas_processadas(id)
);

-- Cardápios gerados
CREATE TABLE cardapios_gerados (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255),
  tipo ENUM('importado_pdf', 'duplicado', 'personalizado') NOT NULL,
  periodo VARCHAR(50),
  data_inicio DATE,
  data_fim DATE,
  unidade_id INT,
  receitas JSON, -- Array de receitas com códigos internos
  status ENUM('rascunho', 'aprovado', 'ativo') DEFAULT 'rascunho',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  criado_por INT,
  baseado_em INT NULL, -- Para cardápios duplicados
  observacoes TEXT,
  FOREIGN KEY (unidade_id) REFERENCES unidades_escolares(id),
  FOREIGN KEY (criado_por) REFERENCES usuarios(id),
  FOREIGN KEY (baseado_em) REFERENCES cardapios_gerados(id)
);

-- Dias do cardápio
CREATE TABLE cardapio_dias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cardapio_id INT NOT NULL,
  data DATE NOT NULL,
  dia_semana VARCHAR(20) NOT NULL,
  semana INT NOT NULL,
  FOREIGN KEY (cardapio_id) REFERENCES cardapios_gerados(id) ON DELETE CASCADE
);

-- Refeições por turno
CREATE TABLE cardapio_refeicoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dia_id INT NOT NULL,
  receita_id INT NOT NULL,
  turno ENUM('matutino', 'vespertino', 'noturno') NOT NULL,
  FOREIGN KEY (dia_id) REFERENCES cardapio_dias(id) ON DELETE CASCADE,
  FOREIGN KEY (receita_id) REFERENCES receitas_processadas(id)
);

-- Necessidades geradas
CREATE TABLE necessidades_cardapio (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cardapio_id INT NOT NULL,
  receita_id INT NOT NULL,
  data DATE,
  produto_id INT NOT NULL,
  quantidade_padrao DECIMAL(10,2),
  quantidade_nae DECIMAL(10,2),
  quantidade_total DECIMAL(10,2),
  unidade VARCHAR(20),
  status ENUM('pendente', 'comprado', 'entregue') DEFAULT 'pendente',
  FOREIGN KEY (cardapio_id) REFERENCES cardapios_gerados(id),
  FOREIGN KEY (receita_id) REFERENCES receitas_processadas(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Efetivos por refeição
CREATE TABLE cardapio_efetivos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  refeicao_id INT NOT NULL,
  efetivos_padrao INT DEFAULT 0,
  efetivos_nae INT DEFAULT 0,
  FOREIGN KEY (refeicao_id) REFERENCES cardapio_refeicoes(id) ON DELETE CASCADE
);

-- Produtos alternativos para NAE
CREATE TABLE produtos_nae (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produto_original_id INT NOT NULL,
  produto_alternativo_id INT NOT NULL,
  intolerancia VARCHAR(50) NOT NULL,
  proporcao DECIMAL(5,2) DEFAULT 1.0,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (produto_original_id) REFERENCES produtos(id),
  FOREIGN KEY (produto_alternativo_id) REFERENCES produtos(id)
);
```

## 🔧 Processamento do PDF

### 1. Extração de Dados Inteligente

```javascript
async function processarCardapioPDF(pdfFile) {
  // 1. Extrair texto do PDF
  const texto = await extrairTextoPDF(pdfFile);
  
  // 2. Identificar período e datas
  const periodo = extrairPeriodo(texto);
  const datas = calcularDatas(periodo);
  
  // 3. Extrair receitas por dia/turno
  const receitas = extrairReceitas(texto);
  
  // 4. Verificar receitas existentes no sistema
  const receitasExistentes = await verificarReceitasExistentes(receitas);
  
  // 5. Processar apenas receitas novas
  const receitasNovas = await processarReceitasNovas(receitas, receitasExistentes);
  
  // 6. Validar ingredientes com base de produtos
  const ingredientesValidados = await validarIngredientes(receitasNovas);
  
  // 7. Calcular efetivos por período
  const efetivos = await calcularEfetivos(periodo);
  
  // 8. Gerar códigos internos para receitas novas
  const receitasComCodigos = await gerarCodigosInternos(receitasNovas);
  
  return {
    cardapio: {
      periodo,
      datas,
      receitas: {
        existentes: receitasExistentes,
        novas: receitasComCodigos
      },
      efetivos
    }
  };
}

async function verificarReceitasExistentes(receitas) {
  const receitasExistentes = [];
  
  for (const receita of receitas) {
    const existente = await ReceitaService.buscarPorCodigoReferencia(receita.codigo);
    if (existente) {
      receitasExistentes.push({
        ...receita,
        codigo_interno: existente.codigo_interno,
        ja_existe: true
      });
    }
  }
  
  return receitasExistentes;
}

async function gerarCodigosInternos(receitas) {
  const receitasComCodigos = [];
  
  for (const receita of receitas) {
    const codigoInterno = await gerarProximoCodigoInterno();
    receitasComCodigos.push({
      ...receita,
      codigo_interno: codigoInterno,
      ja_existe: false
    });
  }
  
  return receitasComCodigos;
}
```

### 2. Algoritmos de Extração

#### A) Identificação de Códigos
```javascript
// Regex para capturar códigos de receitas
const codigoRegex = /[A-Z]{2}\d{2}\.\d{3}/g;

// Exemplo: LL24.222, R25.218, R25.231
```

#### B) Segmentação por Turnos
```javascript
function segmentarPorTurnos(texto) {
  const turnos = {
    matutino: [],
    vespertino: [],
    noturno: []
  };
  
  // Identificar seções por turno
  const secoes = texto.split(/(Matutino|Vespertino|Noturno)/i);
  
  // Processar cada seção
  secoes.forEach((secao, index) => {
    if (secao.toLowerCase().includes('matutino')) {
      turnos.matutino = processarSecao(secoes[index + 1]);
    }
    // ... outros turnos
  });
  
  return turnos;
}
```

### 3. Validação de Ingredientes

```javascript
async function validarIngredientes(receitas) {
  const ingredientesValidados = [];
  
  for (const receita of receitas) {
    for (const ingrediente of receita.ingredientes) {
      // Buscar produto na base de dados
      const produto = await buscarProdutoSimilar(ingrediente.nome);
      
      if (produto) {
        ingredientesValidados.push({
          ...ingrediente,
          produto_id: produto.id,
          validado: true,
          score: produto.score
        });
      } else {
        ingredientesValidados.push({
          ...ingrediente,
          validado: false,
          sugestoes: await buscarSugestoes(ingrediente.nome)
        });
      }
    }
  }
  
  return ingredientesValidados;
}
```

## 🍽️ Cálculo de Efetivos

### 1. Integração com Sistema Atual

```javascript
async function calcularEfetivos(periodo, unidadeId) {
  // Buscar efetivos da unidade para o período
  const efetivos = await EfetivosService.buscarPorPeriodo(unidadeId, periodo);
  
  return {
    padrao: efetivos
      .filter(e => e.tipo_efetivo === 'PADRAO')
      .reduce((sum, e) => sum + e.quantidade, 0),
    nae: efetivos
      .filter(e => e.tipo_efetivo === 'NAE')
      .reduce((sum, e) => sum + e.quantidade, 0),
    por_intolerancia: agruparPorIntolerancia(efetivos)
  };
}
```

## 🛒 Geração de Necessidades

### 1. Processo de Geração

```javascript
async function gerarNecessidades(cardapioId) {
  // 1. Buscar cardápio aprovado
  const cardapio = await CardapioService.buscarPorId(cardapioId);
  
  // 2. Agrupar ingredientes por data
  const necessidades = await agruparIngredientesPorData(cardapio);
  
  // 3. Calcular quantidades por efetivo
  const quantidades = await calcularQuantidades(necessidades, cardapio.efetivos);
  
  // 4. Gerar lista de compras
  const listaCompras = await gerarListaCompras(quantidades);
  
  // 5. Salvar necessidades no banco
  await salvarNecessidades(cardapioId, listaCompras);
  
  return listaCompras;
}

async function agruparIngredientesPorData(cardapio) {
  const necessidades = {};
  
  for (const dia of cardapio.dias) {
    for (const refeicao of dia.refeicoes) {
      const receita = await ReceitaService.buscarPorId(refeicao.receita_id);
      
      for (const ingrediente of receita.ingredientes) {
        const chave = `${dia.data}_${ingrediente.produto_id}`;
        
        if (!necessidades[chave]) {
          necessidades[chave] = {
            data: dia.data,
            produto_id: ingrediente.produto_id,
            quantidade: 0,
            turnos: []
          };
        }
        
        necessidades[chave].quantidade += ingrediente.quantidade;
        necessidades[chave].turnos.push(refeicao.turno);
      }
    }
  }
  
  return Object.values(necessidades);
}

async function calcularQuantidades(necessidades, efetivos) {
  const quantidadesCalculadas = [];
  
  for (const necessidade of necessidades) {
    const produto = await ProdutoService.buscarPorId(necessidade.produto_id);
    
    // Calcular quantidade para efetivos padrão
    const quantidadePadrao = necessidade.quantidade * efetivos.padrao;
    
    // Calcular quantidade para efetivos NAE
    const quantidadeNAE = necessidade.quantidade * efetivos.nae;
    
    quantidadesCalculadas.push({
      ...necessidade,
      quantidade_padrao: quantidadePadrao,
      quantidade_nae: quantidadeNAE,
      quantidade_total: quantidadePadrao + quantidadeNAE,
      unidade: produto.unidade
    });
  }
  
  return quantidadesCalculadas;
}
```

### 2. Geração de Lista de Compras

```javascript
async function gerarListaCompras(quantidades) {
  const listaCompras = {
    resumo: {
      total_produtos: quantidades.length,
      total_quantidade: quantidades.reduce((sum, q) => sum + q.quantidade_total, 0),
      custo_estimado: 0
    },
    por_data: {},
    por_produto: {},
    por_custo: {}
  };
  
  // Agrupar por data
  for (const quantidade of quantidades) {
    const data = quantidade.data;
    if (!listaCompras.por_data[data]) {
      listaCompras.por_data[data] = [];
    }
    listaCompras.por_data[data].push(quantidade);
  }
  
  // Agrupar por produto
  for (const quantidade of quantidades) {
    const produto = await ProdutoService.buscarPorId(quantidade.produto_id);
    if (!listaCompras.por_produto[produto.nome]) {
      listaCompras.por_produto[produto.nome] = {
        produto: produto,
        quantidade_total: 0,
        datas: []
      };
    }
    listaCompras.por_produto[produto.nome].quantidade_total += quantidade.quantidade_total;
    listaCompras.por_produto[produto.nome].datas.push(quantidade.data);
  }
  
  return listaCompras;
}
```

### 2. Produtos NAE Específicos

```javascript
async function buscarProdutosNAE(ingrediente, intolerancias) {
  const produtosNAE = [];
  
  for (const intolerancia of intolerancias) {
    const alternativas = await ProdutoService.buscarAlternativas(
      ingrediente.produto_id, 
      intolerancia
    );
    
    produtosNAE.push({
      intolerancia,
      alternativas,
      quantidade: calcularQuantidadeNAE(ingrediente, intolerancia)
    });
  }
  
  return produtosNAE;
}
```

## 📱 Interface do Sistema

### Responsabilidades das Telas

#### 🛒 Tela de Geração de Necessidades
- **Upload de PDFs** de cardápios
- **Verificação** de receitas já existentes no sistema
- **Processamento** de receitas novas
- **Geração automática** de necessidades de compras
- **Cálculo** de quantidades por efetivo (padrão + NAE)
- **Salvamento** do cardápio processado

#### 📋 Tela de Gerenciamento de Cardápios
- **Visualização** de cardápios já processados
- **Criação** de cardápios personalizados
- **Duplicação** de cardápios existentes
- **Edição** de receitas e ingredientes
- **Exclusão** de cardápios não utilizados
- **Exportação** de dados

### 1. Tela de Geração de Necessidades

```
🛒 Gerar Necessidades
┌─────────────────────────────────────────────────────────┐
│ 📁 [Upload PDF] ou [Selecionar Cardápio Existente]     │
│                                                         │
│ 🔍 Verificar Receitas Existentes:                      │
│ ├── ✅ R25.375 (Carne bovina) - Já existe              │
│ ├── ✅ LL25.228 (Torta de carne) - Já existe           │
│ └── ❌ R25.400 (Nova receita) - Processar              │
│                                                         │
│ 📊 Processamento:                                       │
│ ├── 📅 Período: OUTUBRO/2025                           │
│ ├── 🏫 Unidade: Escola João Silva                      │
│ ├── 👥 Efetivos: 150 padrão + 8 NAE                   │
│ └── 🍽️ Receitas: 45 processadas                       │
│                                                         │
│ [🔄 Processar PDF] [📊 Gerar Necessidades] [💾 Salvar] │
└─────────────────────────────────────────────────────────┘
```

### 2. Tela de Gerenciamento de Cardápios

```
📋 Gerenciar Cardápios
┌─────────────────────────────────────────────────────────┐
│ 🔍 [Buscar] [Filtrar por Data] [Filtrar por Código]    │
│                                                         │
│ [➕ Novo Cardápio] [📋 Duplicar Cardápio]              │
│                                                         │
│ 📅 Cardápios Existentes:                               │
│ ├── OUTUBRO/2025 - Escola João Silva                   │
│ │   ├── R25.375 - Carne bovina em cubos                │
│ │   │   ├── Código Interno: REC-001                    │
│ │   │   ├── Código Referência: R25.375                 │
│ │   │   └── [✏️ Editar] [📋 Duplicar] [🗑️ Excluir]    │
│ │                                                       │
│ ├── NOVEMBRO/2025 - Escola Maria Santos                │
│ │   ├── R25.400 - Frango grelhado                      │
│ │   │   ├── Código Interno: REC-002                    │
│ │   │   ├── Código Referência: R25.400                 │
│ │   │   └── [✏️ Editar] [📋 Duplicar] [🗑️ Excluir]    │
│                                                         │
│ [📤 Exportar] [📊 Relatórios] [🛒 Gerar Necessidades]  │
└─────────────────────────────────────────────────────────┘
```

### 3. Modal de Criação de Cardápio

```
➕ Criar Novo Cardápio
┌─────────────────────────────────────────────────────────┐
│ 📝 Informações Básicas:                                │
│ ├── Nome: [Cardápio Especial - Natal 2025]             │
│ ├── Período: [Dezembro/2025]                           │
│ ├── Unidade: [Escola Municipal João Silva]             │
│ └── Descrição: [Cardápio especial para o Natal]        │
│                                                         │
│ 🍽️ Receitas:                                           │
│ ├── [➕ Adicionar Receita] [📁 Importar do Sistema]    │
│ ├── [📋 Duplicar Receita Existente]                    │
│ └── [✏️ Criar Receita Personalizada]                   │
│                                                         │
│ [💾 Salvar] [❌ Cancelar] [👁️ Preview]                 │
└─────────────────────────────────────────────────────────┘
```

### 4. Upload e Processamento

```
📁 Upload de Cardápio PDF
┌─────────────────────────────────────────────────────────┐
│ [📎 Selecionar Arquivo] ou arraste o PDF aqui          │
│                                                         │
│ ⚠️  Arquivo deve ser enviado 45 dias antes do serviço  │
│                                                         │
│ [🔄 Processar] [❌ Cancelar]                           │
└─────────────────────────────────────────────────────────┘
```

### 2. Preview de Validação

```
📋 Cardápio - OUTUBRO/2025
┌─────────────────────────────────────────────────────────┐
│ 📊 Resumo:                                             │
│ • 31 dias de cardápio                                  │
│ • 93 refeições planejadas                              │
│ • 150 efetivos padrão                                  │
│ • 8 efetivos NAE (lactose: 5, gluten: 3)              │
└─────────────────────────────────────────────────────────┘

✅ Validações:
• Todos os ingredientes encontrados na base
• Quantidades adequadas para efetivos
• Produtos NAE disponíveis

⚠️  Avisos:
• 3 ingredientes com nomes similares
• 1 ingrediente não encontrado

[✅ Aprovar] [✏️ Editar] [❌ Rejeitar]
```

### 3. Detalhamento por Refeição

```
🍽️ Segunda-feira 6/10 - Matutino
┌─────────────────────────────────────────────────────────┐
│ LL24.222 - Leite batido com morango e banana           │
│                                                         │
│ 📊 Efetivos:                                           │
│ • Padrão: 150 pessoas                                  │
│ • NAE Lactose: 5 pessoas                               │
│ • NAE Glúten: 3 pessoas                                │
└─────────────────────────────────────────────────────────┘

🥛 Ingredientes:
┌─────────────────────────────────────────────────────────┐
│ Leite Integral (200ml)                                 │
│ ⚠️  Contém: Lactose                                    │
│ 🔄 NAE Alternativa: Leite de Soja (200ml)             │
│ 📦 Quantidade NAE: 1L (5 pessoas)                     │
└─────────────────────────────────────────────────────────┘

🍓 Morango (50g)
✅ Sem alergênicos
📦 Quantidade Total: 7.5kg (150 pessoas)
```

### 4. Lista de Compras

```
🛒 Lista de Compras - Segunda-feira 6/10
┌─────────────────────────────────────────────────────────┐
│ PADRÃO:                                                │
│ • Leite Integral: 30L                                  │
│ • Morango: 7.5kg                                       │
│ • Banana: 15kg                                         │
│                                                         │
│ 🔄 NAE LACTOSE:                                        │
│ • Leite de Soja: 1L                                    │
│ • Morango: 250g                                        │
│ • Banana: 500g                                         │
│                                                         │
│ 🚫 NAE GLÚTEN:                                         │
│ • Leite de Amêndoa: 600ml                              │
│ • Morango: 150g                                        │
│ • Banana: 300g                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Validações Automáticas

### 1. Verificação de Disponibilidade

```javascript
async function validarDisponibilidadeNAE(cardapio) {
  const problemas = [];
  
  for (const refeicao of cardapio.refeicoes) {
    for (const ingrediente of refeicao.ingredientes) {
      if (ingrediente.alergenicos.length > 0) {
        const alternativas = await buscarAlternativasNAE(ingrediente);
        
        if (alternativas.length === 0) {
          problemas.push({
            ingrediente: ingrediente.nome,
            problema: 'Sem alternativa NAE disponível'
          });
        }
      }
    }
  }
  
  return problemas;
}
```

### 2. Cálculo de Custos

```javascript
async function calcularCustosCardapio(cardapio) {
  let custoTotal = 0;
  let custoNAE = 0;
  
  for (const refeicao of cardapio.refeicoes) {
    for (const ingrediente of refeicao.ingredientes) {
      const produto = await ProdutoService.buscarPorId(ingrediente.produto_id);
      const custo = produto.preco * ingrediente.quantidade;
      
      custoTotal += custo;
      
      if (ingrediente.alergenicos.length > 0) {
        custoNAE += custo;
      }
    }
  }
  
  return {
    custoTotal,
    custoNAE,
    custoPadrao: custoTotal - custoNAE
  };
}
```

## 📊 Relatórios

### 1. Dashboard de Cardápios

```
📊 Dashboard - Cardápios
┌─────────────────────────────────────────────────────────┐
│ 📅 Próximos 30 dias:                                   │
│ • 5 cardápios pendentes de aprovação                   │
│ • 12 cardápios aprovados                               │
│ • 1 cardápio rejeitado                                 │
│                                                         │
│ ⚠️  Alertas:                                           │
│ • 2 cardápios próximos do vencimento (45 dias)         │
│ • 1 ingrediente sem alternativa NAE                    │
└─────────────────────────────────────────────────────────┘
```

### 2. Relatório de Custos NAE

```
💰 Relatório de Custos NAE - OUTUBRO/2025
┌─────────────────────────────────────────────────────────┐
│ 📊 Resumo:                                             │
│ • Total de refeições NAE: 248                          │
│ • Custo adicional NAE: R$ 1.247,50                    │
│ • Custo médio por refeição NAE: R$ 5,03               │
│                                                         │
│ Por Intolerância:                                      │
│ • Lactose: R$ 623,75 (50%)                            │
│ • Glúten: R$ 498,00 (40%)                             │
│ • Outras: R$ 125,75 (10%)                             │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Implementação por Fases

### Fase 1.0 - Básica
- [ ] Upload de PDF
- [ ] Extração simples por regex
- [ ] Validação manual de ingredientes
- [ ] Interface básica de aprovação

### Fase 2.0 - Inteligente
- [ ] ML para classificação de receitas
- [ ] Sugestões automáticas de produtos
- [ ] Validação automática de efetivos
- [ ] Cálculo automático de quantidades NAE


## 🛠️ Tecnologias Recomendadas

### Backend
- **Node.js** com Express
- **Python** para processamento de PDF (PyPDF2, pdfplumber)
- **spaCy** para processamento de linguagem natural
- **scikit-learn** para machine learning

### Frontend
- **React** com interface de edição
- **Preview** em tempo real
- **Validação** visual de dados

### Banco de Dados
- **MySQL** (atual)
- Estrutura normalizada para receitas
- Índices para performance

## 📝 Próximos Passos

1. **Definir estrutura detalhada** das tabelas
2. **Criar protótipo** de extração de PDF
3. **Implementar validação** de ingredientes
4. **Desenvolver interface** de upload e preview
5. **Integrar com sistema** atual de efetivos
6. **Testar com PDFs** reais
7. **Refinar algoritmos** de extração

## ❓ Questões para Discussão

1. **Formato dos PDFs**: Há padronização entre fornecedores?
2. **Aprovação**: Quem aprova os cardápios?
3. **Integração**: Como integrar com sistema de compras?
4. **Backup**: Estratégia de backup dos PDFs originais?
5. **Performance**: Quantos cardápios por mês?
6. **Mobile**: Interface mobile necessária?

---

**Documento criado em:** $(date)
**Versão:** 1.0
**Status:** Em discussão
