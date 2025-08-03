# 🔧 CORREÇÕES NECESSÁRIAS PARA PÁGINAS DO SISTEMA

## 📋 **PÁGINAS JÁ CORRIGIDAS:**
- ✅ **Dashboard** - Funcionando
- ✅ **Filiais** - Funcionando  
- ✅ **Veículos** - Funcionando
- ✅ **Unidades** - Funcionando
- ✅ **Unidades Escolares** - Funcionando
- ✅ **Rotas** - Funcionando
- ✅ **Motoristas** - Funcionando
- ✅ **Ajudantes** - Funcionando
- ✅ **Usuários** - Funcionando
- ✅ **Fornecedores** - Funcionando
- ✅ **Clientes** - Funcionando
- ✅ **Produtos** - Funcionando
- ✅ **Grupos** - Funcionando
- ✅ **Subgrupos** - Funcionando

---

## 🚧 **PÁGINAS PENDENTES:**
- ⏳ **Subgrupos**
- ⏳ **Classes**
- ⏳ **Marcas**

---

## 🔧 **PADRÃO DE CORREÇÕES NECESSÁRIAS:**

### **1. BACKEND - CONTROLLER (`backend/controllers/[nome]Controller.js`)**

#### **A. Corrigir Paginação:**
```javascript
// ❌ ERRADO (causa erro de parâmetros):
LIMIT ? OFFSET ?
const result = await executeQuery(query, [...params, Number(limit), Number(offset)]);

// ✅ CORRETO:
LIMIT ${Number(limit)} OFFSET ${Number(offset)}
const result = await executeQuery(query, params);
```

#### **B. Verificar Colunas do Banco:**
- Comparar com `foods_db (1).sql`
- Corrigir nomes de colunas incorretos (ex: `cc_senic` → `cc_senior`)
- Verificar se usa `created_at/updated_at` ou `criado_em/atualizado_em`

#### **C. Corrigir Formatação de Datas:**
```javascript
// Para campos de data (quando frontend envia ISO):
data_admissao ? data_admissao.split('T')[0] : null
```

#### **D. Tratar Parâmetros undefined:**
```javascript
// ❌ ERRADO:
cpf ? cpf.trim() : null

// ✅ CORRETO:
cpf && cpf.trim() ? cpf.trim() : null
```

#### **E. Verificar AUTO_INCREMENT:**
- Se der erro "Field 'id' doesn't have a default value":
```sql
ALTER TABLE `[nome_tabela]` MODIFY `id` int NOT NULL AUTO_INCREMENT;
```

### **2. FRONTEND - PÁGINA (`frontend/src/pages/[Nome].js`)**

#### **A. Corrigir Acesso aos Dados:**
```javascript
// ❌ ERRADO:
setData(response.data);

// ✅ CORRETO:
setData(response.data.data || []);
```

#### **B. Melhorar Tratamento de Erro:**
```javascript
// ✅ CORRETO:
const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao salvar';
toast.error(errorMessage);
```

### **3. BACKEND - ROTAS (`backend/routes/[nome].js`)**

#### **A. Ajustar Validações (se erro 422):**
```javascript
// ❌ VALIDAÇÕES RESTRITIVAS (pode dar erro 422):
body('cpf').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
body('telefone').matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
body('email').isEmail()

// ✅ VALIDAÇÕES FLEXÍVEIS:
body('cpf').custom((value) => {
  if (value) {
    const cpfLimpo = value.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) throw new Error('CPF deve ter 11 dígitos');
  }
  return true;
})
body('telefone').custom((value) => {
  if (value) {
    const telefoneLimpo = value.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) 
      throw new Error('Telefone deve ter 10 ou 11 dígitos');
  }
  return true;
})
body('email').custom((value) => {
  if (value && value.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) throw new Error('Email deve ser um email válido');
  }
  return true;
})
```

#### **B. Restaurar Validações (após corrigir problemas):**
```javascript
// ✅ COM VALIDAÇÕES (após correções):
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'tabela'),
  validations,
  handleValidationErrors
], controller.criar);
```

### **4. TRATAMENTO DE VÍNCULOS E EXCLUSÃO**

#### **A. Validação de Vínculos (Backend):**
```javascript
// ❌ ERRADO - Verifica todos os registros:
const subgrupos = await executeQuery(
  'SELECT id, nome, status FROM subgrupos WHERE grupo_id = ?',
  [id]
);

// ✅ CORRETO - Verifica apenas ativos:
const subgrupos = await executeQuery(
  'SELECT id, nome, status FROM subgrupos WHERE grupo_id = ? AND status = 1',
  [id]
);
```

#### **B. Mensagens de Erro Detalhadas:**
```javascript
if (subgrupos.length > 0) {
  let mensagem = `Grupo não pode ser excluído pois possui ${subgrupos.length} subgrupo(s) ativo(s) vinculado(s):`;
  mensagem += `\n- ${subgrupos.map(sg => sg.nome).join(', ')}`;
  mensagem += '\n\nPara excluir o grupo, primeiro desative todos os subgrupos vinculados.';
  
  return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
}
```

### **5. MODAL DE ERRO CUSTOMIZADO**

#### **A. Componente ErrorModal (`frontend/src/components/ErrorModal.js`):**
- Modal estilizado com design do sistema
- Ícone de aviso e título informativo
- Suporte a quebras de linha (`white-space: pre-line`)
- Botão "Entendi" com animações

#### **B. Implementação nas Páginas:**
```javascript
// Importar componente
import ErrorModal from '../components/ErrorModal';

// Estados
const [showErrorModal, setShowErrorModal] = useState(false);
const [errorMessage, setErrorMessage] = useState('');

// Tratamento de erro
if (errorMsg.includes('\n')) {
  setErrorMessage(errorMsg);
  setShowErrorModal(true);
} else {
  toast.error(errorMsg);
}

// Renderizar modal
<ErrorModal
  isOpen={showErrorModal}
  message={errorMessage}
  onClose={() => setShowErrorModal(false)}
/>
```

---

## 🚨 **ERROS COMUNS E SOLUÇÕES:**

### **Erro 500 - "Unknown column":**
- **Causa:** Nome de coluna incorreto no SELECT/INSERT/UPDATE
- **Solução:** Verificar estrutura da tabela no `foods_db (1).sql`

### **Erro 500 - "Incorrect arguments to mysqld_stmt_execute":**
- **Causa:** Paginação com parâmetros incorretos
- **Solução:** Usar LIMIT/OFFSET direto na query

### **Erro 500 - "Field 'id' doesn't have a default value":**
- **Causa:** Tabela sem AUTO_INCREMENT
- **Solução:** `ALTER TABLE [tabela] MODIFY id int NOT NULL AUTO_INCREMENT;`

### **Erro 422 - "Unprocessable Entity":**
- **Causa:** Validações do middleware rejeitando dados
- **Solução:** Aplicar validações flexíveis ou remover temporariamente

### **Erro de Exclusão - "Não pode ser excluído":**
- **Causa:** Registros vinculados impedindo exclusão
- **Solução:** Verificar apenas registros ativos (`WHERE status = 1`)
- **Melhoria:** Implementar mensagens detalhadas e modal customizado
- **Solução:** Ajustar validações para serem mais flexíveis (ex: CPF sem formatação, telefone sem formatação, email vazio permitido)

### **Erro 400 - "Bad Request":**
- **Causa:** Validações do controller (CPF/CNH duplicado, etc.)
- **Solução:** Verificar logs do backend para identificar validação específica

---

## 📝 **CHECKLIST PARA CADA PÁGINA:**

### **Backend Controller:**
- [ ] Paginação corrigida (LIMIT/OFFSET direto)
- [ ] Colunas verificadas com banco de dados
- [ ] Datas formatadas corretamente
- [ ] Parâmetros undefined tratados
- [ ] AUTO_INCREMENT verificado
- [ ] Validação de vínculos implementada (apenas ativos)
- [ ] Mensagens de erro detalhadas criadas

### **Frontend:**
- [ ] Acesso aos dados corrigido (`response.data.data`)
- [ ] Tratamento de erro melhorado
- [ ] Paginação funcionando (se aplicável)
- [ ] Modal de erro customizado implementado
- [ ] Mensagens longas exibidas no modal (não toast)

### **Rotas:**
- [ ] Validações removidas temporariamente (se erro 422)
- [ ] Validações restauradas (após correções)

### **Banco de Dados:**
- [ ] AUTO_INCREMENT na coluna `id`
- [ ] Estrutura da tabela verificada

---

## 🔄 **ORDEM DE APLICAÇÃO:**

1. **Verificar estrutura da tabela** no `foods_db (1).sql`
2. **Corrigir controller** (paginação, colunas, datas)
3. **Corrigir frontend** (acesso aos dados)
4. **Implementar validação de vínculos** (apenas registros ativos)
5. **Criar mensagens de erro detalhadas**
6. **Implementar modal de erro customizado**
7. **Testar criação/edição/exclusão**
8. **Se erro 422:** Remover validações temporariamente
9. **Se erro 500:** Verificar logs e corrigir problema específico
10. **Se erro AUTO_INCREMENT:** Executar ALTER TABLE
11. **Restaurar validações** após tudo funcionando

---

## 📞 **COMANDOS ÚTEIS:**

```bash
# Reiniciar backend
docker restart foods_backend

# Ver logs do backend
docker logs foods_backend --tail 50

# Verificar estrutura da tabela
DESCRIBE [nome_tabela];

# Adicionar AUTO_INCREMENT
ALTER TABLE [nome_tabela] MODIFY id int NOT NULL AUTO_INCREMENT;
```

---

**📋 Última atualização:** 02/08/2025
**🎯 Status:** 13 páginas corrigidas, 3 pendentes 