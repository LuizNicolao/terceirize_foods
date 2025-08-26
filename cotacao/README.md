# Sistema de Cotação - Produção

Este projeto foi configurado para rodar em produção no domínio `http://foods.terceirizemais.com.br/cotacao/`.

## Configurações de Produção

### Estrutura de URLs
- **Frontend**: `http://foods.terceirizemais.com.br/cotacao/`
- **API**: `http://foods.terceirizemais.com.br/cotacao/api/`
- **Login**: `http://foods.terceirizemais.com.br/cotacao/login`

### Containers Docker
- **Frontend**: `cotacao_frontend` (porta 3002:80)
- **Backend**: `cotacao_backend` (porta 5000:5000)

### Banco de Dados
- **Host**: `terceirize_mysql` (container externo)
- **Database**: `cotacao_db`
- **User**: `foods_user`
- **Password**: `foods123456`

## Como Executar

1. **Subir os containers**:
   ```bash
   docker compose up -d --build
   ```

2. **Verificar logs**:
   ```bash
   docker compose logs -f
   ```

3. **Parar os containers**:
   ```bash
   docker compose down
   ```

## Mudanças Realizadas

### Removido
- ✅ `docker-compose.dev.yml` - Ambiente de desenvolvimento
- ✅ `start-dev.sh` - Script de desenvolvimento
- ✅ Arquivos de ambiente de desenvolvimento (`env.development`, `env-config.txt`)

### Atualizado
- ✅ `docker-compose.yml` - Configurado para produção
- ✅ `frontend/Dockerfile` - Usando nginx para produção
- ✅ `backend/Dockerfile` - Configurado para produção
- ✅ `frontend/nginx.conf` - Configurado para path `/cotacao`
- ✅ `backend/middleware/routePrefix.js` - Prefixo `/cotacao/api`
- ✅ `frontend/src/App.js` - Basename `/cotacao`
- ✅ `backend/package.json` - Script start para produção

### Configurações
- ✅ Frontend serve na porta 80 (nginx)
- ✅ Backend serve na porta 5000
- ✅ Todas as rotas da API usam prefixo `/cotacao/api`
- ✅ React Router configurado com basename `/cotacao`

## Estrutura de Arquivos

```
cotacao/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── middleware/
│   │   └── routePrefix.js
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
│       ├── App.js
│       └── services/
│           └── api.js
├── docker-compose.yml
└── cotacao_db (1).sql
```

## Notas Importantes

- O sistema usa a rede Docker `terceirize_network` (externa)
- O banco de dados deve estar disponível no container `terceirize_mysql`
- Todas as variáveis de ambiente estão configuradas no `docker-compose.yml`
- O frontend usa nginx para servir arquivos estáticos
- O backend usa Express.js com prefixo de rotas configurado
