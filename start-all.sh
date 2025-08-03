#!/bin/bash

# 🏢 Terceirize Foods - Script de Inicialização Completa
# Este script inicia todos os sistemas em sequência

echo "🚀 Iniciando Terceirize Foods - Sistema Completo"
echo "================================================"

# Função para verificar se o container está rodando
check_container() {
    local container_name=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Aguardando $container_name ficar pronto..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker ps --format "table {{.Names}}" | grep -q "^$container_name$"; then
            if docker inspect $container_name --format='{{.State.Health.Status}}' 2>/dev/null | grep -q "healthy"; then
                echo "✅ $container_name está rodando e saudável!"
                return 0
            elif docker inspect $container_name --format='{{.State.Status}}' 2>/dev/null | grep -q "running"; then
                echo "✅ $container_name está rodando!"
                return 0
            fi
        fi
        echo "   Tentativa $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $container_name não ficou pronto em tempo hábil"
    return 1
}

# 1. Iniciar Banco de Dados (PRIMEIRO)
echo ""
echo "🗄️ 1. Iniciando Banco de Dados Centralizado..."
cd database
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados iniciado com sucesso!"
    
    # Aguardar MySQL ficar pronto
    check_container "terceirize_mysql"
    if [ $? -ne 0 ]; then
        echo "❌ Erro: MySQL não ficou pronto"
        exit 1
    fi
else
    echo "❌ Erro ao iniciar banco de dados"
    exit 1
fi

# 2. Iniciar Sistema Foods
echo ""
echo "🍽️ 2. Iniciando Sistema Foods..."
cd ../foods
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Sistema Foods iniciado com sucesso!"
    
    # Aguardar backend ficar pronto
    check_container "foods_backend"
    if [ $? -ne 0 ]; then
        echo "⚠️  Aviso: Backend do Foods pode não estar totalmente pronto"
    fi
else
    echo "❌ Erro ao iniciar sistema Foods"
    exit 1
fi

# 3. Iniciar Sistema Cotação
echo ""
echo "📊 3. Iniciando Sistema de Cotações..."
cd ../cotacao_v2
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Sistema de Cotações iniciado com sucesso!"
    
    # Aguardar backend ficar pronto
    check_container "cotacao_v2-backend-1"
    if [ $? -ne 0 ]; then
        echo "⚠️  Aviso: Backend do Cotação pode não estar totalmente pronto"
    fi
else
    echo "❌ Erro ao iniciar sistema de Cotações"
    exit 1
fi

# 4. Verificar Status Final
echo ""
echo "🔍 4. Verificando Status Final..."
cd ..
echo ""
echo "📊 Containers em execução:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 URLs de Acesso:"
echo "=================="
echo "🗄️  PHPMyAdmin:     http://82.29.57.43:8080"
echo "🍽️  Foods Frontend: http://82.29.57.43:3000"
echo "🍽️  Foods Backend:  http://82.29.57.43:3001/api"
echo "📊 Cotação Frontend: http://82.29.57.43:3002"
echo "📊 Cotação Backend:  http://82.29.57.43:5000/api"
echo ""
echo "🎉 Todos os sistemas foram iniciados com sucesso!"
echo "================================================" 