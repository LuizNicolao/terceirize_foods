#!/bin/bash

# 🚀 Script de Instalação Automatizada - Sistema Foods
# VPS: 82.29.57.43

echo "🚀 Iniciando instalação do Sistema Foods na VPS..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script deve ser executado como root"
    exit 1
fi

print_status "Atualizando sistema..."
apt update -y
apt upgrade -y

print_status "Instalando pacotes essenciais..."
apt install -y curl wget git nano htop ufw unzip

print_status "Removendo instalações anteriores do Docker..."
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
apt-get autoremove -y

print_status "Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

print_status "Configurando Docker..."
# Adicionar usuário ao grupo docker
usermod -aG docker $USER

# Iniciar e habilitar o serviço Docker
systemctl enable docker
systemctl start docker

# Aguardar o Docker inicializar
print_status "Aguardando inicialização do Docker..."
sleep 10

# Verificar se o daemon está rodando
if ! systemctl is-active --quiet docker; then
    print_warning "Tentando iniciar o Docker novamente..."
    systemctl start docker
    sleep 5
fi

print_status "Verificando instalação do Docker..."
if command -v docker &> /dev/null; then
    print_status "Docker instalado com sucesso!"
    docker --version
    
    # Verificar se o daemon está respondendo
    if docker info &> /dev/null; then
        print_status "Docker daemon funcionando!"
    else
        print_error "Docker daemon não está respondendo"
        print_status "Tentando resolver..."
        systemctl restart docker
        sleep 5
        if docker info &> /dev/null; then
            print_status "Docker daemon agora funcionando!"
        else
            print_error "Falha ao iniciar Docker daemon"
            exit 1
        fi
    fi
else
    print_error "Falha na instalação do Docker"
    exit 1
fi

# Verificar Docker Compose
print_status "Verificando Docker Compose..."
if command -v docker-compose &> /dev/null; then
    print_status "Docker Compose instalado com sucesso!"
    docker-compose --version
elif docker compose version &> /dev/null; then
    print_status "Docker Compose (plugin) disponível!"
    docker compose version
else
    print_error "Falha na instalação do Docker Compose"
    exit 1
fi

print_status "Configurando firewall..."
ufw --force enable
ufw allow ssh
ufw allow 3000
ufw allow 3001
ufw allow 8080
ufw allow 3306

print_status "Verificando se estamos no diretório do projeto..."
if [ ! -f "docker-compose.yml" ]; then
    print_error "Arquivo docker-compose.yml não encontrado. Execute este script na pasta do projeto."
    exit 1
fi

print_status "Projeto encontrado! Configurando..."

print_status "Criando arquivo .env para produção..."
cat > .env << EOF
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
EOF

print_status "Iniciando containers..."
# Usar docker compose (plugin) se disponível, senão docker-compose
if docker compose version &> /dev/null; then
    docker compose up --build -d
else
    docker-compose up --build -d
fi

print_status "Aguardando inicialização dos serviços..."
sleep 30

print_status "Verificando status dos containers..."
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi

print_status "Aguardando mais tempo para inicialização completa..."
sleep 20

print_status "Criando usuário administrador..."
if docker compose version &> /dev/null; then
    docker compose exec -T backend npm run create-admin
else
    docker-compose exec -T backend npm run create-admin
fi

print_status "Verificando conectividade..."
sleep 10

# Testar endpoints
if curl -s http://82.29.57.43:3001/api/health > /dev/null; then
    print_status "✅ Backend funcionando!"
else
    print_warning "⚠️  Backend pode estar ainda inicializando..."
fi

if curl -s http://82.29.57.43:3000 > /dev/null; then
    print_status "✅ Frontend funcionando!"
else
    print_warning "⚠️  Frontend pode estar ainda inicializando..."
fi

print_status "Configuração concluída!"

echo ""
echo "🎉 SISTEMA INSTALADO COM SUCESSO!"
echo ""
echo "📱 URLs de Acesso:"
echo "   • Sistema: http://82.29.57.43:3000"
echo "   • API: http://82.29.57.43:3001"
echo "   • phpMyAdmin: http://82.29.57.43:8080"
echo ""
echo "🔐 Credenciais:"
echo "   • Sistema: admin@foods.com / admin123456"
echo "   • phpMyAdmin:"
echo "     - Usuário: foods_user"
echo "     - Senha: foods123456"
echo "     - Root: root / foods123456"
echo ""
echo "🔧 Comandos Úteis:"
echo "   • Ver logs: docker compose logs -f"
echo "   • Parar serviços: docker compose down"
echo "   • Iniciar serviços: docker compose up -d"
echo "   • Reiniciar: docker compose restart"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   • Altere a senha do administrador após o primeiro login"
echo "   • Configure backup regular do banco de dados"
echo "   • Monitore os logs regularmente"
echo ""

print_status "Instalação concluída! 🚀" ~
