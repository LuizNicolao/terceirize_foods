Vou analisar o módulo de Relatório de Inspeção para criar uma explicação completa. Deixe-me buscar os arquivos relacionados:

[8 tools called]

Agora vou buscar as APIs e estruturas adicionais:

[4 tools called]

Perfeito! Agora vou criar uma explicação completa do sistema de Relatório de Inspeção para você enviar ao outro chat. [[memory:2418210]]

---

# 📋 SISTEMA DE RELATÓRIO DE INSPEÇÃO DE RECEBIMENTO (RIR) - MÓDULO DE QUALIDADE
**Stack:** React (Frontend) + Node.js/Express (Backend)
**URL:** `/relatorio-inspecao`

---

## 🎯 OBJETIVO DO SISTEMA

Sistema para registrar e gerenciar **Relatórios de Inspeção de Recebimento (RIR)**, utilizado no controle de qualidade de produtos recebidos dos fornecedores. Permite avaliar condições higiênico-sanitárias, verificar conformidade dos produtos e integrar com planos de amostragem NQA.

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabela Principal: `relatorio_inspecao`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT(11) AUTO_INCREMENT | ID único do relatório |
| `data_inspecao` | DATE NOT NULL | Data da inspeção de recebimento |
| `hora_inspecao` | TIME NOT NULL | Hora da inspeção |
| `numero_af` | VARCHAR(50) | Número da Autorização de Fornecimento (opcional - campo existe no BD mas não está no formulário) |
| `numero_nota_fiscal` | VARCHAR(50) NOT NULL | Número da Nota Fiscal |
| `fornecedor` | VARCHAR(200) NOT NULL | Razão Social do fornecedor |
| `numero_pedido` | VARCHAR(50) | Número do pedido de compra vinculado |
| `cnpj_fornecedor` | VARCHAR(20) | CNPJ do fornecedor |
| `nota_fiscal_id` | INT(11) | FK para `notas_fiscais` (se existir) |
| `checklist_json` | JSON | Check list de avaliação higiênico-sanitária (formato JSON) |
| `produtos_json` | JSON | Lista de produtos avaliados (formato JSON) |
| `ocorrencias` | TEXT | Ocorrências e observações gerais |
| `recebedor` | VARCHAR(100) | Nome do responsável pelo recebimento |
| `visto_responsavel` | VARCHAR(100) | Nome do responsável técnico |
| `status_geral` | ENUM('APROVADO', 'REPROVADO', 'PARCIAL') | Resultado geral da inspeção |
| `usuario_cadastro_id` | INT(11) NOT NULL | ID do usuário que cadastrou (FK para `usuarios`) |
| `usuario_atualizacao_id` | INT(11) | ID do usuário que atualizou |
| `criado_em` | TIMESTAMP | Data de criação do registro |
| `atualizado_em` | TIMESTAMP | Data da última atualização |

**Índices:**
- `idx_data` (data_inspecao)
- `idx_nf` (numero_nota_fiscal)
- `idx_fornecedor` (fornecedor)
- `idx_status` (status_geral)

**Foreign Keys:**
- `nota_fiscal_id` → `notas_fiscais(id)` ON DELETE SET NULL
- `usuario_cadastro_id` → `usuarios(id)`

---

## 📊 ESTRUTURA JSON DOS DADOS

### **1. `checklist_json` - Avaliação Higiênico-Sanitária**

```json
[
  {
    "tipo_transporte": "Baú Refrigerado",
    "tipo_produto": "Carnes e Derivados",
    "isento_material": "Conforme",
    "condicoes_caminhao": "Conforme",
    "acondicionamento": "Conforme",
    "condicoes_embalagem": "Conforme"
  }
]
```

**Campos:**
- `tipo_transporte`: "Baú", "Baú Isotérmico", "Baú Refrigerado", "Sider", "Grade Baixa", "Graneleiro"
- `tipo_produto`: Nome do grupo de produto (ex: "Carnes e Derivados", "Hortifruti")
- `isento_material`: "Conforme", "Não Conforme", "N/A"
- `condicoes_caminhao`: "Conforme", "Não Conforme", "N/A"
- `acondicionamento`: "Conforme", "Não Conforme", "N/A"
- `condicoes_embalagem`: "Conforme", "Não Conforme", "N/A"

### **2. `produtos_json` - Produtos Avaliados**

```json
[
  {
    "codigo": "001234",
    "descricao": "Filé de Frango Congelado",
    "und": "KG",
    "qtde": "50",
    "fabricacao": "2024-10-01",
    "lote": "L12345",
    "validade": "2025-10-01",
    "controle_validade": "5.2",
    "temperatura": "-18",
    "aval_sensorial": "Conforme",
    "tam_lote": "50",
    "num_amostras_avaliadas": "8",
    "num_amostras_aprovadas": "8",
    "num_amostras_reprovadas": "0",
    "resultado_final": "Aprovado"
  }
]
```

**Campos:**
- `codigo`: Código do produto
- `descricao`: Nome/descrição do produto
- `und`: Unidade de medida (KG, UN, CX, etc.)
- `qtde`: Quantidade pedida
- `fabricacao`: Data de fabricação (formato ISO: YYYY-MM-DD)
- `lote`: Número do lote
- `validade`: Data de validade (formato ISO: YYYY-MM-DD)
- `controle_validade`: Percentual consumido da validade (calculado automaticamente)
- `temperatura`: Temperatura de recebimento em °C
- `aval_sensorial`: "Conforme" ou "Não Conforme"
- `tam_lote`: Tamanho do lote (para buscar NQA)
- `num_amostras_avaliadas`: Número de amostras avaliadas (preenchido automaticamente via NQA)
- `num_amostras_aprovadas`: Número de amostras aprovadas
- `num_amostras_reprovadas`: Número de amostras reprovadas
- `resultado_final`: "Aprovado" ou "Reprovado" (calculado automaticamente)

---

## 🔗 RELACIONAMENTOS E VÍNCULOS

### **Integração com Pedidos de Compras:**

```
pedidos_compras (1) ----< (N) pedido_compras_itens
        ↓
relatorio_inspecao (busca produtos automaticamente via AJAX)
```

**Fluxo:**
1. Usuário seleciona um **Pedido de Compra** no dropdown
2. Sistema busca **fornecedor** e **CNPJ** do pedido
3. Sistema carrega automaticamente todos os **produtos do pedido** via API
4. Para cada produto, sistema busca automaticamente o **NQA** vinculado ao grupo

### **Integração com NQA e Plano de Amostragem:**

```
grupos (1) ----< (1) grupos_nqa >---- (1) nqa
                                        ↓
                          tabela_amostragem (múltiplas faixas)
```

**Fluxo:**
1. Produto possui `grupo_id`
2. Grupo possui NQA vinculado via `grupos_nqa`
3. NQA possui múltiplas faixas em `tabela_amostragem`
4. Sistema busca faixa adequada baseado no tamanho do lote

### **Integração com Fornecedores:**

```
fornecedores (N)
        ↓
relatorio_inspecao (campo fornecedor com autocomplete)
```

---

## 📁 ESTRUTURA DO SISTEMA

### **Frontend (React):**

1. **`RelatorioInspecao.jsx`** - Página principal com listagem e filtros
2. **`RelatorioInspecaoModal.jsx`** - Modal para criar/editar/visualizar RIR
3. **`ChecklistTable.jsx`** - Componente de tabela do checklist
4. **`ProdutosTable.jsx`** - Componente de tabela de produtos
5. **`useRelatorioInspecao.js`** - Hook customizado com lógica de negócio
6. **`relatorioInspecao.js`** - Service para comunicação com API

### **Backend (Node.js/Express):**

1. **`RIRListController.js`** - Controller para listagem e busca
2. **`RIRCRUDController.js`** - Controller para CRUD (criar, editar, excluir)
3. **`RIRIntegrationsController.js`** - Controller para integrações (produtos, NQA, plano)
4. **`relatorioInspecaoRoute.js`** - Rotas RESTful
5. **`relatorioInspecaoValidator.js`** - Validações de entrada

### **APIs REST:**

1. **`GET /api/relatorio-inspecao`** - Lista todos os RIRs (com paginação e filtros)
2. **`GET /api/relatorio-inspecao/:id`** - Busca RIR por ID
3. **`POST /api/relatorio-inspecao`** - Cria novo RIR
4. **`PUT /api/relatorio-inspecao/:id`** - Atualiza RIR existente
5. **`DELETE /api/relatorio-inspecao/:id`** - Exclui RIR
6. **`GET /api/relatorio-inspecao/buscar-produtos-pedido?id={pedido_id}`** - Busca produtos do pedido
7. **`GET /api/relatorio-inspecao/buscar-nqa-grupo?grupo_id={grupo_id}`** - Busca NQA do grupo
8. **`GET /api/relatorio-inspecao/buscar-plano-lote?nqa_id={nqa_id}&tamanho_lote={tamanho}`** - Busca plano de amostragem
9. **`GET /api/relatorio-inspecao/pedidos-aprovados`** - Lista pedidos aprovados
10. **`GET /api/relatorio-inspecao/grupos`** - Lista grupos de produtos

---

## ⚙️ FUNCIONALIDADES DETALHADAS

### **1. LISTAR / VISUALIZAR (`RelatorioInspecao.jsx`)**

#### **O que faz:**
- Lista todos os relatórios de inspeção cadastrados com paginação
- Mostra resumo: Data, NF, Fornecedor, Status, Produtos
- Permite filtrar por:
  - **Status** (Aprovado, Reprovado, Parcial) ✅
  - **Busca** (NF, Fornecedor) ✅
  - **Data** (período) ❌ - Não implementado

#### **Interface:**
- **Filtros:**
  - Campo de busca (busca em NF e Fornecedor)
  - Dropdown de status (APROVADO, REPROVADO, PARCIAL)
  - Botões de ação (buscar, limpar filtros)

- **Tabela de listagem:**
  - Exibe ID, Data/Hora, Nº NF, Fornecedor, Status, Ações
  - Paginação com opções de itens por página
  - Estatísticas no topo (total de RIRs, aprovados, reprovados, parciais)

- **Ações:**
  - 👁️ **Visualizar** → Abre modal em modo visualização
  - ✏️ **Editar** → Abre modal em modo edição
  - 🗑️ **Excluir** → Modal de confirmação + DELETE via API

---

### **2. CADASTRAR / EDITAR (`RelatorioInspecaoModal.jsx`)**

#### **O que faz:**
Modal único que funciona para **criar** e **editar** RIR com **4 seções principais**:

#### **A) Dados do Pedido**

**Campos:**
- **Pedido de Compra** (select) - Dropdown com pedidos aprovados ✅
- **Fornecedor** (text, obrigatório *) - Preenchido automaticamente ao selecionar pedido ✅
- **CNPJ Fornecedor** (text, opcional) - Preenchido automaticamente ✅
- **Nº Nota Fiscal** (text, obrigatório *) ✅
- **Data Recebimento** (date, obrigatório *) - Default: hoje ✅
- **Hora Recebimento** (time, obrigatório *) - Default: hora atual ✅

**Nota:** Campo `numero_af` existe no banco de dados mas não está no formulário.

**Comportamento:**
- Ao selecionar **Pedido de Compra**:
  - Preenche automaticamente **Fornecedor** e **CNPJ** (campos desabilitados)
  - Carrega produtos do pedido via API REST
  - Para cada produto, busca automaticamente o **NQA** do grupo

#### **B) Check List de Avaliação Higiênico-Sanitária**

**Características:**
- Checklist é inicializado automaticamente com **1 linha vazia** ao abrir o modal ✅
- **Não possui botão "Adicionar Item"** - o checklist é parte fixa do relatório ✅
- **Não possui coluna "Ações"** - não é possível remover itens ✅

**Tabela com colunas:**
1. **Tipo de Transporte** (select):
   - Baú, Baú Isotérmico, Baú Refrigerado, Sider, Grade Baixa, Graneleiro ✅

2. **Tipo de Produto** (select):
   - Lista de grupos cadastrados (busca via API) ✅

3. **Isento de Material Estranho** (select):
   - Conforme, Não Conforme, N/A ✅
   - Campo: `isento_material`

4. **Condições do Caminhão** (select):
   - Conforme, Não Conforme, N/A ✅

5. **Acondicionamento** (select):
   - Conforme, Não Conforme, N/A ✅

6. **Condições da Embalagem** (select):
   - Conforme, Não Conforme, N/A ✅

#### **C) Avaliação dos Produtos Recebidos**

**Estrutura:** Cada produto é exibido em **2 linhas** (com cabeçalhos):

**Linha 1 - Informações do Produto:**
| Código | Produto | Unidade | Qtd. Pedido | Fabricação * | Lote * | Validade * | Ctrl. Val. (%) |
|--------|---------|---------|-------------|--------------|--------|------------|----------------|
| 001234 | Produto X | KG | 50 | 01/10/2024 | L123 | 01/10/2025 | **25.3%** |

**Nota:** Campos **Fabricação**, **Lote** e **Validade** são **obrigatórios** ✅

**Linha 2 - Avaliação e Resultado:**
| Temp. (°C) | Aval. Sensorial | Tam. Lote | NQA | Nº Amostras Aval. | Nº Aprov. | Nº Reprov. | Resultado Final |
|------------|-----------------|-----------|-----|-------------------|-----------|------------|-----------------|
| -18 | Conforme | 50 | **2,5** | **8** | 8 | 0 | ✅ **Aprovado** |

**Nota:** Não há coluna "Ações" - produtos não podem ser removidos individualmente (apenas através do pedido) ✅

**Campos preenchidos automaticamente:**
- **NQA**: Busca do grupo do produto via API `GET /api/relatorio-inspecao/buscar-nqa-grupo` ✅
- **Nº Amostras Aval.**: Busca do plano de amostragem via API `GET /api/relatorio-inspecao/buscar-plano-lote` quando preenche tamanho do lote ✅
- **Ctrl. Val. (%)**: Cálculo automático baseado em fabricação e validade ✅
- **Resultado Final**: Cálculo automático baseado em AC/RE do plano NQA ✅

**Cálculos Automáticos:**

1. **Controle de Validade (%)** ✅
```javascript
// Regra dos 30%: % consumido da validade
prazo_total = dias(validade - fabricacao)
dias_restantes = dias(validade - hoje)
percentual_consumido = (1 - (dias_restantes / prazo_total)) * 100

// Valores limitados entre 0% e 100%
percentual_consumido = Math.max(0, Math.min(100, percentual_consumido))

// Se > 30% → Campo vermelho (bg-red-50 text-red-700) - produto próximo ao vencimento
// Se ≤ 30% → Campo verde (bg-green-50 text-green-700) - produto OK
```

2. **Resultado Final (Aprovado/Reprovado)** ✅
```javascript
// Regra combinada:
// 1. Se Ctrl. Val. (%) > 30% → Reprovado (produto próximo ao vencimento)
// 2. Se num_reprovadas >= RE && RE > 0 → Reprovado (amostragem)
// 3. Caso contrário → Aprovado

// Calculado automaticamente quando muda:
// - Ctrl. Val. (%) (fabricação/validade)
// - num_amostras_reprovadas ou RE

if (controle_validade > 30) {
    resultado_final = "Reprovado"  // Produto próximo ao vencimento (> 30%)
} else if (num_reprovadas >= RE && RE > 0) {
    resultado_final = "Reprovado"  // Badge vermelho
} else {
    resultado_final = "Aprovado"   // Badge verde
}
```

3. **Status Geral do RIR** ✅
```javascript
// Calculado no backend (RIRCRUDController.js) ao salvar
if (total_reprovados > 0 && total_aprovados > 0) {
    status_geral = 'PARCIAL';
} else if (total_reprovados > 0) {
    status_geral = 'REPROVADO';
} else {
    status_geral = 'APROVADO';
}
```

#### **D) Ocorrências e Responsáveis**

**Campos:**
- **Ocorrências e Observações Gerais** (textarea, opcional)
- **Recebedor** (text, opcional) - Nome do responsável pelo recebimento
- **Visto Responsável** (text, opcional) - Nome do responsável técnico

---

### **3. EDITAR / VISUALIZAR**

#### **O que faz:**
O mesmo modal (`RelatorioInspecaoModal.jsx`) funciona para **editar** e **visualizar**:
- **Modo Edição**: Permite alterar todos os campos
- **Modo Visualização**: Campos desabilitados (read-only)

**Carregamento de Dados:**
```javascript
// 1. Buscar relatório existente via API
GET /api/relatorio-inspecao/:id

// 2. Backend decodifica JSON automaticamente
// 3. Frontend preenche formulário com dados retornados
// 4. Checklist e produtos são carregados nos estados
```

**Mesmas seções do cadastro**, mas com dados pré-preenchidos.

**Conversão de datas:**
- Backend armazena no formato **ISO** (YYYY-MM-DD)
- Frontend usa `input type="date"` que trabalha com ISO diretamente
- Formatação para exibição (DD/MM/YYYY) é feita apenas visualmente

**Validações ao Editar:**
- Mesmas validações do cadastro
- Campos obrigatórios: Fabricação, Lote, Validade (para cada produto)
- Validação antes do submit

---

## 🔌 APIs E INTEGRAÇÕES

### **API 1: Buscar Produtos do Pedido**

**Endpoint:** `GET /api/relatorio-inspecao/buscar-produtos-pedido?id={pedido_id}`

**O que faz:**
Busca todos os produtos de um pedido de compra, incluindo:
- Dados do produto (código, nome, quantidade, unidade)
- Grupo do produto
- NQA vinculado ao grupo (se existir)

**Query SQL:**
```sql
SELECT 
    pi.id,
    pi.produto_generico_id,
    pi.quantidade_pedido,
    pg.nome as nome_produto,
    pg.codigo as codigo_produto,
    pg.grupo_id,
    um.simbolo as unidade_medida,
    g.nome as grupo_nome,
    n.id as nqa_id,
    n.codigo as nqa_codigo,
    n.nome as nqa_nome
FROM pedido_compras_itens pi
LEFT JOIN produto_generico pg ON pi.produto_generico_id = pg.id
LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
LEFT JOIN grupos g ON pg.grupo_id = g.id
LEFT JOIN grupos_nqa gn ON g.id = gn.grupo_id AND gn.ativo = 1
LEFT JOIN nqa n ON gn.nqa_id = n.id AND n.ativo = 1
WHERE pi.pedido_id = ?
ORDER BY pi.id
```

**Resposta JSON:**
```json
{
  "success": true,
  "produtos": [
    {
      "id": 1,
      "codigo_produto": "001234",
      "nome_produto": "Filé de Frango",
      "quantidade_pedido": "50",
      "unidade_medida": "KG",
      "grupo_id": 5,
      "grupo_nome": "Carnes e Derivados",
      "nqa_id": 2,
      "nqa_codigo": "2,5",
      "nqa_nome": "NQA Padrão"
    }
  ]
}
```

---

### **API 2: Buscar NQA do Grupo**

**Endpoint:** `GET /api/relatorio-inspecao/buscar-nqa-grupo?grupo_id={grupo_id}`

**O que faz:**
Busca o NQA vinculado a um grupo de produtos.

**Query SQL:**
```sql
SELECT n.id, n.codigo, n.nome, n.nivel_inspecao
FROM nqa n
INNER JOIN grupos_nqa gn ON n.id = gn.nqa_id
WHERE gn.grupo_id = ? AND gn.ativo = 1 AND n.ativo = 1
LIMIT 1
```

**Fallback:**
Se não encontrar NQA vinculado, retorna o **NQA Padrão (2,5)**:
```sql
SELECT id, codigo, nome, nivel_inspecao 
FROM nqa 
WHERE codigo = '2,5' 
LIMIT 1
```

**Resposta JSON:**
```json
{
  "success": true,
  "nqa": {
    "id": 2,
    "codigo": "2,5",
    "nome": "NQA Padrão",
    "nivel_inspecao": "II"
  }
}
```

---

### **API 3: Buscar Plano por Lote**

**Endpoint:** `GET /api/relatorio-inspecao/buscar-plano-lote?nqa_id={nqa_id}&tamanho_lote={tamanho}`

**O que faz:**
Busca o plano de amostragem adequado baseado no NQA e tamanho do lote.

**Query SQL:**
```sql
-- 1. Buscar faixa que engloba o tamanho do lote
SELECT id, faixa_inicial, faixa_final, tamanho_amostra, ac, re
FROM tabela_amostragem
WHERE nqa_id = ?
  AND faixa_inicial <= ?
  AND faixa_final >= ?
  AND ativo = 1
ORDER BY faixa_inicial ASC
LIMIT 1

-- 2. Se não encontrou, buscar próximo maior
SELECT id, faixa_inicial, faixa_final, tamanho_amostra, ac, re
FROM tabela_amostragem
WHERE nqa_id = ?
  AND faixa_inicial > ?
  AND ativo = 1
ORDER BY faixa_inicial ASC
LIMIT 1
```

**Resposta JSON:**
```json
{
  "success": true,
  "plano": {
    "id": 3,
    "faixa_inicial": 26,
    "faixa_final": 50,
    "tamanho_amostra": 8,
    "ac": 0,
    "re": 1,
    "tamanho_lote_informado": 50,
    "inspecao_100": false,
    "recomendacao": "Inspecionar 8 unidades de 50"
  }
}
```

---

## 📊 FLUXO COMPLETO DE CADASTRO

**1. Usuário seleciona Pedido de Compra**
```
Pedido #1234 → Fornecedor A (CNPJ: 12.345.678/0001-00)
```

**2. Sistema carrega produtos automaticamente**
```javascript
GET /api/relatorio-inspecao/buscar-produtos-pedido?id=1234
  → Retorna { pedido: {...}, produtos: [...] }
  → Para cada produto: carrega grupo_id, nqa_id (se disponível)
```

**3. Para cada produto, sistema busca NQA do grupo**
```javascript
// Se produto não trouxe NQA, buscar via grupo
GET /api/relatorio-inspecao/buscar-nqa-grupo?grupo_id=5
  → Retorna { id: 2, codigo: "2,5", nome: "NQA Padrão" }
  → Preenche nqa_id e nqa_codigo no produto
```

**4. Usuário preenche Tamanho do Lote**
```javascript
// Quando digita tamanho do lote (ex: 50)
GET /api/relatorio-inspecao/buscar-plano-lote?nqa_id=2&tamanho_lote=50
  → Retorna: { tamanho_amostra: 8, ac: 0, re: 1, ... }
  → Preenche automaticamente "Nº Amostras Aval." = 8
  → Preenche ac e re para cálculo do resultado final
```

**5. Usuário preenche datas (Fabricação e Validade)**
```javascript
// Sistema calcula Controle de Validade
fabricacao = "01/10/2024"
validade = "01/10/2025"
hoje = "03/11/2024"

prazo_total = 365 dias
dias_restantes = 332 dias
percentual_consumido = (1 - (332/365)) * 100 = 9%

→ Campo verde (< 30%)
```

**6. Usuário preenche amostras aprovadas/reprovadas**
```javascript
num_amostras_aprovadas = 8
num_amostras_reprovadas = 0

// Sistema verifica resultado automaticamente
if (num_reprovadas >= RE) → Reprovado
else → Aprovado

→ Resultado Final: Aprovado ✅
```

**7. Sistema calcula Status Geral do RIR**
```javascript
// Calculado no backend ao salvar (RIRCRUDController.js)
Produto 1: Aprovado
Produto 2: Aprovado
Produto 3: Reprovado
Produto 4: Aprovado
Produto 5: Aprovado

totalAprovados = 4
totalReprovados = 1

→ Status Geral: PARCIAL (tem aprovados e reprovados)
```

---

## 📊 ESTRUTURA SQL PARA CRIAR A TABELA

```sql
CREATE TABLE IF NOT EXISTS relatorio_inspecao (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    
    -- Cabeçalho
    data_inspecao DATE NOT NULL,
    hora_inspecao TIME NOT NULL,
    numero_af VARCHAR(50) NULL,
    numero_nota_fiscal VARCHAR(50) NOT NULL,
    fornecedor VARCHAR(200) NOT NULL,
    numero_pedido VARCHAR(50) NULL,
    cnpj_fornecedor VARCHAR(20) NULL,
    nota_fiscal_id INT(11) NULL,
    
    -- Dados completos em JSON
    checklist_json JSON NULL,
    produtos_json JSON NULL,
    ocorrencias TEXT NULL,
    
    -- Responsáveis
    recebedor VARCHAR(100) NULL,
    visto_responsavel VARCHAR(100) NULL,
    
    -- Resultado geral
    status_geral ENUM('APROVADO', 'REPROVADO', 'PARCIAL') NULL,
    
    -- Auditoria
    usuario_cadastro_id INT(11) NOT NULL,
    usuario_atualizacao_id INT(11) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_data (data_inspecao),
    INDEX idx_nf (numero_nota_fiscal),
    INDEX idx_fornecedor (fornecedor),
    INDEX idx_status (status_geral),
    
    -- Foreign Keys
    FOREIGN KEY (nota_fiscal_id) REFERENCES notas_fiscais(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_cadastro_id) REFERENCES usuarios(id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## ✅ RESUMO DAS FUNCIONALIDADES CRUD

| Funcionalidade | Componente/Arquivo | Método HTTP | Descrição |
|---------------|-------------------|-------------|-----------|
| **Visualizar Lista** | `RelatorioInspecao.jsx` | GET | Lista todos os RIRs com filtros e paginação |
| **Criar RIR** | `RelatorioInspecaoModal.jsx` | POST | Cadastra novo relatório completo via modal |
| **Editar RIR** | `RelatorioInspecaoModal.jsx` | PUT | Edita relatório existente via modal |
| **Visualizar RIR** | `RelatorioInspecaoModal.jsx` (viewMode) | GET | Exibe RIR completo em modo visualização (read-only) |
| **Excluir RIR** | `RelatorioInspecao.jsx` | DELETE | Exclui relatório com confirmação |
| **Buscar Produtos** | `RIRIntegrationsController.js` | GET | API: Retorna produtos do pedido |
| **Buscar NQA** | `RIRIntegrationsController.js` | GET | API: Retorna NQA do grupo |
| **Buscar Plano** | `RIRIntegrationsController.js` | GET | API: Retorna plano de amostragem |
| **Pedidos Aprovados** | `RIRIntegrationsController.js` | GET | API: Lista pedidos aprovados para dropdown |
| **Grupos** | `RIRIntegrationsController.js` | GET | API: Lista grupos de produtos |

**Validações Implementadas:**
- ✅ Campos obrigatórios: Fornecedor, Nº NF, Data/Hora recebimento
- ✅ Campos obrigatórios dos produtos: Fabricação, Lote, Validade
- ✅ Validação antes do submit do formulário
- ✅ Mensagens de erro visuais (borda vermelha + texto)

---

## 🔄 INTEGRAÇÕES COM OUTROS MÓDULOS

### **1. Pedidos de Compras:**
- RIR carrega produtos automaticamente do pedido
- Vincula `numero_pedido` para rastreabilidade

### **2. NQA (Plano de Amostragem):**
- Busca NQA do grupo do produto
- Busca faixa de amostragem baseado no tamanho do lote
- Calcula automaticamente AC (Aceitação) e RE (Rejeição)

### **3. Grupos de Produtos:**
- Cada produto pertence a um grupo
- Grupo determina qual NQA usar

### **4. Fornecedores:**
- Fornecedor é preenchido automaticamente ao selecionar pedido (campo desabilitado)
- Armazena CNPJ para rastreabilidade

---

## 📝 NOTAS IMPORTANTES SOBRE A IMPLEMENTAÇÃO

### **O que está implementado:**
✅ CRUD completo (criar, editar, listar, excluir)
✅ Modal único para criar/editar/visualizar
✅ Validações de campos obrigatórios
✅ Cálculos automáticos (Ctrl. Val. %, Resultado Final, Status Geral)
✅ Integrações com APIs (produtos, NQA, plano)
✅ Checklist inicializado automaticamente
✅ Paginação e filtros básicos
✅ Permissões por usuário

### **O que NÃO está implementado:**
❌ Campo Número AF (existe no BD mas não está no formulário)
❌ Filtro de período (data início/fim)
❌ Exportação XLSX/PDF
❌ Página dedicada de visualização/impressão (usa modal)
❌ Funcionalidade de impressão com CSS otimizado

### **Características da Implementação:**
- Stack: React (Frontend) + Node.js/Express (Backend)
- Padrão RESTful com HATEOAS
- Validação de dados no frontend e backend
- Tratamento de erros com mensagens amigáveis
- Interface responsiva (mobile-first)

---

**Essa é a estrutura completa do módulo de Relatório de Inspeção de Recebimento (RIR) conforme implementado!** 🚀