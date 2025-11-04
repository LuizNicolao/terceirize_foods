
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