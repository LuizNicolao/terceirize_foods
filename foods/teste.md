Vou analisar o módulo de Solicitação de Compras para criar uma explicação completa. Deixe-me buscar os arquivos relacionados:

[10 tools called]

Perfeito! Agora tenho todas as informações necessárias. [[memory:2418210]] Vou criar uma explicação completa do sistema de **Solicitação de Compras**:

---

# 📋 SISTEMA DE SOLICITAÇÃO DE COMPRAS
**URL:** `http://localhost:8080/nexflow/modulos/solicitacao_compras/`

---

## 🎯 OBJETIVO DO SISTEMA

Sistema para gerenciar **Solicitações de Compras (SC)**, que são requisições formais de produtos necessários para as filiais. Estas solicitações são posteriormente transformadas em **Pedidos de Compras** para fornecedores. O sistema gerencia o ciclo completo desde a solicitação até o atendimento através dos pedidos.

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabela 1: `solicitacoes_compras`**
Tabela principal que armazena o cabeçalho das solicitações.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT AUTO_INCREMENT | ID único da solicitação |
| `numero_solicitacao` | VARCHAR(20) UNIQUE NOT NULL | Número sequencial (ex: SC000001, SC000002) |
| `descricao` | TEXT | Descrição/Motivo da solicitação |
| `solicitante` | VARCHAR(100) NOT NULL | Nome do solicitante (usuário logado) |
| `unidade` | VARCHAR(100) | Nome da unidade/filial (texto) |
| `data_necessidade` | DATE | Data de entrega CD (quando precisa receber) |
| `observacoes` | TEXT | Observações gerais da solicitação |
| `status` | ENUM | Status atual: `em_digitacao`, `finalizado`, `cancelada`, `pendente`, `aprovada`, `rejeitada`, `em_andamento`, `concluida` |
| `valor_total` | DECIMAL(15,2) | Valor total calculado automaticamente via TRIGGER |
| `criado_por` | INT | ID do usuário que criou (FK para `usuarios`) |
| `criado_em` | TIMESTAMP | Data/hora de criação |
| `atualizado_em` | TIMESTAMP | Data/hora de última atualização |
| `data_documento` | DATE NOT NULL | Data do documento (data atual) |
| `motivo` | VARCHAR(255) NOT NULL | Motivo: "Compra Emergencial" ou "Compra Programada" |
| `filial_id` | INT | ID da filial solicitante (FK para `filiais`) |
| `data_entrega_cd` | DATE | Data de entrega no CD (mesmo que data_necessidade) |
| `semana_abastecimento` | VARCHAR(20) | Semana de abastecimento calculada (ex: "01/11/2024 a 07/11/2024") |

**Índices:**
- `idx_numero_solicitacao` (numero_solicitacao)
- `idx_status` (status)
- `idx_solicitante` (solicitante)
- `idx_data_necessidade` (data_necessidade)
- `idx_criado_em` (criado_em)
- `idx_filial_id` (filial_id)
- `idx_data_entrega_cd` (data_entrega_cd)

**Foreign Keys:**
- `criado_por` → `usuarios(id)` ON DELETE SET NULL
- `filial_id` → `filiais(id)` ON DELETE SET NULL

---

### **Tabela 2: `solicitacao_compras_itens`**
Tabela de itens (produtos) da solicitação.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT AUTO_INCREMENT | ID único do item |
| `solicitacao_id` | INT NOT NULL | ID da solicitação (FK para `solicitacoes_compras`) |
| `produto_id` | INT | ID do produto genérico |
| `codigo_produto` | VARCHAR(10) | Código do produto |
| `nome_produto` | VARCHAR(200) | Nome do produto |
| `unidade_medida_id` | INT | ID da unidade de medida (FK para `unidades_medida`) |
| `unidade_medida` | VARCHAR(50) | Símbolo da unidade (KG, UN, CX, etc.) |
| `quantidade` | DECIMAL(10,3) NOT NULL | Quantidade solicitada |
| `observacao` | TEXT | Observação específica do item |
| `valor_unitario` | DECIMAL(10,2) | Valor unitário estimado (opcional) |
| `valor_total` | DECIMAL(15,2) | Valor total do item = quantidade × valor_unitario |
| `criado_em` | TIMESTAMP | Data/hora de criação |

**Índices:**
- `idx_solicitacao_id` (solicitacao_id)
- `idx_produto_id` (produto_id)
- `idx_codigo_produto` (codigo_produto)

**Foreign Keys:**
- `solicitacao_id` → `solicitacoes_compras(id)` ON DELETE CASCADE
- `unidade_medida_id` → `unidades_medida(id)` ON DELETE SET NULL

---

### **TRIGGERS Automáticos:**

#### **1. Atualizar Valor Total da Solicitação (INSERT)**
```sql
CREATE TRIGGER atualizar_valor_total_solicitacao
AFTER INSERT ON solicitacao_compras_itens
FOR EACH ROW
BEGIN
    UPDATE solicitacoes_compras 
    SET valor_total = (
        SELECT COALESCE(SUM(valor_total), 0) 
        FROM solicitacao_compras_itens 
        WHERE solicitacao_id = NEW.solicitacao_id
    )
    WHERE id = NEW.solicitacao_id;
END
```

#### **2. Atualizar Valor Total da Solicitação (UPDATE)**
Mesmo comportamento, dispara após UPDATE em `solicitacao_compras_itens`.

#### **3. Atualizar Valor Total da Solicitação (DELETE)**
Mesmo comportamento, dispara após DELETE em `solicitacao_compras_itens`.

**Resultado:** O campo `valor_total` em `solicitacoes_compras` é **sempre atualizado automaticamente** quando itens são adicionados, modificados ou removidos.

---

## 🔗 RELACIONAMENTOS E VÍNCULOS

### **Diagrama de Relacionamento:**

```
filiais (1) ----< (N) solicitacoes_compras
                         ↓ (1)
                         |
                    (N) solicitacao_compras_itens ----< (1) produto_generico
                         |                                    ↓
                         |                              unidades_medida
                         ↓
                  pedido_compras_itens (vínculo através de solicitacao_item_id)
                         ↓
                  pedidos_compras
```

### **Explicação dos Vínculos:**

1. **Solicitação ↔ Filial:**
   - Cada solicitação pertence a **uma filial**
   - Uma filial pode ter **várias solicitações**

2. **Solicitação ↔ Itens:**
   - Uma solicitação tem **vários itens** (produtos)
   - Cada item pertence a **uma solicitação** (CASCADE DELETE)

3. **Item ↔ Produto Genérico:**
   - Cada item referencia um **produto genérico**
   - Armazena cópia dos dados (código, nome) para histórico

4. **Item ↔ Unidade de Medida:**
   - Cada item tem uma **unidade de medida**
   - Armazena tanto ID quanto símbolo

5. **Solicitação → Pedido de Compras (Vínculo Indireto):**
   - `solicitacao_compras_itens.id` ← `pedido_compras_itens.solicitacao_item_id`
   - Um item de solicitação pode ser atendido por **múltiplos pedidos** (parcialmente)
   - O sistema rastreia **quantidade utilizada** e **saldo disponível**

---

## 📊 SISTEMA DE STATUS

### **Status da Solicitação (Calculado Automaticamente):**

| Status | Descrição | Quando Ocorre |
|--------|-----------|---------------|
| `em_digitacao` | Em Digitação | Solicitação sendo criada (não usado no sistema atual) |
| `aberto` | Aberto | Nenhum pedido vinculado aos itens |
| `parcial` | Parcial | Alguns itens atendidos, mas não todos |
| `finalizado` | Finalizado | Todos os itens 100% atendidos por pedidos |
| `cancelada` | Cancelada | Solicitação cancelada manualmente |

### **Lógica de Cálculo de Status:**

```php
function recalcularStatusSolicitacao($solicitacao_id) {
    // Buscar todos os itens com quantidades atendidas
    $itens = buscarItensComQuantidadesAtendidas($solicitacao_id);
    
    $totalSolicitado = 0;
    $totalAtendido = 0;
    $todosAtendidos = true;
    $algumAtendido = false;
    
    foreach ($itens as $item) {
        $solicitado = $item['quantidade_solicitada'];
        $atendido = $item['quantidade_atendida']; // Soma dos pedidos
        
        $totalSolicitado += $solicitado;
        $totalAtendido += $atendido;
        
        if ($atendido > 0) $algumAtendido = true;
        if ($atendido < $solicitado) $todosAtendidos = false;
    }
    
    // Determinar status
    if ($totalAtendido == 0) {
        $status = 'aberto';
    } elseif ($todosAtendidos || $totalAtendido >= $totalSolicitado) {
        $status = 'finalizado';
    } else {
        $status = 'parcial';
    }
    
    // Atualizar status no banco
    UPDATE solicitacoes_compras SET status = $status WHERE id = $solicitacao_id;
}
```

**Importante:** O status é recalculado automaticamente:
- Ao listar solicitações (`index.php`)
- Ao visualizar uma solicitação (`visualizar.php`)
- Ao adicionar/remover itens de pedidos

---

## 📁 ARQUIVOS DO SISTEMA

### **Arquivos Principais:**

1. **`index.php`** - Listagem com filtros e paginação (READ)
2. **`cadastrar.php`** - Cadastro de solicitação (CREATE)
3. **`editar.php`** - Edição de solicitação (UPDATE)
4. **`visualizar.php`** - Visualização e impressão (READ)
5. **`excluir.php`** - Exclusão de solicitação (DELETE)

### **APIs e Utilitários:**

6. **`recalcular_status_solicitacao.php`** - Função para recalcular status
7. **`buscar_semana_abastecimento.php`** - API para buscar semana de abastecimento

---

## ⚙️ FUNCIONALIDADES DETALHADAS

### **1. VISUALIZAR / LISTAR (`index.php`)**

#### **O que faz:**
Lista todas as solicitações de compras com filtros avançados e paginação.

#### **Filtros Disponíveis:**
- **Busca Geral** (text): Número, Descrição, Solicitante, Unidade
- **Status** (select): Todos, Em Digitação, Aberto, Parcial, Finalizado, Cancelada, etc.
- **Solicitante** (select): Filtro por nome do solicitante
- **Unidade** (select): Filtro por filial
- **Data Início** (date): Filtro por data de criação inicial
- **Data Fim** (date): Filtro por data de criação final

#### **Consulta SQL:**
```sql
SELECT sc.*,
       sc.motivo as descricao,
       DATE_FORMAT(sc.criado_em, '%d/%m/%Y %H:%i') as data_formatada,
       DATE_FORMAT(sc.data_necessidade, '%d/%m/%Y') as data_necessidade_formatada,
       DATE_FORMAT(sc.data_entrega_cd, '%d/%m/%Y') as data_entrega_formatada
FROM solicitacoes_compras sc 
WHERE [filtros dinâmicos]
ORDER BY sc.criado_em DESC, sc.id DESC
LIMIT ? OFFSET ?
```

**Antes de listar:** Sistema recalcula automaticamente o status de todas as solicitações visíveis.

#### **Tabela de Listagem:**

| Número | Descrição | Solicitante | Unidade | Data Solicitação | Data Necessidade | Status | Valor Total | Ações |
|--------|-----------|-------------|---------|------------------|------------------|--------|-------------|-------|
| SC000001 | Compra Programada | João Silva | Filial A | 03/11/2024 10:30 | 10/11/2024 | ABERTO | R$ 1.500,00 | 👁️ ✏️ 🖨️ 🗑️ |

#### **Ações por Solicitação:**
- 👁️ **Visualizar** → `visualizar.php?id={id}`
- ✏️ **Editar** → `editar.php?id={id}` (apenas se status permitir)
- 🖨️ **Imprimir** → Abre `visualizar.php` em popup e dispara `window.print()`
- 🗑️ **Excluir** → Somente se status = "aberto" (sem vínculos)

#### **Funcionalidade de Exclusão:**
```php
// Via GET
if (isset($_GET['excluir'])) {
    // Verificar status
    $solicitacao = fetchOne("SELECT status FROM solicitacoes_compras WHERE id = ?", [$id]);
    
    if ($solicitacao['status'] === 'aberto') {
        // Excluir itens primeiro (CASCADE faz isso automaticamente)
        executeQuery("DELETE FROM solicitacao_compras_itens WHERE solicitacao_id = ?", [$id]);
        executeQuery("DELETE FROM solicitacoes_compras WHERE id = ?", [$id]);
        $sucesso = "Solicitação excluída!";
    } else {
        $erro = "Não é possível excluir. Status: {$status}";
    }
}
```

**Paginação:**
- Configurável: 10, 25, 50, 100 itens por página
- Navegação com botões: ‹ 1 ... 5 6 **7** 8 9 ... 15 ›

---

### **2. CADASTRAR (`cadastrar.php`)**

#### **O que faz:**
Cria uma nova solicitação de compras com seus itens.

#### **Seções do Formulário:**

#### **A) Cabeçalho da Solicitação**

**Campos:**
- **Filial** (select, obrigatório)
  - Dropdown com todas as filiais cadastradas
  - Formato: "Nome da Filial (Código)"

- **Data de Entrega CD** (date, obrigatório)
  - Data quando os produtos devem chegar no Centro de Distribuição
  - Ao preencher, dispara AJAX para calcular semana de abastecimento

- **Semana de Abastecimento** (text, readonly)
  - Calculada automaticamente via API
  - Formato: "01/11/2024 a 07/11/2024"
  - Busca do banco se já existe para a mesma data, senão calcula

- **Solicitante** (text, readonly)
  - Preenchido automaticamente com usuário logado
  - Não pode ser alterado

- **Justificativa** (select, obrigatório)
  - "Compra Emergencial"
  - "Compra Programada"

- **Observações Gerais** (textarea, opcional)
  - Campo livre para informações adicionais

- **Data do Documento** (date, readonly)
  - Data atual automaticamente
  - Não pode ser alterada

- **Status** (hidden)
  - Sempre começa como `em_digitacao`
  - Ao salvar, muda para `aberto`

#### **B) Produtos da Solicitação**

**Tabela dinâmica com colunas:**

| Nome Genérico | Unidade | Quantidade | Observação | Ações |
|---------------|---------|------------|------------|-------|
| *Select com produtos* | *Select com unidades* | *Input numérico* | *Input texto* | 🗑️ Remover |

**Funcionalidades:**
- **Botão "Adicionar Produto"**: Adiciona nova linha na tabela
- **Select de Produtos**: Lista todos os produtos genéricos ativos
- **Auto-preenchimento de Unidade**: Ao selecionar produto, unidade é preenchida automaticamente
- **Validação de Duplicidade**: Não permite adicionar o mesmo produto duas vezes
- **Indicação Visual**: Produtos já adicionados aparecem desabilitados e riscados nos selects

**JavaScript - Adicionar Produto:**
```javascript
function adicionarProduto() {
    const row = `
        <tr id="product-row-${counter}">
            <td>
                <select name="produtos[${counter}][codigo]" 
                        onchange="selecionarProduto(${counter})" required>
                    <option value="">Selecione...</option>
                    ${produtos.map(p => 
                        `<option value="${p.codigo_produto}" 
                                 data-unidade="${p.unidade_id}">
                            ${p.nome}
                        </option>`
                    )}
                </select>
            </td>
            <td>
                <select name="produtos[${counter}][unidade]" required>
                    ${unidades.map(u => 
                        `<option value="${u.id}">${u.simbolo}</option>`
                    )}
                </select>
            </td>
            <td><input type="number" name="produtos[${counter}][quantidade]" 
                       step="0.01" required></td>
            <td><input type="text" name="produtos[${counter}][observacao]"></td>
            <td><button onclick="removerProduto(${counter})">🗑️</button></td>
        </tr>
    `;
    tbody.innerHTML += row;
    counter++;
}
```

**JavaScript - Preenchimento Automático de Unidade:**
```javascript
function selecionarProduto(index) {
    const produtoSelect = row.querySelector('select[name*="[codigo]"]');
    const unidadeSelect = row.querySelector('select[name*="[unidade]"]');
    
    const selectedOption = produtoSelect.options[produtoSelect.selectedIndex];
    const unidadeId = selectedOption.getAttribute('data-unidade');
    
    if (unidadeId) {
        unidadeSelect.value = unidadeId; // Auto-preenche
    }
}
```

#### **Processamento do Formulário (POST):**

```php
// 1. Gerar número automático (SC000001, SC000002...)
$ultima = fetchOne("SELECT numero_solicitacao FROM solicitacoes_compras 
                    WHERE numero_solicitacao LIKE 'SC%' 
                    ORDER BY id DESC LIMIT 1");

if ($ultima) {
    $numero = intval(substr($ultima['numero_solicitacao'], 2));
    $proximo = 'SC' . str_pad($numero + 1, 6, '0', STR_PAD_LEFT);
} else {
    $proximo = 'SC000001';
}

// 2. Buscar nome da filial
$filial = fetchOne("SELECT nome FROM filiais WHERE id = ?", [$filial_id]);

// 3. Inserir solicitação
INSERT INTO solicitacoes_compras (
    numero_solicitacao, descricao, solicitante, unidade,
    data_necessidade, status, criado_por,
    data_documento, motivo, observacoes,
    filial_id, data_entrega_cd, semana_abastecimento
) VALUES (
    'SC000001', 'Compra Programada', 'João Silva', 'Filial A',
    '2024-11-10', 'aberto', 1,
    '2024-11-03', 'Compra Programada', 'Obs...',
    5, '2024-11-10', '04/11/2024 a 10/11/2024'
);

// 4. Inserir itens (loop por $_POST['produtos'])
foreach ($_POST['produtos'] as $produto) {
    // Buscar dados completos do produto
    $produto_dados = fetchOne("SELECT id, nome, codigo, unidade_medida_id 
                               FROM produto_generico WHERE codigo = ?", 
                               [$produto['codigo']]);
    
    // Buscar símbolo da unidade
    $unidade_dados = fetchOne("SELECT simbolo FROM unidades_medida WHERE id = ?", 
                               [$produto['unidade']]);
    
    // Inserir item
    INSERT INTO solicitacao_compras_itens (
        solicitacao_id, produto_id, codigo_produto, nome_produto,
        unidade_medida_id, unidade_medida, quantidade, observacao
    ) VALUES (
        $solicitacao_id, $produto_dados['id'], $produto_dados['codigo'],
        $produto_dados['nome'], $produto['unidade'], $unidade_dados['simbolo'],
        $produto['quantidade'], $produto['observacao']
    );
    
    // TRIGGER automático atualiza valor_total em solicitacoes_compras
}
```

**Validações:**
- Filial obrigatória
- Data de Entrega CD obrigatória
- Justificativa obrigatória
- Data do Documento obrigatória
- Deve ter pelo menos 1 produto

**Botões de Ação:**
- 💾 **Salvar Solicitação** → Salva e vai para `index.php`
- ✏️ **Salvar e Continuar Editando** → Salva e vai para `editar.php?id={id}`
- 🚫 **Cancelar Solicitação** → Muda status para `cancelada` e salva
- ⬅️ **Voltar** → Cancela e volta para `index.php`

---

### **3. EDITAR (`editar.php`)**

#### **O que faz:**
Permite editar uma solicitação existente.

**Parâmetros:** `?id={id_da_solicitacao}`

#### **Regra de Bloqueio de Edição:**
```php
$pode_editar = ($status === 'aberto');

if (!$pode_editar && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION['erro_msg'] = "Esta solicitação não pode ser editada. 
                             Status: {$status}. 
                             Apenas solicitações 'abertas' podem ser alteradas.";
    header('Location: visualizar.php?id=' . $id);
    exit;
}
```

**Estados de Bloqueio:**
- **ABERTO** → ✅ Pode editar
- **PARCIAL** → ❌ Bloqueado (já tem pedidos vinculados)
- **FINALIZADO** → ❌ Bloqueado (totalmente atendido)
- **CANCELADA** → ❌ Bloqueado

**Interface Bloqueada:**
Se status ≠ "aberto", o formulário inteiro fica com:
```html
<form style="pointer-events: none; opacity: 0.6;">
```
E mostra alerta: "Solicitação Bloqueada para Edição"

#### **Carregamento de Dados:**
```php
// 1. Buscar solicitação
$solicitacao = fetchOne("SELECT * FROM solicitacoes_compras WHERE id = ?", [$id]);

// 2. Buscar itens existentes
$itens_existentes = fetchAll("
    SELECT * FROM solicitacao_compras_itens 
    WHERE solicitacao_id = ? 
    ORDER BY id
", [$id]);

// 3. Renderizar formulário com dados pré-preenchidos
foreach ($itens_existentes as $idx => $item) {
    // Criar linha de produto com valores do banco
}
```

#### **Processamento da Edição (POST):**
```php
// 1. Atualizar cabeçalho
UPDATE solicitacoes_compras SET
    descricao = ?, solicitante = ?, unidade = ?, data_necessidade = ?,
    status = ?, data_documento = ?, motivo = ?, observacoes = ?,
    filial_id = ?, data_entrega_cd = ?, semana_abastecimento = ?
WHERE id = ?

// 2. DELETAR todos os itens antigos
DELETE FROM solicitacao_compras_itens WHERE solicitacao_id = ?

// 3. INSERIR novos itens (baseado no formulário)
foreach ($_POST['produtos'] as $produto) {
    INSERT INTO solicitacao_compras_itens (...)
}

// 4. TRIGGERS recalculam valor_total automaticamente
```

**Observação:** A abordagem é **DELETE + INSERT**, não UPDATE individual dos itens.

---

### **4. VISUALIZAR (`visualizar.php`)**

#### **O que faz:**
Exibe a solicitação completa em modo visualização/impressão.

**Parâmetros:** `?id={id_da_solicitacao}`

#### **Recalcular Status Antes de Exibir:**
```php
require_once 'recalcular_status_solicitacao.php';
recalcularStatusSolicitacao($solicitacao_id);
```

#### **Consulta SQL Completa:**
```sql
-- Cabeçalho com dados da filial
SELECT sc.*,
       f.nome as filial_nome,
       f.codigo as filial_codigo,
       DATE_FORMAT(sc.criado_em, '%d/%m/%Y %H:%i') as data_criacao,
       DATE_FORMAT(sc.data_entrega_cd, '%d/%m/%Y') as data_entrega_formatada
FROM solicitacoes_compras sc
LEFT JOIN filiais f ON sc.filial_id = f.id
WHERE sc.id = ?

-- Itens com informações de vínculo com pedidos
SELECT sci.*,
       um.simbolo as unidade_simbolo,
       um.nome as unidade_nome,
       -- Quantidade atendida por pedidos
       COALESCE(SUM(pci.quantidade_pedido), 0) as quantidade_utilizada,
       -- Saldo restante
       (sci.quantidade - COALESCE(SUM(pci.quantidade_pedido), 0)) as saldo_disponivel,
       -- Lista de pedidos vinculados
       GROUP_CONCAT(DISTINCT CONCAT(pc.numero_pedido, ' (', pci.quantidade_pedido, ')') 
                    SEPARATOR ', ') as pedidos_vinculados
FROM solicitacao_compras_itens sci
LEFT JOIN unidades_medida um ON sci.unidade_medida_id = um.id
LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
LEFT JOIN pedidos_compras pc ON pci.pedido_id = pc.id
WHERE sci.solicitacao_id = ?
GROUP BY sci.id
ORDER BY sci.id
```

#### **Seções Exibidas:**

**1. Cards de Informação:**
- **Informações da Solicitação:**
  - Número (SC000001)
  - Data de Criação
  - Data Entrega CD
  - Status (badge colorido)

- **Filial:**
  - Nome
  - Código (se existir)

- **Justificativa:**
  - Texto do motivo

- **Observações Gerais:**
  - Texto livre (se preenchido)

**2. Tabela de Produtos:**

| Código | Produto | Unidade | Qtd. Solicitada | Qtd. Utilizada | Saldo Disponível | Status | Pedidos Vinculados |
|--------|---------|---------|-----------------|----------------|------------------|--------|--------------------|
| 001234 | Produto A | KG | 100,00 | 50,00 | 50,00 | PARCIAL | PC000001 (50) |
| 005678 | Produto B | UN | 200,00 | 200,00 | 0,00 | FINALIZADO | PC000001 (100), PC000002 (100) |
| 009012 | Produto C | CX | 50,00 | 0,00 | 50,00 | ABERTO | Nenhum |

**Cálculos por Item:**
```php
$quantidade_solicitada = 100;
$quantidade_utilizada = 50; // Soma de todos os pedidos
$saldo_disponivel = 100 - 50 = 50;

// Status do item
if ($quantidade_utilizada == 0) {
    $status = 'aberto';
} elseif ($saldo_disponivel <= 0) {
    $status = 'finalizado';
} else {
    $status = 'parcial';
}
```

#### **Botões de Ação:**
- ✏️ **Editar** → Vai para `editar.php` (se permitido)
- 🗑️ **Excluir** → Vai para `excluir.php` (se permitido)
- 🖨️ **Imprimir** → Dispara `window.print()` com CSS otimizado
- ⬅️ **Voltar** → Retorna para `index.php`

**CSS para Impressão:**
- Oculta sidebar, botões, header
- Reduz fonte para 7-9px
- Otimiza para papel A4
- Mantém cores dos status
- Ajusta largura das colunas

---

### **5. EXCLUIR (`excluir.php` ou via `index.php?excluir=`)**

#### **Regras de Exclusão:**
```php
// Apenas pode excluir se:
$pode_excluir = ($status === 'aberto');

// Se status = 'parcial' ou 'finalizado' → TEM VÍNCULOS COM PEDIDOS
if (!$pode_excluir) {
    $erro = "Não é possível excluir. Esta solicitação está vinculada a pedidos de compras.";
}
```

**Processo:**
1. Verificar status
2. Se `aberto`:
   - DELETE itens (CASCADE automático)
   - DELETE solicitação
3. Se outro status:
   - Mostrar mensagem de erro

---

## 🔌 API E INTEGRAÇÕES

### **API: `buscar_semana_abastecimento.php`**

**Endpoint:** `POST buscar_semana_abastecimento.php`

**Parâmetros:**
- `data_entrega` (POST) - Data de entrega CD

**O que faz:**
1. Busca se já existe semana cadastrada para esta data:
```sql
SELECT semana_abastecimento 
FROM solicitacoes_compras 
WHERE data_entrega_cd = ? 
  AND semana_abastecimento IS NOT NULL
LIMIT 1
```

2. Se não encontrou, calcula baseado na data:
```php
$timestamp = strtotime($data_entrega);
$inicio_semana = date('d/m/Y', strtotime('monday this week', $timestamp));
$fim_semana = date('d/m/Y', strtotime('sunday this week', $timestamp));
$semana = "{$inicio_semana} a {$fim_semana}";
```

**Resposta JSON:**
```json
{
  "sucesso": true,
  "semana_abastecimento": "04/11/2024 a 10/11/2024",
  "data_entrega": "2024-11-10"
}
```

---

## 🔄 INTEGRAÇÃO COM PEDIDOS DE COMPRAS

### **Como Funciona o Vínculo:**

**1. Criação de Pedido a partir de Solicitação:**

Quando um usuário cria um **Pedido de Compras**, ele seleciona uma **Solicitação de Compras** e seus itens.

**Fluxo:**
```
Solicitação SC000001 (3 produtos)
  └─ Item 1: Produto A - 100 KG (solicitacao_compras_itens.id = 1)
  └─ Item 2: Produto B - 200 UN (solicitacao_compras_itens.id = 2)
  └─ Item 3: Produto C - 50 CX (solicitacao_compras_itens.id = 3)

Pedido PC000001 (vinculado à SC000001)
  └─ Item do Pedido 1: Produto A - 50 KG (solicitacao_item_id = 1)
  └─ Item do Pedido 2: Produto B - 100 UN (solicitacao_item_id = 2)

Pedido PC000002 (vinculado à SC000001)
  └─ Item do Pedido 1: Produto A - 50 KG (solicitacao_item_id = 1)
  └─ Item do Pedido 2: Produto B - 100 UN (solicitacao_item_id = 2)
  └─ Item do Pedido 3: Produto C - 50 CX (solicitacao_item_id = 3)

Resultado após PC000002:
  - Item 1 (Produto A): 50 + 50 = 100 KG → 100% atendido → FINALIZADO
  - Item 2 (Produto B): 100 + 100 = 200 UN → 100% atendido → FINALIZADO
  - Item 3 (Produto C): 50 CX → 100% atendido → FINALIZADO
  
  → Solicitação SC000001: Status = FINALIZADO
```

**2. Rastreamento de Saldo:**

```sql
-- Calcular quanto foi usado de cada item da solicitação
SELECT 
    sci.id,
    sci.quantidade as quantidade_solicitada,
    COALESCE(SUM(pci.quantidade_pedido), 0) as quantidade_utilizada,
    (sci.quantidade - COALESCE(SUM(pci.quantidade_pedido), 0)) as saldo_disponivel
FROM solicitacao_compras_itens sci
LEFT JOIN pedido_compras_itens pci ON pci.solicitacao_item_id = sci.id
WHERE sci.solicitacao_id = ?
GROUP BY sci.id
```

**Exemplo de Cálculo:**
```
Item: Produto A - 100 KG solicitado

Pedidos vinculados:
  - PC000001: 30 KG (pci.solicitacao_item_id = item.id)
  - PC000002: 50 KG (pci.solicitacao_item_id = item.id)

quantidade_utilizada = SUM(30 + 50) = 80 KG
saldo_disponivel = 100 - 80 = 20 KG
status_item = 'parcial'
```

---

## 📊 REGRAS DE NEGÓCIO

### **1. Geração de Número Automático:**
- Formato: `SC` + 6 dígitos (SC000001, SC000002...)
- Sequencial baseado no último número cadastrado
- UNIQUE constraint garante não duplicação

### **2. Status Automático:**
Sistema **recalcula automaticamente** baseado em vínculos:

| Situação | Status |
|----------|--------|
| Nenhum item vinculado a pedidos | `aberto` |
| Alguns itens parcialmente atendidos | `parcial` |
| Todos os itens 100% atendidos | `finalizado` |
| Cancelada manualmente | `cancelada` |

### **3. Regra de Edição:**
- Apenas solicitações com status **`aberto`** podem ser editadas
- Se tiver qualquer pedido vinculado → Status muda para `parcial` → Bloqueio de edição

### **4. Regra de Exclusão:**
- Apenas solicitações com status **`aberto`** podem ser excluídas
- Se tiver pedidos vinculados → Não pode excluir

### **5. Validação de Produtos Duplicados:**
- Não permite adicionar o mesmo produto duas vezes na mesma solicitação
- Validação via JavaScript no frontend
- Produtos já adicionados ficam desabilitados nos selects

### **6. Cálculo de Semana de Abastecimento:**
- Busca do banco se já existe para a mesma data
- Senão, calcula: "Segunda da semana DD/MM/YYYY a Domingo DD/MM/YYYY"

### **7. Trigger de Valor Total:**
- Campo `valor_total` em `solicitacoes_compras` é **sempre calculado automaticamente**
- Soma de todos os `valor_total` dos itens
- Atualiza em INSERT, UPDATE, DELETE de itens

---

## 📊 ESTRUTURA SQL PARA CRIAR AS TABELAS

```sql
-- Tabela Principal
CREATE TABLE solicitacoes_compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_solicitacao VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT,
    solicitante VARCHAR(100) NOT NULL,
    unidade VARCHAR(100),
    data_necessidade DATE,
    observacoes TEXT,
    status ENUM('em_digitacao', 'finalizado', 'cancelada', 'pendente', 
                'aprovada', 'rejeitada', 'em_andamento', 'concluida') DEFAULT 'em_digitacao',
    valor_total DECIMAL(15,2) DEFAULT 0.00,
    criado_por INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_documento DATE NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    filial_id INT,
    data_entrega_cd DATE,
    semana_abastecimento VARCHAR(20),
    
    INDEX idx_numero_solicitacao (numero_solicitacao),
    INDEX idx_status (status),
    INDEX idx_filial_id (filial_id),
    
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (filial_id) REFERENCES filiais(id) ON DELETE SET NULL
);

-- Tabela de Itens
CREATE TABLE solicitacao_compras_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitacao_id INT NOT NULL,
    produto_id INT,
    codigo_produto VARCHAR(10),
    nome_produto VARCHAR(200),
    unidade_medida_id INT,
    unidade_medida VARCHAR(50),
    quantidade DECIMAL(10,3) NOT NULL DEFAULT 1,
    observacao TEXT,
    valor_unitario DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) DEFAULT 0.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_solicitacao_id (solicitacao_id),
    INDEX idx_produto_id (produto_id),
    
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compras(id) ON DELETE CASCADE,
    FOREIGN KEY (unidade_medida_id) REFERENCES unidades_medida(id) ON DELETE SET NULL
);

-- Triggers (ver seção anterior)
```

---

## ✅ RESUMO DAS FUNCIONALIDADES CRUD

| Funcionalidade | Arquivo | Método | Descrição |
|---------------|---------|--------|-----------|
| **Visualizar Lista** | `index.php` | GET | Lista todas as solicitações com filtros e paginação |
| **Criar Solicitação** | `cadastrar.php` | POST | Cria nova solicitação com itens |
| **Editar Solicitação** | `editar.php` | POST | Edita solicitação (apenas se status=aberto) |
| **Visualizar Detalhes** | `visualizar.php` | GET | Mostra detalhes completos + vínculos com pedidos |
| **Excluir Solicitação** | `index.php` ou `excluir.php` | GET | Exclui solicitação (apenas se status=aberto) |
| **Buscar Semana** | `buscar_semana_abastecimento.php` | POST | API: Retorna semana de abastecimento |
| **Recalcular Status** | `recalcular_status_solicitacao.php` | Função | Recalcula status baseado em vínculos |

---

## 🔄 INTEGRAÇÕES COM OUTROS MÓDULOS

### **1. Filiais:**
```
filiais (1) ----< (N) solicitacoes_compras
```
- Cada solicitação pertence a uma filial
- Campo `filial_id` + `unidade` (nome copiado para histórico)

### **2. Produto Genérico:**
```
produto_generico (1) ----< (N) solicitacao_compras_itens
```
- Cada item referencia um produto genérico
- Dados são **copiados** (código, nome) para histórico

### **3. Unidades de Medida:**
```
unidades_medida (1) ----< (N) solicitacao_compras_itens
```
- Cada item tem uma unidade de medida
- Armazena tanto `unidade_medida_id` quanto `unidade_medida` (símbolo)

### **4. Usuários:**
```
usuarios (1) ----< (N) solicitacoes_compras
```
- Cada solicitação tem um criador (`criado_por`)
- Nome do solicitante é copiado para `solicitante`

### **5. Pedidos de Compras (VÍNCULO PRINCIPAL):**
```
solicitacoes_compras (1) ----< (N) pedidos_compras
       ↓
solicitacao_compras_itens (1) ----< (N) pedido_compras_itens
                                         (via solicitacao_item_id)
```

**Fluxo de Vínculo:**
1. Solicitação SC000001 é criada com 3 produtos
2. Usuário cria Pedido PC000001 vinculado à SC000001
3. Ao adicionar itens ao pedido, informa `solicitacao_item_id`
4. Sistema rastreia quanto de cada item foi atendido
5. Recalcula status automaticamente:
   - Se nenhum item atendido → `aberto`
   - Se alguns atendidos → `parcial`
   - Se todos atendidos → `finalizado`

**Tabela de Vínculo:**
```sql
-- Em pedido_compras_itens
solicitacao_item_id INT -- FK para solicitacao_compras_itens(id)
quantidade_solicitada DECIMAL(10,3) -- Quantidade original da SC
quantidade_pedido DECIMAL(10,3) -- Quantidade neste pedido específico
```

---

## 📊 EXEMPLO COMPLETO DE FLUXO

### **Passo 1: Criar Solicitação**
```
SC000001 - Filial: Curitiba
  Item 1: Arroz Branco - 500 KG
  Item 2: Feijão Preto - 300 KG
  Item 3: Óleo de Soja - 100 UN

Status: ABERTO (nenhum pedido vinculado)
```

### **Passo 2: Criar Primeiro Pedido**
```
PC000001 - Fornecedor: Distribuidora ABC
  (vinculado a SC000001)
  
  Item 1: Arroz Branco - 200 KG (de 500) - solicitacao_item_id = 1
  Item 2: Feijão Preto - 150 KG (de 300) - solicitacao_item_id = 2

Status da SC000001: PARCIAL
  - Arroz: 200/500 = 40% atendido
  - Feijão: 150/300 = 50% atendido
  - Óleo: 0/100 = 0% atendido
```

### **Passo 3: Criar Segundo Pedido**
```
PC000002 - Fornecedor: Distribuidora XYZ
  (vinculado a SC000001)
  
  Item 1: Arroz Branco - 300 KG (restante) - solicitacao_item_id = 1
  Item 2: Feijão Preto - 150 KG (restante) - solicitacao_item_id = 2
  Item 3: Óleo de Soja - 100 UN (total) - solicitacao_item_id = 3

Status da SC000001: FINALIZADO
  - Arroz: 200 + 300 = 500/500 = 100% ✅
  - Feijão: 150 + 150 = 300/300 = 100% ✅
  - Óleo: 100/100 = 100% ✅
```

### **Passo 4: Visualização na Solicitação**
```
Tabela de Produtos da SC000001:

| Produto | Qtd. Sol. | Qtd. Util. | Saldo | Status | Pedidos |
|---------|-----------|------------|-------|--------|---------|
| Arroz   | 500       | 500        | 0     | FINAL. | PC000001 (200), PC000002 (300) |
| Feijão  | 300       | 300        | 0     | FINAL. | PC000001 (150), PC000002 (150) |
| Óleo    | 100       | 100        | 0     | FINAL. | PC000002 (100) |
```

---

**Essa é a estrutura completa do módulo de Solicitação de Compras!** 🚀