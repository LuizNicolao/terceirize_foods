# Sistema de Implantação

Sistema de gestão de implantação baseado na estrutura do sistema Foods.

## 🚀 Ambiente de Desenvolvimento

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+
- npm

### Portas Utilizadas
- **Frontend**: 3004
- **Backend**: 3005  
- **MySQL**: 3310
- **phpMyAdmin**: 8084

## 🚀 Ambiente de Desenvolvimento

### Iniciar ambiente completo
```bash
./start-dev.sh
```

### Parar ambiente completo
```bash
./stop-dev.sh
```

### Acesso aos Serviços
- **Frontend**: http://localhost:3004
- **Backend**: http://localhost:3005
- **phpMyAdmin**: http://localhost:8084
- **MySQL**: localhost:3310

### Credenciais do Banco
- **Host**: localhost:3310
- **Database**: implantacao_db
- **User**: implantacao_user
- **Password**: implantacao123456

### Credenciais do Sistema
- **Email**: luiz.nicolao@terceirizemais.com.br
- **Senha**: (mesma senha do foods)

## 📁 Estrutura do Projeto

```
implantacao/
├── backend/                 # API Node.js
│   ├── config/             # Configurações
│   ├── controllers/        # Controllers
│   ├── middleware/         # Middlewares
│   ├── routes/            # Rotas
│   └── utils/             # Utilitários
├── frontend/              # React App
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/        # Páginas
│   │   ├── services/     # Serviços API
│   │   └── contexts/     # Contextos React
├── database/              # Scripts de banco
└── docker-compose.dev.yml # Configuração Docker
```

## 🗄️ Tabelas do Banco

### Tabelas Implementadas
- `usuarios` - Usuários do sistema (copiada do foods)
- `permissoes_usuario` - Permissões por usuário (copiada do foods)

### Próximas Tabelas
- `escolas` - Escolas do sistema de implantação
- `necessidades` - Necessidades de produtos
- `produtos` - Produtos específicos

## 🔐 Autenticação

O sistema utiliza JWT para autenticação com as seguintes funcionalidades:
- Login com email/senha
- Verificação de token
- Middleware de autenticação
- Controle de permissões

## 📝 Status do Desenvolvimento

1. ✅ Sistema de Login (idêntico ao foods)
2. ✅ Banco de dados básico
3. 🔄 CRUD de Usuários (próximo)
4. 🔄 Sistema de Permissões (próximo)
5. ⏳ Funcionalidades específicas do implantação
