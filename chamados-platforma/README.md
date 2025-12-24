# Chamados Plataforma

Plataforma centralizada de gestão de chamados para reporte de bugs, erros e melhorias dos sistemas.

## 🚀 Estrutura do Projeto

```
chamados-platforma/
├── backend/          # API Node.js/Express
├── frontend/         # Interface React
├── docker-compose.yml
└── README.md
```

## 📋 Pré-requisitos

- Docker e Docker Compose
- MySQL 8.0 (via Docker)
- Node.js 18+ (para desenvolvimento local)

## 🛠️ Instalação

### 1. Configurar Banco de Dados

Execute a migração SQL para criar as tabelas:

```bash
mysql -u foods_user -p chamados_db < backend/database/migrations/01_create_chamados_tables.sql
```

Ou via phpMyAdmin:
- Acesse http://localhost:8080
- Selecione o banco `chamados_db`
- Execute o arquivo `backend/database/migrations/01_create_chamados_tables.sql`

**Importante:** Após criar as tabelas, você precisa criar um usuário administrador manualmente:

```sql
-- Gerar hash bcrypt para a senha 'admin123'
-- Use um gerador online ou execute no Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('admin123', 10);
-- console.log(hash);

-- Exemplo de inserção (substitua o hash pelo gerado):
INSERT INTO usuarios (nome, email, senha, nivel_de_acesso, tipo_de_acesso, status)
VALUES ('Administrador', 'admin@chamados.com', '$2a$10$SEU_HASH_AQUI', 'III', 'administrador', 'ativo');
```

### 2. Configurar Variáveis de Ambiente

**Backend:**
```bash
cd backend
cp env.example env.development
# Edite env.development com suas configurações
```

**Frontend:**
```bash
cd frontend
cp env.example .env
# Edite .env com suas configurações
```

### 3. Instalar Dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Executar com Docker

```bash
# Na raiz do projeto
docker-compose up -d
```

### 5. Executar em Desenvolvimento (sem Docker)

**Backend:**
```bash
cd backend
npm run dev
# Servidor rodará em http://localhost:3006
```

**Frontend:**
```bash
cd frontend
npm start
# Aplicação rodará em http://localhost:3007
```

## 🔐 Credenciais Padrão

Após criar o usuário administrador:
- **Email:** admin@chamados.com
- **Senha:** admin123

**⚠️ IMPORTANTE:** Altere a senha padrão após o primeiro login!

## 📡 Endpoints da API

- **Base URL (dev):** `http://localhost:3006/chamados/api`
- **Base URL (prod):** `https://foods.terceirizemais.com.br/chamados/api`

### Autenticação
- `POST /auth/login` - Login
- `GET /auth/verify` - Verificar token
- `POST /auth/logout` - Logout

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- `usuarios` - Usuários do sistema
- `chamados` - Chamados/tickets
- `chamados_comentarios` - Comentários dos chamados
- `chamados_anexos` - Anexos (screenshots, logs)
- `chamados_historico` - Histórico de mudanças

## 🎨 Padrão de Desenvolvimento

Seguindo o padrão `@padrao foods.md`:

- **Backend:** Estrutura RESTful, controllers, repositories, middleware
- **Frontend:** Componentes modulares, hooks customizados, services
- **Estilo:** Tailwind CSS, identidade visual verde (green-600)

## 📝 Próximos Passos

1. ✅ Estrutura básica criada
2. ✅ Tela de login implementada
3. ⏳ Dashboard de chamados
4. ⏳ CRUD de chamados
5. ⏳ Sistema de comentários
6. ⏳ Upload de anexos
7. ⏳ Filtros e busca
8. ⏳ Relatórios e métricas

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se o MySQL está rodando
- Confirme as credenciais em `env.development`
- Teste a conexão: `mysql -u foods_user -p -h localhost`

### Erro de CORS
- Verifique `CORS_ORIGIN` no backend
- Confirme que a URL do frontend está na lista de origens permitidas

### Erro de build do frontend
- Limpe o cache: `rm -rf node_modules package-lock.json && npm install`
- Verifique se todas as dependências estão instaladas

## 📄 Licença

MIT

