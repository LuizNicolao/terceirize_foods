# 🚀 Guia Completo - Configuração do Sistema Foods na VPS

## 📋 Pré-requisitos
- VPS com Ubuntu 20.04 ou superior
- Acesso SSH à VPS
- IP da VPS: 82.29.57.43

---

## 🔧 Passo 1: Conectar na VPS

```bash
ssh root@82.29.57.43
```

---

## 🛠️ Passo 2: Atualizar o Sistema

```bash
# Atualizar lista de pacotes
apt update

# Atualizar sistema
apt upgrade -y

# Instalar pacotes essenciais
apt install -y curl wget git nano htop ufw
```

---

## 🐳 Passo 3: Instalar Docker

```bash
# Baixar script de instalação do Docker
curl -fsSL https://get.docker.com -o get-docker.sh

# Executar script de instalação
sh get-docker.sh

# Adicionar usuário ao grupo docker
usermod -aG docker $USER

# Verificar instalação
docker --version
docker-compose --version
```

---

## 🔐 Passo 4: Configurar Firewall

```bash
# Habilitar firewall
ufw enable

# Permitir SSH
ufw allow ssh

# Permitir portas do sistema
ufw allow 3000  # Frontend
ufw allow 3001  # Backend
ufw allow 8080  # phpMyAdmin
ufw allow 3306  # MySQL (se necessário)

# Verificar status
ufw status
```

---

## 📁 Passo 5: Baixar o Projeto

```bash
# Navegar para diretório home
cd /home

# Clonar o projeto (substitua pela URL do seu repositório)
git clone https://github.com/seu-usuario/terceirize_foods.git

# Entrar no diretório
cd terceirize_foods

# Verificar arquivos
ls -la
```

---

## ⚙️ Passo 6: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env para produção
nano .env
```

**Conteúdo do arquivo .env:**
```env
# Configurações do Banco de Dados
DB_HOST=mysql
DB_PORT=3306
DB_NAME=foods_db
DB_USER=foods_user
DB_PASSWORD=foods123456

# Configurações do JWT
JWT_SECRET=foods_jwt_secret_key_2024_producao

# Configurações do Servidor
NODE_ENV=production
PORT=3001

# Configurações do Frontend
REACT_APP_API_URL=http://82.29.57.43:3001
```

**Salvar arquivo:** `Ctrl + X`, depois `Y`, depois `Enter`

---

## 🚀 Passo 7: Iniciar o Sistema

```bash
# Construir e iniciar todos os serviços
docker-compose up --build -d

# Verificar se os containers estão rodando
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f
```

---

## ✅ Passo 8: Verificar Funcionamento

### Verificar Containers:
```bash
# Listar containers ativos
docker ps

# Ver logs de cada serviço
docker-compose logs mysql
docker-compose logs backend
docker-compose logs frontend
docker-compose logs phpmyadmin
```

### Testar Acessos:
- **Frontend**: http://82.29.57.43:3000
- **Backend API**: http://82.29.57.43:3001
- **phpMyAdmin**: http://82.29.57.43:8080
- **Health Check**: http://82.29.57.43:3001/api/health

---

## 👤 Passo 9: Criar Usuário Administrador

```bash
# Entrar no container do backend
docker-compose exec backend bash

# Executar script para criar administrador
npm run create-admin

# Sair do container
exit
```

**Credenciais do Administrador:**
- Email: `admin@foods.com`
- Senha: `admin123456`

---

## 🔧 Passo 10: Comandos Úteis

### Gerenciar Serviços:
```bash
# Parar todos os serviços
docker-compose down

# Iniciar serviços
docker-compose up -d

# Reiniciar serviços
docker-compose restart

# Ver logs
docker-compose logs -f
```

### Backup do Banco:
```bash
# Criar backup
docker-compose exec mysql mysqldump -u foods_user -p foods_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T mysql mysql -u foods_user -p foods_db < backup.sql
```

### Atualizar Sistema:
```bash
# Parar serviços
docker-compose down

# Baixar atualizações
git pull

# Reconstruir e iniciar
docker-compose up --build -d
```

---

## 🐛 Solução de Problemas

### Problema 1: Porta já em uso
```bash
# Verificar portas em uso
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Matar processo se necessário
kill -9 <PID>
```

### Problema 2: Erro de permissão
```bash
# Corrigir permissões
chown -R $USER:$USER .
chmod -R 755 .
```

### Problema 3: Container não inicia
```bash
# Ver logs detalhados
docker-compose logs <nome-do-container>

# Reconstruir container
docker-compose build --no-cache <nome-do-container>
docker-compose up -d <nome-do-container>
```

### Problema 4: Banco não conecta
```bash
# Verificar se MySQL está rodando
docker-compose exec mysql mysql -u foods_user -p

# Testar conexão
docker-compose exec backend node -e "require('./config/database').testConnection()"
```

---

## 📊 Monitoramento

### Verificar Recursos:
```bash
# Uso de CPU e memória
htop

# Espaço em disco
df -h

# Logs do sistema
journalctl -f
```

### Logs dos Containers:
```bash
# Logs em tempo real
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

---

## 🔒 Segurança

### Alterar Senhas Padrão:
1. Acesse phpMyAdmin: http://82.29.57.43:8080
2. Login: `foods_user` / `foods123456`
3. Altere a senha do usuário `foods_user`
4. Atualize o arquivo `.env` com a nova senha
5. Reinicie os serviços: `docker-compose restart`

### Configurar SSL (Opcional):
```bash
# Instalar Certbot
apt install certbot

# Obter certificado SSL
certbot certonly --standalone -d seu-dominio.com
```

---

## 📱 Acessos Finais

### URLs de Produção:
- **Sistema**: http://82.29.57.43:3000
- **API**: http://82.29.57.43:3001
- **phpMyAdmin**: http://82.29.57.43:8080

### Credenciais:
- **Sistema**: admin@foods.com / admin123456
- **phpMyAdmin**: foods_user / foods123456

---

## ✅ Checklist de Verificação

- [ ] Docker instalado e funcionando
- [ ] Firewall configurado
- [ ] Projeto baixado
- [ ] Variáveis de ambiente configuradas
- [ ] Containers rodando
- [ ] Frontend acessível
- [ ] Backend respondendo
- [ ] phpMyAdmin funcionando
- [ ] Usuário administrador criado
- [ ] Login funcionando

---

## 🆘 Suporte

### Comandos de Diagnóstico:
```bash
# Status geral
docker-compose ps
docker system df
docker stats

# Verificar conectividade
curl http://82.29.57.43:3001/api/health
curl http://82.29.57.43:3000

# Verificar logs
docker-compose logs --tail=100
```

### Contatos:
- Em caso de problemas, verifique os logs primeiro
- Use `docker-compose logs -f` para monitorar em tempo real
- Consulte o README.md para mais informações

---

**🎉 Sistema configurado com sucesso!**

O sistema Foods está pronto para uso em produção na VPS 82.29.57.43. 