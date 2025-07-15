## �� **Padrão de Design do Sistema**

### **📐 Paleta de Cores**

```css
:root {
  /* Cores Principais */
  --primary-green: #4CAF50;      /* Verde principal */
  --dark-green: #388E3C;         /* Verde escuro */
  --light-green: #81C784;        /* Verde claro */
  
  /* Cores Neutras */
  --white: #FFFFFF;              /* Branco */
  --light-gray: #f5f5f5;         /* Cinza claro (background) */
  --gray: #757575;               /* Cinza médio (texto secundário) */
  --dark-gray: #424242;          /* Cinza escuro (texto principal) */
  
  /* Cores de Ação */
  --blue: #2196F3;               /* Azul (botões de ação) */
  --orange: #FF9800;             /* Laranja (alertas/destaques) */
  
  /* Cores de Status */
  --error-red: #ff4444;          /* Vermelho (erros) */
  --success-green: #00C851;      /* Verde (sucesso) */
}
```

### **🏗️ Estrutura de Layout**

#### **1. Layout Principal**
```css
/* Container principal */
.layout-container {
  min-height: 100vh;
  background-color: var(--light-gray);
  display: flex;
}

/* Conteúdo principal */
.main-content {
  flex: 1;
  margin-left: 250px; /* Largura da sidebar */
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}
```

#### **2. Sidebar (Navegação)**
```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: var(--white);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1000;
  width: 250px; /* Expandida */
}

.sidebar.collapsed {
  width: 60px; /* Recolhida */
}
```

#### **3. Header**
```css
.layout-header {
  background: var(--white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px 0;
}

.header-content h1 {
  color: var(--primary-green);
  font-size: 24px;
  font-weight: 700;
}
```

### **�� Componentes Padrão**

#### **1. Cards**
```css
.card {
  background: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

#### **2. Botões**
```css
/* Botão Primário */
.btn-primary {
  background: var(--primary-green);
  color: var(--white);
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #005a2e;
  transform: translateY(-1px);
}

/* Botão Secundário */
.btn-secondary {
  background: var(--blue);
  color: var(--white);
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Botão de Perigo */
.btn-danger {
  background: var(--error-red);
  color: var(--white);
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
```

#### **3. Formulários**
```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: var(--dark-gray);
  font-weight: 600;
  font-size: 14px;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: var(--white);
}

.form-input:focus {
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
}
```

#### **4. Tabelas**
```css
.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table th {
  background-color: #f5f5f5;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: var(--dark-gray);
}
```

### **�� Responsividade**

#### **Breakpoints Padrão**
```css
/* Mobile */
@media (max-width: 768px) {
  .main-content {
    margin-left: 60px;
  }
}

/* Tablet */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 200px;
  }
}

/* Desktop */
@media (min-width: 1920px) {
  .main-content {
    margin-left: 280px;
  }
}
```

### **🎨 Tela de Login**
```css
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-green) 0%, #005a2e 100%);
}

.login-card {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 114, 62, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  animation: fadeInUp 0.6s ease-out;
}
```

### **🔧 Animações e Transições**
```css
/* Transições suaves */
* {
  transition: all 0.3s ease;
}

/* Animação de entrada */
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

### **📋 Tipografia**
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### **�� Status e Badges**
```css
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pendente { background: #fff3e0; color: #f57c00; }
.status-aprovada { background: #e8f5e8; color: #2e7d32; }
.status-rejeitada { background: #ffebee; color: #c62828; }
```

Este padrão de design oferece uma interface moderna, limpa e profissional com foco na usabilidade e responsividade, mantendo a identidade visual verde como cor principal do sistema.