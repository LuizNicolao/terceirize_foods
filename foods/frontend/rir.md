Vou analisar o módulo de Relatório de Inspeção para criar uma explicação completa. Deixe-me buscar os arquivos relacionados:

[8 tools called]

Agora vou buscar as APIs e estruturas adicionais:

[4 tools called]

Perfeito! Agora vou criar uma explicação completa do sistema de Relatório de Inspeção para você enviar ao outro chat. [[memory:2418210]]

---

# 📋 SISTEMA DE RELATÓRIO DE INSPEÇÃO DE RECEBIMENTO (RIR) - MÓDULO DE QUALIDADE
**URL:** `http://localhost:8080/nexflow/modulos/qualidade/relatorio_inspecao/`

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
| `numero_af` | VARCHAR(50) | Número da Autorização de Fornecimento (opcional) |
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

## 📁 ARQUIVOS DO SISTEMA

### **Arquivos Principais:**

1. **`index.php`** - Listagem com filtros (READ)
2. **`cadastrar.php`** - Cadastro de RIR (CREATE)
3. **`editar.php`** - Edição de RIR (UPDATE)
4. **`visualizar.php`** - Visualização e impressão (READ)

### **APIs (AJAX):**

5. **`buscar_produtos_pedido.php`** - Busca produtos do pedido
6. **`buscar_nqa_grupo.php`** - Busca NQA vinculado ao grupo
7. **`buscar_plano_por_lote.php`** - Busca plano de amostragem por NQA e tamanho de lote

---

## ⚙️ FUNCIONALIDADES DETALHADAS

### **1. VISUALIZAR / LISTAR (`index.php`)**

#### **O que faz:**
- Lista todos os relatórios de inspeção cadastrados
- Mostra resumo: Data, NF, Fornecedor, Status, Produtos
- Permite filtrar por:
  - **Status** (Aprovado, Reprovado, Parcial)
  - **Fornecedor**
  - **Data** (início e fim)
  - **Busca** (NF, Fornecedor, AF)

#### **Consulta SQL:**
```php
SELECT 
    ri.*,
    u.nome as usuario_nome,
    JSON_LENGTH(ri.produtos_json) as total_produtos
FROM relatorio_inspecao ri
LEFT JOIN usuarios u ON ri.usuario_cadastro_id = u.id
WHERE [filtros]
ORDER BY ri.data_inspecao DESC, ri.hora_inspecao DESC
```

#### **Funcionalidade de Exclusão:**
```php
// Excluir via GET
if (isset($_GET['excluir'])) {
    executeQuery("DELETE FROM relatorio_inspecao WHERE id = ?", [$id_excluir]);
    $_SESSION['sucesso_msg'] = "Relatório excluído com sucesso!";
}
```

#### **Elementos da Interface:**
- **Filtros:**
  - Campo de busca (NF, Fornecedor, AF)
  - Dropdown de status
  - Botões "Filtrar" e "Limpar"

- **Tabela de listagem:**

| ID | Data/Hora | Nº NF | Fornecedor | Produtos | Status | Responsável | Ações |
|----|-----------|-------|------------|----------|--------|-------------|-------|
| #0001 | 03/11/2024 10:30 | 12345 | Fornecedor A | 5 itens | APROVADO | João | 👁️ ✏️ 🗑️ |

- **Ações:**
  - 👁️ **Visualizar** → `visualizar.php?id={id}`
  - ✏️ **Editar** → `editar.php?id={id}`
  - 🗑️ **Excluir** → confirmação JavaScript + DELETE

---

### **2. CADASTRAR (`cadastrar.php`)**

#### **O que faz:**
Página de cadastro de RIR com **4 seções principais**:

#### **A) Dados do Pedido**

**Campos:**
- **Pedido de Compra** (select) - Dropdown com pedidos aprovados
- **Fornecedor** (text, obrigatório) - Autocomplete com fornecedores cadastrados
- **CNPJ Fornecedor** (text, opcional)
- **Nº Nota Fiscal** (text, obrigatório)
- **Data Recebimento** (date, obrigatório) - Default: hoje
- **Hora Recebimento** (time, obrigatório) - Default: hora atual

**Comportamento:**
- Ao selecionar **Pedido de Compra**:
  - Preenche automaticamente **Fornecedor** e **CNPJ**
  - Carrega produtos do pedido via AJAX

#### **B) Check List de Avaliação Higiênico-Sanitária**

**Tabela com colunas:**
1. **Tipo de Transporte** (select):
   - Baú, Baú Isotérmico, Baú Refrigerado, Sider, Grade Baixa, Graneleiro

2. **Tipo de Produto** (select):
   - Lista de grupos cadastrados

3. **Isento de Material Estranho** (select):
   - Conforme, Não Conforme, N/A

4. **Condições do Caminhão** (select):
   - Conforme, Não Conforme, N/A

5. **Acondicionamento do Produto** (select):
   - Conforme, Não Conforme, N/A

6. **Condições da Embalagem** (select):
   - Conforme, Não Conforme, N/A

#### **C) Avaliação dos Produtos Recebidos**

**Estrutura:** Cada produto é exibido em **2 linhas** (com cabeçalhos):

**Linha 1 - Informações do Produto:**
| Código | Produto | Unidade | Qtd. Pedido | Fabricação | Lote | Validade | Ctrl. Val. (%) |
|--------|---------|---------|-------------|------------|------|----------|----------------|
| 001234 | Produto X | KG | 50 | 01/10/2024 | L123 | 01/10/2025 | **25.3%** |

**Linha 2 - Avaliação e Resultado:**
| Temp. (°C) | Aval. Sensorial | Tam. Lote | NQA | Nº Amostras Aval. | Nº Aprov. | Nº Reprov. | Resultado Final | Ações |
|------------|-----------------|-----------|-----|-------------------|-----------|------------|-----------------|-------|
| -18 | Conforme | 50 | **2,5** | **8** | 8 | 0 | ✅ **Aprovado** | 🗑️ |

**Campos preenchidos automaticamente:**
- **NQA**: Busca do grupo do produto via API `buscar_nqa_grupo.php`
- **Nº Amostras Aval.**: Busca do plano de amostragem via API `buscar_plano_por_lote.php`
- **Ctrl. Val. (%)**: Cálculo automático baseado em fabricação e validade
- **Resultado Final**: Cálculo automático baseado em AC/RE do plano NQA

**Cálculos Automáticos:**

1. **Controle de Validade (%)**
```javascript
// Regra dos 30%: % consumido da validade
prazo_total = dias(validade - fabricacao)
dias_restantes = dias(validade - hoje)
percentual_consumido = (1 - (dias_restantes / prazo_total)) * 100

// Se > 30% → Campo vermelho (produto próximo ao vencimento)
// Se ≤ 30% → Campo verde (produto OK)
```

2. **Resultado Final (Aprovado/Reprovado)**
```javascript
// Baseado em AC (Aceitação) e RE (Rejeição) do plano NQA
if (num_reprovados >= RE) {
    resultado = "Reprovado"
} else {
    resultado = "Aprovado"
}
```

3. **Status Geral do RIR**
```php
if ($total_reprovados > 0 && $total_aprovados > 0) {
    $status_geral = 'PARCIAL';
} elseif ($total_reprovados > 0) {
    $status_geral = 'REPROVADO';
} else {
    $status_geral = 'APROVADO';
}
```

#### **D) Ocorrências e Responsáveis**

**Campos:**
- **Ocorrências e Observações Gerais** (textarea, opcional)
- **Recebedor** (text, opcional) - Nome do responsável pelo recebimento
- **Visto Responsável** (text, opcional) - Nome do responsável técnico

---

### **3. EDITAR (`editar.php`)**

#### **O que faz:**
Permite editar um RIR existente.

**Parâmetros:** `?id={id_do_rir}`

**Carregamento de Dados:**
```php
// 1. Buscar relatório existente
$rir_atual = fetchOne("SELECT * FROM relatorio_inspecao WHERE id = ?", [$rir_id]);

// 2. Decodificar JSON
$checklist_atual = json_decode($rir_atual['checklist_json'], true) ?? [];
$produtos_atual = json_decode($rir_atual['produtos_json'], true) ?? [];

// 3. Preencher formulário com dados existentes via JavaScript
```

**Mesmas seções do cadastro**, mas com dados pré-preenchidos.

**Conversão de datas:**
- Backend (PHP) armazena no formato **ISO** (YYYY-MM-DD)
- Frontend (JavaScript) converte para **formato BR** (DD/MM/YYYY) para exibição
- Ao salvar, converte novamente para ISO

---

### **4. VISUALIZAR (`visualizar.php`)**

#### **O que faz:**
Exibe o RIR completo em formato de visualização/impressão.

**Parâmetros:** `?id={id_do_rir}`

**Seções exibidas:**

1. **Header com Status:**
   - ID do RIR (ex: #0001)
   - Badge de status (APROVADO/REPROVADO/PARCIAL)

2. **Cards de Informação:**
   - **Dados do Relatório:** Data, Hora, Nº NF, Nº AF
   - **Fornecedor:** Razão Social
   - **Responsáveis:** Recebedor, Visto, Usuário que cadastrou

3. **Check List Higiênico-Sanitário:**
   - Tabela com todos os itens avaliados
   - Cores: Verde (Conforme), Vermelho (Não Conforme)

4. **Produtos Avaliados:**
   - Tabela completa com todos os produtos
   - Badge de resultado por produto

5. **Ocorrências:**
   - Texto livre com observações

**Botões de Ação:**
- 📄 **Gerar PDF** → Chama `window.print()` com CSS otimizado para impressão
- ✏️ **Editar Relatório** → Vai para `editar.php`
- ⬅️ **Voltar para Lista** → Vai para `index.php`

**CSS para Impressão:**
- Oculta sidebar, botões e elementos desnecessários
- Reduz fonte para 7-9px
- Otimiza para papel A4
- Mantém cores dos status (verde/vermelho)

---

## 🔌 APIs E INTEGRAÇÕES

### **API 1: `buscar_produtos_pedido.php`**

**Endpoint:** `GET buscar_produtos_pedido.php?id={pedido_id}`

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

### **API 2: `buscar_nqa_grupo.php`**

**Endpoint:** `GET buscar_nqa_grupo.php?grupo_id={grupo_id}`

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

### **API 3: `buscar_plano_por_lote.php`**

**Endpoint:** `GET buscar_plano_por_lote.php?nqa_id={nqa_id}&tamanho_lote={tamanho}`

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
fetch('buscar_produtos_pedido.php?id=1234')
  → Retorna 5 produtos com grupo_id e nqa_codigo
```

**3. Para cada produto, sistema busca NQA do grupo**
```javascript
// Se produto não trouxe NQA, buscar via grupo
fetch('buscar_nqa_grupo.php?grupo_id=5')
  → Retorna NQA 2,5
```

**4. Usuário preenche Tamanho do Lote**
```javascript
// Quando digita tamanho do lote (ex: 50)
fetch('buscar_plano_por_lote.php?nqa_id=2&tamanho_lote=50')
  → Retorna: tamanho_amostra=8, ac=0, re=1
  → Preenche automaticamente "Nº Amostras Aval." = 8
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
```php
Produto 1: Aprovado
Produto 2: Aprovado
Produto 3: Reprovado
Produto 4: Aprovado
Produto 5: Aprovado

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

| Funcionalidade | Arquivo | Método | Descrição |
|---------------|---------|--------|-----------|
| **Visualizar Lista** | `index.php` | GET | Lista todos os RIRs com filtros |
| **Criar RIR** | `cadastrar.php` | POST | Cadastra novo relatório completo |
| **Editar RIR** | `editar.php` | POST | Edita relatório existente |
| **Visualizar RIR** | `visualizar.php` | GET | Exibe RIR completo (modo visualização/impressão) |
| **Excluir RIR** | `index.php` | GET | Exclui relatório |
| **Buscar Produtos** | `buscar_produtos_pedido.php` | GET | API: Retorna produtos do pedido |
| **Buscar NQA** | `buscar_nqa_grupo.php` | GET | API: Retorna NQA do grupo |
| **Buscar Plano** | `buscar_plano_por_lote.php` | GET | API: Retorna plano de amostragem |

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
- Autocomplete com fornecedores cadastrados
- Armazena CNPJ para rastreabilidade

---

**Essa é a estrutura completa do módulo de Relatório de Inspeção de Recebimento (RIR)!** 🚀