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

### 🎯 **REGRAS IMPORTANTES - NÃO CRIAR/EXCLUIR CARDS:**

#### **⚠️ REGRA FUNDAMENTAL:**
- **✅ MANTER:** Todos os cards/estatísticas que já existem
- **✅ NÃO CRIAR:** Novos cards que não existem no backend
- **✅ NÃO EXCLUIR:** Cards existentes, apenas padronizar
- **✅ APENAS MODERNIZAR:** Layout, cores, responsividade

#### **📊 EXEMPLO DASHBOARD:**
```javascript
// ✅ CORRETO - Manter todos os cards existentes
const statsData = {
  totalUsuarios: dashboardData.usuarios || 0,
  totalFornecedores: dashboardData.fornecedores || 0,
  totalClientes: dashboardData.clientes || 0,
  totalProdutos: dashboardData.produtos || 0,
  totalGrupos: dashboardData.grupos || 0,
  totalSubgrupos: dashboardData.subgrupos || 0,
  totalClasses: dashboardData.classes || 0,
  totalMarcas: dashboardData.marcas || 0,
  totalFiliais: dashboardData.filiais || 0,
  totalRotas: dashboardData.rotas || 0,
  totalMotoristas: dashboardData.motoristas || 0,
  totalAjudantes: dashboardData.ajudantes || 0,
  totalVeiculos: dashboardData.veiculos || 0,
  totalUnidadesEscolares: dashboardData.unidades_escolares || 0,
  totalUnidades: dashboardData.unidades || 0,
  totalNomeGenerico: dashboardData.nome_generico_produto || 0,
  valorEstoque: dashboardData.valorEstoque || 0,
  produtosEstoqueBaixo: dashboardData.produtosEstoqueBaixo || 0,
  produtosSemEstoque: dashboardData.produtosSemEstoque || 0,
  produtosVencendo: dashboardData.produtosVencendo || 0,
  veiculosDocumentacaoVencendo: dashboardData.veiculosDocumentacaoVencendo || 0,
  motoristasCnhVencendo: dashboardData.motoristasCnhVencendo || 0
};

// ❌ INCORRETO - Criar cards que não existem
const statsData = {
  totalUsuarios: dashboardData.usuarios || 0,
  // ❌ NÃO CRIAR: totalNovoCard: 0, // se não existir no backend
};
```

### 🎯 **CONFIGURAÇÃO DO TAILWIND CSS (OBRIGATÓRIO):**

#### **1. ✅ DEPENDÊNCIAS (package.json):**
```json
"devDependencies": {
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.14",
  "postcss": "^8.4.24"
}
```

#### **2. ✅ CONFIGURAÇÃO (tailwind.config.js):**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: { /* cores personalizadas */ },
        green: { /* cores personalizadas */ }
      }
    },
  },
  plugins: [],
}
```

#### **3. ✅ POSTCSS (postcss.config.js):**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### **4. ✅ CSS GLOBAL (global.css):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Resto do CSS personalizado */
```

### 🎯 **PROBLEMAS COMUNS E SOLUÇÕES:**

#### **❌ PROBLEMA: Layout quebrado, dados empilhados**
**🔧 SOLUÇÃO:** Verificar se Tailwind CSS está instalado e configurado

#### **❌ PROBLEMA: Quadrado verde piscando**
**🔧 SOLUÇÃO:** Usar loading inline simples com Tailwind CSS

#### **❌ PROBLEMA: Erro de proxy favicon.ico**
**🔧 SOLUÇÃO:** Ignorar - não afeta funcionalidade

#### **❌ PROBLEMA: Rotas 404**
**🔧 SOLUÇÃO:** Verificar rotas corretas do backend antes de implementar

#### **❌ PROBLEMA: Cards faltando ou extras**
**🔧 SOLUÇÃO:** Manter exatamente os cards que existem no backend

### 🎯 **CHECKLIST PARA CADA PÁGINA:**

#### **✅ ANTES DE MODERNIZAR:**
1. **Verificar rotas do backend** - Quais existem?
2. **Verificar estrutura de dados** - Como o backend retorna?
3. **Verificar validações** - Quais campos são obrigatórios?
4. **Verificar se Tailwind está configurado** - Evitar layout quebrado
5. **Mapear cards/estatísticas existentes** - Não criar/excluir

#### **✅ DURANTE A MODERNIZAÇÃO:**
1. **Criar service** - Separar lógica de API
2. **Usar componentes UI** - Button, Input, Modal, Table
3. **Aplicar Tailwind CSS** - Remover styled-components
4. **Implementar responsividade** - Mobile-first
5. **Manter funcionalidades** - CRUD, filtros, paginação
6. **Manter cards existentes** - Não criar/excluir, apenas padronizar
7. **Usar loading inline** - Evitar quadrado verde

#### **✅ APÓS MODERNIZAÇÃO:**
1. **Testar todas as funcionalidades** - CRUD, filtros, validações
2. **Verificar responsividade** - Mobile, tablet, desktop
3. **Verificar erros** - Console, network, validações
4. **Verificar layout** - Grid, cards, espaçamentos
5. **Verificar cards** - Todos os existentes estão presentes
6. **Documentar mudanças** - Atualizar este arquivo

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
1. **Dashboard** ✅ (Concluído - Tailwind configurado, loading corrigido)
2. **Filiais** 🔄 (Próximo)
3. **Veículos**
4. **Unidades**
5. **Unidades Escolares**
6. **Rotas** ✅ (Concluído - Service criado, componentes UI, estatísticas, loading inline)
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

### 🎯 **LOADING PADRÃO (SEM QUADRADO VERDE):**
```javascript
// ✅ CORRETO - Loading inline simples
if (loading) {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
```

### 🎯 **COMANDOS IMPORTANTES:**
```bash
# Instalar dependências do Tailwind
npm install

# Reiniciar container após mudanças
docker restart foods_frontend

# Resolver conflitos Git
git add package.json
git commit -m "fix: resolver conflito package.json"
```

### 🎯 **ÚLTIMA ATUALIZAÇÃO:**
**Data:** 03/08/2025
**Status:** Rotas modernizada com Service criado, componentes UI, estatísticas e loading inline
**Próximo:** Filiais
**Problemas Resolvidos:** Layout quebrado, LoadingSpinner, configuração Tailwind, quadrado verde, styled-components removido
**Regra Importante:** Manter todos os cards existentes, não criar/excluir, apenas padronizar
**Componentes Atualizados:** Input (select/textarea), StatCard, Modal, Table, Button 