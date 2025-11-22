# 🗄️ MySQL Backup Web

Solução completa de backup para MySQL com interface web, similar ao PG Back Web mas para MySQL.

## 🚀 Funcionalidades

- 📦 Interface web intuitiva
- 📅 Agendamento de backups
- 📈 Monitoramento visual
- 📤 Download e restore de backups
- 🔔 Notificações via Telegram
- 💾 Armazenamento local e S3 (futuro)
- 🔒 Criptografia (futuro)
- 🌚 Dark mode

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- MySQL rodando (container ou servidor)

## 🛠️ Instalação

```bash
cd mysql-backup-web
docker compose up -d
```

Acesse: http://localhost:8086

## ⚙️ Configuração

Variáveis de ambiente no `docker-compose.yml`:

- `MBW_ENCRYPTION_KEY`: Chave de criptografia
- `MBW_MYSQL_HOST`: Host do MySQL
- `MBW_MYSQL_PORT`: Porta do MySQL
- `MBW_MYSQL_USER`: Usuário do MySQL
- `MBW_MYSQL_PASSWORD`: Senha do MySQL
- `MBW_TELEGRAM_BOT_TOKEN`: Token do bot Telegram (opcional)
- `MBW_TELEGRAM_CHAT_ID`: Chat ID do Telegram (opcional)

## 📁 Estrutura

```
mysql-backup-web/
├── backend/          # API Node.js/Express
├── frontend/         # Interface React
├── docker-compose.yml
└── README.md
```

