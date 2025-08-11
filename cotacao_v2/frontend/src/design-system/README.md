# Design System - Sistema de Cotação

Este design system foi implementado baseado no guia de estilo do Sistema Foods, garantindo consistência visual e de experiência do usuário em todo o projeto.

## 📁 Estrutura

```
design-system/
├── components/          # Componentes reutilizáveis
│   ├── Button.js       # Botões com variantes
│   ├── Input.js        # Campos de entrada
│   ├── Card.js         # Cards e containers
│   └── index.js        # Exportações dos componentes
├── global.css          # CSS global e utilitários
├── index.js            # Design system principal
└── README.md           # Esta documentação
```

## 🎨 Paleta de Cores

### Cores Principais
- **Verde Primário**: `#4CAF50` - Cor principal do sistema
- **Verde Escuro**: `#388E3C` - Hover e estados ativos
- **Verde Claro**: `#81C784` - Backgrounds e destaques

### Cores Neutras
- **Branco**: `#FFFFFF` - Backgrounds principais
- **Cinza Claro**: `#f5f5f5` - Backgrounds secundários
- **Cinza**: `#757575` - Texto secundário
- **Cinza Escuro**: `#424242` - Texto principal

### Cores Secundárias
- **Azul**: `#2196F3` - Botões secundários
- **Laranja**: `#FF9800` - Avisos e alertas

### Cores de Status
- **Erro**: `#f44336` - Mensagens de erro
- **Sucesso**: `#4CAF50` - Mensagens de sucesso
- **Aviso**: `#FF9800` - Mensagens de aviso

## 🧩 Componentes

### Button
```jsx
import { Button } from '../design-system/components';

// Variantes disponíveis: primary, secondary, danger, outline
// Tamanhos disponíveis: sm, md, lg
<Button variant="primary" size="lg" fullWidth>
  Entrar
</Button>
```

### Input
```jsx
import { Input } from '../design-system/components';

<Input
  type="email"
  label="E-mail"
  placeholder="Digite seu e-mail"
  error="Mensagem de erro"
/>
```

### Card
```jsx
import { Card } from '../design-system/components';

// Variantes: base, dashboard
<Card variant="dashboard" hover>
  Conteúdo do card
</Card>
```

## 📝 Tipografia

### Família de Fontes
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Tamanhos
- **xs**: 10px
- **sm**: 12px
- **base**: 14px
- **lg**: 16px
- **xl**: 18px
- **2xl**: 24px
- **3xl**: 28px
- **4xl**: 32px

## 📏 Espaçamentos

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px
- **4xl**: 40px

## ✨ Animações

### Transições
- **Duração padrão**: 0.3s
- **Easing**: ease

### Keyframes
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

## 📱 Responsividade

### Breakpoints
- **Mobile**: max-width: 768px
- **Tablet**: max-width: 1024px
- **Desktop**: min-width: 1920px

## 🚀 Como Usar

### 1. Importar o Design System
```jsx
import './design-system'; // No App.js ou index.js
```

### 2. Usar Componentes
```jsx
import { Button, Input, Card } from '../design-system/components';
import { colors, typography } from '../design-system';
```

### 3. Usar com Styled Components
```jsx
import styled from 'styled-components';
import { colors, typography } from '../design-system';

const StyledComponent = styled.div`
  color: ${colors.primary.green};
  font-size: ${typography.fontSize.lg};
`;
```

## 🎯 Telas Implementadas

### ✅ Login
- Design moderno com gradiente verde
- Animações suaves
- Componentes reutilizáveis
- Responsivo

### 🔄 Próximas Telas
- Dashboard
- Sidebar
- Tabelas
- Formulários
- Modais

## 📚 Dependências

- `styled-components`: ^6.0.0
- `react-icons`: ^4.12.0

## 🔧 Configuração

O design system é automaticamente carregado quando você importa:

```jsx
import './design-system';
```

Isso inclui:
- CSS global
- Variáveis CSS
- Animações
- Utilitários

---

**Nota**: Este design system segue os padrões estabelecidos no guia de estilo do Sistema Foods, garantindo consistência visual e de experiência do usuário. 