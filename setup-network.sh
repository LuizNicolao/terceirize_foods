#!/bin/bash

# Script para configurar a rede interna dos sistemas Terceirize

echo "🚀 Configurando rede interna dos sistemas Terceirize..."

# Criar rede interna se não existir
if ! docker network ls | grep -q "terceirize_network"; then
    echo "📡 Criando rede terceirize_network..."
    docker network create \
        --driver bridge \
        --subnet=172.20.0.0/16 \
        --ip-range=172.20.240.0/20 \
        --gateway=172.20.0.1 \
        terceirize_network
    echo "✅ Rede terceirize_network criada com sucesso!"
else
    echo "✅ Rede terceirize_network já existe!"
fi

# Verificar status da rede
echo ""
echo "📊 Status da rede:"
docker network ls | grep terceirize

echo ""
echo "🔍 Detalhes da rede:"
docker network inspect terceirize_network --format '{{json .IPAM.Config}}' | jq '.'

echo ""
echo "✅ Configuração da rede concluída!"
echo ""
echo "🎯 Próximos passos:"
echo "1. Execute: docker compose up -d --build (em cada projeto)"
echo "2. Ou use o script: ./start-all.sh"
echo ""
