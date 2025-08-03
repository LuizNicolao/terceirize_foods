# 🗄️ Banco de Dados Centralizado - Terceirize Foods

Este diretório contém a configuração centralizada do banco de dados MySQL e PHPMyAdmin para todos os sistemas da Terceirize Foods.

## 🏗️ Estrutura

```
database/
├── docker-compose.yml    # Configuração MySQL + PHPMyAdmin
├── .env                  # Variáveis de ambiente
├── init/                 # Scripts de inicialização
│   └── foods_db.sql      # Banco de dados principal
└── README.md            # Esta documentação
```

## 🚀 Como Executar

### 1. Primeira Execução
```bash
cd database
docker-compose up -d
```

### 2. Verificar Status
```bash
docker-compose ps
```

### 3. Ver Logs
```bash
docker-compose logs -f
```

## 🌐 Acesso

- **MySQL:** localhost:3306
- **PHPMyAdmin:** http://localhost:8080
  - **Usuário:** foods_user
  - **Senha:** foods123456

## 📊 Bancos de Dados

### Sistema Principal (foods)
- **Database:** `foods_db`
- **Usuário:** `foods_user`
- **Senha:** `foods123456`

### Sistema de Cotações (cotacao_v2)
- **Database:** `cotacao_db`
- **Usuário:** `foods_user`
- **Senha:** `foods123456`

## 🔧 Configurações

### Variáveis de Ambiente (.env)
```env
DB_HOST=mysql
DB_PORT=3306
DB_NAME=foods_db
DB_USER=foods_user
DB_PASSWORD=foods123456
JWT_SECRET=foods_jwt_secret_key_2024_producao
```

### Recursos Alocados
- **MySQL:** 1GB RAM, 1 CPU
- **PHPMyAdmin:** 256MB RAM

## 🛠️ Manutenção

### Backup
```bash
# Backup manual
docker-compose exec mysql mysqldump -u foods_user -p foods_db > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
# Restore manual
docker-compose exec -T mysql mysql -u foods_user -p foods_db < backup_file.sql
```

### Limpeza
```bash
# Parar serviços
docker-compose down

# Remover volumes (CUIDADO: perde dados)
docker-compose down -v
```

## 🔗 Conexão com Sistemas

### Foods System
- **Host:** terceirize_mysql
- **Port:** 3306
- **Network:** terceirize_network

### Cotação System
- **Host:** terceirize_mysql
- **Port:** 3306
- **Network:** terceirize_network

## ⚠️ Importante

- Este banco é compartilhado entre todos os sistemas
- Faça backups regulares
- Monitore o uso de recursos
- Use o PHPMyAdmin para administração visual 