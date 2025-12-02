#!/bin/bash

# Script para configurar OSRM pela primeira vez

set -e

echo "🚀 Configurando servidor OSRM..."

# Criar diretório de dados se não existir
mkdir -p data
cd data

# Verificar se o arquivo já existe
if [ -f "brazil-latest.osm.pbf" ]; then
    echo "✅ Arquivo brazil-latest.osm.pbf já existe. Pulando download..."
else
    echo "📥 Baixando mapa do Brasil (isso pode demorar alguns minutos)..."
    wget https://download.geofabrik.de/south-america/brazil-latest.osm.pbf
    echo "✅ Download concluído!"
fi

cd ..

echo "⚙️ Processando dados (isso pode demorar 30-60 minutos para o Brasil inteiro)..."
echo "   ⚠️  ATENÇÃO: Este processo requer pelo menos 6GB de RAM disponível"
echo "   📊 Memória disponível: $(free -h | grep Mem | awk '{print $7}')"
echo ""
echo "   Passo 1/3: Extraindo dados (pode demorar 20-40 minutos)..."
echo "   💡 Este é o passo mais demorado e que mais consome memória"
docker run --rm -t --memory="6g" --memory-swap="6g" -v "$(pwd)/data:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/brazil-latest.osm.pbf

if [ ! -f "data/brazil-latest.osrm" ]; then
    echo "❌ Erro: Arquivo .osrm não foi gerado. Verifique os logs acima."
    exit 1
fi

echo "   ✅ Extração concluída!"
echo ""
echo "   Passo 2/3: Particionando..."
docker run --rm -t --memory="4g" --memory-swap="4g" -v "$(pwd)/data:/data" osrm/osrm-backend osrm-partition /data/brazil-latest.osrm

echo "   Passo 3/3: Customizando..."
docker run --rm -t --memory="4g" --memory-swap="4g" -v "$(pwd)/data:/data" osrm/osrm-backend osrm-customize /data/brazil-latest.osrm

echo "✅ Processamento concluído!"

echo "🚀 Iniciando servidor OSRM..."
docker compose up -d

echo "✅ Servidor OSRM iniciado!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Atualize RoutePolyline.jsx com: OSRM_SERVER_URL = 'http://localhost:5000'"
echo "   2. Teste acessando: http://localhost:5000/route/v1/driving/-51.055,-26.3559;-49.5953,-27.0659"
echo ""
echo "Para ver os logs: docker compose logs -f osrm"

