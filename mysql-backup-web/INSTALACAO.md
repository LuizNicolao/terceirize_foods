# 🚀 Guia de Instalação - MySQL Backup Web

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- MySQL rodando (container `terceirize_mysql` ou servidor MySQL)
- Rede Docker `terceirize_network` criada

## ⚙️ Configuração

### 1. Criar arquivo .env (opcional)

```bash
cd mysql-backup-web
cp backend/.env.example backend/.env
```

Edite `backend/.env` se necessário (geralmente não precisa, as configurações estão no docker-compose.yml).

### 2. Configurar Telegram (opcional)

No arquivo `docker-compose.yml`, adicione as variáveis de ambiente:

```yaml
TELEGRAM_BOT_TOKEN: "seu_token_aqui"
TELEGRAM_CHAT_ID: "seu_chat_id_aqui"
```

Ou crie um arquivo `.env` na raiz:

```bash
TELEGRAM_BOT_TOKEN=seu_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
```

E no docker-compose.yml já está configurado para ler essas variáveis.

### 3. Verificar rede Docker

Certifique-se de que a rede `terceirize_network` existe:

```bash
docker network ls | grep terceirize_network
```

Se não existir, crie:

```bash
docker network create terceirize_network
```

## 🏃 Executar

### Desenvolvimento

```bash
cd mysql-backup-web

# Backend
cd backend
npm install
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

### Produção (Docker)

```bash
cd mysql-backup-web
docker compose up -d --build
```

## 🌐 Acessar

- **Frontend**: http://localhost:8086
- **Backend API**: http://localhost:3000/api

## 📝 Primeiro Acesso

1. Acesse http://localhost:8086
2. O sistema criará automaticamente o banco de dados `mysql_backup_web` no MySQL
3. Você verá a lista de bancos de dados disponíveis
4. Pode criar backups manuais ou configurar agendamentos

## 🔧 Configurações Importantes

### MySQL Connection

O sistema usa o MySQL existente (`terceirize_mysql`) para:
- Armazenar metadados dos backups
- Listar bancos disponíveis para backup

### Backup Storage

Os backups são salvos em:
- `./backups/` (mapeado para `/backups` no container)
- Estrutura: `backups/{daily|weekly|monthly}/{database_name}/`

### Agendamentos

- Configure agendamentos na interface web
- Os backups são executados automaticamente via `node-cron`
- Expressões cron são validadas antes de salvar

## 🐛 Troubleshooting

### Erro de conexão com MySQL

Verifique se o container `terceirize_mysql` está rodando:

```bash
docker ps | grep terceirize_mysql
```

### Erro de permissão nos backups

```bash
sudo chown -R $USER:$USER ./backups
```

### Ver logs

```bash
# Backend
docker logs mysql_backup_web_backend

# Frontend
docker logs mysql_backup_web_frontend
```

### Reiniciar serviços

```bash
docker compose restart
```

## 📚 API Endpoints

- `GET /api/health` - Status do sistema
- `GET /api/databases` - Listar bancos disponíveis
- `GET /api/backups` - Listar backups
- `POST /api/backups` - Criar backup manual
- `GET /api/backups/:id/download` - Download backup
- `POST /api/backups/:id/restore` - Restaurar backup
- `DELETE /api/backups/:id` - Deletar backup
- `GET /api/schedules` - Listar agendamentos
- `POST /api/schedules` - Criar agendamento
- `DELETE /api/schedules/:id` - Deletar agendamento
- `GET /api/settings` - Configurações

