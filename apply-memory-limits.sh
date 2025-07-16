#!/bin/bash

echo "🔧 Aplicando limites de memória otimizados aos containers..."

# Parar todos os containers
echo "⏹️  Parando containers..."
docker-compose down

# Remover containers antigos para aplicar novos limites
echo "🗑️  Removendo containers antigos..."
docker-compose rm -f

# Reconstruir e iniciar com novos limites
echo "🚀 Reconstruindo e iniciando containers com limites otimizados..."
docker-compose up -d --build

# Aguardar um pouco para os containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 15

# Verificar status dos containers
echo "📊 Verificando status dos containers..."
docker-compose ps

# Verificar uso de memória
echo "🧠 Verificando uso de memória:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "✅ Limites de memória otimizados aplicados com sucesso!"
echo ""
echo "📋 Resumo dos limites otimizados:"
echo "   • MySQL: 1024MB (reserva: 512MB) - Para 5k produtos e queries pesadas"
echo "   • Backend: 512MB (reserva: 256MB) - API com processos assíncronos"
echo "   • Frontend: 512MB (reserva: 256MB) - React otimizado sem source maps"
echo "   • phpMyAdmin: 128MB (reserva: 64MB) - Interface leve"
echo ""
echo "💡 Total máximo: ~2.2GB (dentro do limite de 2.5GB)"
echo "💡 Reserva mínima: ~1.1GB"
echo ""
echo "🔍 Para monitorar uso de memória:"
echo "   docker stats"
echo ""
echo "📝 Para ver logs:"
echo "   docker-compose logs -f"
echo ""
echo "⚡ Otimizações aplicadas:"
echo "   • MySQL: Buffer pool 512MB, 100 conexões máximas"
echo "   • Node.js: Heap size 512MB para backend e frontend"
echo "   • React: Sem source maps para reduzir bundle" 