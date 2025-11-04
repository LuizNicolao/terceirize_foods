
---

## 🎯 OBJETIVO DO SISTEMA

Sistema para gerenciar **Pedidos de Compras (PC)**, que são documentos formais enviados aos fornecedores baseados em **Solicitações de Compras** aprovadas. O sistema permite criar pedidos vinculados a solicitações, gerenciar quantidades parciais, controlar valores e acompanhar o status de entrega.

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabela 1: `pedidos_compras`**
Tabela principal que armazena o cabeçalho dos pedidos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT AUTO_INCREMENT | ID único do pedido |
| `numero_pedido` | VARCHAR(20) UNIQUE NOT NULL | Número sequencial (ex: PC000001, PC000002) |
| `solicitacao_compras_id` | INT NOT NULL | ID da solicitação vinculada (FK para `solicitacoes_compras`) |
| `fornecedor_id` | INT | ID do fornecedor (FK para `fornecedores` - opcional) |
| `fornecedor_nome` | VARCHAR(200) | Nome/Razão Social do fornecedor |
| `fornecedor_cnpj` | VARCHAR(18) | CNPJ do fornecedor |
| `filial_id` | INT | ID da filial solicitante (copiado da SC) |
| `filial_nome` | VARCHAR(100) | Nome da filial (copiado para histórico) |
| `data_entrega_cd` | DATE | Data de entrega no Centro de Distribuição |
| `semana_abastecimento` | VARCHAR(20) | Semana de abastecimento (ex: "01/11 a 07/11/2024") |
| `valor_total` | DECIMAL(15,2) | Valor total do pedido (calculado via TRIGGER) |
| `status` | ENUM | Status: `em_digitacao`, `enviado`, `confirmado`, `em_transito`, `entregue`, `cancelado` |
| `observacoes` | TEXT | Observações gerais do pedido |
| `criado_por` | INT | ID do usuário que criou (FK para `usuarios`) |
| `criado_em` | TIMESTAMP | Data/hora de criação |
| `atualizado_em` | TIMESTAMP | Data/hora de última atualização |
| `filial_faturamento_id` | INT | ID da filial para faturamento |
| `filial_cobranca_id` | INT | ID da filial para cobrança (pagamento) |
| `filial_entrega_id` | INT | ID da filial para entrega |
| `endereco_faturamento` | TEXT | Endereço completo para NF |
| `endereco_cobranca` | TEXT | Endereço completo para cobrança |
| `endereco_entrega` | TEXT | Endereço completo para entrega |
| `cnpj_faturamento` | VARCHAR(18) | CNPJ da filial faturamento |
| `cnpj_cobranca` | VARCHAR(18) | CNPJ da filial cobrança |
| `cnpj_entrega` | VARCHAR(18) | CNPJ da filial entrega |
| `forma_pagamento` | VARCHAR(100) | Forma de pagamento (Boleto, PIX, etc.) |
| `prazo_pagamento` | VARCHAR(100) | Prazo de pagamento (30 dias, 28/35/42, etc.) |
| `justificativa` | TEXT | Justificativa da solicitação (copiado) |
| `numero_solicitacao` | VARCHAR(20) | Número da SC (copiado para histórico) |

**Índices:**
- `idx_numero_pedido` (numero_pedido)
- `idx_solicitacao_compras_id` (solicitacao_compras_id)
- `idx_fornecedor_id` (fornecedor_id)
- `idx_filial_id` (filial_id)
- `idx_status` (status)
- `idx_data_entrega_cd` (data_entrega_cd)
- `idx_criado_em` (criado_em)

**Foreign Keys:**
- `solicitacao_compras_id` → `solicitacoes_compras(id)` ON DELETE RESTRICT
- `criado_por` → `usuarios(id)` ON DELETE SET NULL
- `filial_id` → `filiais(id)` ON DELETE SET NULL

---

### **Tabela 2: `pedido_compras_itens`**
Tabela de itens (produtos) do pedido.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT AUTO_INCREMENT | ID único do item |
| `pedido_id` | INT NOT NULL | ID do pedido (FK para `pedidos_compras`) |
| `solicitacao_item_id` | INT | **ID do item da solicitação** (FK para `solicitacao_compras_itens`) - **VÍNCULO PRINCIPAL** |
| `produto_generico_id` | INT | ID do produto genérico |
| `codigo_produto` | VARCHAR(10) | Código do produto (copiado) |
| `nome_produto` | VARCHAR(200) | Nome do produto (copiado) |
| `unidade_medida_id` | INT | ID da unidade de medida (FK para `unidades_medida`) |
| `unidade_medida` | VARCHAR(50) | Símbolo da unidade (KG, UN, etc.) |
| `quantidade_solicitada` | DECIMAL(10,3) | Quantidade original da solicitação |
| `quantidade_pedido` | DECIMAL(10,3) NOT NULL | **Quantidade neste pedido específico** (pode ser menor que solicitada) |
| `valor_unitario` | DECIMAL(10,2) | Valor unitário do produto |
| `valor_total` | DECIMAL(15,2) | Valor total = quantidade_pedido × valor_unitario (calculado via TRIGGER) |
| `observacao` | TEXT | Observação específica do item |
| `criado_em` | TIMESTAMP | Data/hora de criação |

**Índices:**
- `idx_pedido_id` (pedido_id)
- `idx_produto_generico_id` (produto_generico_id)
- `idx_codigo_produto` (codigo_produto)
- `idx_solicitacao_item_id` (solicitacao_item_id) - **CRÍTICO PARA RASTREABILIDADE**

**Foreign Keys:**
- `pedido_id` → `pedidos_compras(id)` ON DELETE CASCADE
- `solicitacao_item_id` → `solicitacao_compras_itens(id)` ON DELETE SET NULL
- `unidade_medida_id` → `unidades_medida(id)` ON DELETE SET NULL

---

### **TRIGGERS Automáticos:**

#### **1. Calcular Valor Total do Item (BEFORE INSERT)**
```sql
CREATE TRIGGER calcular_valor_total_item_pedido
BEFORE INSERT ON pedido_compras_itens
FOR EACH ROW
BEGIN
    SET NEW.valor_total = NEW.quantidade_pedido * NEW.valor_unitario;
END
```

#### **2. Calcular Valor Total do Item (BEFORE UPDATE)**
```sql
CREATE TRIGGER calcular_valor_total_item_pedido_update
BEFORE UPDATE ON pedido_compras_itens
FOR EACH ROW
BEGIN
    SET NEW.valor_total = NEW.quantidade_pedido * NEW.valor_unitario;
END
```

#### **3. Atualizar Valor Total do Pedido (AFTER INSERT/UPDATE/DELETE)**
```sql
-- Após inserir item
CREATE TRIGGER atualizar_valor_total_pedido
AFTER INSERT ON pedido_compras_itens
FOR EACH ROW
BEGIN
    UPDATE pedidos_compras 
    SET valor_total = (
        SELECT COALESCE(SUM(valor_total), 0) 
        FROM pedido_compras_itens 
        WHERE pedido_id = NEW.pedido_id
    )
    WHERE id = NEW.pedido_id;
END

-- Mesmo comportamento para UPDATE e DELETE
```

---

## 🔗 RELACIONAMENTOS E VÍNCULOS

### **Diagrama Completo:**

```
solicitacoes_compras (1) ----< (N) pedidos_compras
       ↓ (1)
       |
  (N) solicitacao_compras_itens (1) ----< (N) pedido_compras_itens
                                              (via solicitacao_item_id)
       ↓
  produto_generico (1) ----< (N) pedido_compras_itens
       ↓
  unidades_medida

fornecedores (1) ----< (N) pedidos_compras (opcional)

filiais:
  - filial_faturamento_id  →  filiais(id)
  - filial_cobranca_id     →  filiais(id)
  - filial_entrega_id      →  filiais(id)

formas_pagamento → pedidos_compras.forma_pagamento (texto)
prazos_pagamento → pedidos_compras.prazo_pagamento (texto)
```

---

### **Vínculo CRÍTICO: Solicitação → Pedido**

**Nível 1: Solicitação ↔ Pedido (cabeçalho)**
```sql
pedidos_compras.solicitacao_compras_id → solicitacoes_compras.id
```

**Nível 2: Item Solicitação ↔ Item Pedido (rastreabilidade)**
```sql
pedido_compras_itens.solicitacao_item_id → solicitacao_compras_itens.id
```

**Exemplo de Rastreamento:**
```
Solicitação SC000001:
  Item 1 (ID=10): Arroz - 500 KG solicitado

Pedido PC000001:
  Item A: Arroz - 200 KG (solicitacao_item_id = 10)

Pedido PC000002:
  Item B: Arroz - 300 KG (solicitacao_item_id = 10)

Consulta de saldo:
SELECT 
    sci.quantidade as solicitado,  -- 500
    SUM(pci.quantidade_pedido) as atendido,  -- 200 + 300 = 500
    (sci.quantidade - SUM(pci.quantidade_pedido)) as saldo  -- 0
FROM solicitacao_compras_itens sci
LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
WHERE sci.id = 10
GROUP BY sci.id
```

---

## 📁 ARQUIVOS DO SISTEMA

### **Arquivos Principais:**

1. **`index.php`** - Listagem com ações em lote (READ)
2. **`cadastrar.php`** - Cadastro de pedido (CREATE)
3. **`editar.php`** - Edição de pedido (UPDATE)
4. **`visualizar.php`** - Visualização e impressão (READ)
5. **`excluir.php`** - Exclusão de pedido (DELETE)

### **APIs:**

6. **`buscar_itens_solicitacao.php`** - Busca itens com saldo disponível
7. **`buscar_dados_filial.php`** - Busca dados completos da filial
8. **`adicionar_item_pedido.php`** - Adiciona item ao pedido (via edição)
9. **`editar_item_pedido.php`** - Edita item existente
10. **`remover_item_pedido.php`** - Remove item do pedido

---

## ⚙️ FUNCIONALIDADES DETALHADAS

### **1. VISUALIZAR / LISTAR (`index.php`)**

#### **O que faz:**
Lista todos os pedidos de compras com funcionalidades de **ações em lote** (aprovação múltipla).

#### **Filtros Disponíveis:**
- **Busca Geral** (text): Número do pedido, Fornecedor, Filial
- **Status** (select): Em Digitação, Aprovado, Parcial, Finalizado

#### **Consulta SQL:**
```sql
SELECT 
    p.id,
    p.numero_pedido,
    p.solicitacao_compras_id,
    p.fornecedor_nome,
    p.fornecedor_cnpj,
    p.filial_nome,
    p.data_entrega_cd,
    p.valor_total,
    p.criado_em,
    p.status,
    s.numero_solicitacao,
    DATE_FORMAT(p.criado_em, '%d/%m/%Y %H:%i') as data_criacao,
    DATE_FORMAT(p.data_entrega_cd, '%d/%m/%Y') as data_entrega_formatada,
    (SELECT COUNT(*) FROM pedido_compras_itens WHERE pedido_id = p.id) as total_itens
FROM pedidos_compras p
LEFT JOIN solicitacoes_compras s ON p.solicitacao_compras_id = s.id
WHERE [filtros]
ORDER BY p.criado_em DESC
```

#### **Tabela de Listagem:**

| ☑️ | Número | Solicitação | Fornecedor | Filial | Data Entrega | Itens | Valor Total | Status | Ações |
|----|--------|-------------|------------|--------|--------------|-------|-------------|--------|-------|
| ☑️ | PC000001 | SC000001 | Fornecedor A (CNPJ) | Filial A | 10/11/2024 | 3 itens | R$ 5.000,00 | EM DIGITAÇÃO | 👁️ ✏️ 🖨️ |

#### **Funcionalidade de Ações em Lote:**

**Checkbox "Selecionar Todos":**
- Seleciona/deseleciona todos os pedidos
- Mostra contador: "(5 selecionados)"

**Botões de Ação em Lote:**

1. **✅ Aprovar Pedidos:**
```php
// Apenas pedidos com status = 'em_digitacao'
foreach ($pedidos_selecionados as $id) {
    $pedido = fetchOne("SELECT status FROM pedidos_compras WHERE id = ?", [$id]);
    
    if ($pedido['status'] === 'em_digitacao') {
        executeQuery("UPDATE pedidos_compras SET status = 'aprovado' WHERE id = ?", [$id]);
    }
}
```

2. **🔄 Reabrir Pedidos:**
```php
// Apenas pedidos com status = 'aprovado'
foreach ($pedidos_selecionados as $id) {
    $pedido = fetchOne("SELECT status FROM pedidos_compras WHERE id = ?", [$id]);
    
    if ($pedido['status'] === 'aprovado') {
        executeQuery("UPDATE pedidos_compras SET status = 'em_digitacao' WHERE id = ?", [$id]);
    }
}
```

**Observação:** Pedidos com status `Parcial` ou `Finalizado` **não podem ser reaberertos** (foram usados em Notas Fiscais/RIR).

#### **Ações Individuais:**
- 👁️ **Visualizar** → `visualizar.php?id={id}`
- ✏️ **Editar** → `editar.php?id={id}`
- 🖨️ **Imprimir** → Abre `visualizar.php` em popup + `window.print()`

#### **Funcionalidade de Exclusão:**
```php
// Via GET
if (isset($_GET['excluir'])) {
    $pedido = fetchOne("SELECT status FROM pedidos_compras WHERE id = ?", [$id]);
    
    if (in_array($pedido['status'], ['em_digitacao', 'cancelado'])) {
        executeQuery("DELETE FROM pedidos_compras WHERE id = ?", [$id]);
        $sucesso = "Pedido excluído!";
    } else {
        $erro = "Apenas pedidos em digitação ou cancelados podem ser excluídos.";
    }
}
```

---

### **2. CADASTRAR (`cadastrar.php`)**

#### **O que faz:**
Cria um novo pedido de compra baseado em uma Solicitação de Compras existente.

#### **Seções do Formulário:**

#### **A) Selecionar Solicitação de Compras**

**Campo:**
- **Solicitação de Compras** (select, obrigatório)
  - Mostra apenas solicitações com status `aberto` ou `parcial`
  - Formato: "SC000001 - Filial A - Entrega: 10/11/2024"
  - Ao selecionar, dispara AJAX para carregar itens

**Query para buscar solicitações disponíveis:**
```sql
SELECT s.id, s.numero_solicitacao, s.filial_id, s.data_entrega_cd, 
       s.semana_abastecimento, s.status,
       f.nome as filial_nome, f.codigo as filial_codigo
FROM solicitacoes_compras s
LEFT JOIN filiais f ON s.filial_id = f.id
WHERE s.status IN ('aberto', 'parcial')
ORDER BY s.criado_em DESC
```

#### **B) Dados do Fornecedor**

**Campos:**
- **Razão Social** (select ou text, obrigatório)
  - Se houver fornecedores cadastrados → Select com auto-preenchimento
  - Senão → Input texto manual

- **Nome Fantasia** (text, readonly se fornecedor cadastrado)
  - Preenchido automaticamente ao selecionar fornecedor

- **CNPJ** (text, readonly se fornecedor cadastrado)
  - Preenchido automaticamente

- **Data de Entrega no CD** (date, obrigatório)
  - Preenchido automaticamente da solicitação selecionada

**JavaScript - Auto-preenchimento:**
```javascript
function preencherDadosFornecedor() {
    const select = document.getElementById('fornecedorSelect');
    const option = select.options[select.selectedIndex];
    
    if (option && option.value) {
        document.getElementById('fornecedorNome').value = option.dataset.razaoSocial;
        document.getElementById('fornecedorNomeFantasia').value = option.dataset.nomeFantasia;
        document.getElementById('fornecedorCnpj').value = option.dataset.cnpj;
    }
}
```

#### **C) Condições de Pagamento**

**Campos:**
- **Forma de Pagamento** (select): Boleto, PIX, Transferência, etc.
- **Prazo de Pagamento** (select): À vista, 30 dias, 28/35/42, etc.

**Observação:** Se não houver formas/prazos cadastrados, permite digitação manual.

#### **D) Dados para Faturamento**

**Campos (todos readonly):**
- **Filial** - Preenchido automaticamente com filial da solicitação
- **Razão Social** - Busca via AJAX
- **CNPJ** - Busca via AJAX
- **Endereço** - Montado automaticamente

**Montagem do Endereço:**
```
Rua ABC, 123 - Complemento - Bairro - Cidade/UF - CEP: 00000-000
```

#### **E) Dados para Cobrança**

**Campos:**
- **Filial** (select, obrigatório) - **Default: Filial Matriz**
- **Razão Social** (readonly) - Busca via AJAX
- **CNPJ** (readonly) - Busca via AJAX
- **Endereço** (readonly) - Busca via AJAX

**Lógica de Matriz:**
```php
// Buscar filial matriz
$matriz = fetchOne("SELECT id, nome, cnpj, razao_social 
                    FROM filiais WHERE is_matriz = 1 LIMIT 1");

if (!$matriz) {
    // Se não houver matriz, usar primeira filial
    $matriz = fetchOne("SELECT id, nome, cnpj, razao_social 
                        FROM filiais ORDER BY id ASC LIMIT 1");
}

// Pré-selecionar matriz no select
```

#### **F) Dados para Entrega**

**Campos:**
- **Filial** (select, obrigatório) - Pré-selecionado com filial da solicitação
- **Razão Social** (readonly)
- **CNPJ** (readonly)
- **Endereço** (readonly)

#### **G) Produtos do Pedido**

Ao selecionar uma solicitação, sistema carrega automaticamente os produtos via AJAX.

**API: `buscar_itens_solicitacao.php?id={solicitacao_id}`**

**Resposta:**
```json
{
  "success": true,
  "itens": [
    {
      "id": 10,
      "produto_id": 5,
      "codigo_produto": "001234",
      "nome_produto": "Arroz Branco",
      "unidade_simbolo": "KG",
      "unidade_medida_id": 2,
      "quantidade": 500,
      "quantidade_atendida": 200,
      "quantidade_saldo": 300
    }
  ],
  "solicitacao": {
    "numero_solicitacao": "SC000001",
    "filial_nome": "Filial A",
    "motivo": "Compra Programada"
  }
}
```

**Tabela Renderizada:**

| ☑️ | Produto | Und | Qtd. Sol. | Qtd. Atendida | **Saldo Disp.** | **Qtd. Pedido** * | **Valor Unit.** * | Valor Total |
|----|---------|-----|-----------|---------------|-----------------|-------------------|-------------------|-------------|
| ☑️ | Arroz Branco | KG | 500,00 | 200,00 | **300,00** | 300,00 | 5,50 | **R$ 1.650,00** |
| ☑️ | Feijão Preto | KG | 200,00 | 0,00 | **200,00** | 200,00 | 8,20 | **R$ 1.640,00** |

**Funcionalidades da Tabela:**

1. **Checkbox por Item:**
   - Permite selecionar quais produtos incluir no pedido
   - Produtos desmarcados não são incluídos
   - Ao desmarcar, linha fica com `opacity: 0.5`

2. **Qtd. Pedido (editável):**
   - Pré-preenchido com saldo disponível
   - Validação: não pode ser maior que saldo
   ```javascript
   function validarQuantidade(index, maxQtd) {
       const input = document.getElementById(`qtd_${index}`);
       const valor = parseFloat(input.value) || 0;
       if (valor > maxQtd) {
           input.value = maxQtd;
           alert(`Não pode ser maior que ${maxQtd}`);
       }
   }
   ```

3. **Valor Unitário (editável):**
   - Usuário informa preço negociado com fornecedor
   - Obrigatório

4. **Valor Total (calculado):**
   - Calcula automaticamente: `qtd_pedido × valor_unitario`
   - Atualiza ao alterar quantidade ou valor
   ```javascript
   function calcularTotal(index) {
       const qtd = parseFloat(document.querySelector(`input[name="itens[${index}][quantidade]"]`).value) || 0;
       const valorUnit = parseFloat(document.getElementById(`valor_${index}`).value) || 0;
       const total = qtd * valorUnit;
       
       document.getElementById(`total_${index}`).textContent = `R$ ${total.toFixed(2)}`;
       calcularTotalPedido();
   }
   ```

5. **Valor Total do Pedido (rodapé):**
   - Soma de todos os itens selecionados
   - Atualiza em tempo real

#### **Processamento do Formulário (POST):**

```php
// 1. Gerar número automático
$ultimo = fetchOne("SELECT numero_pedido FROM pedidos_compras 
                    WHERE numero_pedido LIKE 'PC%' ORDER BY id DESC LIMIT 1");

if ($ultimo) {
    $numero = intval(substr($ultimo['numero_pedido'], 2));
    $proximo = 'PC' . str_pad($numero + 1, 6, '0', STR_PAD_LEFT);
} else {
    $proximo = 'PC000001';
}

// 2. Buscar dados da solicitação
$solicitacao = fetchOne("SELECT s.*, f.nome as filial_nome
                         FROM solicitacoes_compras s
                         LEFT JOIN filiais f ON s.filial_id = f.id
                         WHERE s.id = ?", [$solicitacao_id]);

// 3. Buscar endereços das 3 filiais (faturamento, cobrança, entrega)
foreach (['faturamento', 'cobranca', 'entrega'] as $tipo) {
    $filial_id = $_POST["filial_{$tipo}_id"];
    $filial = fetchOne("SELECT * FROM filiais WHERE id = ?", [$filial_id]);
    
    // Montar endereço completo
    $endereco = "{$filial['logradouro']}, {$filial['numero']} - {$filial['bairro']} - {$filial['cidade']}/{$filial['uf']} - CEP: {$filial['cep']}";
    
    ${"endereco_$tipo"} = $endereco;
    ${"cnpj_$tipo"} = $filial['cnpj'];
}

// 4. Inserir pedido
INSERT INTO pedidos_compras (
    numero_pedido, solicitacao_compras_id, fornecedor_id, fornecedor_nome, fornecedor_cnpj,
    filial_id, filial_nome,
    filial_faturamento_id, filial_cobranca_id, filial_entrega_id,
    endereco_faturamento, endereco_cobranca, endereco_entrega,
    cnpj_faturamento, cnpj_cobranca, cnpj_entrega,
    data_entrega_cd, semana_abastecimento,
    forma_pagamento, prazo_pagamento,
    justificativa, numero_solicitacao,
    status, observacoes, criado_por
) VALUES (...)

// 5. Inserir apenas itens SELECIONADOS
$itens_selecionados = $_POST['itens_selecionados'] ?? [];

foreach ($_POST['itens'] as $index => $item) {
    if (in_array($index, $itens_selecionados) && $item['quantidade'] > 0) {
        // Validar saldo disponível (backend)
        $saldo = fetchOne("
            SELECT (sci.quantidade - COALESCE(SUM(pci.quantidade_pedido), 0)) as saldo
            FROM solicitacao_compras_itens sci
            LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
            WHERE sci.id = ?
            GROUP BY sci.id
        ", [$item['solicitacao_item_id']]);
        
        if ($item['quantidade'] > $saldo['saldo']) {
            throw new Exception("Quantidade maior que saldo disponível!");
        }
        
        // Inserir item
        INSERT INTO pedido_compras_itens (
            pedido_id, solicitacao_item_id, produto_generico_id,
            codigo_produto, nome_produto,
            unidade_medida_id, unidade_medida,
            quantidade_solicitada, quantidade_pedido,
            valor_unitario
        ) VALUES (...)
        
        // TRIGGER calcula valor_total do item
        // TRIGGER atualiza valor_total do pedido
    }
}

// 6. Recalcular status da solicitação
recalcularStatusSolicitacao($solicitacao_id);
```

**Validações:**
- Solicitação obrigatória
- Fornecedor obrigatório (nome mínimo)
- Data de Entrega CD obrigatória
- Pelo menos 1 produto selecionado
- Quantidade do pedido ≤ Saldo disponível (validação backend)

---

### **3. EDITAR (`editar.php`)**

#### **O que faz:**
Permite editar um pedido existente e adicionar novos produtos da solicitação.

**Parâmetros:** `?id={id_do_pedido}`

#### **Seções do Formulário:**

**A) Solicitação Vinculada (readonly):**
- Mostra número da solicitação
- Mostra filial
- Mostra justificativa
- **Não pode alterar a solicitação vinculada**

**B) Dados do Fornecedor:**
- Select para buscar fornecedor cadastrado (preenche automaticamente)
- Campos editáveis: Nome, CNPJ
- Data de Entrega CD editável

**C) Condições de Pagamento:**
- Forma de pagamento editável
- Prazo de pagamento editável
- **Status** editável (dropdown):
  - Em Digitação
  - Enviado
  - Confirmado
  - Em Trânsito
  - Entregue
  - Cancelado

**D) Produtos Disponíveis da Solicitação:**

Mostra produtos que **ainda não foram adicionados** a este pedido.

**Query:**
```sql
SELECT sci.*
FROM solicitacao_compras_itens sci
WHERE sci.solicitacao_id = ?
AND sci.id NOT IN (
    SELECT solicitacao_item_id 
    FROM pedido_compras_itens 
    WHERE pedido_id = ? AND solicitacao_item_id IS NOT NULL
)
```

**Tabela:**

| Produto | Unidade | Qtd. Disponível | Qtd. a Adicionar | Valor Unitário | Ação |
|---------|---------|-----------------|------------------|----------------|------|
| Produto X | KG | 150,00 | *Input* | *Input* | ➕ **Adicionar** |

**Botão "Adicionar":**
```javascript
function adicionarItemAoPedido(itemSolicitacaoId, idx) {
    const qtd = parseFloat(document.getElementById(`qtd_disp_${idx}`).value);
    const valor = parseFloat(document.getElementById(`valor_disp_${idx}`).value);
    
    if (!qtd || qtd <= 0) {
        alert('Informe a quantidade!');
        return;
    }
    
    // Submete via POST para adicionar_item_pedido.php
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'adicionar_item_pedido.php?pedido_id=' + pedidoId;
    
    form.innerHTML = `
        <input name="item_solicitacao_id" value="${itemSolicitacaoId}">
        <input name="quantidade" value="${qtd}">
        <input name="valor_unitario" value="${valor}">
    `;
    
    document.body.appendChild(form);
    form.submit();
}
```

**E) Produtos do Pedido (Existentes):**

Mostra produtos já incluídos no pedido com possibilidade de editar quantidades e valores.

**Tabela:**

| Produto | Und | Qtd. Solicitada | **Qtd. Pedido** * | **Valor Unit.** * | Valor Total |
|---------|-----|-----------------|-------------------|-------------------|-------------|
| Arroz | KG | 500,00 | 200,00 | 5,50 | R$ 1.100,00 |

**Funcionalidades:**
- Editar quantidade do pedido (valida contra saldo)
- Editar valor unitário
- Valor total calculado automaticamente

#### **Processamento da Edição (POST):**

```php
// 1. Atualizar cabeçalho do pedido
UPDATE pedidos_compras SET
    fornecedor_nome = ?, fornecedor_cnpj = ?,
    data_entrega_cd = ?, forma_pagamento = ?, prazo_pagamento = ?,
    status = ?, observacoes = ?,
    atualizado_em = CURRENT_TIMESTAMP
WHERE id = ?

// 2. Atualizar itens existentes (com validação de saldo)
foreach ($_POST['itens'] as $item_id => $item_data) {
    // Buscar saldo disponível considerando item atual
    $item_atual = fetchOne("
        SELECT pci.*,
               sci.quantidade as quantidade_solicitada_total,
               (sci.quantidade - COALESCE(SUM(pci2.quantidade_pedido), 0) + pci.quantidade_pedido) as saldo_disponivel
        FROM pedido_compras_itens pci
        INNER JOIN solicitacao_compras_itens sci ON pci.solicitacao_item_id = sci.id
        LEFT JOIN pedido_compras_itens pci2 ON pci2.solicitacao_item_id = sci.id
        WHERE pci.id = ?
        GROUP BY pci.id
    ", [$item_id]);
    
    $nova_quantidade = floatval($item_data['quantidade']);
    $saldo = floatval($item_atual['saldo_disponivel']);
    
    if ($nova_quantidade > $saldo) {
        throw new Exception("Quantidade ({$nova_quantidade}) > Saldo ({$saldo})");
    }
    
    // Atualizar item
    UPDATE pedido_compras_itens SET
        quantidade_pedido = ?, 
        valor_unitario = ?,
        valor_total = quantidade_pedido * valor_unitario
    WHERE id = ?
}

// 3. Recalcular status da solicitação
recalcularStatusSolicitacao($solicitacao_id);
```

---

### **4. VISUALIZAR (`visualizar.php`)**

## 🎯 OBJETIVO DO SISTEMA

Sistema para gerenciar **Prazos de Pagamento** disponíveis no sistema Nexflow. Permite cadastrar diferentes prazos (À vista, 30 dias, parcelamentos, etc.) que são utilizados no módulo de **Pedidos de Compras**. Suporta tanto **pagamentos únicos** quanto **parcelamentos** com intervalos configuráveis.

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabela: `prazos_pagamento`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT AUTO_INCREMENT | ID único do prazo |
| `nome` | VARCHAR(100) NOT NULL | Nome do prazo (ex: "30 dias", "3x (30/60/90)") |
| `dias` | INT | **Dias da 1ª parcela** (0 = à vista, 30 = vence em 30 dias) |
| `parcelas` | INT DEFAULT 1 | **Número de parcelas** (1 = pagamento único, 2+ = parcelado) |
| `intervalo_dias` | INT NULL | **Intervalo entre parcelas** (ex: 30 para mensal, 15 para quinzenal) |
| `descricao` | TEXT | Descrição detalhada do prazo (opcional) |
| `ativo` | TINYINT(1) DEFAULT 1 | 1 = Ativo (disponível para uso), 0 = Inativo |
| `criado_em` | TIMESTAMP | Data/hora de criação do registro |
| `atualizado_em` | TIMESTAMP | Data/hora da última atualização (auto-atualizado) |
| `criado_por` | INT | ID do usuário que criou o registro |

**Índices:**
- `idx_ativo` (ativo) - Para filtrar apenas prazos ativos
- `idx_criado_por` (criado_por) - Para rastreabilidade
- `idx_parcelas` (parcelas) - Para ordenação e filtros

**Constraints:**
- `nome` NOT NULL - Nome é obrigatório
- `dias` NOT NULL - Número de dias é obrigatório
- `parcelas` DEFAULT 1 - Padrão é pagamento único
- `ativo` DEFAULT 1 - Por padrão, prazos são criados ativos

---

## 📊 DADOS PRÉ-CADASTRADOS

Ao instalar o módulo, são criados automaticamente:

### **Pagamentos Únicos (9 registros):**

| ID | Nome | Dias | Parcelas | Intervalo | Descrição | Ativo |
|----|------|------|----------|-----------|-----------|-------|
| 1 | À vista | 0 | 1 | NULL | Pagamento imediato | ✅ |
| 2 | 7 dias | 7 | 1 | NULL | Pagamento em 7 dias | ✅ |
| 3 | 14 dias | 14 | 1 | NULL | Pagamento em 14 dias | ✅ |
| 4 | 21 dias | 21 | 1 | NULL | Pagamento em 21 dias | ✅ |
| 5 | 28 dias | 28 | 1 | NULL | Pagamento em 28 dias | ✅ |
| 6 | 30 dias | 30 | 1 | NULL | Pagamento em 30 dias | ✅ |
| 7 | 45 dias | 45 | 1 | NULL | Pagamento em 45 dias | ✅ |
| 8 | 60 dias | 60 | 1 | NULL | Pagamento em 60 dias | ✅ |
| 9 | 90 dias | 90 | 1 | NULL | Pagamento em 90 dias | ✅ |

### **Pagamentos Parcelados (6 registros):**

| ID | Nome | Dias | Parcelas | Intervalo | Vencimentos Calculados | Ativo |
|----|------|------|----------|-----------|------------------------|-------|
| 10 | 2x (30/60 dias) | 30 | 2 | 30 | 30d, 60d | ✅ |
| 11 | 3x (30/60/90 dias) | 30 | 3 | 30 | 30d, 60d, 90d | ✅ |
| 12 | 4x (30/60/90/120 dias) | 30 | 4 | 30 | 30d, 60d, 90d, 120d | ✅ |
| 13 | 2x (15/30 dias) | 15 | 2 | 15 | 15d, 30d | ✅ |
| 14 | 3x (15/30/45 dias) | 15 | 3 | 15 | 15d, 30d, 45d | ✅ |
| 15 | 6x (30 dias) | 30 | 6 | 30 | 30d, 60d, 90d, 120d, 150d, 180d | ✅ |

---

## 🧮 CÁLCULO DE VENCIMENTOS (PARCELADO)

### **Fórmula:**

```
Para cada parcela i (de 0 até parcelas-1):
    vencimento[i] = dias + (i × intervalo_dias)
```

### **Exemplo: 3x (30/60/90 dias)**

```
dias = 30
parcelas = 3
intervalo_dias = 30

Parcela 0 (1ª): 30 + (0 × 30) = 30 dias
Parcela 1 (2ª): 30 + (1 × 30) = 60 dias
Parcela 2 (3ª): 30 + (2 × 30) = 90 dias
```

### **Exemplo: 4x Quinzenal**

```
dias = 15
parcelas = 4
intervalo_dias = 15

Parcela 0: 15 + (0 × 15) = 15 dias
Parcela 1: 15 + (1 × 15) = 30 dias
Parcela 2: 15 + (2 × 15) = 45 dias
Parcela 3: 15 + (3 × 15) = 60 dias
```

---

## 🔗 RELACIONAMENTOS E VÍNCULOS

### **Integração com Pedidos de Compras:**

```
prazos_pagamento (N) → pedidos_compras.prazo_pagamento (texto)
```

**Importante:** O vínculo é **por nome (texto)**, não por ID (FK).

**Motivo:** Permite que o pedido mantenha o histórico mesmo se o prazo for excluído.

**Exemplo:**
```sql
-- Pedido de Compras
pedidos_compras:
  numero_pedido: PC000001
  forma_pagamento: "Boleto Bancário"
  prazo_pagamento: "3x (30/60/90 dias)"  ← Texto, não FK
```

### **Verificação de Uso:**

Antes de excluir um prazo, o sistema verifica:
```sql
SELECT COUNT(*) as total 
FROM pedidos_compras 
WHERE prazo_pagamento = '3x (30/60/90 dias)'
```

Se `total > 0` → **Não permite excluir** (está em uso)

---

## 📁 ARQUIVOS DO SISTEMA

### **Arquivos Principais:**

1. **`index.php`** - Listagem com filtros (READ)
2. **`cadastrar.php`** - Cadastro de prazo (CREATE)
3. **`editar.php`** - Edição de prazo (UPDATE)
4. **`visualizar.php`** - Visualização de detalhes com cálculo de vencimentos (READ)
5. **`excluir.php`** - Exclusão com validação (DELETE)
6. **`instalar_tabela.php`** - Script de instalação
7. **`atualizar_parcelamento.php`** - Atualização para suportar parcelamento

---

## ⚙️ FUNCIONALIDADES DETALHADAS

### **1. VISUALIZAR / LISTAR (`index.php`)**

#### **O que faz:**
Lista todos os prazos de pagamento cadastrados com filtros de busca e status.

#### **Filtros Disponíveis:**
- **Busca** (text): Busca por nome ou descrição
- **Status** (select):
  - Todos
  - Ativos
  - Inativos

#### **Consulta SQL:**
```sql
SELECT * FROM prazos_pagamento 
WHERE [filtros dinâmicos]
ORDER BY dias ASC  -- Ordenado por dias (crescente)
```

**Ordenação:** Prazos mais curtos primeiro (À vista → 7 dias → 30 dias → 90 dias → parcelados)

#### **Tabela de Listagem:**

| # | Nome | Parcelas | Vencimentos | Descrição | Status | Ações |
|---|------|----------|-------------|-----------|--------|-------|
| 1 | À vista | **1x** | **À vista** | Pagamento imediato | ✅ Ativo | 👁️ ✏️ 🗑️ |
| 6 | 30 dias | **1x** | **30 dias** | Pagamento em 30 dias | ✅ Ativo | 👁️ ✏️ 🗑️ |
| 11 | 3x (30/60/90 dias) | **3x** 🏷️ | **30d / 60d / 90d** | Pagamento parcelado | ✅ Ativo | 👁️ ✏️ 🗑️ |
| 15 | 6x (30 dias) | **6x** 🏷️ | **30d / 60d / 90d ...** | 6 parcelas mensais | ✅ Ativo | 👁️ ✏️ 🗑️ |

**Coluna "Parcelas":**
```php
$parcelas = $prazo['parcelas'] ?? 1;
echo $parcelas . 'x';
if ($parcelas > 1) {
    echo ' <i class="fas fa-tags"></i>';  // Ícone indicando parcelamento
}

// Resultado: "1x" ou "3x 🏷️"
```

**Coluna "Vencimentos":**
```php
$parcelas = $prazo['parcelas'] ?? 1;
$dias_inicial = $prazo['dias'];
$intervalo = $prazo['intervalo_dias'] ?? 0;

if ($dias_inicial == 0) {
    echo 'À vista';
} elseif ($parcelas == 1) {
    echo $dias_inicial . ' dias';
} else {
    // Parcelado - mostrar até 3 vencimentos
    $vencimentos = [];
    for ($i = 0; $i < min($parcelas, 3); $i++) {
        $vencimentos[] = ($dias_inicial + ($i * $intervalo)) . 'd';
    }
    echo implode(' / ', $vencimentos);
    if ($parcelas > 3) echo ' ...';  // Indicar que há mais
}

// Resultados:
// - "À vista"
// - "30 dias"
// - "30d / 60d / 90d"
// - "30d / 60d / 90d ..." (para 6x)
```

#### **Ações por Registro:**
- 👁️ **Visualizar** → `visualizar.php?id={id}`
- ✏️ **Editar** → `editar.php?id={id}`
- 🗑️ **Excluir** → `excluir.php?id={id}` com confirmação

---

### **2. CADASTRAR (`cadastrar.php`)**

#### **O que faz:**
Cria um novo prazo de pagamento no sistema.

#### **Campos do Formulário:**

1. **Nome do Prazo** (text, obrigatório)
   - Placeholder: "Ex: 30 dias, À vista"
   - Para parcelado: "3x (30/60/90 dias)"

2. **Dias da 1ª Parcela** (number, obrigatório)
   - Min: 0 (à vista)
   - Placeholder: "Ex: 30"
   - Hint: "Dias até o vencimento (0 para à vista)"

3. **Número de Parcelas** (number, obrigatório)
   - Min: 1
   - Max: 12
   - Default: 1
   - Hint: "1 = pagamento único, 2+ = parcelado"
   - **onChange**: Dispara JavaScript para mostrar/ocultar campo "Intervalo"

4. **Intervalo entre Parcelas (dias)** (number, condicional)
   - **Só aparece se Parcelas > 1**
   - Min: 1
   - Placeholder: "Ex: 30 para mensal"
   - Hint: "Ex: 30 dias para parcelas mensais, 15 para quinzenais"

5. **Descrição** (textarea, opcional)
   - Placeholder: "Descreva os detalhes deste prazo"

6. **Prazo ativo** (checkbox)
   - Marcado por padrão
   - Se desmarcado: prazo fica inativo

#### **JavaScript - Toggle Campo Intervalo:**

```javascript
function toggleIntervalo() {
    const parcelas = document.getElementById('parcelas').value;
    const intervaloGroup = document.getElementById('intervaloGroup');
    
    if (parcelas > 1) {
        intervaloGroup.style.display = 'block';  // Mostrar
    } else {
        intervaloGroup.style.display = 'none';   // Ocultar
        document.getElementById('intervalo_dias').value = '';  // Limpar
    }
}

// Executar ao mudar número de parcelas
document.getElementById('parcelas').addEventListener('change', toggleIntervalo);

// Executar ao carregar página
document.addEventListener('DOMContentLoaded', toggleIntervalo);
```

#### **Processamento do Formulário (POST):**

```php
// 1. Receber dados
$nome = trim($_POST['nome'] ?? '');
$dias = $_POST['dias'] ?? '';
$parcelas = $_POST['parcelas'] ?? 1;
$intervalo_dias = $_POST['intervalo_dias'] ?? null;
$descricao = trim($_POST['descricao'] ?? '');
$ativo = isset($_POST['ativo']) ? 1 : 0;

// 2. Lógica de Intervalo
// Se parcelas > 1 e não tem intervalo, usar os dias como intervalo (padrão mensal)
if ($parcelas > 1 && empty($intervalo_dias)) {
    $intervalo_dias = $dias;
}

// Se parcelas = 1, intervalo deve ser NULL (não faz sentido)
if ($parcelas == 1) {
    $intervalo_dias = null;
}

// 3. Validações
if (empty($nome)) {
    throw new Exception("O nome do prazo é obrigatório.");
}

if ($dias === '') {
    throw new Exception("O número de dias é obrigatório.");
}

if ($parcelas < 1) {
    throw new Exception("O número de parcelas deve ser pelo menos 1.");
}

// 4. Inserir no banco
$id = insert("
    INSERT INTO prazos_pagamento (nome, dias, parcelas, intervalo_dias, descricao, ativo, criado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?)
", [$nome, $dias, $parcelas, $intervalo_dias, $descricao, $ativo, $usuario_id]);

// 5. Redirecionar para visualização
$_SESSION['sucesso_msg'] = "Prazo cadastrado com sucesso!";
header("Location: visualizar.php?id=$id");
exit;
```

**Validações:**
- Nome não pode estar vazio
- Dias não pode estar vazio
- Parcelas deve ser ≥ 1
- Se parcelas > 1, intervalo é recomendado (mas não obrigatório)

---

### **3. EDITAR (`editar.php`)**

#### **O que faz:**
Permite editar um prazo de pagamento existente.

**Parâmetros:** `?id={id_do_prazo}`

#### **Carregamento de Dados:**
```php
$prazo = fetchOne("SELECT * FROM prazos_pagamento WHERE id = ?", [$id]);

if (!$prazo) {
    $_SESSION['erro_msg'] = "Prazo não encontrado.";
    header('Location: index.php');
    exit;
}
```

#### **Campos do Formulário:**
Mesmos campos do cadastro, mas **pré-preenchidos**:

```html
<input type="text" name="nome" value="<?php echo htmlspecialchars($prazo['nome']); ?>" required>

<input type="number" name="dias" value="<?php echo htmlspecialchars($prazo['dias']); ?>" required>

<input type="number" name="parcelas" value="<?php echo htmlspecialchars($prazo['parcelas'] ?? 1); ?>" onchange="toggleIntervalo()">

<!-- Campo intervalo - visibilidade condicional baseado em parcelas -->
<div id="intervaloGroup" style="display: <?php echo (($prazo['parcelas'] ?? 1) > 1) ? 'block' : 'none'; ?>;">
    <input type="number" name="intervalo_dias" value="<?php echo htmlspecialchars($prazo['intervalo_dias'] ?? ''); ?>">
</div>

<textarea name="descricao"><?php echo htmlspecialchars($prazo['descricao'] ?? ''); ?></textarea>

<input type="checkbox" name="ativo" <?php echo $prazo['ativo'] == 1 ? 'checked' : ''; ?>>
```

#### **Processamento da Edição (POST):**

```php
// 1. Receber dados
$nome = trim($_POST['nome'] ?? '');
$dias = $_POST['dias'] ?? '';
$parcelas = $_POST['parcelas'] ?? 1;
$intervalo_dias = $_POST['intervalo_dias'] ?? null;
$descricao = trim($_POST['descricao'] ?? '');
$ativo = isset($_POST['ativo']) ? 1 : 0;

// 2. Lógica de Intervalo (mesma do cadastro)
if ($parcelas > 1 && empty($intervalo_dias)) {
    $intervalo_dias = $dias;
}

if ($parcelas == 1) {
    $intervalo_dias = null;
}

// 3. Validações (mesmas do cadastro)

// 4. Atualizar no banco
executeQuery("
    UPDATE prazos_pagamento 
    SET nome = ?, dias = ?, parcelas = ?, intervalo_dias = ?, descricao = ?, ativo = ?
    WHERE id = ?
", [$nome, $dias, $parcelas, $intervalo_dias, $descricao, $ativo, $id]);

// 5. Redirecionar
$_SESSION['sucesso_msg'] = "Prazo atualizado com sucesso!";
header("Location: visualizar.php?id=$id");
exit;
```

**Botões de Ação:**
- 💾 **Salvar Alterações** → Salva e vai para `visualizar.php`
- ❌ **Cancelar** → Volta para `visualizar.php` sem salvar

---

### **4. VISUALIZAR (`visualizar.php`)**

#### **O que faz:**
Exibe os detalhes completos de um prazo de pagamento, incluindo **cálculo e exibição de todos os vencimentos** (para parcelados).

**Parâmetros:** `?id={id_do_prazo}`

#### **Consulta SQL:**
```sql
SELECT * FROM prazos_pagamento WHERE id = ?
```

#### **Seções Exibidas:**

**1. Informações do Prazo:**

| Campo | Valor Exemplo |
|-------|---------------|
| 🔢 ID | 11 |
| 📅 Nome | **3x (30/60/90 dias)** |
| 🕐 Dias (1ª Parcela) | 30 dias |
| 📋 Parcelas | **3x** (Parcelado) |
| 📆 Intervalo entre Parcelas | 30 dias |
| ✅ Vencimentos | **30 dias \| 60 dias \| 90 dias** |
| ✅ Status | ✅ Ativo |
| 📝 Descrição | Pagamento em 3 parcelas mensais |

**Cálculo de Vencimentos (PHP):**
```php
<?php if (($prazo['parcelas'] ?? 1) > 1 && !empty($prazo['intervalo_dias'])): ?>
    <div class="info-item" style="grid-column: 1 / -1;">
        <span class="info-label">
            <i class="fas fa-calendar-check"></i> Vencimentos
        </span>
        <span class="info-value">
            <?php 
            $vencimentos = [];
            for ($i = 0; $i < $prazo['parcelas']; $i++) {
                $dias_venc = $prazo['dias'] + ($i * $prazo['intervalo_dias']);
                $vencimentos[] = $dias_venc . ' dias';
            }
            echo implode(' | ', $vencimentos);
            
            // Resultado: "30 dias | 60 dias | 90 dias"
            ?>
        </span>
    </div>
<?php endif; ?>
```

**2. Informações do Sistema:**
- 📅 Criado em: DD/MM/YYYY HH:MM
- ✏️ Atualizado em: DD/MM/YYYY HH:MM (se foi alterado)

#### **Botões de Ação:**
- ✏️ **Editar** → `editar.php?id={id}`
- 🗑️ **Excluir** → `excluir.php?id={id}` com confirmação
- ⬅️ **Voltar** → `index.php`

---

### **5. EXCLUIR (`excluir.php`)**

#### **O que faz:**
Página de confirmação para excluir um prazo de pagamento.

**Parâmetros:** `?id={id_do_prazo}`

#### **Verificação de Uso (ANTES de Excluir):**

```php
// Verificar se está em uso em pedidos de compras
$em_uso = fetchOne("
    SELECT COUNT(*) as total 
    FROM pedidos_compras 
    WHERE prazo_pagamento = ?
", [$prazo['nome']]);

if ($em_uso && $em_uso['total'] > 0) {
    $erro = "Não é possível excluir este prazo pois está sendo utilizado em {$em_uso['total']} pedido(s).";
    // Bloqueia exclusão
}
```

**Regra de Negócio:**
- ✅ Pode excluir: Se não estiver vinculado a nenhum pedido
- ❌ Não pode excluir: Se estiver em uso em qualquer pedido

**Alternativa:** Desativar em vez de excluir.

#### **Tela de Confirmação:**

```
⚠️ Atenção! Esta ação não pode ser desfeita.

┌─────────────────────────────────────────┐
│ # ID: 11                                │
│ 📅 Nome: 3x (30/60/90 dias)             │
│ 🕐 Dias: 30 dias                        │
└─────────────────────────────────────────┘

[🗑️ Confirmar Exclusão]  [❌ Cancelar]
```

#### **Processamento da Exclusão (POST):**

```php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Verificar uso
        $em_uso = fetchOne("SELECT COUNT(*) as total FROM pedidos_compras WHERE prazo_pagamento = ?", [$prazo['nome']]);
        
        if ($em_uso['total'] > 0) {
            throw new Exception("Está em uso em {$em_uso['total']} pedido(s).");
        }
        
        // Excluir
        executeQuery("DELETE FROM prazos_pagamento WHERE id = ?", [$id]);
        
        $_SESSION['sucesso_msg'] = "Prazo excluído com sucesso!";
        header('Location: index.php');
        exit;
        
    } catch (Exception $e) {
        $erro = "Erro ao excluir: " . $e->getMessage();
    }
}
```

---

## 📊 REGRAS DE NEGÓCIO

### **1. Campos Obrigatórios:**
- **Nome**: Não pode estar vazio
- **Dias**: Deve ser informado (0 ou maior)
- **Parcelas**: Deve ser ≥ 1

### **2. Lógica de Intervalo:**

**Regra 1:** Se `parcelas = 1` → `intervalo_dias = NULL`
```php
if ($parcelas == 1) {
    $intervalo_dias = null;
}
```

**Regra 2:** Se `parcelas > 1` e `intervalo_dias` vazio → usar `dias` como intervalo (padrão mensal)
```php
if ($parcelas > 1 && empty($intervalo_dias)) {
    $intervalo_dias = $dias;  // Default: mesmo intervalo que primeira parcela
}
```

**Exemplo:**
```
Nome: "3x (30/60/90)"
Dias: 30
Parcelas: 3
Intervalo: (vazio)

→ Sistema preenche automaticamente: intervalo_dias = 30
```

### **3. Ordenação Inteligente:**
Lista ordenada por **dias** (crescente), mostrando:
1. À vista (0 dias)
2. Prazos curtos (7, 14, 21 dias)
3. Prazos médios (30, 45, 60 dias)
4. Prazos longos (90+ dias)
5. Parcelados (ordenados pelo primeiro vencimento)

### **4. Status Ativo/Inativo:**
- **Ativo (1)**: Aparece nos selects de pedidos de compras
- **Inativo (0)**: Não aparece, mas mantém histórico

### **5. Exclusão com Validação:**
- Verifica se está em uso em `pedidos_compras`
- Se estiver em uso → **Bloqueia exclusão**
- Sugestão: Desativar em vez de excluir

### **6. Vínculo por Texto:**
Como o vínculo é por **texto** (não FK), mesmo que o prazo seja excluído, os pedidos antigos mantêm o histórico.

---

## 🔄 INTEGRAÇÃO COM PEDIDOS DE COMPRAS

### **Como é Usado:**

**No cadastro/edição de Pedido de Compras:**

```html
<!-- Campo: Prazo de Pagamento -->
<select name="prazo_pagamento">
    <option value="">Selecione...</option>
    <?php foreach ($prazos_pagamento as $prazo): ?>
        <option value="<?php echo htmlspecialchars($prazo['nome']); ?>">
            <?php echo htmlspecialchars($prazo['nome']); ?>
            <?php 
            $parcelas = $prazo['parcelas'] ?? 1;
            if ($parcelas > 1) {
                echo " - {$parcelas}x";
            } elseif ($prazo['dias'] > 0) {
                echo " ({$prazo['dias']} dias)";
            }
            ?>
        </option>
    <?php endforeach; ?>
</select>
```

**Dropdown renderizado:**
```
Selecione...
À vista
7 dias (7 dias)
30 dias (30 dias)
2x (30/60 dias) - 2x
3x (30/60/90 dias) - 3x
6x (30 dias) - 6x
```

**Query para buscar prazos ativos:**
```sql
SELECT id, nome, dias, parcelas, intervalo_dias 
FROM prazos_pagamento 
WHERE ativo = 1 
ORDER BY parcelas ASC, dias ASC
```

**Salvamento no Pedido:**
```sql
INSERT INTO pedidos_compras (
    ...,
    prazo_pagamento,  -- Armazena o NOME (texto)
    ...
) VALUES (
    ...,
    '3x (30/60/90 dias)',  -- Texto completo
    ...
)
```

---

## 💡 EXEMPLOS DE CADASTRO

### **Exemplo 1: Pagamento Único Simples**

```
Nome: "45 dias"
Dias da 1ª Parcela: 45
Número de Parcelas: 1
Intervalo: (não preencher - campo oculto)
Descrição: "Pagamento único em 45 dias"
Ativo: ✓

Resultado no banco:
  nome = "45 dias"
  dias = 45
  parcelas = 1
  intervalo_dias = NULL
```

### **Exemplo 2: À Vista**

```
Nome: "À vista"
Dias da 1ª Parcela: 0
Número de Parcelas: 1
Intervalo: (não preencher)
Descrição: "Pagamento imediato"
Ativo: ✓

Resultado no banco:
  nome = "À vista"
  dias = 0
  parcelas = 1
  intervalo_dias = NULL
```

### **Exemplo 3: Parcelado Mensal**

```
Nome: "3x (30/60/90 dias)"
Dias da 1ª Parcela: 30
Número de Parcelas: 3
Intervalo entre Parcelas: 30
Descrição: "Pagamento em 3 parcelas mensais"
Ativo: ✓

Resultado no banco:
  nome = "3x (30/60/90 dias)"
  dias = 30
  parcelas = 3
  intervalo_dias = 30

Vencimentos calculados:
  1ª parcela: 30 + (0 × 30) = 30 dias
  2ª parcela: 30 + (1 × 30) = 60 dias
  3ª parcela: 30 + (2 × 30) = 90 dias
```

### **Exemplo 4: Parcelado Quinzenal**

```
Nome: "4x quinzenal (15/30/45/60)"
Dias da 1ª Parcela: 15
Número de Parcelas: 4
Intervalo entre Parcelas: 15
Descrição: "Pagamento em 4 parcelas quinzenais"
Ativo: ✓

Resultado no banco:
  nome = "4x quinzenal (15/30/45/60)"
  dias = 15
  parcelas = 4
  intervalo_dias = 15

Vencimentos calculados:
  1ª: 15 dias
  2ª: 30 dias
  3ª: 45 dias
  4ª: 60 dias
```

### **Exemplo 5: Parcelado Sem Intervalo Informado**

```
Nome: "2x (30/60)"
Dias da 1ª Parcela: 30
Número de Parcelas: 2
Intervalo entre Parcelas: (deixar vazio)
Ativo: ✓

Sistema preenche automaticamente:
  intervalo_dias = 30 (usa o valor de "dias")

Resultado:
  1ª: 30 dias
  2ª: 60 dias
```

---

## 📊 ESTRUTURA SQL PARA CRIAR A TABELA

```sql
-- Tabela Principal
CREATE TABLE `prazos_pagamento` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL,
  `dias` INT NULL COMMENT 'Número de dias (0 para à vista)',
  `parcelas` INT DEFAULT 1 COMMENT 'Número de parcelas (1 = único)',
  `intervalo_dias` INT NULL COMMENT 'Intervalo entre parcelas',
  `descricao` TEXT NULL,
  `ativo` TINYINT(1) DEFAULT 1,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `criado_por` INT NULL,
  INDEX `idx_ativo` (`ativo`),
  INDEX `idx_criado_por` (`criado_por`),
  INDEX `idx_parcelas` (`parcelas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados Padrão - Pagamentos Únicos
INSERT INTO `prazos_pagamento` (`nome`, `dias`, `parcelas`, `intervalo_dias`, `descricao`, `ativo`) VALUES
('À vista', 0, 1, NULL, 'Pagamento imediato', 1),
('7 dias', 7, 1, NULL, 'Pagamento em 7 dias', 1),
('14 dias', 14, 1, NULL, 'Pagamento em 14 dias', 1),
('21 dias', 21, 1, NULL, 'Pagamento em 21 dias', 1),
('28 dias', 28, 1, NULL, 'Pagamento em 28 dias', 1),
('30 dias', 30, 1, NULL, 'Pagamento em 30 dias', 1),
('45 dias', 45, 1, NULL, 'Pagamento em 45 dias', 1),
('60 dias', 60, 1, NULL, 'Pagamento em 60 dias', 1),
('90 dias', 90, 1, NULL, 'Pagamento em 90 dias', 1);

-- Dados Padrão - Pagamentos Parcelados
INSERT INTO `prazos_pagamento` (`nome`, `dias`, `parcelas`, `intervalo_dias`, `descricao`, `ativo`) VALUES
('2x (30/60 dias)', 30, 2, 30, 'Pagamento em 2 parcelas mensais', 1),
('3x (30/60/90 dias)', 30, 3, 30, 'Pagamento em 3 parcelas mensais', 1),
('4x (30/60/90/120 dias)', 30, 4, 30, 'Pagamento em 4 parcelas mensais', 1),
('2x (15/30 dias)', 15, 2, 15, 'Pagamento em 2 parcelas quinzenais', 1),
('3x (15/30/45 dias)', 15, 3, 15, 'Pagamento em 3 parcelas quinzenais', 1),
('6x (30 dias)', 30, 6, 30, 'Pagamento em 6 parcelas mensais', 1);
```

---

## ✅ RESUMO DAS FUNCIONALIDADES CRUD

| Funcionalidade | Arquivo | Método | Descrição |
|---------------|---------|--------|-----------|
| **Visualizar Lista** | `index.php` | GET | Lista todos os prazos com filtros |
| **Criar Prazo** | `cadastrar.php` | POST | Cria novo prazo (único ou parcelado) |
| **Editar Prazo** | `editar.php` | POST | Edita prazo existente |
| **Visualizar Detalhes** | `visualizar.php` | GET | Mostra detalhes + cálculo de vencimentos |
| **Excluir Prazo** | `excluir.php` | POST | Exclui (se não estiver em uso) |

---

## 🔄 INTEGRAÇÕES

### **1. Pedidos de Compras:**
```
prazos_pagamento (N) → pedidos_compras.prazo_pagamento (texto)
```
- Vínculo por **nome** (texto)
- Usado no dropdown ao criar/editar pedidos
- Permite digitação manual se não houver prazos cadastrados

### **2. Formas de Pagamento:**
```
Relação conceitual (não há FK):
  "Boleto Bancário" geralmente usado com "30 dias" ou "45 dias"
  "PIX" geralmente usado com "À vista"
```
- Sem vínculo direto no banco
- Usuário combina livremente forma + prazo

---

## 📋 CASOS DE USO PRÁTICOS

### **Caso 1: Cadastrar Prazo Parcelado**

```
Cenário: Fornecedor oferece 4x com vencimentos a cada 30 dias

Ação:
1. Acessar: Prazos de Pagamento → Novo Prazo
2. Preencher:
   - Nome: "4x (30/60/90/120 dias)"
   - Dias da 1ª Parcela: 30
   - Número de Parcelas: 4 ← Campo "Intervalo" aparece
   - Intervalo: 30
   - Descrição: "Pagamento em 4 parcelas mensais"
   - Ativo: ✓
3. Salvar

Resultado:
- Disponível em Pedidos de Compras
- Mostra "4x 🏷️" na listagem
- Vencimentos: 30d / 60d / 90d / 120d
```

### **Caso 2: Editar Prazo Existente**

```
Cenário: Prazo "30 dias" precisa mudar para "35 dias"

Ação:
1. Acessar: Prazos de Pagamento → Editar #6
2. Alterar:
   - Dias: 30 → 35
   - Nome: "30 dias" → "35 dias"
3. Salvar

Resultado:
- Prazo atualizado
- Pedidos NOVOS usarão "35 dias"
- Pedidos ANTIGOS mantêm "30 dias" (histórico)
```

### **Caso 3: Desativar Prazo Obsoleto**

```
Cenário: Empresa não oferece mais "90 dias"

Ação:
1. Acessar: Prazos de Pagamento → Editar #9
2. Desmarcar: "Prazo ativo"
3. Salvar

Resultado:
- Não aparece mais em novos pedidos
- Pedidos antigos com "90 dias" mantêm o histórico
- Pode reativar futuramente se necessário
```

### **Caso 4: Tentar Excluir Prazo em Uso**

```
Cenário: Tentar excluir "30 dias" que está em 50 pedidos

Ação:
1. Acessar: Prazos de Pagamento → Excluir #6
2. Clicar em "Confirmar Exclusão"

Sistema verifica:
  SELECT COUNT(*) FROM pedidos_compras WHERE prazo_pagamento = '30 dias'
  → Resultado: 50 pedidos

Resultado:
- ❌ ERRO: "Não é possível excluir este prazo pois está 
           sendo utilizado em 50 pedido(s)."
- Exclusão bloqueada
- Sugestão: Desativar
```

### **Caso 5: Prazo Semanal Personalizado**

```
Cenário: Criar parcelamento semanal (4 semanas)

Ação:
1. Novo Prazo
2. Preencher:
   - Nome: "4x semanal (7/14/21/28)"
   - Dias da 1ª Parcela: 7
   - Número de Parcelas: 4
   - Intervalo: 7
3. Salvar

Resultado:
  Vencimentos calculados:
  - 1ª: 7 dias
  - 2ª: 14 dias
  - 3ª: 21 dias
  - 4ª: 28 dias
```

---

## 🧮 CÁLCULOS E ALGORITMOS

### **Algoritmo de Cálculo de Vencimentos:**

```php
function calcularVencimentos($dias_inicial, $parcelas, $intervalo) {
    $vencimentos = [];
    
    for ($i = 0; $i < $parcelas; $i++) {
        $dias_vencimento = $dias_inicial + ($i * $intervalo);
        $vencimentos[] = $dias_vencimento;
    }
    
    return $vencimentos;
}

// Exemplo: calcularVencimentos(30, 3, 30)
// Retorna: [30, 60, 90]
```

### **Exemplo de Uso Real:**

```php
// Prazo: 6x (30/60/90/120/150/180)
$prazo = [
    'dias' => 30,
    'parcelas' => 6,
    'intervalo_dias' => 30
];

$vencimentos = [];
for ($i = 0; $i < $prazo['parcelas']; $i++) {
    $venc = $prazo['dias'] + ($i * $prazo['intervalo_dias']);
    $vencimentos[] = $venc . ' dias';
}

echo implode(' | ', $vencimentos);
// Output: "30 dias | 60 dias | 90 dias | 120 dias | 150 dias | 180 dias"
```

---

## 📊 QUERY ÚTEIS

### **1. Listar Prazos Ativos (Para Pedidos):**
```sql
SELECT id, nome, dias, parcelas, intervalo_dias 
FROM prazos_pagamento 
WHERE ativo = 1 
ORDER BY parcelas ASC, dias ASC
```

### **2. Verificar se Está em Uso:**
```sql
SELECT COUNT(*) as total 
FROM pedidos_compras 
WHERE prazo_pagamento = '3x (30/60/90 dias)'
```

### **3. Buscar com Filtros:**
```sql
SELECT * FROM prazos_pagamento 
WHERE ativo = 1 
  AND (nome LIKE '%30%' OR descricao LIKE '%30%')
ORDER BY dias ASC
```

### **4. Listar Apenas Parcelados:**
```sql
SELECT * FROM prazos_pagamento 
WHERE parcelas > 1 
  AND ativo = 1
ORDER BY parcelas ASC, dias ASC
```

### **5. Estatística de Uso:**
```sql
-- Quantos pedidos usam cada prazo
SELECT 
    pp.nome,
    pp.parcelas,
    COUNT(pc.id) as total_pedidos,
    SUM(pc.valor_total) as valor_total_pedidos
FROM prazos_pagamento pp
LEFT JOIN pedidos_compras pc ON pc.prazo_pagamento = pp.nome
GROUP BY pp.id, pp.nome, pp.parcelas
ORDER BY total_pedidos DESC
```

---

## 🎨 OBSERVAÇÕES SOBRE A INTERFACE

### **Características Especiais:**

**1. Campo Dinâmico (Intervalo):**
```javascript
// Campo "Intervalo" só aparece quando Parcelas > 1
if (parcelas > 1) {
    intervaloGroup.style.display = 'block';
} else {
    intervaloGroup.style.display = 'none';
}
```

**2. Badge de Parcelas:**
```html
<!-- Na listagem -->
<span class="badge badge-info">
    3x 🏷️  <!-- Ícone de tag para parcelados -->
</span>

<!-- Para pagamento único -->
<span class="badge badge-info">
    1x
</span>
```

**3. Exibição Inteligente de Vencimentos:**
```php
// Se tiver mais de 3 parcelas, mostra "..."
if ($parcelas <= 3) {
    echo "30d / 60d / 90d";
} else {
    echo "30d / 60d / 90d ...";  // Indica que há mais
}
```

---

## 🔐 SEGURANÇA E VALIDAÇÕES

### **Segurança:**
- ✅ Verificação de login obrigatória
- ✅ Verificação de timeout de sessão
- ✅ Prepared Statements (PDO)
- ✅ `htmlspecialchars()` para proteção XSS
- ✅ Exclusão via POST (não GET)

### **Validações:**

**Cadastro/Edição:**
```php
// 1. Nome obrigatório
if (empty($nome)) {
    throw new Exception("Nome é obrigatório");
}

// 2. Dias obrigatório
if ($dias === '') {
    throw new Exception("Dias é obrigatório");
}

// 3. Parcelas ≥ 1
if ($parcelas < 1) {
    throw new Exception("Parcelas deve ser >= 1");
}

// 4. Validação lógica de intervalo
if ($parcelas == 1) {
    $intervalo_dias = null;  // Não faz sentido ter intervalo
}
```

**Exclusão:**
```php
// Verifica uso em pedidos
if ($em_uso['total'] > 0) {
    throw new Exception("Em uso em {$total} pedido(s)");
}
```

---

## 📊 DIFERENÇAS EM RELAÇÃO A "FORMAS DE PAGAMENTO"

| Aspecto | Formas de Pagamento | Prazos de Pagamento |
|---------|---------------------|---------------------|
| **Propósito** | COMO pagar (Boleto, PIX) | QUANDO pagar (30 dias, 3x) |
| **Campos Principais** | nome, descricao | nome, dias, parcelas, intervalo |
| **Complexidade** | Simples (2 campos) | Média (4 campos + cálculo) |
| **Parcelamento** | Não | ✅ Sim |
| **Cálculo Dinâmico** | Não | ✅ Sim (vencimentos) |
| **JavaScript** | Não | ✅ Sim (toggle campo) |

---

## 💡 BOAS PRÁTICAS

### **1. Nomenclatura Clara:**
```
✅ Bom: "3x (30/60/90 dias)", "À vista", "45 dias"
❌ Ruim: "3x", "prazo1", "p30"
```

### **2. Descrição Informativa:**
```
✅ Bom: "Pagamento em 3 parcelas mensais com vencimentos aos 30, 60 e 90 dias"
❌ Ruim: "Parcelado" (vago)
```

### **3. Desativar em Vez de Excluir:**
```
❌ Evitar: Excluir prazos antigos
✅ Preferir: Desativar (ativo = 0)
```

### **4. Intervalos Padronizados:**
```
✅ Padrão: 7 (semanal), 15 (quinzenal), 30 (mensal)
❌ Evitar: Intervalos irregulares (23 dias, 37 dias)
```

---

## 📊 EXEMPLO COMPLETO DE FLUXO

### **Fluxo: Cadastrar Prazo Parcelado**

```
1. Usuário acessa:
   http://localhost:8080/nexflow/modulos/suprimentos/prazos_pagamento/

2. Clica em: "Novo Prazo"

3. Preenche formulário:
   - Nome: "5x (28/56/84/112/140)"
   - Dias da 1ª Parcela: 28
   - Número de Parcelas: 5 ← Campo "Intervalo" aparece automaticamente
   - Intervalo entre Parcelas: 28
   - Descrição: "Pagamento em 5 parcelas a cada 28 dias"
   - Ativo: ✓

4. Clica em: "Salvar Prazo"

5. Sistema:
   INSERT INTO prazos_pagamento (
       nome, dias, parcelas, intervalo_dias, descricao, ativo, criado_por
   ) VALUES (
       '5x (28/56/84/112/140)', 28, 5, 28, '...', 1, 1
   )
   
   Retorna ID: 16

6. Redireciona para: visualizar.php?id=16

7. Página mostra:
   ✅ Prazo cadastrado com sucesso!
   
   📅 Nome: 5x (28/56/84/112/140)
   🕐 Dias (1ª Parcela): 28 dias
   📋 Parcelas: 5x (Parcelado)
   📆 Intervalo: 28 dias
   ✅ Vencimentos: 28 dias | 56 dias | 84 dias | 112 dias | 140 dias
   
   [✏️ Editar] [🗑️ Excluir] [⬅️ Voltar]

8. Ao criar um Pedido de Compras:
   Dropdown "Prazo de Pagamento" mostra:
   - ...
   - 3x (30/60/90 dias) - 3x
   - 4x (30/60/90/120 dias) - 4x
   - 5x (28/56/84/112/140) - 5x  ← Nova opção
   - ...
```

---

## 🎯 CASOS ESPECIAIS

### **Caso 1: À Vista (0 dias)**
```
Nome: "À vista"
Dias: 0
Parcelas: 1
Intervalo: NULL

→ Pagamento imediato no ato da compra
```

### **Caso 2: Parcelado Irregular**
```
Nome: "3x (15/45/90)"
Dias: 15
Parcelas: 3
Intervalo: 30 (não 15!)

Vencimentos:
  1ª: 15 dias
  2ª: 15 + 30 = 45 dias
  3ª: 15 + 60 = 75 dias ← Não seria 90!

OBSERVAÇÃO: Para vencimentos irregulares, 
considere cadastrar como "3x irregular" 
e detalhar na descrição.
```

### **Caso 3: Entrada + Parcelas**
```
Nome: "Entrada + 2x (30/60)"
Dias: 0 (entrada à vista)
Parcelas: 3 (entrada + 2 parcelas)
Intervalo: 30

Vencimentos:
  1ª (entrada): 0 dias (à vista)
  2ª: 30 dias
  3ª: 60 dias
```

---

## 📊 ATUALIZAÇÃO PARA SUPORTAR PARCELAMENTO

Se a tabela foi criada antes da funcionalidade de parcelamento:

### **Script de Atualização:**
```sql
-- Adicionar colunas
ALTER TABLE `prazos_pagamento` 
ADD COLUMN `parcelas` INT DEFAULT 1 AFTER `dias`,
ADD COLUMN `intervalo_dias` INT NULL AFTER `parcelas`;

-- Atualizar existentes
UPDATE `prazos_pagamento` SET `parcelas` = 1 WHERE `parcelas` IS NULL;

-- Criar índice
CREATE INDEX `idx_parcelas` ON `prazos_pagamento` (`parcelas`);
```

**Arquivo:** `sql/atualizar_prazos_pagamento_parcelado.sql`

---

## ✅ RESUMO EXECUTIVO

**Módulo:** Prazos de Pagamento  
**Complexidade:** ⭐⭐⭐☆☆ (Média - Tem cálculos de parcelamento)  
**Tabelas:** 1 (`prazos_pagamento`)  
**Relacionamentos:** Vínculo indireto com `pedidos_compras` (por texto)  
**CRUD:** Completo (Create, Read, Update, Delete)  
**Validações:** Exclusão verificada contra uso em pedidos  
**Status:** Ativo/Inativo para controle de disponibilidade  

**Características Especiais:**
- ✅ **Suporte a parcelamento** (1 até 12 parcelas)
- ✅ **Cálculo automático** de vencimentos
- ✅ **Interface dinâmica** (campo intervalo condicional)
- ✅ **15 prazos pré-cadastrados** (9 únicos + 6 parcelados)
- ✅ Vínculo por texto para preservar histórico

**Uso Principal:** Padronizar prazos de pagamento usados em **Pedidos de Compras**.

**Fórmula de Vencimentos:**
```
vencimento[i] = dias_inicial + (i × intervalo_dias)
```

---

**Essa é a estrutura completa do módulo de Prazos de Pagamento!** 🚀
## 🎯 OBJETIVO DO SISTEMA

Sistema para gerenciar **Prazos de Pagamento** disponíveis no sistema Nexflow. Permite cadastrar diferentes prazos (À vista, 30 dias, parcelamentos, etc.) que são utilizados no módulo de **Pedidos de Compras**. Suporta tanto **pagamentos únicos** quanto **parcelamentos** com intervalos configuráveis.

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabela: `prazos_pagamento`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT AUTO_INCREMENT | ID único do prazo |
| `nome` | VARCHAR(100) NOT NULL | Nome do prazo (ex: "30 dias", "3x (30/60/90)") |
| `dias` | INT | **Dias da 1ª parcela** (0 = à vista, 30 = vence em 30 dias) |
| `parcelas` | INT DEFAULT 1 | **Número de parcelas** (1 = pagamento único, 2+ = parcelado) |
| `intervalo_dias` | INT NULL | **Intervalo entre parcelas** (ex: 30 para mensal, 15 para quinzenal) |
| `descricao` | TEXT | Descrição detalhada do prazo (opcional) |
| `ativo` | TINYINT(1) DEFAULT 1 | 1 = Ativo (disponível para uso), 0 = Inativo |
| `criado_em` | TIMESTAMP | Data/hora de criação do registro |
| `atualizado_em` | TIMESTAMP | Data/hora da última atualização (auto-atualizado) |
| `criado_por` | INT | ID do usuário que criou o registro |

**Índices:**
- `idx_ativo` (ativo) - Para filtrar apenas prazos ativos
- `idx_criado_por` (criado_por) - Para rastreabilidade
- `idx_parcelas` (parcelas) - Para ordenação e filtros

**Constraints:**
- `nome` NOT NULL - Nome é obrigatório
- `dias` NOT NULL - Número de dias é obrigatório
- `parcelas` DEFAULT 1 - Padrão é pagamento único
- `ativo` DEFAULT 1 - Por padrão, prazos são criados ativos

---

## 📊 DADOS PRÉ-CADASTRADOS

Ao instalar o módulo, são criados automaticamente:

### **Pagamentos Únicos (9 registros):**

| ID | Nome | Dias | Parcelas | Intervalo | Descrição | Ativo |
|----|------|------|----------|-----------|-----------|-------|
| 1 | À vista | 0 | 1 | NULL | Pagamento imediato | ✅ |
| 2 | 7 dias | 7 | 1 | NULL | Pagamento em 7 dias | ✅ |
| 3 | 14 dias | 14 | 1 | NULL | Pagamento em 14 dias | ✅ |
| 4 | 21 dias | 21 | 1 | NULL | Pagamento em 21 dias | ✅ |
| 5 | 28 dias | 28 | 1 | NULL | Pagamento em 28 dias | ✅ |
| 6 | 30 dias | 30 | 1 | NULL | Pagamento em 30 dias | ✅ |
| 7 | 45 dias | 45 | 1 | NULL | Pagamento em 45 dias | ✅ |
| 8 | 60 dias | 60 | 1 | NULL | Pagamento em 60 dias | ✅ |
| 9 | 90 dias | 90 | 1 | NULL | Pagamento em 90 dias | ✅ |

### **Pagamentos Parcelados (6 registros):**

| ID | Nome | Dias | Parcelas | Intervalo | Vencimentos Calculados | Ativo |
|----|------|------|----------|-----------|------------------------|-------|
| 10 | 2x (30/60 dias) | 30 | 2 | 30 | 30d, 60d | ✅ |
| 11 | 3x (30/60/90 dias) | 30 | 3 | 30 | 30d, 60d, 90d | ✅ |
| 12 | 4x (30/60/90/120 dias) | 30 | 4 | 30 | 30d, 60d, 90d, 120d | ✅ |
| 13 | 2x (15/30 dias) | 15 | 2 | 15 | 15d, 30d | ✅ |
| 14 | 3x (15/30/45 dias) | 15 | 3 | 15 | 15d, 30d, 45d | ✅ |
| 15 | 6x (30 dias) | 30 | 6 | 30 | 30d, 60d, 90d, 120d, 150d, 180d | ✅ |

---

## 🧮 CÁLCULO DE VENCIMENTOS (PARCELADO)

### **Fórmula:**

```
Para cada parcela i (de 0 até parcelas-1):
    vencimento[i] = dias + (i × intervalo_dias)
```

### **Exemplo: 3x (30/60/90 dias)**

```
dias = 30
parcelas = 3
intervalo_dias = 30

Parcela 0 (1ª): 30 + (0 × 30) = 30 dias
Parcela 1 (2ª): 30 + (1 × 30) = 60 dias
Parcela 2 (3ª): 30 + (2 × 30) = 90 dias
```

### **Exemplo: 4x Quinzenal**

```
dias = 15
parcelas = 4
intervalo_dias = 15

Parcela 0: 15 + (0 × 15) = 15 dias
Parcela 1: 15 + (1 × 15) = 30 dias
Parcela 2: 15 + (2 × 15) = 45 dias
Parcela 3: 15 + (3 × 15) = 60 dias
```

---

## 🔗 RELACIONAMENTOS E VÍNCULOS

### **Integração com Pedidos de Compras:**

```
prazos_pagamento (N) → pedidos_compras.prazo_pagamento (texto)
```

**Importante:** O vínculo é **por nome (texto)**, não por ID (FK).

**Motivo:** Permite que o pedido mantenha o histórico mesmo se o prazo for excluído.

**Exemplo:**
```sql
-- Pedido de Compras
pedidos_compras:
  numero_pedido: PC000001
  forma_pagamento: "Boleto Bancário"
  prazo_pagamento: "3x (30/60/90 dias)"  ← Texto, não FK
```

### **Verificação de Uso:**

Antes de excluir um prazo, o sistema verifica:
```sql
SELECT COUNT(*) as total 
FROM pedidos_compras 
WHERE prazo_pagamento = '3x (30/60/90 dias)'
```

Se `total > 0` → **Não permite excluir** (está em uso)

---

## 📁 ARQUIVOS DO SISTEMA

### **Arquivos Principais:**

1. **`index.php`** - Listagem com filtros (READ)
2. **`cadastrar.php`** - Cadastro de prazo (CREATE)
3. **`editar.php`** - Edição de prazo (UPDATE)
4. **`visualizar.php`** - Visualização de detalhes com cálculo de vencimentos (READ)
5. **`excluir.php`** - Exclusão com validação (DELETE)
6. **`instalar_tabela.php`** - Script de instalação
7. **`atualizar_parcelamento.php`** - Atualização para suportar parcelamento

---

## ⚙️ FUNCIONALIDADES DETALHADAS

### **1. VISUALIZAR / LISTAR (`index.php`)**

#### **O que faz:**
Lista todos os prazos de pagamento cadastrados com filtros de busca e status.

#### **Filtros Disponíveis:**
- **Busca** (text): Busca por nome ou descrição
- **Status** (select):
  - Todos
  - Ativos
  - Inativos

#### **Consulta SQL:**
```sql
SELECT * FROM prazos_pagamento 
WHERE [filtros dinâmicos]
ORDER BY dias ASC  -- Ordenado por dias (crescente)
```

**Ordenação:** Prazos mais curtos primeiro (À vista → 7 dias → 30 dias → 90 dias → parcelados)

#### **Tabela de Listagem:**

| # | Nome | Parcelas | Vencimentos | Descrição | Status | Ações |
|---|------|----------|-------------|-----------|--------|-------|
| 1 | À vista | **1x** | **À vista** | Pagamento imediato | ✅ Ativo | 👁️ ✏️ 🗑️ |
| 6 | 30 dias | **1x** | **30 dias** | Pagamento em 30 dias | ✅ Ativo | 👁️ ✏️ 🗑️ |
| 11 | 3x (30/60/90 dias) | **3x** 🏷️ | **30d / 60d / 90d** | Pagamento parcelado | ✅ Ativo | 👁️ ✏️ 🗑️ |
| 15 | 6x (30 dias) | **6x** 🏷️ | **30d / 60d / 90d ...** | 6 parcelas mensais | ✅ Ativo | 👁️ ✏️ 🗑️ |

**Coluna "Parcelas":**
```php
$parcelas = $prazo['parcelas'] ?? 1;
echo $parcelas . 'x';
if ($parcelas > 1) {
    echo ' <i class="fas fa-tags"></i>';  // Ícone indicando parcelamento
}

// Resultado: "1x" ou "3x 🏷️"
```

**Coluna "Vencimentos":**
```php
$parcelas = $prazo['parcelas'] ?? 1;
$dias_inicial = $prazo['dias'];
$intervalo = $prazo['intervalo_dias'] ?? 0;

if ($dias_inicial == 0) {
    echo 'À vista';
} elseif ($parcelas == 1) {
    echo $dias_inicial . ' dias';
} else {
    // Parcelado - mostrar até 3 vencimentos
    $vencimentos = [];
    for ($i = 0; $i < min($parcelas, 3); $i++) {
        $vencimentos[] = ($dias_inicial + ($i * $intervalo)) . 'd';
    }
    echo implode(' / ', $vencimentos);
    if ($parcelas > 3) echo ' ...';  // Indicar que há mais
}

// Resultados:
// - "À vista"
// - "30 dias"
// - "30d / 60d / 90d"
// - "30d / 60d / 90d ..." (para 6x)
```

#### **Ações por Registro:**
- 👁️ **Visualizar** → `visualizar.php?id={id}`
- ✏️ **Editar** → `editar.php?id={id}`
- 🗑️ **Excluir** → `excluir.php?id={id}` com confirmação

---

### **2. CADASTRAR (`cadastrar.php`)**

#### **O que faz:**
Cria um novo prazo de pagamento no sistema.

#### **Campos do Formulário:**

1. **Nome do Prazo** (text, obrigatório)
   - Placeholder: "Ex: 30 dias, À vista"
   - Para parcelado: "3x (30/60/90 dias)"

2. **Dias da 1ª Parcela** (number, obrigatório)
   - Min: 0 (à vista)
   - Placeholder: "Ex: 30"
   - Hint: "Dias até o vencimento (0 para à vista)"

3. **Número de Parcelas** (number, obrigatório)
   - Min: 1
   - Max: 12
   - Default: 1
   - Hint: "1 = pagamento único, 2+ = parcelado"
   - **onChange**: Dispara JavaScript para mostrar/ocultar campo "Intervalo"

4. **Intervalo entre Parcelas (dias)** (number, condicional)
   - **Só aparece se Parcelas > 1**
   - Min: 1
   - Placeholder: "Ex: 30 para mensal"
   - Hint: "Ex: 30 dias para parcelas mensais, 15 para quinzenais"

5. **Descrição** (textarea, opcional)
   - Placeholder: "Descreva os detalhes deste prazo"

6. **Prazo ativo** (checkbox)
   - Marcado por padrão
   - Se desmarcado: prazo fica inativo

#### **JavaScript - Toggle Campo Intervalo:**

```javascript
function toggleIntervalo() {
    const parcelas = document.getElementById('parcelas').value;
    const intervaloGroup = document.getElementById('intervaloGroup');
    
    if (parcelas > 1) {
        intervaloGroup.style.display = 'block';  // Mostrar
    } else {
        intervaloGroup.style.display = 'none';   // Ocultar
        document.getElementById('intervalo_dias').value = '';  // Limpar
    }
}

// Executar ao mudar número de parcelas
document.getElementById('parcelas').addEventListener('change', toggleIntervalo);

// Executar ao carregar página
document.addEventListener('DOMContentLoaded', toggleIntervalo);
```

#### **Processamento do Formulário (POST):**

```php
// 1. Receber dados
$nome = trim($_POST['nome'] ?? '');
$dias = $_POST['dias'] ?? '';
$parcelas = $_POST['parcelas'] ?? 1;
$intervalo_dias = $_POST['intervalo_dias'] ?? null;
$descricao = trim($_POST['descricao'] ?? '');
$ativo = isset($_POST['ativo']) ? 1 : 0;

// 2. Lógica de Intervalo
// Se parcelas > 1 e não tem intervalo, usar os dias como intervalo (padrão mensal)
if ($parcelas > 1 && empty($intervalo_dias)) {
    $intervalo_dias = $dias;
}

// Se parcelas = 1, intervalo deve ser NULL (não faz sentido)
if ($parcelas == 1) {
    $intervalo_dias = null;
}

// 3. Validações
if (empty($nome)) {
    throw new Exception("O nome do prazo é obrigatório.");
}

if ($dias === '') {
    throw new Exception("O número de dias é obrigatório.");
}

if ($parcelas < 1) {
    throw new Exception("O número de parcelas deve ser pelo menos 1.");
}

// 4. Inserir no banco
$id = insert("
    INSERT INTO prazos_pagamento (nome, dias, parcelas, intervalo_dias, descricao, ativo, criado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?)
", [$nome, $dias, $parcelas, $intervalo_dias, $descricao, $ativo, $usuario_id]);

// 5. Redirecionar para visualização
$_SESSION['sucesso_msg'] = "Prazo cadastrado com sucesso!";
header("Location: visualizar.php?id=$id");
exit;
```

**Validações:**
- Nome não pode estar vazio
- Dias não pode estar vazio
- Parcelas deve ser ≥ 1
- Se parcelas > 1, intervalo é recomendado (mas não obrigatório)

---

### **3. EDITAR (`editar.php`)**

#### **O que faz:**
Permite editar um prazo de pagamento existente.

**Parâmetros:** `?id={id_do_prazo}`

#### **Carregamento de Dados:**
```php
$prazo = fetchOne("SELECT * FROM prazos_pagamento WHERE id = ?", [$id]);

if (!$prazo) {
    $_SESSION['erro_msg'] = "Prazo não encontrado.";
    header('Location: index.php');
    exit;
}
```

#### **Campos do Formulário:**
Mesmos campos do cadastro, mas **pré-preenchidos**:

```html
<input type="text" name="nome" value="<?php echo htmlspecialchars($prazo['nome']); ?>" required>

<input type="number" name="dias" value="<?php echo htmlspecialchars($prazo['dias']); ?>" required>

<input type="number" name="parcelas" value="<?php echo htmlspecialchars($prazo['parcelas'] ?? 1); ?>" onchange="toggleIntervalo()">

<!-- Campo intervalo - visibilidade condicional baseado em parcelas -->
<div id="intervaloGroup" style="display: <?php echo (($prazo['parcelas'] ?? 1) > 1) ? 'block' : 'none'; ?>;">
    <input type="number" name="intervalo_dias" value="<?php echo htmlspecialchars($prazo['intervalo_dias'] ?? ''); ?>">
</div>

<textarea name="descricao"><?php echo htmlspecialchars($prazo['descricao'] ?? ''); ?></textarea>

<input type="checkbox" name="ativo" <?php echo $prazo['ativo'] == 1 ? 'checked' : ''; ?>>
```

#### **Processamento da Edição (POST):**

```php
// 1. Receber dados
$nome = trim($_POST['nome'] ?? '');
$dias = $_POST['dias'] ?? '';
$parcelas = $_POST['parcelas'] ?? 1;
$intervalo_dias = $_POST['intervalo_dias'] ?? null;
$descricao = trim($_POST['descricao'] ?? '');
$ativo = isset($_POST['ativo']) ? 1 : 0;

// 2. Lógica de Intervalo (mesma do cadastro)
if ($parcelas > 1 && empty($intervalo_dias)) {
    $intervalo_dias = $dias;
}

if ($parcelas == 1) {
    $intervalo_dias = null;
}

// 3. Validações (mesmas do cadastro)

// 4. Atualizar no banco
executeQuery("
    UPDATE prazos_pagamento 
    SET nome = ?, dias = ?, parcelas = ?, intervalo_dias = ?, descricao = ?, ativo = ?
    WHERE id = ?
", [$nome, $dias, $parcelas, $intervalo_dias, $descricao, $ativo, $id]);

// 5. Redirecionar
$_SESSION['sucesso_msg'] = "Prazo atualizado com sucesso!";
header("Location: visualizar.php?id=$id");
exit;
```

**Botões de Ação:**
- 💾 **Salvar Alterações** → Salva e vai para `visualizar.php`
- ❌ **Cancelar** → Volta para `visualizar.php` sem salvar

---

### **4. VISUALIZAR (`visualizar.php`)**

#### **O que faz:**
Exibe os detalhes completos de um prazo de pagamento, incluindo **cálculo e exibição de todos os vencimentos** (para parcelados).

**Parâmetros:** `?id={id_do_prazo}`

#### **Consulta SQL:**
```sql
SELECT * FROM prazos_pagamento WHERE id = ?
```

#### **Seções Exibidas:**

**1. Informações do Prazo:**

| Campo | Valor Exemplo |
|-------|---------------|
| 🔢 ID | 11 |
| 📅 Nome | **3x (30/60/90 dias)** |
| 🕐 Dias (1ª Parcela) | 30 dias |
| 📋 Parcelas | **3x** (Parcelado) |
| 📆 Intervalo entre Parcelas | 30 dias |
| ✅ Vencimentos | **30 dias \| 60 dias \| 90 dias** |
| ✅ Status | ✅ Ativo |
| 📝 Descrição | Pagamento em 3 parcelas mensais |

**Cálculo de Vencimentos (PHP):**
```php
<?php if (($prazo['parcelas'] ?? 1) > 1 && !empty($prazo['intervalo_dias'])): ?>
    <div class="info-item" style="grid-column: 1 / -1;">
        <span class="info-label">
            <i class="fas fa-calendar-check"></i> Vencimentos
        </span>
        <span class="info-value">
            <?php 
            $vencimentos = [];
            for ($i = 0; $i < $prazo['parcelas']; $i++) {
                $dias_venc = $prazo['dias'] + ($i * $prazo['intervalo_dias']);
                $vencimentos[] = $dias_venc . ' dias';
            }
            echo implode(' | ', $vencimentos);
            
            // Resultado: "30 dias | 60 dias | 90 dias"
            ?>
        </span>
    </div>
<?php endif; ?>
```

**2. Informações do Sistema:**
- 📅 Criado em: DD/MM/YYYY HH:MM
- ✏️ Atualizado em: DD/MM/YYYY HH:MM (se foi alterado)

#### **Botões de Ação:**
- ✏️ **Editar** → `editar.php?id={id}`
- 🗑️ **Excluir** → `excluir.php?id={id}` com confirmação
- ⬅️ **Voltar** → `index.php`

---

### **5. EXCLUIR (`excluir.php`)**

#### **O que faz:**
Página de confirmação para excluir um prazo de pagamento.

**Parâmetros:** `?id={id_do_prazo}`

#### **Verificação de Uso (ANTES de Excluir):**

```php
// Verificar se está em uso em pedidos de compras
$em_uso = fetchOne("
    SELECT COUNT(*) as total 
    FROM pedidos_compras 
    WHERE prazo_pagamento = ?
", [$prazo['nome']]);

if ($em_uso && $em_uso['total'] > 0) {
    $erro = "Não é possível excluir este prazo pois está sendo utilizado em {$em_uso['total']} pedido(s).";
    // Bloqueia exclusão
}
```

**Regra de Negócio:**
- ✅ Pode excluir: Se não estiver vinculado a nenhum pedido
- ❌ Não pode excluir: Se estiver em uso em qualquer pedido

**Alternativa:** Desativar em vez de excluir.

#### **Tela de Confirmação:**

```
⚠️ Atenção! Esta ação não pode ser desfeita.

┌─────────────────────────────────────────┐
│ # ID: 11                                │
│ 📅 Nome: 3x (30/60/90 dias)             │
│ 🕐 Dias: 30 dias                        │
└─────────────────────────────────────────┘

[🗑️ Confirmar Exclusão]  [❌ Cancelar]
```

#### **Processamento da Exclusão (POST):**

```php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Verificar uso
        $em_uso = fetchOne("SELECT COUNT(*) as total FROM pedidos_compras WHERE prazo_pagamento = ?", [$prazo['nome']]);
        
        if ($em_uso['total'] > 0) {
            throw new Exception("Está em uso em {$em_uso['total']} pedido(s).");
        }
        
        // Excluir
        executeQuery("DELETE FROM prazos_pagamento WHERE id = ?", [$id]);
        
        $_SESSION['sucesso_msg'] = "Prazo excluído com sucesso!";
        header('Location: index.php');
        exit;
        
    } catch (Exception $e) {
        $erro = "Erro ao excluir: " . $e->getMessage();
    }
}
```

---

## 📊 REGRAS DE NEGÓCIO

### **1. Campos Obrigatórios:**
- **Nome**: Não pode estar vazio
- **Dias**: Deve ser informado (0 ou maior)
- **Parcelas**: Deve ser ≥ 1

### **2. Lógica de Intervalo:**

**Regra 1:** Se `parcelas = 1` → `intervalo_dias = NULL`
```php
if ($parcelas == 1) {
    $intervalo_dias = null;
}
```

**Regra 2:** Se `parcelas > 1` e `intervalo_dias` vazio → usar `dias` como intervalo (padrão mensal)
```php
if ($parcelas > 1 && empty($intervalo_dias)) {
    $intervalo_dias = $dias;  // Default: mesmo intervalo que primeira parcela
}
```

**Exemplo:**
```
Nome: "3x (30/60/90)"
Dias: 30
Parcelas: 3
Intervalo: (vazio)

→ Sistema preenche automaticamente: intervalo_dias = 30
```

### **3. Ordenação Inteligente:**
Lista ordenada por **dias** (crescente), mostrando:
1. À vista (0 dias)
2. Prazos curtos (7, 14, 21 dias)
3. Prazos médios (30, 45, 60 dias)
4. Prazos longos (90+ dias)
5. Parcelados (ordenados pelo primeiro vencimento)

### **4. Status Ativo/Inativo:**
- **Ativo (1)**: Aparece nos selects de pedidos de compras
- **Inativo (0)**: Não aparece, mas mantém histórico

### **5. Exclusão com Validação:**
- Verifica se está em uso em `pedidos_compras`
- Se estiver em uso → **Bloqueia exclusão**
- Sugestão: Desativar em vez de excluir

### **6. Vínculo por Texto:**
Como o vínculo é por **texto** (não FK), mesmo que o prazo seja excluído, os pedidos antigos mantêm o histórico.

---

## 🔄 INTEGRAÇÃO COM PEDIDOS DE COMPRAS

### **Como é Usado:**

**No cadastro/edição de Pedido de Compras:**

```html
<!-- Campo: Prazo de Pagamento -->
<select name="prazo_pagamento">
    <option value="">Selecione...</option>
    <?php foreach ($prazos_pagamento as $prazo): ?>
        <option value="<?php echo htmlspecialchars($prazo['nome']); ?>">
            <?php echo htmlspecialchars($prazo['nome']); ?>
            <?php 
            $parcelas = $prazo['parcelas'] ?? 1;
            if ($parcelas > 1) {
                echo " - {$parcelas}x";
            } elseif ($prazo['dias'] > 0) {
                echo " ({$prazo['dias']} dias)";
            }
            ?>
        </option>
    <?php endforeach; ?>
</select>
```

**Dropdown renderizado:**
```
Selecione...
À vista
7 dias (7 dias)
30 dias (30 dias)
2x (30/60 dias) - 2x
3x (30/60/90 dias) - 3x
6x (30 dias) - 6x
```

**Query para buscar prazos ativos:**
```sql
SELECT id, nome, dias, parcelas, intervalo_dias 
FROM prazos_pagamento 
WHERE ativo = 1 
ORDER BY parcelas ASC, dias ASC
```

**Salvamento no Pedido:**
```sql
INSERT INTO pedidos_compras (
    ...,
    prazo_pagamento,  -- Armazena o NOME (texto)
    ...
) VALUES (
    ...,
    '3x (30/60/90 dias)',  -- Texto completo
    ...
)
```

---

## 💡 EXEMPLOS DE CADASTRO

### **Exemplo 1: Pagamento Único Simples**

```
Nome: "45 dias"
Dias da 1ª Parcela: 45
Número de Parcelas: 1
Intervalo: (não preencher - campo oculto)
Descrição: "Pagamento único em 45 dias"
Ativo: ✓

Resultado no banco:
  nome = "45 dias"
  dias = 45
  parcelas = 1
  intervalo_dias = NULL
```

### **Exemplo 2: À Vista**

```
Nome: "À vista"
Dias da 1ª Parcela: 0
Número de Parcelas: 1
Intervalo: (não preencher)
Descrição: "Pagamento imediato"
Ativo: ✓

Resultado no banco:
  nome = "À vista"
  dias = 0
  parcelas = 1
  intervalo_dias = NULL
```

### **Exemplo 3: Parcelado Mensal**

```
Nome: "3x (30/60/90 dias)"
Dias da 1ª Parcela: 30
Número de Parcelas: 3
Intervalo entre Parcelas: 30
Descrição: "Pagamento em 3 parcelas mensais"
Ativo: ✓

Resultado no banco:
  nome = "3x (30/60/90 dias)"
  dias = 30
  parcelas = 3
  intervalo_dias = 30

Vencimentos calculados:
  1ª parcela: 30 + (0 × 30) = 30 dias
  2ª parcela: 30 + (1 × 30) = 60 dias
  3ª parcela: 30 + (2 × 30) = 90 dias
```

### **Exemplo 4: Parcelado Quinzenal**

```
Nome: "4x quinzenal (15/30/45/60)"
Dias da 1ª Parcela: 15
Número de Parcelas: 4
Intervalo entre Parcelas: 15
Descrição: "Pagamento em 4 parcelas quinzenais"
Ativo: ✓

Resultado no banco:
  nome = "4x quinzenal (15/30/45/60)"
  dias = 15
  parcelas = 4
  intervalo_dias = 15

Vencimentos calculados:
  1ª: 15 dias
  2ª: 30 dias
  3ª: 45 dias
  4ª: 60 dias
```

### **Exemplo 5: Parcelado Sem Intervalo Informado**

```
Nome: "2x (30/60)"
Dias da 1ª Parcela: 30
Número de Parcelas: 2
Intervalo entre Parcelas: (deixar vazio)
Ativo: ✓

Sistema preenche automaticamente:
  intervalo_dias = 30 (usa o valor de "dias")

Resultado:
  1ª: 30 dias
  2ª: 60 dias
```

---

## 📊 ESTRUTURA SQL PARA CRIAR A TABELA

```sql
-- Tabela Principal
CREATE TABLE `prazos_pagamento` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL,
  `dias` INT NULL COMMENT 'Número de dias (0 para à vista)',
  `parcelas` INT DEFAULT 1 COMMENT 'Número de parcelas (1 = único)',
  `intervalo_dias` INT NULL COMMENT 'Intervalo entre parcelas',
  `descricao` TEXT NULL,
  `ativo` TINYINT(1) DEFAULT 1,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `criado_por` INT NULL,
  INDEX `idx_ativo` (`ativo`),
  INDEX `idx_criado_por` (`criado_por`),
  INDEX `idx_parcelas` (`parcelas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados Padrão - Pagamentos Únicos
INSERT INTO `prazos_pagamento` (`nome`, `dias`, `parcelas`, `intervalo_dias`, `descricao`, `ativo`) VALUES
('À vista', 0, 1, NULL, 'Pagamento imediato', 1),
('7 dias', 7, 1, NULL, 'Pagamento em 7 dias', 1),
('14 dias', 14, 1, NULL, 'Pagamento em 14 dias', 1),
('21 dias', 21, 1, NULL, 'Pagamento em 21 dias', 1),
('28 dias', 28, 1, NULL, 'Pagamento em 28 dias', 1),
('30 dias', 30, 1, NULL, 'Pagamento em 30 dias', 1),
('45 dias', 45, 1, NULL, 'Pagamento em 45 dias', 1),
('60 dias', 60, 1, NULL, 'Pagamento em 60 dias', 1),
('90 dias', 90, 1, NULL, 'Pagamento em 90 dias', 1);

-- Dados Padrão - Pagamentos Parcelados
INSERT INTO `prazos_pagamento` (`nome`, `dias`, `parcelas`, `intervalo_dias`, `descricao`, `ativo`) VALUES
('2x (30/60 dias)', 30, 2, 30, 'Pagamento em 2 parcelas mensais', 1),
('3x (30/60/90 dias)', 30, 3, 30, 'Pagamento em 3 parcelas mensais', 1),
('4x (30/60/90/120 dias)', 30, 4, 30, 'Pagamento em 4 parcelas mensais', 1),
('2x (15/30 dias)', 15, 2, 15, 'Pagamento em 2 parcelas quinzenais', 1),
('3x (15/30/45 dias)', 15, 3, 15, 'Pagamento em 3 parcelas quinzenais', 1),
('6x (30 dias)', 30, 6, 30, 'Pagamento em 6 parcelas mensais', 1);
```

---

## ✅ RESUMO DAS FUNCIONALIDADES CRUD

| Funcionalidade | Arquivo | Método | Descrição |
|---------------|---------|--------|-----------|
| **Visualizar Lista** | `index.php` | GET | Lista todos os prazos com filtros |
| **Criar Prazo** | `cadastrar.php` | POST | Cria novo prazo (único ou parcelado) |
| **Editar Prazo** | `editar.php` | POST | Edita prazo existente |
| **Visualizar Detalhes** | `visualizar.php` | GET | Mostra detalhes + cálculo de vencimentos |
| **Excluir Prazo** | `excluir.php` | POST | Exclui (se não estiver em uso) |

---

## 🔄 INTEGRAÇÕES

### **1. Pedidos de Compras:**
```
prazos_pagamento (N) → pedidos_compras.prazo_pagamento (texto)
```
- Vínculo por **nome** (texto)
- Usado no dropdown ao criar/editar pedidos
- Permite digitação manual se não houver prazos cadastrados

### **2. Formas de Pagamento:**
```
Relação conceitual (não há FK):
  "Boleto Bancário" geralmente usado com "30 dias" ou "45 dias"
  "PIX" geralmente usado com "À vista"
```
- Sem vínculo direto no banco
- Usuário combina livremente forma + prazo

---

## 📋 CASOS DE USO PRÁTICOS

### **Caso 1: Cadastrar Prazo Parcelado**

```
Cenário: Fornecedor oferece 4x com vencimentos a cada 30 dias

Ação:
1. Acessar: Prazos de Pagamento → Novo Prazo
2. Preencher:
   - Nome: "4x (30/60/90/120 dias)"
   - Dias da 1ª Parcela: 30
   - Número de Parcelas: 4 ← Campo "Intervalo" aparece
   - Intervalo: 30
   - Descrição: "Pagamento em 4 parcelas mensais"
   - Ativo: ✓
3. Salvar

Resultado:
- Disponível em Pedidos de Compras
- Mostra "4x 🏷️" na listagem
- Vencimentos: 30d / 60d / 90d / 120d
```

### **Caso 2: Editar Prazo Existente**

```
Cenário: Prazo "30 dias" precisa mudar para "35 dias"

Ação:
1. Acessar: Prazos de Pagamento → Editar #6
2. Alterar:
   - Dias: 30 → 35
   - Nome: "30 dias" → "35 dias"
3. Salvar

Resultado:
- Prazo atualizado
- Pedidos NOVOS usarão "35 dias"
- Pedidos ANTIGOS mantêm "30 dias" (histórico)
```

### **Caso 3: Desativar Prazo Obsoleto**

```
Cenário: Empresa não oferece mais "90 dias"

Ação:
1. Acessar: Prazos de Pagamento → Editar #9
2. Desmarcar: "Prazo ativo"
3. Salvar

Resultado:
- Não aparece mais em novos pedidos
- Pedidos antigos com "90 dias" mantêm o histórico
- Pode reativar futuramente se necessário
```

### **Caso 4: Tentar Excluir Prazo em Uso**

```
Cenário: Tentar excluir "30 dias" que está em 50 pedidos

Ação:
1. Acessar: Prazos de Pagamento → Excluir #6
2. Clicar em "Confirmar Exclusão"

Sistema verifica:
  SELECT COUNT(*) FROM pedidos_compras WHERE prazo_pagamento = '30 dias'
  → Resultado: 50 pedidos

Resultado:
- ❌ ERRO: "Não é possível excluir este prazo pois está 
           sendo utilizado em 50 pedido(s)."
- Exclusão bloqueada
- Sugestão: Desativar
```

### **Caso 5: Prazo Semanal Personalizado**

```
Cenário: Criar parcelamento semanal (4 semanas)

Ação:
1. Novo Prazo
2. Preencher:
   - Nome: "4x semanal (7/14/21/28)"
   - Dias da 1ª Parcela: 7
   - Número de Parcelas: 4
   - Intervalo: 7
3. Salvar

Resultado:
  Vencimentos calculados:
  - 1ª: 7 dias
  - 2ª: 14 dias
  - 3ª: 21 dias
  - 4ª: 28 dias
```

---

## 🧮 CÁLCULOS E ALGORITMOS

### **Algoritmo de Cálculo de Vencimentos:**

```php
function calcularVencimentos($dias_inicial, $parcelas, $intervalo) {
    $vencimentos = [];
    
    for ($i = 0; $i < $parcelas; $i++) {
        $dias_vencimento = $dias_inicial + ($i * $intervalo);
        $vencimentos[] = $dias_vencimento;
    }
    
    return $vencimentos;
}

// Exemplo: calcularVencimentos(30, 3, 30)
// Retorna: [30, 60, 90]
```

### **Exemplo de Uso Real:**

```php
// Prazo: 6x (30/60/90/120/150/180)
$prazo = [
    'dias' => 30,
    'parcelas' => 6,
    'intervalo_dias' => 30
];

$vencimentos = [];
for ($i = 0; $i < $prazo['parcelas']; $i++) {
    $venc = $prazo['dias'] + ($i * $prazo['intervalo_dias']);
    $vencimentos[] = $venc . ' dias';
}

echo implode(' | ', $vencimentos);
// Output: "30 dias | 60 dias | 90 dias | 120 dias | 150 dias | 180 dias"
```

---

## 📊 QUERY ÚTEIS

### **1. Listar Prazos Ativos (Para Pedidos):**
```sql
SELECT id, nome, dias, parcelas, intervalo_dias 
FROM prazos_pagamento 
WHERE ativo = 1 
ORDER BY parcelas ASC, dias ASC
```

### **2. Verificar se Está em Uso:**
```sql
SELECT COUNT(*) as total 
FROM pedidos_compras 
WHERE prazo_pagamento = '3x (30/60/90 dias)'
```

### **3. Buscar com Filtros:**
```sql
SELECT * FROM prazos_pagamento 
WHERE ativo = 1 
  AND (nome LIKE '%30%' OR descricao LIKE '%30%')
ORDER BY dias ASC
```

### **4. Listar Apenas Parcelados:**
```sql
SELECT * FROM prazos_pagamento 
WHERE parcelas > 1 
  AND ativo = 1
ORDER BY parcelas ASC, dias ASC
```

### **5. Estatística de Uso:**
```sql
-- Quantos pedidos usam cada prazo
SELECT 
    pp.nome,
    pp.parcelas,
    COUNT(pc.id) as total_pedidos,
    SUM(pc.valor_total) as valor_total_pedidos
FROM prazos_pagamento pp
LEFT JOIN pedidos_compras pc ON pc.prazo_pagamento = pp.nome
GROUP BY pp.id, pp.nome, pp.parcelas
ORDER BY total_pedidos DESC
```

---

## 🎨 OBSERVAÇÕES SOBRE A INTERFACE

### **Características Especiais:**

**1. Campo Dinâmico (Intervalo):**
```javascript
// Campo "Intervalo" só aparece quando Parcelas > 1
if (parcelas > 1) {
    intervaloGroup.style.display = 'block';
} else {
    intervaloGroup.style.display = 'none';
}
```

**2. Badge de Parcelas:**
```html
<!-- Na listagem -->
<span class="badge badge-info">
    3x 🏷️  <!-- Ícone de tag para parcelados -->
</span>

<!-- Para pagamento único -->
<span class="badge badge-info">
    1x
</span>
```

**3. Exibição Inteligente de Vencimentos:**
```php
// Se tiver mais de 3 parcelas, mostra "..."
if ($parcelas <= 3) {
    echo "30d / 60d / 90d";
} else {
    echo "30d / 60d / 90d ...";  // Indica que há mais
}
```

---

## 🔐 SEGURANÇA E VALIDAÇÕES

### **Segurança:**
- ✅ Verificação de login obrigatória
- ✅ Verificação de timeout de sessão
- ✅ Prepared Statements (PDO)
- ✅ `htmlspecialchars()` para proteção XSS
- ✅ Exclusão via POST (não GET)

### **Validações:**

**Cadastro/Edição:**
```php
// 1. Nome obrigatório
if (empty($nome)) {
    throw new Exception("Nome é obrigatório");
}

// 2. Dias obrigatório
if ($dias === '') {
    throw new Exception("Dias é obrigatório");
}

// 3. Parcelas ≥ 1
if ($parcelas < 1) {
    throw new Exception("Parcelas deve ser >= 1");
}

// 4. Validação lógica de intervalo
if ($parcelas == 1) {
    $intervalo_dias = null;  // Não faz sentido ter intervalo
}
```

**Exclusão:**
```php
// Verifica uso em pedidos
if ($em_uso['total'] > 0) {
    throw new Exception("Em uso em {$total} pedido(s)");
}
```

---

## 📊 DIFERENÇAS EM RELAÇÃO A "FORMAS DE PAGAMENTO"

| Aspecto | Formas de Pagamento | Prazos de Pagamento |
|---------|---------------------|---------------------|
| **Propósito** | COMO pagar (Boleto, PIX) | QUANDO pagar (30 dias, 3x) |
| **Campos Principais** | nome, descricao | nome, dias, parcelas, intervalo |
| **Complexidade** | Simples (2 campos) | Média (4 campos + cálculo) |
| **Parcelamento** | Não | ✅ Sim |
| **Cálculo Dinâmico** | Não | ✅ Sim (vencimentos) |
| **JavaScript** | Não | ✅ Sim (toggle campo) |

---

## 💡 BOAS PRÁTICAS

### **1. Nomenclatura Clara:**
```
✅ Bom: "3x (30/60/90 dias)", "À vista", "45 dias"
❌ Ruim: "3x", "prazo1", "p30"
```

### **2. Descrição Informativa:**
```
✅ Bom: "Pagamento em 3 parcelas mensais com vencimentos aos 30, 60 e 90 dias"
❌ Ruim: "Parcelado" (vago)
```

### **3. Desativar em Vez de Excluir:**
```
❌ Evitar: Excluir prazos antigos
✅ Preferir: Desativar (ativo = 0)
```

### **4. Intervalos Padronizados:**
```
✅ Padrão: 7 (semanal), 15 (quinzenal), 30 (mensal)
❌ Evitar: Intervalos irregulares (23 dias, 37 dias)
```

---

## 📊 EXEMPLO COMPLETO DE FLUXO

### **Fluxo: Cadastrar Prazo Parcelado**

```
1. Usuário acessa:
   http://localhost:8080/nexflow/modulos/suprimentos/prazos_pagamento/

2. Clica em: "Novo Prazo"

3. Preenche formulário:
   - Nome: "5x (28/56/84/112/140)"
   - Dias da 1ª Parcela: 28
   - Número de Parcelas: 5 ← Campo "Intervalo" aparece automaticamente
   - Intervalo entre Parcelas: 28
   - Descrição: "Pagamento em 5 parcelas a cada 28 dias"
   - Ativo: ✓

4. Clica em: "Salvar Prazo"

5. Sistema:
   INSERT INTO prazos_pagamento (
       nome, dias, parcelas, intervalo_dias, descricao, ativo, criado_por
   ) VALUES (
       '5x (28/56/84/112/140)', 28, 5, 28, '...', 1, 1
   )
   
   Retorna ID: 16

6. Redireciona para: visualizar.php?id=16

7. Página mostra:
   ✅ Prazo cadastrado com sucesso!
   
   📅 Nome: 5x (28/56/84/112/140)
   🕐 Dias (1ª Parcela): 28 dias
   📋 Parcelas: 5x (Parcelado)
   📆 Intervalo: 28 dias
   ✅ Vencimentos: 28 dias | 56 dias | 84 dias | 112 dias | 140 dias
   
   [✏️ Editar] [🗑️ Excluir] [⬅️ Voltar]

8. Ao criar um Pedido de Compras:
   Dropdown "Prazo de Pagamento" mostra:
   - ...
   - 3x (30/60/90 dias) - 3x
   - 4x (30/60/90/120 dias) - 4x
   - 5x (28/56/84/112/140) - 5x  ← Nova opção
   - ...
```

---

## 🎯 CASOS ESPECIAIS

### **Caso 1: À Vista (0 dias)**
```
Nome: "À vista"
Dias: 0
Parcelas: 1
Intervalo: NULL

→ Pagamento imediato no ato da compra
```

### **Caso 2: Parcelado Irregular**
```
Nome: "3x (15/45/90)"
Dias: 15
Parcelas: 3
Intervalo: 30 (não 15!)

Vencimentos:
  1ª: 15 dias
  2ª: 15 + 30 = 45 dias
  3ª: 15 + 60 = 75 dias ← Não seria 90!

OBSERVAÇÃO: Para vencimentos irregulares, 
considere cadastrar como "3x irregular" 
e detalhar na descrição.
```

### **Caso 3: Entrada + Parcelas**
```
Nome: "Entrada + 2x (30/60)"
Dias: 0 (entrada à vista)
Parcelas: 3 (entrada + 2 parcelas)
Intervalo: 30

Vencimentos:
  1ª (entrada): 0 dias (à vista)
  2ª: 30 dias
  3ª: 60 dias
```

---

## 📊 ATUALIZAÇÃO PARA SUPORTAR PARCELAMENTO

Se a tabela foi criada antes da funcionalidade de parcelamento:

### **Script de Atualização:**
```sql
-- Adicionar colunas
ALTER TABLE `prazos_pagamento` 
ADD COLUMN `parcelas` INT DEFAULT 1 AFTER `dias`,
ADD COLUMN `intervalo_dias` INT NULL AFTER `parcelas`;

-- Atualizar existentes
UPDATE `prazos_pagamento` SET `parcelas` = 1 WHERE `parcelas` IS NULL;

-- Criar índice
CREATE INDEX `idx_parcelas` ON `prazos_pagamento` (`parcelas`);
```

**Arquivo:** `sql/atualizar_prazos_pagamento_parcelado.sql`

---

## ✅ RESUMO EXECUTIVO

**Módulo:** Prazos de Pagamento  
**Complexidade:** ⭐⭐⭐☆☆ (Média - Tem cálculos de parcelamento)  
**Tabelas:** 1 (`prazos_pagamento`)  
**Relacionamentos:** Vínculo indireto com `pedidos_compras` (por texto)  
**CRUD:** Completo (Create, Read, Update, Delete)  
**Validações:** Exclusão verificada contra uso em pedidos  
**Status:** Ativo/Inativo para controle de disponibilidade  

**Características Especiais:**
- ✅ **Suporte a parcelamento** (1 até 12 parcelas)
- ✅ **Cálculo automático** de vencimentos
- ✅ **Interface dinâmica** (campo intervalo condicional)
- ✅ **15 prazos pré-cadastrados** (9 únicos + 6 parcelados)
- ✅ Vínculo por texto para preservar histórico

**Uso Principal:** Padronizar prazos de pagamento usados em **Pedidos de Compras**.

**Fórmula de Vencimentos:**
```
vencimento[i] = dias_inicial + (i × intervalo_dias)
```

---

**Essa é a estrutura completa do módulo de Prazos de Pagamento!** 🚀
#### **O que faz:**
Exibe o pedido completo em formato de visualização/impressão.

**Parâmetros:** `?id={id_do_pedido}`

#### **Consulta SQL Completa:**
```sql
SELECT p.*,
       s.numero_solicitacao,
       s.motivo as justificativa,
       f_faturamento.nome as filial_faturamento_nome,
       f_faturamento.razao_social as filial_faturamento_razao_social,
       f_cobranca.nome as filial_cobranca_nome,
       f_cobranca.razao_social as filial_cobranca_razao_social,
       f_entrega.nome as filial_entrega_nome,
       f_entrega.razao_social as filial_entrega_razao_social,
       fn.razao_social as fornecedor_razao_social,
       fn.logradouro as fornecedor_endereco,
       ...
FROM pedidos_compras p
LEFT JOIN solicitacoes_compras s ON p.solicitacao_compras_id = s.id
LEFT JOIN filiais f_faturamento ON p.filial_faturamento_id = f_faturamento.id
LEFT JOIN filiais f_cobranca ON p.filial_cobranca_id = f_cobranca.id
LEFT JOIN filiais f_entrega ON p.filial_entrega_id = f_entrega.id
LEFT JOIN fornecedores fn ON p.fornecedor_id = fn.id
WHERE p.id = ?
```

#### **Seções Exibidas:**

**1. Cards de Informação:**

- **Informações do Pedido:**
  - Número (PC000001)
  - Data de Criação
  - Data Entrega CD
  - Status (badge)

- **Fornecedor:**
  - Razão Social
  - CNPJ
  - Endereço completo

- **Condições de Pagamento:**
  - Forma de Pagamento
  - Prazo de Pagamento

- **Dados para Faturamento:**
  - Filial
  - Razão Social
  - CNPJ
  - Endereço

- **Dados para Cobrança:**
  - Filial
  - Razão Social
  - CNPJ
  - Endereço

- **Dados para Entrega:**
  - Filial
  - Razão Social
  - CNPJ
  - Endereço

- **Observações** (se preenchido)

- **Justificativa** (da solicitação)

**2. Tabela de Produtos:**

| Código | Produto | Unidade | Qtd. Pedido | Valor Unit. | Valor Total |
|--------|---------|---------|-------------|-------------|-------------|
| 001234 | Arroz Branco | KG | 300,00 | R$ 5,50 | R$ 1.650,00 |
| 005678 | Feijão Preto | KG | 200,00 | R$ 8,20 | R$ 1.640,00 |
| **TOTAL** | | | | | **R$ 3.290,00** |

#### **Botões de Ação:**
- ✏️ **Editar** → `editar.php?id={id}`
- 🗑️ **Excluir** → `excluir.php?id={id}` (se permitido)
- 🖨️ **Imprimir** → `window.print()` com CSS otimizado
- ⬅️ **Voltar** → `index.php`

**CSS para Impressão:**
- Papel A4 Portrait
- Fonte 7-9px
- Oculta sidebar, botões
- Mantém cores dos status
- Tabelas com bordas para PDF

---

### **5. EXCLUIR (`excluir.php` ou via `index.php?excluir=`)**

#### **Regras de Exclusão:**
```php
$pode_excluir = in_array($status, ['em_digitacao', 'cancelado']);

if (!$pode_excluir) {
    $erro = "Apenas pedidos 'em_digitacao' ou 'cancelado' podem ser excluídos.";
}
```

**Estados:**
- **Em Digitação** → ✅ Pode excluir
- **Aprovado** → ❌ Não pode (já foi aprovado)
- **Parcial/Finalizado** → ❌ Não pode (usado em RIR/NF)
- **Cancelado** → ✅ Pode excluir

**Processo de Exclusão:**
```php
// CASCADE DELETE automático dos itens
DELETE FROM pedidos_compras WHERE id = ?

// pedido_compras_itens são deletados automaticamente (ON DELETE CASCADE)

// Recalcular status da solicitação vinculada
recalcularStatusSolicitacao($solicitacao_id);
```

---

## 🔌 APIS E INTEGRAÇÕES

### **API 1: `buscar_itens_solicitacao.php`**

**Endpoint:** `GET buscar_itens_solicitacao.php?id={solicitacao_id}`

**O que faz:**
Busca produtos da solicitação que **ainda têm saldo disponível**.

**Query:**
```sql
SELECT 
    sci.*,
    um.simbolo as unidade_simbolo,
    COALESCE(SUM(pci.quantidade_pedido), 0) as quantidade_atendida,
    (sci.quantidade - COALESCE(SUM(pci.quantidade_pedido), 0)) as quantidade_saldo
FROM solicitacao_compras_itens sci
LEFT JOIN unidades_medida um ON sci.unidade_medida_id = um.id
LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
WHERE sci.solicitacao_id = ?
GROUP BY sci.id
HAVING quantidade_saldo > 0  -- APENAS COM SALDO
ORDER BY sci.id
```

**Resposta JSON:**
```json
{
  "success": true,
  "itens": [
    {
      "id": 10,
      "codigo_produto": "001234",
      "nome_produto": "Arroz Branco",
      "unidade_simbolo": "KG",
      "quantidade": 500,
      "quantidade_atendida": 200,
      "quantidade_saldo": 300
    }
  ],
  "solicitacao": {
    "numero_solicitacao": "SC000001",
    "filial_id": 5,
    "filial_nome": "Filial Curitiba (CUR)",
    "filial_cnpj": "12.345.678/0001-00",
    "filial_endereco_completo": "Rua ABC, 123 - Centro - Curitiba/PR - CEP: 80000-000",
    "motivo": "Compra Programada"
  }
}
```

---

### **API 2: `buscar_dados_filial.php`**

**Endpoint:** `GET buscar_dados_filial.php?id={filial_id}`

**O que faz:**
Busca dados completos de uma filial (CNPJ, endereço, razão social).

**Query Dinâmica:**
```sql
-- Verifica quais colunas existem (logradouro vs endereco, municipio vs cidade, etc)
SELECT id, nome, codigo, cnpj, razao_social,
       logradouro as endereco, numero, complemento, bairro,
       municipio as cidade, uf as estado, cep
FROM filiais
WHERE id = ?
```

**Montagem do Endereço:**
```php
$endereco = "{$filial['endereco']}, {$filial['numero']}";
if ($filial['complemento']) $endereco .= " - {$filial['complemento']}";
if ($filial['bairro']) $endereco .= " - {$filial['bairro']}";
if ($filial['cidade']) $endereco .= " - {$filial['cidade']}";
if ($filial['estado']) $endereco .= "/{$filial['estado']}";
if ($filial['cep']) $endereco .= " - CEP: {$filial['cep']}";

// Resultado: "Rua ABC, 123 - Apto 4 - Centro - Curitiba/PR - CEP: 80000-000"
```

**Resposta JSON:**
```json
{
  "success": true,
  "filial": {
    "id": 5,
    "nome": "Filial Curitiba",
    "nome_completo": "Filial Curitiba (CUR)",
    "codigo": "CUR",
    "cnpj": "12.345.678/0001-00",
    "razao_social": "Empresa LTDA",
    "endereco": "Rua ABC, 123 - Centro - Curitiba/PR - CEP: 80000-000"
  }
}
```

---

### **API 3: `adicionar_item_pedido.php`**

**Endpoint:** `POST adicionar_item_pedido.php?pedido_id={id}`

**Parâmetros:**
- `item_solicitacao_id` (POST)
- `quantidade` (POST)
- `valor_unitario` (POST)

**O que faz:**
Adiciona um produto da solicitação a um pedido existente (durante edição).

**Lógica:**
```php
// 1. Buscar saldo disponível do item
$item_sol = fetchOne("
    SELECT sci.*,
           (sci.quantidade - COALESCE(SUM(pci.quantidade_pedido), 0)) as saldo
    FROM solicitacao_compras_itens sci
    LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
    WHERE sci.id = ?
    GROUP BY sci.id
", [$item_solicitacao_id]);

// 2. Validar quantidade
if ($quantidade > $item_sol['saldo']) {
    throw new Exception("Quantidade maior que saldo!");
}

// 3. Inserir item
INSERT INTO pedido_compras_itens (
    pedido_id, solicitacao_item_id, produto_generico_id,
    codigo_produto, nome_produto,
    unidade_medida_id, unidade_medida,
    quantidade_solicitada, quantidade_pedido,
    valor_unitario
) VALUES (...)

// 4. Recalcular status da solicitação
recalcularStatusSolicitacao($solicitacao_id);
```

---

## 📊 SISTEMA DE STATUS DO PEDIDO

### **Status do Pedido (Manual):**

| Status | Descrição | Quando Usar |
|--------|-----------|-------------|
| `em_digitacao` | Em Digitação | Pedido sendo criado/editado |
| `aprovado` | Aprovado | Pedido aprovado para envio ao fornecedor |
| `enviado` | Enviado | Pedido enviado ao fornecedor |
| `confirmado` | Confirmado | Fornecedor confirmou recebimento |
| `em_transito` | Em Trânsito | Produtos em transporte |
| `entregue` | Entregue | Produtos entregues |
| `cancelado` | Cancelado | Pedido cancelado |
| `Parcial` | Parcial | Usado parcialmente em RIR/NF (**automático**) |
| `Finalizado` | Finalizado | Usado totalmente em RIR/NF (**automático**) |

**Observações:**
- Status `em_digitacao` → `aprovado`: Via ação em lote ou edição manual
- Status `Parcial`/`Finalizado`: Calculados automaticamente quando usado em RIR/Notas Fiscais

---

## 📊 INTEGRAÇÃO E RASTREABILIDADE

### **Fluxo Completo: Solicitação → Pedido → RIR**

```
1. SOLICITAÇÃO SC000001 criada
   └─ Item 1 (ID=10): Arroz - 500 KG

2. PEDIDO PC000001 criado (vinculado a SC000001)
   └─ Item A: Arroz - 200 KG
      └─ solicitacao_item_id = 10
      └─ quantidade_solicitada = 500
      └─ quantidade_pedido = 200
   
   Status SC000001: PARCIAL (200/500 atendidos)

3. PEDIDO PC000002 criado (vinculado a SC000001)
   └─ Item B: Arroz - 300 KG
      └─ solicitacao_item_id = 10
      └─ quantidade_solicitada = 500
      └─ quantidade_pedido = 300
   
   Status SC000001: FINALIZADO (500/500 atendidos)

4. RIR (Relatório de Inspeção) criado
   └─ Vincula ao PEDIDO PC000001 para inspecionar Arroz
   └─ Sistema busca produtos automaticamente
```

**Query de Rastreabilidade:**
```sql
-- Ver quais pedidos atenderam uma solicitação
SELECT 
    pc.numero_pedido,
    pci.quantidade_pedido,
    pc.status as status_pedido
FROM pedido_compras_itens pci
INNER JOIN pedidos_compras pc ON pci.pedido_id = pc.id
WHERE pci.solicitacao_item_id = 10  -- ID do item da solicitação
ORDER BY pci.criado_em
```

---

## 📋 REGRAS DE NEGÓCIO

### **1. Geração de Número Automático:**
- Formato: `PC` + 6 dígitos (PC000001, PC000002...)
- Sequencial baseado no último número

### **2. Herança de Dados da Solicitação:**
Ao criar pedido, copia automaticamente:
- Filial solicitante
- Data de entrega CD
- Semana de abastecimento
- Justificativa
- Número da solicitação

### **3. Controle de Saldo:**
```
Quantidade Solicitada: 500 KG
Já Atendida (Soma de todos os pedidos): 200 KG
Saldo Disponível: 300 KG

→ Novo pedido pode ter no máximo 300 KG
```

**Validação Backend:**
```php
if ($quantidade_pedido > $quantidade_saldo) {
    throw new Exception("Quantidade excede saldo disponível!");
}
```

### **4. Múltiplas Filiais:**
- **Faturamento**: Filial que emite a nota fiscal
- **Cobrança**: Filial que paga (geralmente Matriz)
- **Entrega**: Filial que recebe os produtos

### **5. Status "Aprovado":**
- Apenas pedidos `em_digitacao` podem ser aprovados
- Aprovação pode ser:
  - Individual (editando o pedido)
  - Em lote (selecionando múltiplos na listagem)

### **6. Triggers de Valor:**
- Campo `valor_total` do item é calculado automaticamente
- Campo `valor_total` do pedido é calculado automaticamente
- **Não** atualizar manualmente

### **7. Recálculo de Status da Solicitação:**
Sempre que um pedido é criado, editado ou excluído, o status da solicitação vinculada é recalculado automaticamente via `recalcularStatusSolicitacao($solicitacao_id)`.

---

## 📊 ESTRUTURA SQL PARA CRIAR AS TABELAS

```sql
-- Tabela Principal de Pedidos
CREATE TABLE pedidos_compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(20) NOT NULL UNIQUE,
    solicitacao_compras_id INT NOT NULL,
    fornecedor_id INT,
    fornecedor_nome VARCHAR(200),
    fornecedor_cnpj VARCHAR(18),
    filial_id INT,
    filial_nome VARCHAR(100),
    data_entrega_cd DATE,
    semana_abastecimento VARCHAR(20),
    valor_total DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('em_digitacao', 'enviado', 'confirmado', 'em_transito', 'entregue', 'cancelado') DEFAULT 'em_digitacao',
    observacoes TEXT,
    criado_por INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    filial_faturamento_id INT,
    filial_cobranca_id INT,
    filial_entrega_id INT,
    endereco_faturamento TEXT,
    endereco_cobranca TEXT,
    endereco_entrega TEXT,
    cnpj_faturamento VARCHAR(18),
    cnpj_cobranca VARCHAR(18),
    cnpj_entrega VARCHAR(18),
    forma_pagamento VARCHAR(100),
    prazo_pagamento VARCHAR(100),
    justificativa TEXT,
    numero_solicitacao VARCHAR(20),
    
    INDEX idx_numero_pedido (numero_pedido),
    INDEX idx_solicitacao_compras_id (solicitacao_compras_id),
    INDEX idx_fornecedor_id (fornecedor_id),
    INDEX idx_status (status),
    
    FOREIGN KEY (solicitacao_compras_id) REFERENCES solicitacoes_compras(id) ON DELETE RESTRICT,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (filial_id) REFERENCES filiais(id) ON DELETE SET NULL
);

-- Tabela de Itens do Pedido
CREATE TABLE pedido_compras_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    solicitacao_item_id INT,  -- VÍNCULO CRÍTICO
    produto_generico_id INT,
    codigo_produto VARCHAR(10),
    nome_produto VARCHAR(200),
    unidade_medida_id INT,
    unidade_medida VARCHAR(50),
    quantidade_solicitada DECIMAL(10,3) NOT NULL DEFAULT 0,
    quantidade_pedido DECIMAL(10,3) NOT NULL DEFAULT 0,
    valor_unitario DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) DEFAULT 0.00,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_pedido_id (pedido_id),
    INDEX idx_solicitacao_item_id (solicitacao_item_id),
    INDEX idx_produto_generico_id (produto_generico_id),
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos_compras(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compras_itens(id) ON DELETE SET NULL,
    FOREIGN KEY (unidade_medida_id) REFERENCES unidades_medida(id) ON DELETE SET NULL
);

-- Triggers (ver seção anterior de TRIGGERS)
```

---

## ✅ RESUMO DAS FUNCIONALIDADES CRUD

| Funcionalidade | Arquivo | Método | Descrição |
|---------------|---------|--------|-----------|
| **Visualizar Lista** | `index.php` | GET | Lista pedidos com filtros e ações em lote |
| **Aprovar em Lote** | `index.php` | POST | Aprova múltiplos pedidos simultaneamente |
| **Reabrir em Lote** | `index.php` | POST | Reabre múltiplos pedidos aprovados |
| **Criar Pedido** | `cadastrar.php` | POST | Cria pedido vinculado a solicitação |
| **Editar Pedido** | `editar.php` | POST | Edita pedido existente |
| **Adicionar Item** | `adicionar_item_pedido.php` | POST | Adiciona produto ao pedido (durante edição) |
| **Visualizar Detalhes** | `visualizar.php` | GET | Mostra pedido completo com impressão |
| **Excluir Pedido** | `excluir.php` ou `index.php` | GET | Exclui pedido (regras de status) |
| **Buscar Itens SC** | `buscar_itens_solicitacao.php` | GET | API: Itens com saldo disponível |
| **Buscar Filial** | `buscar_dados_filial.php` | GET | API: Dados completos da filial |

---

## 🔄 INTEGRAÇÕES COM OUTROS MÓDULOS

### **1. Solicitações de Compras (PRINCIPAL):**
```
solicitacoes_compras (1) ----< (N) pedidos_compras
       ↓
solicitacao_compras_itens (1) ----< (N) pedido_compras_itens
                                        (via solicitacao_item_id)
```
- **Vínculo obrigatório**: Todo pedido vem de uma solicitação
- **Rastreamento de saldo**: Sistema controla quanto foi atendido
- **Atendimento parcial**: Permite criar vários pedidos para a mesma solicitação
- **Recálculo automático**: Status da SC é atualizado quando PC muda

### **2. Fornecedores:**
```
fornecedores (1) ----< (N) pedidos_compras
```
- Vínculo opcional (`fornecedor_id` pode ser NULL)
- Dados copiados para histórico (`fornecedor_nome`, `fornecedor_cnpj`)

### **3. Filiais (Triplo Vínculo):**
```
filiais ----< pedidos_compras.filial_faturamento_id
filiais ----< pedidos_compras.filial_cobranca_id
filiais ----< pedidos_compras.filial_entrega_id
```
- **Faturamento**: Quem emite a nota
- **Cobrança**: Quem paga (geralmente Matriz)
- **Entrega**: Onde os produtos são entregues

### **4. Produto Genérico:**
```
produto_generico (1) ----< (N) pedido_compras_itens
```
- Cada item referencia um produto genérico
- Dados copiados para histórico

### **5. Unidades de Medida:**
```
unidades_medida (1) ----< (N) pedido_compras_itens
```
- Cada item tem uma unidade
- ID e símbolo armazenados

### **6. Formas e Prazos de Pagamento:**
```
formas_pagamento → pedidos_compras.forma_pagamento (texto)
prazos_pagamento → pedidos_compras.prazo_pagamento (texto)
```
- Armazena como texto (não FK)
- Permite valores personalizados

### **7. Relatório de Inspeção (RIR):**
```
pedidos_compras (1) ----< (N) relatorio_inspecao
       ↓
pedido_compras_itens → Produtos carregados automaticamente no RIR
```
- RIR pode vincular a um pedido específico
- Produtos do pedido são carregados automaticamente

---

## 📊 EXEMPLO COMPLETO DE FLUXO

### **Passo 1: Solicitação Criada**
```
SC000001 - Filial: Curitiba
  Item 1 (ID=10): Arroz - 500 KG (saldo: 500)
  Item 2 (ID=11): Feijão - 300 KG (saldo: 300)
  Item 3 (ID=12): Óleo - 100 UN (saldo: 100)

Status SC000001: ABERTO
```

### **Passo 2: Criar Primeiro Pedido**
```
PC000001 - Fornecedor: Distribuidora ABC
Vinculado a: SC000001

Produtos selecionados:
  ☑️ Arroz - Qtd. Pedido: 200 KG (de 500) - Valor: R$ 5,50 = R$ 1.100,00
  ☑️ Feijão - Qtd. Pedido: 150 KG (de 300) - Valor: R$ 8,00 = R$ 1.200,00
  ☐ Óleo (não selecionado)

Valor Total PC000001: R$ 2.300,00
Status PC000001: em_digitacao

Banco de dados:
  pedido_compras_itens:
    - Item A: pedido_id=1, solicitacao_item_id=10, quantidade_pedido=200
    - Item B: pedido_id=1, solicitacao_item_id=11, quantidade_pedido=150

Recalcula SC000001:
  Item 1: 500 - 200 = 300 KG saldo
  Item 2: 300 - 150 = 150 KG saldo
  Item 3: 100 - 0 = 100 UN saldo
  
  Status SC000001: PARCIAL ✅
```

### **Passo 3: Aprovar Pedido**
```
Ação em lote: Selecionar PC000001 → Botão "Aprovar Pedidos"

UPDATE pedidos_compras SET status = 'aprovado' WHERE id = 1

Status PC000001: aprovado ✅
```

### **Passo 4: Criar Segundo Pedido (Restante)**
```
PC000002 - Fornecedor: Distribuidora XYZ
Vinculado a: SC000001

Produtos disponíveis (com saldo):
  ☑️ Arroz - Saldo: 300 KG → Qtd. Pedido: 300 KG
  ☑️ Feijão - Saldo: 150 KG → Qtd. Pedido: 150 KG
  ☑️ Óleo - Saldo: 100 UN → Qtd. Pedido: 100 UN

Valor Total PC000002: R$ 4.500,00

Recalcula SC000001:
  Item 1: 500 - (200+300) = 0 KG saldo
  Item 2: 300 - (150+150) = 0 KG saldo
  Item 3: 100 - 100 = 0 UN saldo
  
  Status SC000001: FINALIZADO ✅
```

### **Passo 5: Visualização na Solicitação**
```
Solicitação SC000001 (visualizar.php):

Tabela de Produtos:
| Produto | Qtd. Sol. | Qtd. Util. | Saldo | Status | Pedidos Vinculados |
|---------|-----------|------------|-------|--------|--------------------|
| Arroz   | 500,00    | 500,00     | 0,00  | FINAL. | PC000001 (200), PC000002 (300) |
| Feijão  | 300,00    | 300,00     | 0,00  | FINAL. | PC000001 (150), PC000002 (150) |
| Óleo    | 100,00    | 100,00     | 0,00  | FINAL. | PC000002 (100) |
```

---

**Essa é a estrutura completa do módulo de Pedidos de Compras!** 🚀