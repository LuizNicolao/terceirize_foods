# 📋 TRATATIVAS FUTURAS - VÍNCULOS E MODAL DE ERRO

## 🎯 **OBJETIVO:**
Implementar validação de vínculos e modal de erro customizado em todas as telas do sistema.

---

## ✅ **STATUS ATUAL:**

### **JÁ IMPLEMENTADO:**
- **Grupos** - Validação de vínculos + Modal customizado ✅
- **Subgrupos** - Validação de vínculos + Modal customizado ✅

---

## ⚠️ **PENDENTE DE IMPLEMENTAÇÃO:**

### **1. BACKEND - Validação de Vínculos:**

#### **A. Produtos** (já tem validação básica, mas precisa melhorar):
- **Vínculo:** `almoxarifado_itens` (já verifica)
- **Melhoria:** Mensagem detalhada + verificar apenas ativos
- **Arquivo:** `backend/controllers/produtosController.js`

#### **B. Classes** - ✅ IMPLEMENTADO:
- **Vínculo:** `produtos` (verifica apenas ativos)
- **Mensagem:** Detalhada com lista de produtos
- **Modal:** Customizado implementado
- **Arquivo:** `backend/controllers/classesController.js`

#### **C. Marcas** (já tem validação básica, mas precisa melhorar):
- **Vínculo:** `produtos` (já verifica)
- **Melhoria:** Mensagem detalhada + verificar apenas ativos
- **Arquivo:** `backend/controllers/marcasController.js`

#### **D. Clientes** (precisa implementar):
- **Vínculo:** `produtos` (cliente_id)
- **Ação:** Verificar se tem produtos vinculados
- **Arquivo:** `backend/controllers/clientesController.js`

#### **E. Fornecedores** (precisa implementar):
- **Vínculo:** `produtos` (fornecedor_id)
- **Ação:** Verificar se tem produtos vinculados
- **Arquivo:** `backend/controllers/fornecedoresController.js`

#### **F. Usuários** (precisa implementar):
- **Vínculo:** `permissoes_usuario` (usuario_id)
- **Ação:** Verificar se tem permissões vinculadas
- **Arquivo:** `backend/controllers/usuariosController.js`

#### **G. Motoristas** (precisa implementar):
- **Vínculo:** `veiculos` (motorista_id)
- **Ação:** Verificar se tem veículos vinculados
- **Arquivo:** `backend/controllers/motoristasController.js`

#### **H. Ajudantes** (precisa implementar):
- **Vínculo:** `veiculos` (ajudante_id)
- **Ação:** Verificar se tem veículos vinculados
- **Arquivo:** `backend/controllers/ajudantesController.js`

#### **I. Filiais** (precisa implementar):
- **Vínculo:** `motoristas`, `ajudantes`, `usuarios` (filial_id)
- **Ação:** Verificar se tem funcionários vinculados
- **Arquivo:** `backend/controllers/filiaisController.js`

#### **J. Veículos** (precisa implementar):
- **Vínculo:** `rotas` (veiculo_id)
- **Ação:** Verificar se tem rotas vinculadas
- **Arquivo:** `backend/controllers/veiculosController.js`

#### **K. Rotas** (precisa implementar):
- **Vínculo:** `unidades_escolares` (rota_id)
- **Ação:** Verificar se tem unidades vinculadas
- **Arquivo:** `backend/controllers/rotasController.js`

#### **L. Unidades Escolares** (precisa implementar):
- **Vínculo:** `produtos` (unidade_id)
- **Ação:** Verificar se tem produtos vinculados
- **Arquivo:** `backend/controllers/unidadesEscolaresController.js`

#### **M. Unidades de Medida** (precisa implementar):
- **Vínculo:** `produtos` (unidade_id)
- **Ação:** Verificar se tem produtos vinculados
- **Arquivo:** `backend/controllers/unidadesController.js`

---

### **2. FRONTEND - Modal de Erro Customizado:**

#### **Páginas que precisam do ErrorModal:**
1. **Produtos** - `frontend/src/pages/Produtos.js`
2. **Classes** - `frontend/src/pages/Classes.js` - ✅ IMPLEMENTADO
3. **Marcas** - `frontend/src/pages/Marcas.js`
4. **Clientes** - `frontend/src/pages/Clientes.js`
5. **Fornecedores** - `frontend/src/pages/Fornecedores.js`
6. **Usuários** - `frontend/src/pages/Usuarios.js`
7. **Motoristas** - `frontend/src/pages/Motoristas.js`
8. **Ajudantes** - `frontend/src/pages/Ajudantes.js`
9. **Filiais** - `frontend/src/pages/Filiais.js`
10. **Veículos** - `frontend/src/pages/Veiculos.js`
11. **Rotas** - `frontend/src/pages/Rotas.js`
12. **Unidades Escolares** - `frontend/src/pages/UnidadesEscolares.js`
13. **Unidades de Medida** - `frontend/src/pages/Unidades.js`

---

## 🎯 **PRIORIDADE DE IMPLEMENTAÇÃO:**

### **ALTA PRIORIDADE:**
1. **Produtos** - Já tem validação, só precisa melhorar mensagem
2. **Classes** - ✅ IMPLEMENTADO
3. **Marcas** - Já tem validação, só precisa melhorar mensagem

### **MÉDIA PRIORIDADE:**
4. **Clientes** - Vínculo com produtos
5. **Fornecedores** - Vínculo com produtos
6. **Usuários** - Vínculo com permissões

### **BAIXA PRIORIDADE:**
7. **Motoristas/Ajudantes** - Vínculo com veículos
8. **Filiais** - Vínculo com funcionários
9. **Veículos/Rotas** - Vínculo com rotas/unidades
10. **Unidades** - Vínculo com produtos

---

## 📝 **PADRÃO DE IMPLEMENTAÇÃO:**

### **Backend - Validação de Vínculos:**
```javascript
// Verificar apenas registros ATIVOS
const produtos = await executeQuery(
  'SELECT id, nome, status FROM produtos WHERE fornecedor_id = ? AND status = 1',
  [id]
);

if (produtos.length > 0) {
  let mensagem = `Fornecedor não pode ser excluído pois possui ${produtos.length} produto(s) ativo(s) vinculado(s):`;
  mensagem += `\n- ${produtos.map(p => p.nome).join(', ')}`;
  mensagem += '\n\nPara excluir o fornecedor, primeiro desative todos os produtos vinculados.';
  
  return errorResponse(res, mensagem, STATUS_CODES.BAD_REQUEST);
}
```

### **Frontend - Modal de Erro:**
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

## 📊 **RESUMO:**
- **13 páginas** precisam do modal de erro customizado
- **11 controllers** precisam de validação de vínculos melhorada
- **3 controllers** já têm validação básica, só precisam melhorar mensagens

---

## 🚀 **PRÓXIMOS PASSOS:**
1. Corrigir telas com erros atuais
2. Implementar validação de vínculos por prioridade
3. Implementar modal de erro nas páginas restantes
4. Testar todas as funcionalidades

---

**📋 Última atualização:** 02/08/2025
**🎯 Status:** 3 páginas implementadas, 12 pendentes 