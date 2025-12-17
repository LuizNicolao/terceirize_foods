# Cotação Luiz

Sistema de cotação desenvolvido em PHP.

## Configuração do Docker

### Portas Configuradas (para evitar conflitos)

- **Web/Apache**: `3087` (padrão, configurável via variável `WEB_PORT`)
- **phpMyAdmin**: `8082` (padrão, configurável via variável `PHPMYADMIN_PORT`)
- **MySQL**: `3308` (no host, mapeado para 3306 no container)

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Portas do Docker
WEB_PORT=3087
PHPMYADMIN_PORT=8082

# Configurações do Banco de Dados
DB_HOST=db
DB_PORT=3306
DB_NAME=cotacao_db
DB_USER=root
DB_PASSWORD=cotacao_root_password_2024

# Senha root do MySQL
MYSQL_ROOT_PASSWORD=cotacao_root_password_2024
```

### Como Iniciar

```bash
# Criar o arquivo .env (copie e ajuste conforme necessário)
cp .env.example .env

# Iniciar os containers
docker compose up -d --build
```

### Acessos

- **Aplicação Web**: http://localhost:3087
- **phpMyAdmin**: http://localhost:8082

### Observações

- O projeto usa uma rede Docker isolada (`cotacao-network`) para não conflitar com outros projetos
- O banco de dados MySQL está isolado e não interfere com o `terceirize_mysql` usado pelos outros projetos
- Todas as portas foram configuradas para não conflitar com os outros projetos do sistema