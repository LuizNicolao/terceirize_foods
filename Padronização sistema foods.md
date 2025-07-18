# 🎯 Padrão de Design e Tecnologias - Sistema Foods

## 🛠️ **Stack Tecnológica**

### **Frontend**
- **React 18.2.0** - Biblioteca principal
- **React Router DOM 6.20.1** - Roteamento
- **Styled Components 6.1.1** - Estilização CSS-in-JS
- **React Icons 4.12.0** - Biblioteca de ícones
- **React Hook Form 7.48.2** - Gerenciamento de formulários
- **React Query 3.39.3** - Gerenciamento de estado e cache
- **React Hot Toast 2.4.1** - Notificações
- **Axios 1.6.2** - Cliente HTTP
- **XLSX 0.18.5** - Manipulação de arquivos Excel

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express 4.18.2** - Framework web
- **MySQL2 3.6.5** - Banco de dados
- **JWT 9.0.2** - Autenticação
- **Bcryptjs 2.4.3** - Criptografia de senhas
- **Multer 1.4.5** - Upload de arquivos
- **Puppeteer 21.5.2** - Geração de PDFs

---

## 🎨 **Sistema de Cores**

### **Cores Principais (CSS Variables)**
```css
:root {
  /* Cores Principais */
  --primary-green: #4CAF50;    /* Verde principal */
  --dark-green: #388E3C;       /* Verde escuro */
  --light-green: #81C784;      /* Verde claro */
  
  /* Cores Neutras */
  --white: #FFFFFF;            /* Branco */
  --light-gray: #f5f5f5;       /* Cinza claro */
  --gray: #757575;             /* Cinza médio */
  --dark-gray: #424242;        /* Cinza escuro */
  
  /* Cores Secundárias */
  --blue: #2196F3;             /* Azul */
  --orange: #FF9800;           /* Laranja */
  --error-red: #f44336;        /* Vermelho erro */
  --success-green: #4CAF50;    /* Verde sucesso */
  --warning-orange: #FF9800;   /* Laranja aviso */
}
```

### **Uso das Cores**
- **Verde**: Botões primários, links ativos, elementos de sucesso
- **Azul**: Botões secundários, links, informações
- **Vermelho**: Erros, botões de exclusão, alertas críticos
- **Laranja**: Avisos, botões de atenção
- **Cinza**: Textos, bordas, elementos neutros

---

## 🏗️ **Layout e Estrutura**

### **Layout Principal**
```jsx
// Estrutura básica
<LayoutContainer>
  <Sidebar collapsed={collapsed} />
  <MainContent>
    <Header />
    <PageContent />
  </MainContent>
</LayoutContainer>
```

### **Sidebar**
- **Largura**: 250px (expandida) / 60px (colapsada)
- **Posição**: Fixa à esquerda
- **Responsivo**: Colapsa automaticamente em mobile
- **Estado**: Persistido no localStorage
- **Animações**: Transições suaves (0.3s ease)

### **Header**
- **Altura**: Auto
- **Background**: Branco com sombra
- **Conteúdo**: Título da página + botão toggle sidebar

---

## 🧩 **Componentes Padrão**

### **Botões**
```jsx
// Botão Primário
const PrimaryButton = styled.button`
  background: var(--primary-green);
  color: var(--white);
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--dark-green);
    transform: translateY(-1px);
  }
`;

// Botão Secundário
const SecondaryButton = styled.button`
  background: var(--blue);
  color: var(--white);
  // ... mesmas propriedades
`;

// Botão de Perigo
const DangerButton = styled.button`
  background: var(--error-red);
  color: var(--white);
  // ... mesmas propriedades
`;
```

### **Formulários**
```jsx
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: var(--white);

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;
```

### **Tabelas**
```jsx
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background-color: #f5f5f5;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: var(--dark-gray);
`;
```

---

## 🔧 **Funcionalidades Importantes**

### **1. Sistema de Autenticação**
```jsx
// AuthContext
const { user, login, logout, isAuthenticated } = useAuth();

// Login
const login = async (email, senha) => {
  const response = await api.post('/auth/login', { email, senha });
  localStorage.setItem('token', response.data.token);
  // ...
};
```

### **2. Sistema de Permissões**
```jsx
// PermissionsContext
const { canView, canCreate, canEdit, canDelete } = usePermissions();

// Uso
{canCreate('fornecedores') && (
  <button>Adicionar Fornecedor</button>
)}
```

### **3. API Service**
```jsx
// api.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Interceptors automáticos para token e tratamento de erros
```

### **4. Notificações**
```jsx
import toast from 'react-hot-toast';

// Sucesso
toast.success('Operação realizada com sucesso!');

// Erro
toast.error('Erro ao realizar operação');

// Carregamento
toast.loading('Processando...');
```

### **5. Formulários com Validação**
```jsx
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = async (data) => {
  // Lógica de submissão
};

<Form onSubmit={handleSubmit(onSubmit)}>
  <Input {...register('campo', { required: 'Campo obrigatório' })} />
  {errors.campo && <span>{errors.campo.message}</span>}
</Form>
```

---

## 📱 **Responsividade**

### **Breakpoints**
```css
/* Mobile */
@media (max-width: 768px) {
  .main-content { margin-left: 0; }
  .sidebar { width: 0; transform: translateX(-100%); }
}

/* Tablet */
@media (max-width: 1024px) {
  .main-content { margin-left: 200px; }
}

/* Desktop Grande */
@media (min-width: 1920px) {
  .main-content { margin-left: 280px; }
}
```

### **Sidebar Responsiva**
- **Desktop**: 250px (expandida) / 60px (colapsada)
- **Mobile**: Overlay com backdrop
- **Toggle**: Botão flutuante

---

## 🎭 **Animações e Transições**

### **Transições Padrão**
```css
transition: all 0.3s ease;
```

### **Animações**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### **Hover Effects**
- **Botões**: `transform: translateY(-1px)`
- **Cards**: `transform: translateY(-2px)`
- **Links**: Mudança de cor + borda esquerda

---

## 🔍 **Ícones Utilizados**

### **Biblioteca**: React Icons (Font Awesome)
```jsx
import { 
  FaHome, FaUsers, FaTruck, FaBox, 
  FaLayerGroup, FaRulerCombined, FaTag,
  FaShieldAlt, FaSignOutAlt, FaChevronLeft,
  FaChevronRight, FaSitemap, FaCubes,
  FaFileAlt, FaPlus, FaEdit, FaTrash,
  FaSearch, FaFilter, FaEye, FaQuestionCircle,
  FaFileExcel, FaFilePdf, FaUpload, FaTimes
} from 'react-icons/fa';
```

### **Padrão de Uso**
- **Navegação**: Ícones descritivos (FaHome, FaUsers, etc.)
- **Ações**: Ícones de ação (FaPlus, FaEdit, FaTrash)
- **Status**: Ícones de estado (FaEye, FaTimes)
- **Arquivos**: Ícones de documento (FaFileExcel, FaFilePdf)

---

## 📊 **Padrões de Dados**

### **Estrutura de API**
```javascript
// Resposta de sucesso
{
  success: true,
  data: [...],
  message: "Operação realizada com sucesso"
}

// Resposta de erro
{
  success: false,
  error: "Mensagem de erro"
}
```

### **Paginação**
```javascript
{
  data: [...],
  pagination: {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 25
  }
}
```

---

## 🚀 **Funcionalidades Avançadas**

### **1. Exportação de Dados**
- **Excel**: Usando XLSX
- **PDF**: Usando Puppeteer no backend
- **Filtros**: Aplicados na exportação

### **2. Importação de Dados**
- **Excel**: Upload e processamento
- **Validação**: Dados antes da importação
- **Feedback**: Progresso e resultados

### **3. Auditoria**
- **Logs**: Todas as operações CRUD
- **Filtros**: Por data, usuário, ação
- **Exportação**: Relatórios de auditoria

### **4. Busca e Filtros**
- **Busca**: Por campo específico ou geral
- **Filtros**: Por status, data, etc.
- **Ordenação**: Por qualquer coluna
- **Paginação**: Configurável

---

## 📝 **Convenções de Código**

### **Nomenclatura**
- **Componentes**: PascalCase (UserList)
- **Funções**: camelCase (handleSubmit)
- **Variáveis**: camelCase (userData)
- **Constantes**: UPPER_SNAKE_CASE (API_URL)

### **Estrutura de Arquivos**
```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── contexts/      # Contextos React
├── services/      # Serviços e APIs
├── styles/        # Estilos globais
└── utils/         # Utilitários
```

### **Styled Components**
- **Prefixo**: Sem prefixo para componentes básicos
- **Props**: Usar `$` para props que não devem ir para o DOM
- **Organização**: Um arquivo por componente complexo

---

## 🎯 **Exemplos de Implementação**

### **Página Padrão**
```jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  color: var(--dark-gray);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const AddButton = styled.button`
  background: var(--primary-green);
  color: var(--white);
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--dark-green);
    transform: translateY(-1px);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const TableContainer = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f5f5f5;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: var(--dark-gray);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-right: 8px;
  color: var(--gray);

  &:hover {
    background-color: var(--light-gray);
  }

  &.edit {
    color: var(--blue);
  }

  &.delete {
    color: var(--error-red);
  }
`;

const ExamplePage = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/endpoint');
      setData(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        await api.delete(`/endpoint/${id}`);
        toast.success('Item excluído com sucesso!');
        loadData();
      } catch (error) {
        toast.error('Erro ao excluir item');
      }
    }
  };

  const filteredData = data.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Container>Carregando...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>Título da Página</Title>
        {canCreate('resource') && (
          <AddButton>
            <FaPlus />
            Adicionar Item
          </AddButton>
        )}
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Descrição</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <Td>{item.name}</Td>
                <Td>{item.description}</Td>
                <Td>{item.status}</Td>
                <Td>
                  <ActionButton
                    className="edit"
                    title="Editar"
                    onClick={() => handleEdit(item)}
                  >
                    <FaEdit />
                  </ActionButton>
                  {canDelete('resource') && (
                    <ActionButton
                      className="delete"
                      title="Excluir"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash />
                    </ActionButton>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ExamplePage;
```

---

## 📋 **Checklist de Implementação**

### **Para Novas Páginas**
- [ ] Usar estrutura de layout padrão
- [ ] Implementar sistema de permissões
- [ ] Adicionar notificações toast
- [ ] Implementar busca e filtros
- [ ] Adicionar paginação se necessário
- [ ] Usar cores e estilos padrão
- [ ] Implementar responsividade
- [ ] Adicionar loading states
- [ ] Tratar erros adequadamente

### **Para Novos Componentes**
- [ ] Usar Styled Components
- [ ] Seguir padrão de nomenclatura
- [ ] Implementar hover effects
- [ ] Usar transições suaves
- [ ] Ser responsivo
- [ ] Seguir acessibilidade básica

---

Este padrão garante consistência visual, boa performance e manutenibilidade do código. Use estas diretrizes para manter a identidade visual e funcional do sistema em novos projetos! 🎯 