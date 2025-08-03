#!/bin/bash

# 🏢 Terceirize Foods - Script de Parada Completa
# Este script para todos os sistemas em sequência

echo "🛑 Parando Terceirize Foods - Sistema Completo"
echo "=============================================="

# 1. Parar Sistema Cotação (PRIMEIRO)
echo ""
echo "📊 1. Parando Sistema de Cotações..."
cd cotacao_v2
docker-compose down
echo "✅ Sistema de Cotações parado!"

# 2. Parar Sistema Foods
echo ""
echo "🍽️ 2. Parando Sistema Foods..."
cd ../foods
docker-compose down
echo "✅ Sistema Foods parado!"

# 3. Parar Banco de Dados (ÚLTIMO)
echo ""
echo "🗄️ 3. Parando Banco de Dados Centralizado..."
cd ../database
docker-compose down
echo "✅ Banco de dados parado!"

# 4. Verificar Status Final
echo ""
echo "🔍 4. Verificando Status Final..."
cd ..
echo ""
echo "📊 Containers restantes:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎉 Todos os sistemas foram parados com sucesso!"
echo "==============================================" 