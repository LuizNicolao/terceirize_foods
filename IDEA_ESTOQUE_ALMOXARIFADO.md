# 📦 Proposta de Implementação: Sistema de Estoque/Almoxarifado

## 🎯 Objetivo
Implementar um sistema completo de gestão de estoque integrado com almoxarifados, permitindo rastreamento de entradas, saídas e movimentações de produtos.

---

## 📊 1. ESTRUTURA DE TABELAS

### 1.1 Tabela: `almoxarifado_estoque`
Armazena o saldo atual de cada produto em cada almoxarifado.

```sql
CREATE TABLE almoxarifado_estoque (
  id INT PRIMARY KEY AUTO_INCREMENT,
  almoxarifado_id INT NOT NULL,
  produto_generico_id INT NOT NULL,
  quantidade_atual DECIMAL(15,3) DEFAULT 0.000,
  quantidade_reservada DECIMAL(15,3) DEFAULT 0.000, -- Para reservas/pedidos futuros
  quantidade_disponivel DECIMAL(15,3) GENERATED ALWAYS AS (quantidade_atual - quantidade_reservada) STORED,
  valor_unitario_medio DECIMAL(15,2) DEFAULT 0.00, -- Custo médio ponderado
  valor_total DECIMAL(15,2) GENERATED ALWAYS AS (quantidade_atual * valor_unitario_medio) STORED,
  estoque_minimo DECIMAL(15,3) DEFAULT 0.000,
  estoque_maximo DECIMAL(15,3) DEFAULT NULL,
  ponto_reposicao DECIMAL(15,3) DEFAULT NULL,
  localizacao VARCHAR(100) NULL, -- Ex: "Prateleira A-05"
  lote VARCHAR(50) NULL,
  data_validade DATE NULL,
  status ENUM('ATIVO', 'BLOQUEADO', 'INATIVO') DEFAULT 'ATIVO',
  observacoes TEXT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  usuario_cadastro_id INT NULL,
  usuario_atualizacao_id INT NULL,
  
  UNIQUE KEY uk_almoxarifado_produto (almoxarifado_id, produto_generico_id, lote, data_validade),
  FOREIGN KEY (almoxarifado_id) REFERENCES almoxarifado(id),
  FOREIGN KEY (produto_generico_id) REFERENCES produto_generico(id),
  INDEX idx_produto (produto_generico_id),
  INDEX idx_almoxarifado (almoxarifado_id),
  INDEX idx_status (status)
);
```

**Pontos importantes:**
- **Saldo único por produto/almoxarifado**: Evita duplicidades
- **Suporte a lotes e validades**: Importante para produtos perecíveis
- **Custo médio ponderado**: Facilita cálculo de valor do estoque
- **Quantidade reservada**: Permite reservar estoque para saídas futuras

---

### 1.2 Tabela: `almoxarifado_movimentacoes`
Registra todas as movimentações de estoque (entrada, saída, transferência, ajuste).

```sql
CREATE TABLE almoxarifado_movimentacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  almoxarifado_id INT NOT NULL,
  produto_generico_id INT NOT NULL,
  tipo_movimentacao ENUM('ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE', 'DEVOLUCAO', 'PERDA', 'AVARIA') NOT NULL,
  quantidade DECIMAL(15,3) NOT NULL,
  valor_unitario DECIMAL(15,2) DEFAULT 0.00,
  valor_total DECIMAL(15,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  
  -- Origem/Destino
  almoxarifado_origem_id INT NULL, -- Para transferências
  almoxarifado_destino_id INT NULL, -- Para transferências
  
  -- Documentos relacionados
  nota_fiscal_id INT NULL, -- Para entradas via NF
  nota_fiscal_item_id INT NULL,
  pedido_compra_id INT NULL,
  requisicao_id INT NULL, -- Para saídas (futuro)
  solicitacao_id INT NULL, -- Para saídas (futuro)
  
  -- Controle
  lote VARCHAR(50) NULL,
  data_validade DATE NULL,
  motivo TEXT NULL,
  observacoes TEXT NULL,
  status ENUM('PENDENTE', 'CONFIRMADO', 'CANCELADO') DEFAULT 'CONFIRMADO',
  
  -- Auditoria
  data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (almoxarifado_id) REFERENCES almoxarifado(id),
  FOREIGN KEY (produto_generico_id) REFERENCES produto_generico(id),
  FOREIGN KEY (nota_fiscal_id) REFERENCES notas_fiscais(id),
  FOREIGN KEY (nota_fiscal_item_id) REFERENCES notas_fiscais_itens(id),
  FOREIGN KEY (almoxarifado_origem_id) REFERENCES almoxarifado(id),
  FOREIGN KEY (almoxarifado_destino_id) REFERENCES almoxarifado(id),
  INDEX idx_almoxarifado (almoxarifado_id),
  INDEX idx_produto (produto_generico_id),
  INDEX idx_tipo (tipo_movimentacao),
  INDEX idx_data (data_movimentacao),
  INDEX idx_nota_fiscal (nota_fiscal_id)
);
```

**Pontos importantes:**
- **Histórico completo**: Todas as movimentações são registradas
- **Rastreabilidade**: Vincula movimentações a documentos (NF, pedidos, etc.)
- **Status**: Permite cancelar movimentações (estorno)
- **Transferências**: Suporta movimentação entre almoxarifados

---

### 1.3 Tabela: `almoxarifado_reservas` (Opcional - Futuro)
Para reservar estoque para saídas futuras (requisições, solicitações).

```sql
CREATE TABLE almoxarifado_reservas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  almoxarifado_id INT NOT NULL,
  produto_generico_id INT NOT NULL,
  quantidade DECIMAL(15,3) NOT NULL,
  requisicao_id INT NULL,
  solicitacao_id INT NULL,
  data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_vencimento TIMESTAMP NULL,
  status ENUM('ATIVA', 'CONFIRMADA', 'CANCELADA', 'VENCIDA') DEFAULT 'ATIVA',
  observacoes TEXT NULL,
  usuario_id INT NOT NULL,
  
  FOREIGN KEY (almoxarifado_id) REFERENCES almoxarifado(id),
  FOREIGN KEY (produto_generico_id) REFERENCES produto_generico(id),
  INDEX idx_status (status),
  INDEX idx_data_vencimento (data_vencimento)
);
```

---

## 🔄 2. FLUXO DE ENTRADA VIA NOTA FISCAL

### 2.1 Quando uma Nota Fiscal é lançada (status = 'LANCADA')

**Opção A: Entrada Automática**
- Ao lançar a NF, automaticamente cria movimentações de ENTRADA
- Atualiza saldo no almoxarifado da filial
- **Vantagem**: Automático, sem intervenção manual
- **Desvantagem**: Pode não refletir a realidade física (produto pode ir para outro almoxarifado)


### 2.2 Campos adicionais na Nota Fiscal

Adicionar na tabela `notas_fiscais`:
- `almoxarifado_id` INT NULL - Almoxarifado de destino padrão
- `estoque_processado` BOOLEAN DEFAULT FALSE - Indica se estoque foi processado

Adicionar na tabela `notas_fiscais_itens`:
- `almoxarifado_id` INT NULL - Almoxarifado específico para este item (se diferente do padrão)
- `estoque_processado` BOOLEAN DEFAULT FALSE

### 2.3 Processo de Entrada

**Fluxo conceitual:**
1. Buscar Nota Fiscal e seus itens
2. Para cada item, determinar o almoxarifado de destino (prioridade: item > NF > filial padrão)
3. Criar movimentação de ENTRADA vinculada à NF e ao item
4. Atualizar saldo no estoque do almoxarifado
5. Marcar item como processado
6. Marcar Nota Fiscal como processada

### 2.4 Cálculo de Custo Médio Ponderado

**Conceito:**
- Quando não existe estoque: criar novo registro com quantidade e valor unitário da entrada
- Quando já existe estoque: calcular novo custo médio ponderado
  - Valor total atual = quantidade atual × valor médio atual
  - Valor total novo = quantidade nova × valor unitário da entrada
  - Novo valor médio = (valor total atual + valor total novo) / (quantidade atual + quantidade nova)
- Atualizar estoque com nova quantidade total e novo valor médio

---

## 📤 3. FLUXO DE SAÍDA

### 3.1 Tipos de Saída

1. **Saída por Requisição/Solicitação**
   - Vinculada a uma solicitação de compra ou requisição interna
   - Pode ser automática ou manual

2. **Saída por Transferência**
   - Transferência entre almoxarifados
   - Cria 2 movimentações: SAIDA no origem, ENTRADA no destino

3. **Saída por Ajuste**
   - Ajuste de inventário (perda, avaria, vencimento)
   - Requer justificativa

4. **Saída por Devolução**
   - Devolução ao fornecedor
   - Vinculada a uma nota fiscal de devolução

### 3.2 Validações de Saída

- Verificar saldo disponível (quantidade_atual - quantidade_reservada)
- Não permitir saída maior que o disponível

---

## 🔀 4. TRANSFERÊNCIAS ENTRE ALMOXARIFADOS

### 4.1 Processo

**Fluxo conceitual:**
1. Validar saldo disponível no almoxarifado de origem
2. Criar movimentação de SAIDA no almoxarifado de origem (tipo TRANSFERENCIA, quantidade negativa)
3. Criar movimentação de ENTRADA no almoxarifado de destino (tipo TRANSFERENCIA, quantidade positiva)
4. Ambas movimentações devem referenciar origem e destino
5. Atualizar saldo no almoxarifado de origem (reduzir)
6. Atualizar saldo no almoxarifado de destino (aumentar)
7. Manter o mesmo valor unitário médio (custo do produto não muda na transferência)

---

## ⚙️ 5. FUNCIONALIDADES ADICIONAIS

### 5.1 Controle de Lotes e Validades

- Permitir entrada com lote e validade
- Alertas de produtos próximos ao vencimento
- Controle FIFO (First In, First Out) ou FEFO (First Expired, First Out)

### 5.2 Estoque Mínimo/Máximo

- Configurar estoque mínimo e máximo por produto/almoxarifado
- Alertas quando estoque abaixo do mínimo
- Sugestão de compra quando abaixo do ponto de reposição

### 5.3 Inventário Físico

- Tabela `almoxarifado_inventario` para contagens físicas
- Comparação entre estoque contábil vs físico
- Ajustes automáticos após aprovação

### 5.4 Relatórios

- Saldo atual por almoxarifado/produto
- Movimentações por período
- Produtos em falta (abaixo do mínimo)
- Produtos próximos ao vencimento
- Valor do estoque por almoxarifado
- Histórico de movimentações

---

## 🔐 6. VALIDAÇÕES E REGRAS DE NEGÓCIO

### 6.1 Validações de Entrada

- ✅ Nota fiscal deve estar com status 'LANCADA'
- ✅ Almoxarifado deve estar ativo
- ✅ Produto deve estar ativo
- ✅ Quantidade deve ser positiva
- ✅ Valor unitário deve ser positivo

### 6.2 Validações de Saída

- ✅ Saldo disponível suficiente
- ✅ Almoxarifado deve estar ativo
- ✅ Produto deve estar ativo
- ✅ Quantidade deve ser positiva
- ✅ Requer permissão adequada

### 6.3 Validações de Transferência

- ✅ Origem e destino devem ser diferentes
- ✅ Ambos almoxarifados devem estar ativos
- ✅ Saldo disponível suficiente na origem
- ✅ Mesma filial (ou permitir entre filiais?)

---

## 🎨 7. INTERFACE DO USUÁRIO

### 7.1 Tela de Estoque

- Listagem de produtos por almoxarifado
- Filtros: almoxarifado, produto, status
- Colunas: produto, quantidade atual, disponível, reservada, valor unitário, valor total
- Ações: ver histórico, transferir, ajustar

### 7.2 Tela de Movimentações

- Listagem de todas as movimentações
- Filtros: tipo, almoxarifado, produto, período, status
- Detalhes: data, tipo, quantidade, valor, documento relacionado, usuário

### 7.3 Modal de Entrada de Estoque (via NF)

- Ao processar NF, mostrar modal com itens
- Permitir escolher almoxarifado por item
- Mostrar saldo atual antes e depois
- Confirmar processamento

### 7.4 Modal de Saída/Transferência

- Selecionar almoxarifado origem
- Selecionar produtos e quantidades
- Selecionar almoxarifado destino (se transferência)
- Informar motivo/observações
- Confirmar

---

## 🔄 8. INTEGRAÇÃO COM NOTA FISCAL

### 8.1 Modificações Necessárias

**No controller de Nota Fiscal:**

1. Ao criar/atualizar NF com status 'LANCADA':
   - Opcionalmente processar entrada de estoque automaticamente
   - Ou criar "pendência" para processamento manual

2. Ao excluir NF:
   - Se estoque foi processado, criar movimentação de estorno (SAIDA)
   - Reverter saldo no almoxarifado

3. Ao alterar status de PENDENTE para LANCADA:
   - Processar entrada de estoque (se configurado)

### 8.2 Endpoint para Processar Entrada

**Conceito:**
- Endpoint para processar entrada de estoque a partir de uma Nota Fiscal
- Recebe lista de itens com almoxarifado de destino para cada item
- Permite entrada parcial (quantidade diferente da NF)
- Permite informar lote e data de validade por item
- Processa cada item individualmente

---

## 📈 9. CONSIDERAÇÕES TÉCNICAS

### 9.1 Performance

- Índices nas tabelas de movimentações (data, produto, almoxarifado)
- Cache de saldos (Redis?) para consultas frequentes
- Agregações periódicas para relatórios

### 9.2 Transações

- Todas as operações de estoque devem ser transacionais
- Se uma movimentação falhar, reverter todas as alterações
- Usar locks para evitar race conditions

### 9.3 Auditoria

- Todas as movimentações registram usuário e data
- Histórico completo e imutável
- Logs de alterações em estoques

### 9.4 Backup e Recuperação

- Backup regular das tabelas de estoque
- Possibilidade de reconstruir estoque a partir de movimentações
- Validação de integridade periódica

---

## 🚀 10. PLANO DE IMPLEMENTAÇÃO SUGERIDO

### Fase 1: Estrutura Base
1. Criar tabelas de estoque e movimentações
2. Criar controllers básicos (CRUD de estoque)
3. Criar endpoints de consulta

### Fase 2: Entrada via Nota Fiscal
1. Integrar com Nota Fiscal
2. Processar entrada automática/manual
3. Calcular custo médio

### Fase 3: Saídas e Transferências
1. Implementar saídas
2. Implementar transferências
3. Validações de saldo

### Fase 4: Funcionalidades Avançadas
1. Lotes e validades
2. Estoque mínimo/máximo
3. Relatórios
4. Alertas

---

## ❓ 11. DECISÕES A TOMAR

4. **Transferências entre filiais?**
   - Definir regra de negócio vou definir posteriormente

5. **Custo médio ou FIFO?**
   - Recomendação: Custo médio (mais simples)

6. **Obrigatório processar estoque ao lançar NF?**
   - Recomendação: Não obrigatório, mas recomendado = sim

7. **Permitir entrada parcial de itens da NF?**
   - Sim (útil para casos de recebimento parcial) = não, apenas integral

