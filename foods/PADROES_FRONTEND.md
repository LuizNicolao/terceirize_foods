# PADRÕES PARA MODERNIZAÇÃO DO FRONTEND

## 📋 RESUMO DOS PADRÕES CORRETOS

### 🎯 **PADRÕES DO BACKEND (RESPEITAR SEMPRE):**

1. **✅ RESTFUL API:** Usar rotas corretas do backend
2. **✅ HATEOAS:** Middleware já implementado
3. **✅ Paginação:** Usar `limit` e `offset` corretamente
4. **✅ Respostas padronizadas:** `response.data.data` ou `response.data`
5. **✅ Status codes:** 200, 400, 404, 422, 500
6. **✅ Separação:** Rotas separadas dos controllers

### 🎯 **PADRÕES DO FRONTEND (APLICAR SEMPRE):**

#### **1. ✅ ESTRUTURA DE DADOS:**
```javascript
// ✅ CORRETO - Acessar dados do backend
const response = await api.get('/entidade/stats');
const data = response.data.data || response.data;

// ❌ INCORRETO - Usar rotas que não existem
const response = await api.get('/entidade'); // se não existir
```

#### **2. ✅ SERVICE LAYER:**
```javascript
// ✅ CORRETO - Service separado
class EntidadeService {
  static async listar(params = {}) {
    const response = await api.get('/entidade', { params });
    return {
      success: true,
      data: response.data.data?.items || response.data.data || []
    };
  }
}
```

#### **3. ✅ COMPONENTES REUTILIZÁVEIS:**
```javascript
// ✅ CORRETO - Usar componentes UI
import { Button, Input, Modal, Table } from '../components/ui';

// ✅ CORRETO - Tailwind CSS
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
```

#### **4. ✅ RESPONSIVIDADE:**
```javascript
// ✅ CORRETO - Mobile-first
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
<div className="flex flex-col sm:flex-row justify-between">
```

### 🎯 **CHECKLIST PARA CADA PÁGINA:**

#### **✅ ANTES DE MODERNIZAR:**
1. **Verificar rotas do backend** - Quais existem?
2. **Verificar estrutura de dados** - Como o backend retorna?
3. **Verificar validações** - Quais campos são obrigatórios?

#### **✅ DURANTE A MODERNIZAÇÃO:**
1. **Criar service** - Separar lógica de API
2. **Usar componentes UI** - Button, Input, Modal, Table
3. **Aplicar Tailwind CSS** - Remover styled-components
4. **Implementar responsividade** - Mobile-first
5. **Manter funcionalidades** - CRUD, filtros, paginação

#### **✅ APÓS MODERNIZAÇÃO:**
1. **Testar todas as funcionalidades** - CRUD, filtros, validações
2. **Verificar responsividade** - Mobile, tablet, desktop
3. **Verificar erros** - Console, network, validações
4. **Documentar mudanças** - Atualizar este arquivo

### 🎯 **EXEMPLOS DE ROTAS CORRETAS:**

#### **✅ DASHBOARD:**
- `/dashboard/stats` - Estatísticas gerais
- `/dashboard/alertas` - Alertas do sistema

#### **✅ ENTIDADES:**
- `/entidade` - Listar com paginação
- `/entidade/:id` - Buscar por ID
- `/entidade` (POST) - Criar
- `/entidade/:id` (PUT) - Atualizar
- `/entidade/:id` (DELETE) - Excluir

### 🎯 **ESTRUTURA DE RESPOSTA DO BACKEND:**
```javascript
// ✅ Estrutura padrão
{
  success: true,
  data: {
    items: [...], // Para listas com paginação
    total: 100,
    page: 1,
    limit: 10
  }
}

// ✅ Para dados simples
{
  success: true,
  data: {
    id: 1,
    nome: "Exemplo"
  }
}
```

### 🎯 **ORDEM DE MODERNIZAÇÃO:**
1. **Dashboard** ✅ (Concluído)
2. **Filiais** 🔄 (Próximo)
3. **Veículos**
4. **Unidades**
5. **Unidades Escolares**
6. **Rotas**
7. **Motoristas**
8. **Ajudantes**
9. **Usuários**
10. **Fornecedores**
11. **Clientes**
12. **Produtos**
13. **Grupos**
14. **Subgrupos**
15. **Classes**
16. **Nomes Genéricos**
17. **Marcas**
18. **Permissões**

### 🎯 **COMPONENTES UI DISPONÍVEIS:**
- `Button` - Botões com variantes e loading
- `Input` - Inputs com label e erro
- `Modal` - Modais com título e fechar
- `Table` - Tabelas responsivas
- `StatCard` - Cards de estatísticas
- `ActivityCard` - Cards de atividades
- `ChartCard` - Containers para gráficos

### 🎯 **ÚLTIMA ATUALIZAÇÃO:**
**Data:** 03/08/2025
**Status:** Dashboard modernizado com sucesso
**Próximo:** Filiais 