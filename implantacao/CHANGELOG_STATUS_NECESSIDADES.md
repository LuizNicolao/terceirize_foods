# Changelog - Sistema de Status para Necessidades

## Data: 2024-12-19

### Resumo das Alterações

Este changelog documenta as alterações implementadas para adicionar um sistema de status às necessidades no sistema de Implantação, permitindo o controle do fluxo de aprovação.

### 🗄️ Alterações no Banco de Dados

#### Script de Migração
- **Arquivo**: `database/migrations/add_status_column_necessidades.sql`
- **Alterações**:
  - Adicionada coluna `status` (VARCHAR(20)) com valor padrão 'NEC NUTRI'
  - Adicionada coluna `observacoes` (TEXT) para comentários sobre análise
  - Criado índice `idx_necessidades_status` para melhorar performance
  - Atualização de registros existentes com status padrão

### 🔧 Alterações no Backend

#### 1. Controller NecessidadesSpecialController
- **Arquivo**: `backend/controllers/necessidades/NecessidadesSpecialController.js`
- **Alterações**:
  - Inclusão do campo `status` com valor 'NEC NUTRI' ao criar necessidades
  - Inclusão do campo `observacoes` (NULL por padrão)

#### 2. Controller NecessidadesCRUDController
- **Arquivo**: `backend/controllers/necessidades/NecessidadesCRUDController.js`
- **Alterações**:
  - Inclusão do campo `status` com valor 'NEC NUTRI' ao criar necessidades
  - Inclusão do campo `observacoes` (NULL por padrão)
  - Atualização da função `atualizar` para permitir edição de status e observações
  - Implementação de controle de permissões (coordenador/supervisor/admin podem editar qualquer necessidade)

#### 3. Controller NecessidadesListController
- **Arquivo**: `backend/controllers/necessidades/NecessidadesListController.js`
- **Alterações**:
  - Já retorna todos os campos da tabela (`n.*`), incluindo status e observações

### 🎨 Alterações no Frontend

#### 1. Componente StatusBadge
- **Arquivo**: `frontend/src/components/necessidades/StatusBadge.jsx`
- **Funcionalidade**: Componente para exibir status das necessidades com cores e ícones apropriados
- **Status suportados**:
  - `NEC NUTRI`: Criada pela Nutricionista (azul)
  - `APROVADA`: Aprovada (verde)
  - `REJEITADA`: Rejeitada (vermelho)
  - `EM_ANALISE`: Em Análise (amarelo)

#### 2. Página Necessidades
- **Arquivo**: `frontend/src/pages/necessidades/Necessidades.jsx`
- **Alterações**:
  - Inclusão do componente StatusBadge na exibição das necessidades
  - Exibição do status de cada grupo de necessidades

#### 3. Nova Página AnaliseNecessidades
- **Arquivo**: `frontend/src/pages/necessidades/AnaliseNecessidades.jsx`
- **Funcionalidade**: Tela dedicada para análise e ajuste de necessidades
- **Recursos**:
  - Filtro de necessidades por status (NEC NUTRI, EM_ANALISE)
  - Modal para análise com campos de status e observações
  - Controle de permissões para edição
  - Exibição organizada por escola e data

#### 4. Atualização do Índice de Componentes
- **Arquivo**: `frontend/src/components/necessidades/index.js`
- **Alteração**: Exportação do componente StatusBadge

### 📋 Status Implementados

1. **NEC NUTRI**: Necessidade criada pela nutricionista (status inicial)
2. **EM_ANALISE**: Necessidade em análise pela coordenação
3. **APROVADA**: Necessidade aprovada pela coordenação
4. **REJEITADA**: Necessidade rejeitada pela coordenação

### 🔐 Controle de Permissões

- **Nutricionistas**: Podem criar necessidades com status 'NEC NUTRI' e editar apenas suas próprias necessidades
- **Coordenadores/Supervisores/Administradores**: Podem editar qualquer necessidade e alterar status

### 📝 Próximos Passos

1. **Executar migração**: Aplicar o script SQL no banco de dados
2. **Testar funcionalidades**: Verificar criação e atualização de necessidades
3. **Configurar rotas**: Adicionar rota para a nova tela de análise
4. **Treinamento**: Orientar usuários sobre o novo fluxo de aprovação

### 🚀 Como Aplicar as Alterações

1. Execute o script de migração no banco de dados:
   ```sql
   SOURCE database/migrations/add_status_column_necessidades.sql;
   ```

2. Reinicie o backend para aplicar as alterações nos controllers

3. Acesse a nova tela de análise em `/analise-necessidades` (após configurar rota)

### 📊 Impacto

- **Compatibilidade**: Mantida compatibilidade com necessidades existentes
- **Performance**: Índice criado para otimizar consultas por status
- **Usabilidade**: Interface clara para controle do fluxo de aprovação
- **Auditoria**: Rastreamento completo do ciclo de vida das necessidades
