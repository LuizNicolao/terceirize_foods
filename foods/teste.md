
## 🎯 OBJETIVO DO SISTEMA

Sistema para gerenciar **Formas de Pagamento** disponíveis no sistema Nexflow. Permite cadastrar diferentes métodos de pagamento (Boleto, PIX, Transferência, etc.) que são utilizados no módulo de **Pedidos de Compras**. Sistema simples mas essencial para padronizar as formas de pagamento aceitas pela empresa.

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabela: `formas_pagamento`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT AUTO_INCREMENT | ID único da forma de pagamento |
| `nome` | VARCHAR(100) NOT NULL | Nome da forma de pagamento (ex: "Boleto Bancário", "PIX") |
| `descricao` | TEXT | Descrição detalhada da forma de pagamento (opcional) |
| `prazo_padrao` | VARCHAR(50) | Prazo padrão associado (ex: "30 dias", "À vista") - opcional |
| `ativo` | TINYINT(1) DEFAULT 1 | 1 = Ativo (disponível para uso), 0 = Inativo |
| `criado_em` | TIMESTAMP | Data/hora de criação do registro |
| `atualizado_em` | TIMESTAMP | Data/hora da última atualização (auto-atualizado) |
| `criado_por` | INT | ID do usuário que criou o registro |

**Índices:**
- `idx_ativo` (ativo) - Para filtrar apenas formas ativas
- `idx_criado_por` (criado_por) - Para rastreabilidade

**Constraints:**
- `nome` NOT NULL - Nome é obrigatório
- `ativo` DEFAULT 1 - Por padrão, formas são criadas ativas

---

## 📊 DADOS PRÉ-CADASTRADOS

Ao instalar o módulo, são criadas **7 formas de pagamento padrão**:

| ID | Nome | Descrição | Prazo Padrão | Ativo |
|----|------|-----------|--------------|-------|
| 1 | Boleto | Pagamento via boleto bancário | 30 dias | ✅ |
| 2 | Transferência Bancária | Transferência entre contas | À vista | ✅ |
| 3 | PIX | Pagamento instantâneo via PIX | À vista | ✅ |
| 4 | Cheque | Pagamento via cheque | 30 dias | ✅ |
| 5 | Cartão de Crédito | Pagamento com cartão de crédito | 30 dias | ✅ |
| 6 | Depósito Bancário | Depósito em conta bancária | À vista | ✅ |
| 7 | Dinheiro | Pagamento em espécie | À vista | ✅ |

---

## 🔗 RELACIONAMENTOS E VÍNCULOS

### **Integração com Pedidos de Compras:**

```
formas_pagamento (N) → pedidos_compras.forma_pagamento (texto)
```

**Importante:** O vínculo é **por nome (texto)**, não por ID (FK).

**Motivo:** Permite que o pedido mantenha o histórico mesmo se a forma for excluída.

**Exemplo:**
```sql
-- Pedido de Compras
pedidos_compras:
  numero_pedido: PC000001
  forma_pagamento: "Boleto Bancário"  ← Texto, não FK
  prazo_pagamento: "30 dias"
```

### **Verificação de Uso:**

Antes de excluir uma forma de pagamento, o sistema verifica:
```sql
SELECT COUNT(*) as total 
FROM pedidos_compras 
WHERE forma_pagamento = 'Boleto Bancário'
```

Se `total > 0` → **Não permite excluir** (está em uso)

---

## 📁 ARQUIVOS DO SISTEMA

### **Arquivos Principais:**

1. **`index.php`** - Listagem com filtros (READ)
2. **`cadastrar.php`** - Cadastro de forma de pagamento (CREATE)
3. **`editar.php`** - Edição de forma de pagamento (UPDATE)
4. **`visualizar.php`** - Visualização de detalhes (READ)
5. **`excluir.php`** - Exclusão com validação (DELETE)
6. **`instalar_tabela.php`** - Script de instalação

---

## ⚙️ FUNCIONALIDADES DETALHADAS

### **1. VISUALIZAR / LISTAR (`index.php`)**

#### **O que faz:**
Lista todas as formas de pagamento cadastradas com filtros de busca e status.

#### **Filtros Disponíveis:**
- **Busca** (text): Busca por nome ou descrição
- **Status** (select): 
  - Todos
  - Ativos
  - Inativos

#### **Consulta SQL:**
```sql
SELECT * FROM formas_pagamento 
WHERE [filtros dinâmicos]
ORDER BY nome ASC
```

**Construção de Filtros:**
```php
$where = [];
$params = [];

if ($filtro_status !== '') {
    $where[] = "ativo = ?";
    $params[] = $filtro_status;  // 0 ou 1
}

if ($filtro_busca) {
    $where[] = "(nome LIKE ? OR descricao LIKE ?)";
    $params[] = "%$filtro_busca%";
    $params[] = "%$filtro_busca%";
}

$where_sql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
```

#### **Tabela de Listagem:**

| # | Nome | Descrição | Status | Ações |
|---|------|-----------|--------|-------|
| 1 | Boleto Bancário | Pagamento via boleto bancário | ✅ **Ativo** | 👁️ ✏️ 🗑️ |
| 2 | PIX | Pagamento instantâneo via PIX | ✅ **Ativo** | 👁️ ✏️ 🗑️ |
| 3 | Dinheiro | Pagamento em espécie | ❌ **Inativo** | 👁️ ✏️ 🗑️ |

**Badges de Status:**
```html
<!-- Ativo -->
<span class="status-badge status-active">
    <i class="fas fa-check-circle"></i> Ativo
</span>

<!-- Inativo -->
<span class="status-badge status-inactive">
    <i class="fas fa-times-circle"></i> Inativo
</span>
```

#### **Ações por Registro:**
- 👁️ **Visualizar** → `visualizar.php?id={id}`
- ✏️ **Editar** → `editar.php?id={id}`
- 🗑️ **Excluir** → `excluir.php?id={id}` com confirmação

#### **Botão de Ação Principal:**
- ➕ **Nova Forma de Pagamento** → `cadastrar.php`

#### **Empty State:**
Se não houver registros:
```
💳 (ícone grande)
Nenhuma forma de pagamento cadastrada.
[➕ Cadastrar Primeira Forma de Pagamento]
```

---

### **2. CADASTRAR (`cadastrar.php`)**

#### **O que faz:**
Cria uma nova forma de pagamento no sistema.

#### **Campos do Formulário:**

1. **Nome da Forma de Pagamento** (text, obrigatório)
   - Placeholder: "Ex: Boleto Bancário, PIX, Cartão de Crédito"
   - Validação: Não pode estar vazio

2. **Descrição** (textarea, opcional)
   - Placeholder: "Descreva os detalhes desta forma de pagamento"
   - Múltiplas linhas

3. **Forma de pagamento ativa** (checkbox)
   - Marcado por padrão
   - Se desmarcado: forma fica inativa (não aparece em selects)

#### **Processamento do Formulário (POST):**

```php
// 1. Receber dados
$nome = trim($_POST['nome'] ?? '');
$descricao = trim($_POST['descricao'] ?? '');
$ativo = isset($_POST['ativo']) ? 1 : 0;

// 2. Validações
if (empty($nome)) {
    throw new Exception("O nome da forma de pagamento é obrigatório.");
}

// 3. Inserir no banco
$id = insert("
    INSERT INTO formas_pagamento (nome, descricao, ativo, criado_por)
    VALUES (?, ?, ?, ?)
", [$nome, $descricao, $ativo, $usuario_id]);

// 4. Redirecionar para visualização
header("Location: visualizar.php?id=$id");
```

**Validações:**
- Nome não pode estar vazio
- Descrição é opcional
- Status padrão: Ativo (1)

**Após Salvar:**
Redireciona para `visualizar.php?id={id_criado}` mostrando o registro recém-criado.

---

### **3. EDITAR (`editar.php`)**

#### **O que faz:**
Permite editar uma forma de pagamento existente.

**Parâmetros:** `?id={id_da_forma}`

#### **Carregamento de Dados:**
```php
// Buscar forma de pagamento
$forma = fetchOne("SELECT * FROM formas_pagamento WHERE id = ?", [$id]);

if (!$forma) {
    $erro = "Forma de pagamento não encontrada.";
    // Bloqueia exibição do formulário
}
```

#### **Campos do Formulário:**
Mesmos campos do cadastro, mas **pré-preenchidos**:

```html
<input type="text" name="nome" value="<?php echo htmlspecialchars($forma['nome']); ?>" required>

<textarea name="descricao"><?php echo htmlspecialchars($forma['descricao'] ?? ''); ?></textarea>

<input type="checkbox" name="ativo" <?php echo $forma['ativo'] == 1 ? 'checked' : ''; ?>>
```

#### **Processamento da Edição (POST):**

```php
// 1. Receber dados
$nome = trim($_POST['nome'] ?? '');
$descricao = trim($_POST['descricao'] ?? '');
$ativo = isset($_POST['ativo']) ? 1 : 0;

// 2. Validações
if (empty($nome)) {
    throw new Exception("O nome é obrigatório.");
}

// 3. Atualizar no banco
executeQuery("
    UPDATE formas_pagamento 
    SET nome = ?, descricao = ?, ativo = ?
    WHERE id = ?
", [$nome, $descricao, $ativo, $id]);

$sucesso = "Forma de pagamento atualizada com sucesso!";

// 4. Recarregar dados para mostrar valores atualizados
$forma = fetchOne("SELECT * FROM formas_pagamento WHERE id = ?", [$id]);
```

**Observações:**
- **Não redireciona** após salvar (fica na mesma página mostrando mensagem de sucesso)
- Dados são recarregados para refletir mudanças
- Campo `atualizado_em` é atualizado automaticamente pelo banco

**Botões de Ação:**
- 💾 **Salvar Alterações** → Salva e recarrega página
- ❌ **Cancelar** → Volta para `visualizar.php?id={id}`

---

### **4. VISUALIZAR (`visualizar.php`)**

#### **O que faz:**
Exibe os detalhes completos de uma forma de pagamento em modo visualização.

**Parâmetros:** `?id={id_da_forma}`

#### **Consulta SQL:**
```sql
SELECT * FROM formas_pagamento WHERE id = ?
```

#### **Seções Exibidas:**

**1. Informações Principais:**
- **ID**: Número do registro
- **Nome**: Nome da forma de pagamento (em negrito)
- **Status**: Badge colorido (Ativo/Inativo)
- **Descrição**: Texto completo (ou "Sem descrição" se vazio)

**2. Informações do Sistema:**
- **Criado em**: Data/hora formatada (DD/MM/YYYY HH:MM)
- **Atualizado em**: Data/hora da última modificação (se foi alterado)

**Layout:**
```
┌─────────────────────────────────────────┐
│ 💳 Informações Principais               │
├─────────────────────────────────────────┤
│ #  ID: 1                                │
│ 💳 Nome: Boleto Bancário                │
│ ✅ Status: ✓ Ativo                      │
│ 📄 Descrição: Pagamento via boleto...   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🕐 Informações do Sistema               │
├─────────────────────────────────────────┤
│ 📅 Criado em: 03/11/2024 10:30         │
│ ✏️ Atualizado em: 05/11/2024 14:22     │
└─────────────────────────────────────────┘
```

#### **Botões de Ação:**
- ✏️ **Editar** → `editar.php?id={id}`
- 🗑️ **Excluir** → `excluir.php?id={id}` com confirmação
- ⬅️ **Voltar** → `index.php`

---

### **5. EXCLUIR (`excluir.php`)**

#### **O que faz:**
Página de confirmação para excluir uma forma de pagamento.

**Parâmetros:** `?id={id_da_forma}`

#### **Verificação de Uso (ANTES de Excluir):**

```php
// Verificar se está em uso em pedidos de compras
$em_uso = fetchOne("
    SELECT COUNT(*) as total 
    FROM pedidos_compras 
    WHERE forma_pagamento = ?
", [$forma['nome']]);

if ($em_uso && $em_uso['total'] > 0) {
    $erro = "Não é possível excluir esta forma de pagamento pois ela está sendo utilizada em {$em_uso['total']} pedido(s).";
    // Bloqueia exclusão
}
```

**Regra de Negócio:**
- ✅ Pode excluir: Se não estiver vinculada a nenhum pedido
- ❌ Não pode excluir: Se estiver em uso em qualquer pedido

**Alternativa:** Em vez de excluir, pode **desativar** (editar e desmarcar "Ativo").

#### **Tela de Confirmação:**

```
⚠️ Atenção! Esta ação não pode ser desfeita. 
   Tem certeza que deseja excluir esta forma de pagamento?

┌─────────────────────────────────────────┐
│ # ID: 5                                 │
│ 💳 Nome: Cartão de Crédito              │
│ 📅 Prazo Padrão: 30 dias                │
│ ✅ Status: Ativo                        │
└─────────────────────────────────────────┘

[🗑️ Confirmar Exclusão]  [❌ Cancelar]
```

#### **Processamento da Exclusão (POST):**

```php
// Método: POST (não GET para segurança)

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Verificar uso
        $em_uso = fetchOne("SELECT COUNT(*) as total FROM pedidos_compras WHERE forma_pagamento = ?", [$forma['nome']]);
        
        if ($em_uso['total'] > 0) {
            throw new Exception("Está em uso em {$em_uso['total']} pedido(s).");
        }
        
        // Excluir
        executeQuery("DELETE FROM formas_pagamento WHERE id = ?", [$id]);
        
        $_SESSION['sucesso_msg'] = "Forma de pagamento excluída com sucesso!";
        header('Location: index.php');
        exit;
        
    } catch (Exception $e) {
        $erro = "Erro ao excluir: " . $e->getMessage();
    }
}
```

**Botões:**
- 🗑️ **Confirmar Exclusão** (botão vermelho) → Submit do formulário POST
- ❌ **Cancelar** → Volta para `visualizar.php?id={id}`

---

## 📊 REGRAS DE NEGÓCIO

### **1. Nome Obrigatório:**
- Campo `nome` não pode estar vazio
- É o identificador usado nos pedidos

### **2. Status Ativo/Inativo:**
- **Ativo (1)**: Aparece nos selects de pedidos de compras
- **Inativo (0)**: Não aparece, mas mantém histórico

**Query em Pedidos de Compras:**
```sql
SELECT id, nome, prazo_padrao 
FROM formas_pagamento 
WHERE ativo = 1  ← Apenas ativos
ORDER BY nome
```

### **3. Exclusão com Validação:**
- Verifica se está em uso em `pedidos_compras`
- Se estiver em uso → **Bloqueia exclusão**
- Sugestão: Desativar em vez de excluir

### **4. Prazo Padrão (Opcional):**
Campo `prazo_padrao` é opcional e informativo. Pode ser usado futuramente para auto-preenchimento.

### **5. Histórico Preservado:**
Como o vínculo é por **texto** (não FK), mesmo que a forma seja excluída, os pedidos antigos mantêm o histórico.

---

## 🔄 INTEGRAÇÃO COM PEDIDOS DE COMPRAS

### **Como é Usado:**

**No cadastro/edição de Pedido de Compras:**

```html
<!-- Campo: Forma de Pagamento -->
<select name="forma_pagamento">
    <option value="">Selecione...</option>
    <?php foreach ($formas_pagamento as $forma): ?>
        <option value="<?php echo htmlspecialchars($forma['nome']); ?>">
            <?php echo htmlspecialchars($forma['nome']); ?>
        </option>
    <?php endforeach; ?>
</select>
```

**Query para buscar formas ativas:**
```sql
SELECT id, nome, prazo_padrao 
FROM formas_pagamento 
WHERE ativo = 1 
ORDER BY nome
```

**Salvamento no Pedido:**
```sql
INSERT INTO pedidos_compras (
    ...,
    forma_pagamento,  -- Armazena o NOME (texto)
    prazo_pagamento,
    ...
) VALUES (
    ...,
    'Boleto Bancário',  -- Texto
    '30 dias',
    ...
)
```

### **Fluxo de Uso:**

```
1. Usuário acessa: Pedidos de Compras → Novo Pedido

2. Campo "Forma de Pagamento":
   - Dropdown com formas ativas
   - Se não houver formas, permite digitação manual
   - Link: "Cadastrar nova forma" (abre em nova aba)

3. Usuário seleciona: "Boleto Bancário"
   
4. Sistema salva no pedido: forma_pagamento = "Boleto Bancário"

5. Se futuramente "Boleto Bancário" for excluído:
   - Pedidos antigos ainda mostram "Boleto Bancário"
   - Novos pedidos não terão essa opção
```

---

## 📊 ESTRUTURA SQL PARA CRIAR A TABELA

```sql
CREATE TABLE IF NOT EXISTS `formas_pagamento` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL,
  `descricao` TEXT NULL,
  `prazo_padrao` VARCHAR(50) NULL COMMENT 'Prazo padrão (ex: 30 dias, À vista)',
  `ativo` TINYINT(1) DEFAULT 1,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `criado_por` INT NULL,
  INDEX `idx_ativo` (`ativo`),
  INDEX `idx_criado_por` (`criado_por`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados Iniciais
INSERT INTO `formas_pagamento` (`nome`, `descricao`, `prazo_padrao`, `ativo`) VALUES
('Boleto', 'Pagamento via boleto bancário', '30 dias', 1),
('Transferência Bancária', 'Transferência entre contas', 'À vista', 1),
('PIX', 'Pagamento instantâneo via PIX', 'À vista', 1),
('Cheque', 'Pagamento via cheque', '30 dias', 1),
('Cartão de Crédito', 'Pagamento com cartão de crédito', '30 dias', 1),
('Depósito Bancário', 'Depósito em conta bancária', 'À vista', 1),
('Dinheiro', 'Pagamento em espécie', 'À vista', 1);
```

---

## ✅ RESUMO DAS FUNCIONALIDADES CRUD

| Funcionalidade | Arquivo | Método | Descrição |
|---------------|---------|--------|-----------|
| **Visualizar Lista** | `index.php` | GET | Lista todas as formas com filtros |
| **Criar Forma** | `cadastrar.php` | POST | Cria nova forma de pagamento |
| **Editar Forma** | `editar.php` | POST | Edita forma existente |
| **Visualizar Detalhes** | `visualizar.php` | GET | Mostra detalhes completos |
| **Excluir Forma** | `excluir.php` | POST | Exclui (se não estiver em uso) |

---

## 🔄 INTEGRAÇÕES

### **1. Pedidos de Compras:**
```
formas_pagamento (N) → pedidos_compras.forma_pagamento (texto)
```
- Vínculo por **nome** (texto)
- Usado no dropdown ao criar/editar pedidos
- Permite digitação manual se não houver formas cadastradas

### **2. Usuários:**
```
usuarios (1) ----< (N) formas_pagamento.criado_por
```
- Rastreia quem criou cada forma
- Para auditoria

---

## 📋 CASOS DE USO PRÁTICOS

### **Caso 1: Cadastrar Nova Forma**
```
Cenário: Empresa passou a aceitar Pix Parcelado

Ação:
1. Acessar: Formas de Pagamento → Nova Forma
2. Preencher:
   - Nome: "PIX Parcelado"
   - Descrição: "Pagamento via PIX com parcelamento em até 3x"
   - Prazo: "30 dias"
   - Ativo: ✓
3. Salvar

Resultado:
- Disponível imediatamente em Pedidos de Compras
- Aparece no dropdown de formas
```

### **Caso 2: Desativar Forma Obsoleta**
```
Cenário: Empresa não aceita mais cheques

Ação:
1. Acessar: Formas de Pagamento → Editar "Cheque"
2. Desmarcar: "Forma de pagamento ativa"
3. Salvar

Resultado:
- Não aparece mais em novos pedidos
- Pedidos antigos com cheque mantêm o histórico
- Pode reativar futuramente se necessário
```

### **Caso 3: Tentar Excluir Forma em Uso**
```
Cenário: Tentar excluir "Boleto" que está em 25 pedidos

Ação:
1. Acessar: Formas de Pagamento → Excluir "Boleto"
2. Clicar em "Confirmar Exclusão"

Resultado:
- ❌ ERRO: "Não é possível excluir esta forma de pagamento 
           pois ela está sendo utilizada em 25 pedido(s)."
- Exclusão bloqueada
- Sugestão: Desativar em vez de excluir
```

### **Caso 4: Buscar Forma Específica**
```
Cenário: Precisa encontrar "PIX" rapidamente em uma lista de 20 formas

Ação:
1. Acessar: Formas de Pagamento
2. Filtro "Buscar": digitar "pix"
3. Clicar em "Filtrar"

Resultado:
- Lista mostra apenas formas com "pix" no nome ou descrição
- Filtragem case-insensitive via LIKE
```

---

## 🎨 OBSERVAÇÕES SOBRE A INTERFACE

### **Características:**
- Layout com **Sidebar** de navegação
- Cards com bordas arredondadas
- **Badges coloridos** para status:
  - Verde (#10B981): Ativo
  - Cinza (#6B7280): Inativo
- Ícones Font Awesome 6.0
- Tema Windows 11 consistente

### **Cores do Módulo:**
- **Cor principal**: Verde (#10B981) - Representa pagamento/dinheiro
- **Ícone**: 💳 `fa-credit-card`

### **Responsividade:**
- Adaptado para desktop, tablet e mobile
- Sidebar colapsa em telas pequenas
- Tabelas com scroll horizontal

---

## 🔐 SEGURANÇA E VALIDAÇÕES

### **Segurança:**
- ✅ Verificação de login obrigatória
- ✅ Verificação de timeout de sessão
- ✅ Prepared Statements (PDO) - Proteção contra SQL Injection
- ✅ `htmlspecialchars()` - Proteção contra XSS
- ✅ Exclusão via POST (não GET) - Proteção contra CSRF

### **Validações:**

**Cadastro/Edição:**
```php
if (empty($nome)) {
    throw new Exception("O nome da forma de pagamento é obrigatório.");
}

// Nome é o único campo obrigatório
// Descrição e prazo são opcionais
```

**Exclusão:**
```php
// Verifica se está em uso
$em_uso = fetchOne("SELECT COUNT(*) FROM pedidos_compras WHERE forma_pagamento = ?", [$nome]);

if ($em_uso['total'] > 0) {
    throw new Exception("Está em uso em {$em_uso['total']} pedido(s).");
}

// Só exclui se uso = 0
```

---

## 📊 EXEMPLO COMPLETO DE FLUXO

### **Fluxo 1: Cadastro Completo**

```
1. Usuário acessa:
   http://localhost:8080/nexflow/modulos/suprimentos/formas_pagamento/

2. Clica em: "Nova Forma de Pagamento"

3. Preenche formulário:
   - Nome: "Transferência Bancária Internacional"
   - Descrição: "Transferência para conta no exterior via Swift"
   - Prazo Padrão: "À vista"
   - Ativo: ✓ (marcado)

4. Clica em: "Salvar Forma de Pagamento"

5. Sistema:
   - Insere no banco:
     INSERT INTO formas_pagamento (nome, descricao, prazo_padrao, ativo, criado_por)
     VALUES ('Transferência Bancária Internacional', '...', 'À vista', 1, 1)
   
   - Retorna ID: 8
   
   - Redireciona para: visualizar.php?id=8

6. Página de visualização mostra:
   ✅ "Transferência Bancária Internacional" cadastrado com sucesso!
   
   [✏️ Editar] [🗑️ Excluir] [⬅️ Voltar]
```

### **Fluxo 2: Edição**

```
1. Usuário na listagem clica em ✏️ em "PIX"

2. Sistema carrega: editar.php?id=3

3. Formulário pré-preenchido:
   - Nome: "PIX"
   - Descrição: "Pagamento instantâneo via PIX"
   - Ativo: ✓

4. Usuário altera descrição para:
   "Pagamento instantâneo via PIX - Disponível 24/7"

5. Clica em: "Salvar Alterações"

6. Sistema:
   - UPDATE formas_pagamento SET descricao = '...', atualizado_em = NOW() WHERE id = 3
   
   - Recarrega mesma página mostrando:
     ✅ "Forma de pagamento atualizada com sucesso!"
   
   - Campos mostram valores atualizados
```

### **Fluxo 3: Tentativa de Exclusão (Bloqueada)**

```
1. Usuário clica em 🗑️ em "Boleto"

2. Sistema carrega: excluir.php?id=1

3. Mostra tela de confirmação:
   ⚠️ Atenção! Esta ação não pode ser desfeita...
   
   Dados:
   - Nome: "Boleto"
   - Status: Ativo

4. Usuário clica em: "Confirmar Exclusão"

5. Sistema verifica:
   SELECT COUNT(*) FROM pedidos_compras WHERE forma_pagamento = 'Boleto'
   → Resultado: 25 pedidos

6. Sistema bloqueia:
   ❌ ERRO: "Não é possível excluir esta forma de pagamento pois 
            ela está sendo utilizada em 25 pedido(s)."
   
   [⬅️ Voltar]

Alternativa sugerida:
   "Para desabilitar esta forma sem excluí-la, 
    edite o registro e desmarque 'Ativo'."
```

### **Fluxo 4: Uso em Pedido de Compras**

```
1. Usuário cria Pedido PC000010

2. Campo "Forma de Pagamento":
   <select name="forma_pagamento">
     <option value="">Selecione...</option>
     <option value="Boleto">Boleto</option>
     <option value="PIX">PIX</option>
     <option value="Transferência Bancária">Transferência Bancária</option>
     <!-- Apenas formas com ativo=1 -->
   </select>

3. Usuário seleciona: "PIX"

4. Sistema salva:
   pedidos_compras:
     numero_pedido: PC000010
     forma_pagamento: "PIX"  ← Texto, não ID

5. Visualização do Pedido mostra:
   💳 Forma de Pagamento: PIX
   📅 Prazo: À vista
```

---

## 🎯 DIFERENÇAS EM RELAÇÃO A OUTROS MÓDULOS

### **Simplicidade:**
Este é um módulo **auxiliar/paramétrico** simples:
- Apenas 3 campos principais (nome, descrição, ativo)
- Sem relacionamentos complexos
- Sem triggers complicados
- Sem cálculos automáticos

### **Sem Paginação:**
- Quantidade de formas é limitada (10-20 normalmente)
- Não necessita paginação
- Lista todas de uma vez

### **Vínculo por Texto:**
- Diferente de FK tradicional
- Permite flexibilidade
- Mantém histórico mesmo após exclusão

---

## 💡 BOAS PRÁTICAS E RECOMENDAÇÕES

### **1. Não Excluir, Desativar:**
```
❌ Evitar: Excluir formas antigas
✅ Preferir: Desativar marcando ativo=0
```

**Motivo:** Preserva integridade referencial e histórico.

### **2. Nomes Padronizados:**
```
✅ Bom: "Boleto Bancário", "PIX", "Transferência Bancária"
❌ Ruim: "boleto", "pix!!!", "transf"
```

**Motivo:** Profissionalismo e consistência nos relatórios.

### **3. Descrição Clara:**
```
✅ Bom: "Pagamento via boleto bancário com vencimento em 30 dias"
❌ Ruim: "Boleto" (sem descrição)
```

**Motivo:** Facilita compreensão para novos usuários.

---

## 📊 ESTRUTURA SQL COMPLETA

```sql
-- Tabela
CREATE TABLE `formas_pagamento` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL,
  `descricao` TEXT NULL,
  `prazo_padrao` VARCHAR(50) NULL COMMENT 'Ex: 30 dias, À vista',
  `ativo` TINYINT(1) DEFAULT 1,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `criado_por` INT NULL,
  INDEX `idx_ativo` (`ativo`),
  INDEX `idx_criado_por` (`criado_por`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados Padrão
INSERT INTO `formas_pagamento` (`nome`, `descricao`, `prazo_padrao`, `ativo`) VALUES
('Boleto', 'Pagamento via boleto bancário', '30 dias', 1),
('Transferência Bancária', 'Transferência entre contas', 'À vista', 1),
('PIX', 'Pagamento instantâneo via PIX', 'À vista', 1),
('Cheque', 'Pagamento via cheque', '30 dias', 1),
('Cartão de Crédito', 'Pagamento com cartão de crédito', '30 dias', 1),
('Depósito Bancário', 'Depósito em conta bancária', 'À vista', 1),
('Dinheiro', 'Pagamento em espécie', 'À vista', 1);
```

---

## 🔍 QUERIES PRINCIPAIS

### **1. Listar Formas Ativas (Para Pedidos):**
```sql
SELECT id, nome, prazo_padrao 
FROM formas_pagamento 
WHERE ativo = 1 
ORDER BY nome ASC
```

### **2. Verificar se Está em Uso:**
```sql
SELECT COUNT(*) as total 
FROM pedidos_compras 
WHERE forma_pagamento = 'Boleto Bancário'
```

### **3. Buscar com Filtros:**
```sql
SELECT * FROM formas_pagamento 
WHERE ativo = 1 
  AND (nome LIKE '%pix%' OR descricao LIKE '%pix%')
ORDER BY nome ASC
```

### **4. Histórico de Uso (Para Auditoria):**
```sql
-- Quantos pedidos usam cada forma
SELECT 
    fp.nome,
    COUNT(pc.id) as total_pedidos,
    SUM(pc.valor_total) as valor_total_pedidos
FROM formas_pagamento fp
LEFT JOIN pedidos_compras pc ON pc.forma_pagamento = fp.nome
GROUP BY fp.id, fp.nome
ORDER BY total_pedidos DESC
```


**Uso Principal:** Padronizar formas de pagamento usadas em **Pedidos de Compras**.

---

**Essa é a estrutura completa do módulo de Formas de Pagamento!** 🚀