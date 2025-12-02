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

echo "⚙️ Processando dados (isso pode demorar 10-30 minutos)..."
echo "   Passo 1/3: Extraindo dados..."
docker run -t -v "$(pwd)/data:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/brazil-latest.osm.pbf

echo "   Passo 2/3: Particionando..."
docker run -t -v "$(pwd)/data:/data" osrm/osrm-backend osrm-partition /data/brazil-latest.osrm

echo "   Passo 3/3: Customizando..."
docker run -t -v "$(pwd)/data:/data" osrm/osrm-backend osrm-customize /data/brazil-latest.osrm

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

