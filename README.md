# 🍽️ Sistema de Cadastro de Informações Foods

Sistema completo de cadastro de informações com backend Node.js, frontend React e banco de dados MySQL, seguindo o padrão de design da empresa.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com Express.js
- **MySQL** como banco de dados
- **JWT** para autenticação
- **bcryptjs** para criptografia
- **express-validator** para validação
- **helmet** e **express-rate-limit** para segurança

### Frontend
- **React.js 18.2.0**
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Styled Components** para estilização
- **React Hook Form** para formulários
- **React Query** para gerenciamento de estado

### Infraestrutura
- **Docker** para containerização
- **Docker Compose** para orquestração
- **phpMyAdmin** para administração do banco

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)
- Git

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd terceirize_foods
```

### 2. Configuração do Ambiente

#### Para Desenvolvimento Local:
```bash
# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

#### Para Produção (Docker):
```bash
# Construir e iniciar todos os serviços
docker-compose up --build
```

### 3. Configuração do Banco de Dados

O banco de dados será criado automaticamente com as tabelas necessárias quando você executar o Docker Compose. O arquivo `BANCO_DE_DADOS_FOODS.sql` será executado automaticamente.

### 4. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (opcional para desenvolvimento local):

```env
# Backend
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foods_db
DB_USER=foods_user
DB_PASSWORD=foods123456
JWT_SECRET=foods_jwt_secret_key_2024

# Frontend
REACT_APP_API_URL=http://localhost:3001
```

## 🚀 Executando o Projeto

### Desenvolvimento Local

#### Backend:
```bash
cd backend
npm run dev
```
O backend estará disponível em: http://localhost:3001

#### Frontend:
```bash
cd frontend
npm start
```
O frontend estará disponível em: http://localhost:3000

### Produção (Docker)

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## 🌐 Acessos

Após iniciar o projeto, você terá acesso a:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **phpMyAdmin**: http://localhost:8080
  - Usuário: `foods_user`
  - Senha: `foods123456`

## 📊 Estrutura do Banco de Dados

O sistema inclui as seguintes tabelas:

- **usuarios**: Gerenciamento de usuários do sistema
- **fornecedores**: Cadastro de fornecedores
- **produtos**: Cadastro de produtos
- **grupos**: Categorização de produtos
- **subgrupos**: Subcategorias de produtos
- **unidades_medida**: Unidades de medida
- **permissoes_usuario**: Controle de permissões

## 🔐 Autenticação e Permissões

O sistema utiliza JWT para autenticação e possui diferentes níveis de acesso:

- **Níveis de Acesso**: I, II, III
- **Tipos de Acesso**: administrador, coordenador, administrativo, gerente, supervisor
- **Permissões**: visualizar, criar, editar, excluir

## 🎨 Padrão de Design

O sistema segue o padrão de design da empresa com:

- **Cores Principais**: Verde (#4CAF50)
- **Layout Responsivo**: Adaptável a diferentes dispositivos
- **Interface Moderna**: Design limpo e profissional
- **Animações Suaves**: Transições e efeitos visuais

## 📱 Funcionalidades

### Módulos Disponíveis:
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de Usuários
- ✅ Cadastro de Fornecedores
- ✅ Cadastro de Produtos
- ✅ Gerenciamento de Grupos
- ✅ Gerenciamento de Unidades
- ✅ Sistema de Permissões
- ✅ Autenticação JWT

### Recursos:
- 🔍 Busca e filtros
- 📄 Paginação
- ✅ Validação de formulários
- 🔐 Controle de acesso
- 📱 Interface responsiva
- 🎨 Design moderno

## 🛠️ Desenvolvimento

### Estrutura de Pastas:
```
terceirize_foods/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
│   └── public/
├── docker-compose.yml
└── README.md
```

### Comandos Úteis:

```bash
# Desenvolvimento
npm run dev          # Backend
npm start            # Frontend

# Produção
docker-compose up -d # Iniciar todos os serviços
docker-compose down  # Parar serviços
docker-compose logs  # Ver logs

# Banco de dados
docker-compose exec mysql mysql -u foods_user -p foods_db
```

## 🔧 Configuração para VPS

Para configurar na sua VPS (82.29.57.43):

1. **Instalar Docker na VPS**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Clonar o projeto na VPS**:
```bash
git clone <url-do-repositorio>
cd terceirize_foods
```

3. **Configurar variáveis de ambiente para produção**:
```env
NODE_ENV=production
REACT_APP_API_URL=http://82.29.57.43:3001
```

4. **Iniciar os serviços**:
```bash
docker-compose up -d
```

5. **Configurar firewall** (se necessário):
```bash
sudo ufw allow 3000  # Frontend
sudo ufw allow 3001  # Backend
sudo ufw allow 8080  # phpMyAdmin
sudo ufw allow 3306  # MySQL (se necessário)
```

## 🐛 Troubleshooting

### Problemas Comuns:

1. **Erro de conexão com banco**:
   - Verifique se o MySQL está rodando
   - Confirme as credenciais no docker-compose.yml

2. **Frontend não carrega**:
   - Verifique se a API está rodando
   - Confirme a URL da API no .env

3. **Erro de permissão no Docker**:
   ```bash
   sudo chown -R $USER:$USER .
   ```

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs: `docker-compose logs`
- Consulte a documentação da API em `/api/health`
- Verifique o status do banco via phpMyAdmin

## 📄 Licença

Este projeto é desenvolvido para uso interno da empresa Foods.

---

**Desenvolvido com ❤️ para o Sistema Foods** 