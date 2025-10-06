#!/bin/bash

echo "🚀 Iniciando ambiente de desenvolvimento Foods..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.dev.yml down

# Iniciar banco de dados
echo "🗄️  Iniciando banco de dados MySQL..."
docker-compose -f docker-compose.dev.yml up -d mysql

# Aguardar o banco estar pronto
echo "⏳ Aguardando banco de dados estar pronto..."
sleep 10

# Verificar se o banco está rodando
echo "🔍 Verificando status do banco de dados..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "✅ Ambiente de desenvolvimento configurado!"
echo ""
echo "📋 Próximos passos:"
echo "1. Terminal 1 - Backend: cd backend && npm run start:dev"
echo "2. Terminal 2 - Frontend: cd frontend && npm run start:dev"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   MySQL:    localhost:3306"
echo ""
